import os
import sys
import google.generativeai as genai
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from query import query_documents

# --- INITIALIZATION ---
# Load environment variables from a .env file
load_dotenv()

# Create the Flask application instance
app = Flask(__name__)
# Enable Cross-Origin Resource Sharing (CORS) to allow frontend access
CORS(app)

# --- QDRANT CONFIGURATION ---
try:
    qdrant_url = os.getenv("QDRANT_URL")
    if not qdrant_url:
        raise ValueError("QDRANT_URL not set in environment variables.")
except Exception:
    print("Error loading QDRANT_URL from environment variables.")
    sys.exit(1)

# --- GEMINI API CONFIGURATION ---
try:
    # Configure the Gemini API with the key from environment variables
    gemini_api_key = os.getenv("GEMINI_API_KEY")
    if not gemini_api_key:
        raise ValueError("GEMINI_API_KEY not found in environment variables. Please create a .env file and add it.")
    genai.configure(api_key=gemini_api_key)
except Exception as e:
    print(f"Error configuring Gemini API: {e}")
    sys.exit(1)
    # You might want to exit or handle this more gracefully
    # For this example, we'll let it proceed and fail on the API call

VALID_ROLES = {"user", "model", "system"}

def normalize_history(history):
    normalized = []
    for item in history:
        role = item.get("role", "").lower()

        # Fix OpenAI-style "assistant" → Gemini's "model"
        if role == "assistant":
            role = "model"

        # Skip anything invalid
        if role not in VALID_ROLES:
            continue

        normalized.append({
            "role": role,
            "parts": item.get("parts") or item.get("content", "")
        })
    return normalized

# --- API ENDPOINT ---
@app.route('/chat', methods=['POST'])
def chat_handler():
    """
    Handles chat requests to the Gemini API with advanced RAG capabilities.
    Expects a JSON payload with 'user_query' and 'history'.
    Implements query rewriting and document reranking for better context retrieval.
    """
    # 1. Validate incoming data
    if not request.json:
        return jsonify({"error": "Invalid request: No JSON payload received."}), 400

    user_query = request.json.get('user_query')
    history = request.json.get('history', [])
    use_reranking = request.json.get('use_reranking', True)  # Optional parameter

    if not user_query:
        return jsonify({"error": "Missing 'user_query' in the request."}), 400
    
    try:
        # 2. Retrieve relevant context with query rewriting and reranking
        # This now includes:
        # - Query rewriting for better semantic matching
        # - Cross-encoder reranking for improved relevance
        context_doc = query_documents(user_query, k=15, use_reranking=use_reranking)
        
        # 3. Construct the enhanced system prompt
        system_prompt_parts = """
            You are NanoBook, a world-class intellectual research assistant. 
            Your goal is to help users synthesize information from their uploaded documents.
    
            Guidelines:
            1. Be precise, analytical, and objective.
            2. Prioritize information found in the provided CONTEXT.
            3. If information is not in the context, clearly state "Based on the provided documents, I couldn't find information on this, however..." and then provide general knowledge if relevant.
            4. Use markdown for structural clarity (headers, bullet points, bold text).
            5. Maintain a scholarly but accessible tone.
        """.strip()

        # 4. Normalize conversation history
        history = normalize_history(history)
        
        # 5. Construct the full query with context and metadata
        full_query = f"""
        === RETRIEVED CONTEXT ===
        The following context has been retrieved and ranked by relevance to answer the user's question.
        Use this information as the primary source for your response.
        
        {context_doc}
        
        === END CONTEXT ===
        
        User Question: {user_query}
        
        Instructions:
        - Answer based primarily on the context above
        - If the context doesn't fully address the question, acknowledge this
        - Maintain conversation continuity with the chat history
        - Follow all system guidelines for response format and content
        """

        # 6. Call the Gemini API with enhanced configuration
        model = genai.GenerativeModel(
            'gemini-2.5-flash-lite',
            system_instruction=system_prompt_parts,
            generation_config={
                "temperature": 0.3,  # Lower temperature for more consistent medical advice
                "top_p": 0.8,
                "top_k": 40,
                "max_output_tokens": 1024,
            }
        )

        # 7. Start chat session with history
        chat_session = model.start_chat(history=history)
        
        # 8. Generate response
        response = chat_session.send_message(full_query)

        # 9. Return enhanced response with metadata
        return jsonify({
            "response": response.text,
            "metadata": {
                "reranking_used": use_reranking,
                "context_retrieved": True,
                "query_rewritten": True
            }
        }), 200

    except Exception as e:
        # Enhanced error handling
        print(f"Error in chat_handler: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            "error": "Failed to get a response from the AI system.",
            "details": str(e) if app.debug else "Internal server error"
        }), 500
    
