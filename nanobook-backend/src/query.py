import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

try:
    qdrant_url = os.getenv("QDRANT_URL")
    if not qdrant_url:
        raise ValueError("QDRANT_URL not set in environment variables.")
except Exception:
    print("Error loading QDRANT_URL from environment variables.")
    exit(1)

# Add parent directory to Python path to import Utils module
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from langchain_qdrant import QdrantVectorStore
from langchain_huggingface import HuggingFaceEmbeddings
from qdrant_client import QdrantClient
from Utils.Gemini_Api import call_gemini_api
from sentence_transformers import CrossEncoder

# Global variables for lazy initialization
_embeddings = None
_client = None
_qdrant = None
_reranker = None

def _get_embeddings():
    """Lazy initialization of embeddings model"""
    global _embeddings
    if _embeddings is None:
        _embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    return _embeddings

def _get_qdrant_client():
    """Lazy initialization of Qdrant client and vector store"""
    global _client, _qdrant
    if _qdrant is None:
        _client = QdrantClient(url=qdrant_url)
        
        # Check if collection exists
        collections = _client.get_collections().collections
        collection_names = [c.name for c in collections]
        
        if "data_sources" not in collection_names:
            raise RuntimeError(
                "Collection 'data_sources' not found in Qdrant!\n"
                "Please run 'python src/ingest.py' first to create the collection and ingest documents."
            )
        
        _qdrant = QdrantVectorStore(
            client=_client, 
            collection_name="data_sources", 
            embedding=_get_embeddings()
        )
    return _qdrant

def _get_reranker():
    """Lazy initialization of reranker model"""
    global _reranker
    if _reranker is None:
        _reranker = CrossEncoder('cross-encoder/ms-marco-MiniLM-L-6-v2')
    return _reranker

def rewrite_query(original_query: str) -> str:
    """
    Rewrite the user query into a more detailed clinical query for better retrieval.
    
    Args:
        original_query (str): The user's original question
        
    Returns:
        str: A rewritten, more detailed clinical query
    """
    try:
        rewritten = call_gemini_api(f"""
        System Role: You are the Search Query Optimizer for "NanoBook." Your goal is to convert natural language questions into precise, database-friendly search queries.
        
        Input Context: You will be provided with:
        
            Raw User Input: The latest message sent by the user.
        
        Your Objective: Transform the Raw User Input into an optimized search string.
        
        Rules for Rewriting:
        
            Remove Fluff: Strip out conversational politeness (e.g., "Hello," "I was wondering," "Can you find," "Please").
        
            Fix Ambiguity: If the user uses vague terms but the intent is clear from the sentence itself, make it specific (e.g., "How much is it?" -> "Price/Cost details"). Note: Do not invent context if it is completely missing.
        
            Keyword Focus: Prioritize nouns, entities, and technical terms.
        
            No Answering: Do NOT answer the question. Output only the rewritten query string.
        
        Examples:
        
            Example 1:
        
                Input: "Can you please tell me what the revenue was for Q3?"
        
                Output: Q3 revenue figures
        
            Example 2:
        
                Input: "I'm looking for info on how to reset the password."
        
                Output: Password reset instructions procedure
        
            Example 3:
        
                Input: "Why is the sky blue?"
        
                Output: Reason sky blue scattering
        
        Current Task:
                Raw User Input: {original_query}
        """)
        return rewritten.strip()
    except Exception as e:
        print(f"Error rewriting query: {e}")
        return original_query  # Fallback to original query if rewriting fails

def query_documents(query_text: str, k: int = 10, use_reranking: bool = True):
    """
    Query the Qdrant vector database for the most relevant documents with optional reranking.

    Args:
        query_text (str): The user's query.
        k (int): Number of documents to retrieve before reranking.
        use_reranking (bool): Whether to apply reranking to the results.

    Returns:
        str: Formatted string containing the most relevant documents.
    """
    # Step 1: Get Qdrant connection (lazy initialization)
    qdrant = _get_qdrant_client()
    
    # Step 2: Rewrite the query for better retrieval
    rewritten_query = rewrite_query(query_text)
    print(f"Original query: {query_text}")
    print(f"Rewritten query: {rewritten_query}")
    
    # Step 3: Retrieve initial documents (more than needed for reranking)
    initial_k = k * 3 if use_reranking else k  # Retrieve 3x documents for reranking
    found_docs = qdrant.similarity_search(rewritten_query, k=initial_k)
    
    # Step 4: Rerank documents using cross-encoder
    if use_reranking and len(found_docs) > 0:
        reranker = _get_reranker()
        
        # Prepare query-document pairs for reranking
        pairs = [[rewritten_query, doc.page_content] for doc in found_docs]
        
        # Get relevance scores from cross-encoder
        scores = reranker.predict(pairs)
        
        # Sort documents by scores (descending) and keep top k
        doc_score_pairs = list(zip(found_docs, scores))
        doc_score_pairs.sort(key=lambda x: x[1], reverse=True)
        found_docs = [doc for doc, score in doc_score_pairs[:k]]
        
        print(f"Reranked top {k} documents from {initial_k} candidates")
    
    # Step 5: Format the results
    output = ""
    for i, doc in enumerate(found_docs):
        output += f"\n--- Document {i+1} ---"
        output += f"\nSource: {doc.metadata.get('source', 'Unknown')}"
        output += f"\nContent: {doc.page_content}"
    
    return output

if __name__ == '__main__':
    # 3. Define our query
    query = "what are the symptoms of influenza?"
    print(f"Searching for: '{query}'")

    # 4. Perform the similarity search with reranking
    output = query_documents(query, k=10, use_reranking=True)
    print(output)