@app.route('/upload', methods=['POST'])
def upload_handler():
    """
    Handles document uploads, saves the file, and ingests it into Qdrant.
    Expects a file in the 'file' field of the form data.
    """
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request."}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file."}), 400

    # Validate file type
    allowed_extensions = {'.txt', '.pdf', '.doc', '.docx', '.md', '.html', '.htm', '.csv', '.xlsx', '.xls', '.pptx', '.ppt'}
    file_ext = os.path.splitext(file.filename)[1].lower()
    
    if file_ext not in allowed_extensions:
        return jsonify({
            "error": f"Unsupported file type. Allowed types: {', '.join(allowed_extensions)}"
        }), 400

    try:
        # Create uploads directory if it doesn't exist
        upload_dir = os.path.join(os.path.dirname(__file__), '..', 'data_sources')
        os.makedirs(upload_dir, exist_ok=True)

        # Save the file
        file_path = os.path.join(upload_dir, file.filename)
        file.save(file_path)

        # Import necessary components for ingestion
        from langchain_community.document_loaders import (
            TextLoader, PyPDFLoader, Docx2txtLoader, 
            UnstructuredHTMLLoader, CSVLoader, 
            UnstructuredExcelLoader, UnstructuredPowerPointLoader,
            UnstructuredMarkdownLoader
        )
        from langchain_text_splitters import RecursiveCharacterTextSplitter
        from langchain_huggingface import HuggingFaceEmbeddings
        from langchain_qdrant import QdrantVectorStore
        from qdrant_client import QdrantClient

        # Load the document based on file type
        if file_ext == '.pdf':
            loader = PyPDFLoader(file_path)
        elif file_ext in ['.doc', '.docx']:
            loader = Docx2txtLoader(file_path)
        elif file_ext in ['.html', '.htm']:
            loader = UnstructuredHTMLLoader(file_path)
        elif file_ext == '.csv':
            loader = CSVLoader(file_path)
        elif file_ext in ['.xlsx', '.xls']:
            loader = UnstructuredExcelLoader(file_path)
        elif file_ext in ['.pptx', '.ppt']:
            loader = UnstructuredPowerPointLoader(file_path)
        elif file_ext == '.md':
            loader = UnstructuredMarkdownLoader(file_path)
        else:  # .txt and others
            loader = TextLoader(file_path)
        
        documents = loader.load()

        # Split into chunks
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=500, 
            chunk_overlap=100
        )
        text_chunks = text_splitter.split_documents(documents)

        # Create embeddings
        embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

        # Connect to existing Qdrant collection and add documents
        client = QdrantClient(url=qdrant_url)
        check_collections = client.get_collections().collections
        collection_names = [c.name for c in check_collections]
        if "data_sources" not in collection_names:
            qdrant = QdrantVectorStore.from_documents(
                documents=text_chunks,
                embedding=embeddings,
                url=qdrant_url,
                collection_name="data_sources",
            )
        else:
            qdrant = QdrantVectorStore(
                client=client,
                collection_name="data_sources",
                embedding=embeddings
            )
            qdrant.add_documents(text_chunks)
            
        return jsonify({
            "message": f"File '{file.filename}' uploaded and ingested successfully.",
            "chunks_created": len(text_chunks),
            "file_path": file_path,
            "statusText": "ingestion_complete"
        }), 200

    except Exception as e:
        # Clean up the file if ingestion failed
        if os.path.exists(file_path):
            os.remove(file_path)
        
        print(f"Error during file upload and ingestion: {e}")
        return jsonify({
            "error": f"Failed to process file: {str(e)}"
        }), 500

@app.route('/reset', methods=['DELETE'])
def reset_handler():
    """
    Resets the document store by clearing all documents from the Qdrant collection.
    """
    try:
        from qdrant_client import QdrantClient

        # Connect to Qdrant
        client = QdrantClient(url=qdrant_url)
        
        # Check if collection exists and delete it
        check_collections = client.get_collections().collections
        collection_names = [c.name for c in check_collections]
        if "data_sources" in collection_names:
            client.delete_collection(collection_name="data_sources")

        # Delete all files in data_sources directory
        data_sources_path = os.path.join(os.path.dirname(__file__), '..', 'data_sources')
        os.makedirs(data_sources_path, exist_ok=True)
        for filename in os.listdir(data_sources_path):
            file_path = os.path.join(data_sources_path, filename)
            try:
                if os.path.isfile(file_path):
                    os.remove(file_path)
            except Exception as e:
                print(f"Error deleting file {file_path}: {e}")

        return jsonify({
            "message": "Document store has been reset successfully."
        }), 200

    except Exception as e:
        print(f"Error during reset: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            "error": f"Failed to reset document store: {str(e)}"
        }), 500

# --- MAIN EXECUTION ---
if __name__ == '__main__':
    # Runs the Flask development server
    # Use Gunicorn for production deployment
    app.run(host='0.0.0.0', port=5000, debug=True)
