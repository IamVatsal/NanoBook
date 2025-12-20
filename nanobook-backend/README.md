# NanoBook Backend

An advanced RAG (Retrieval-Augmented Generation) system for intelligent document research assistance, powered by Google Gemini AI and Qdrant vector database.

## 🚀 Features

- **Advanced Document Retrieval**
  - Query rewriting for optimized semantic matching
  - Vector similarity search using HuggingFace embeddings
  - Cross-encoder reranking for maximum relevance
  
- **Multi-Format Document Support**
  - Text files (`.txt`, `.md`)
  - PDFs (`.pdf`)
  - Word documents (`.doc`, `.docx`)
  - Excel spreadsheets (`.xlsx`, `.xls`)
  - PowerPoint presentations (`.pptx`, `.ppt`)
  - HTML/Web pages (`.html`, `.htm`)
  - CSV files (`.csv`)

- **Intelligent AI Assistant**
  - Context-aware conversational AI using Google Gemini 2.5 Flash Lite
  - Maintains chat history for coherent conversations
  - Source attribution and scholarly tone
  - Grounded responses based on uploaded documents

- **RESTful API**
  - `/chat` - Query documents and get AI responses
  - `/upload` - Upload and ingest new documents
  - `/reset` - Clear document store

## 📋 Prerequisites

- Python 3.8+
- Docker (for Qdrant)
- Google Gemini API key

## 🛠️ Installation

### 1. Clone the repository
```bash
git clone https://github.com/IamVatsal/NanoBook.git
cd NanoBook
cd nanobook-backend
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```
### 3. Set up Qdrant vector database
```bash
docker pull qdrant/qdrant
docker run -p 6333:6333 qdrant/qdrant
```
### 4. Configure environment variables
Create a .env file in the root directory:
```bash
GEMINI_API_KEY=your_gemini_api_key
QDRANT_URL=http://localhost:6333
```

> Note: Replace your_gemini_api_key with your actual Google Gemini API key. Get one from Google AI Studio.

## 🚦 Getting Started

1. Ingest Initial Documents

    Place your documents in the `data_sources` directory, then run:
    
    ```bash
    python src/ingest.py
    ```
    
    This will:

    - Load all documents from data_sources
    - Split them into chunks (500 characters, 100 overlap)
    - Generate embeddings using all-MiniLM-L6-v2
    - Store vectors in Qdrant collection data_sources

2. Start the Flask Server

    ```bash
    python src/app.py
    ``` 
    The API will be available at `http://localhost:5000`

3. Test the Query System (Optional)
    ```bash
    python src/query.py
    ```

## 📚 API Endpoints
POST `/chat`
Query documents and get AI-generated responses.

**Request Body:**
```json
{
  "user_query": "What are the main topics discussed?",
  "history": [
    {"role": "user", "parts": "Previous question"},
    {"role": "model", "parts": "Previous answer"}
  ],
  "use_reranking": true
}
```
**Response:**
```json
{
  "user_query": "What are the main topics discussed?",
  "history": [
    {"role": "user", "parts": "Previous question"},
    {"role": "model", "parts": "Previous answer"}
  ],
  "use_reranking": true
}
```
**Parameters:**

- `user_query` (required): The question to ask
- `history` (optional): Previous conversation history
- `use_reranking` (optional, default: true): Enable cross-encoder reranking

POST `/upload`

Upload and ingest a new document into the vector database.

**Request:**

- Form data with file field: `file`

**Response:**
```json
{
  "message": "File 'document.pdf' uploaded and ingested successfully.",
  "chunks_created": 42,
  "file_path": "/path/to/file",
  "statusText": "ingestion_complete"
}
```
**Supported File Types:**

`.txt`, `.pdf`, `.doc`, `.docx`, `.md`, `.html`, `.htm`, `.csv`, `.xlsx`, `.xls`, `.pptx`, `.ppt`

**Example with cURL:**
```bash
curl -X POST http://localhost:5000/upload \
  -F "file=@/path/to/document.pdf"
```

DELETE `/reset`

Clear all documents from the vector database and `data_sources` directory.

**Response:**
```json
{
  "message": "Document store has been reset successfully."
}
```
**Example with cURL:**
```bash
curl -X DELETE http://localhost:5000/reset
```

## 🏗️ Architecture
Components

1. [`app.py`](./src/app.py) - Flask API server
1. [`ingest.py`](./src/ingest.py) - Document ingestion pipeline
1. [`query.py`](./src/query.py) - Query processing with reranking
1. [`Gemini_Api.py`](./Utils/Gemini_Api.py) - Gemini API wrapper

RAG Pipeline
```
User Query 
    ↓
Query Rewriting (Gemini)
    ↓
Semantic Search (Qdrant + HuggingFace embeddings)
    ↓
Cross-Encoder Reranking (ms-marco-MiniLM-L-6-v2)
    ↓
Context Injection
    ↓
Response Generation (Gemini 2.5 Flash Lite)
    ↓
Markdown-formatted Answer
```

Technical Stack

- **Vector Database:** Qdrant (local instance)
- **Embeddings:** HuggingFace `all-MiniLM-L6-v2` (384 dimensions)
- **Reranker:** Cross-Encoder `ms-marco-MiniLM-L-6-v2`
- **LLM:** Google Gemini 2.5 Flash Lite
- **Backend:** Flask with CORS support
- **Document Processing:** LangChain + Unstructured

## 🔧 Configuration
Chunking Strategy
Adjust in [`ingest.py`](./src/ingest.py) and [`app.py`](./src/app.py):
```python
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,      # Characters per chunk
    chunk_overlap=100    # Overlap between chunks
)
```

Retrieval Parameters
Modify in [`query.py`](./src/query.py):
```python
query_documents(
    query_text="Your query",
    k=10,                    # Final number of documents
    use_reranking=True       # Enable/disable reranking
)
```

Gemini Generation Config
Update in [`app.py`](./src/app.py):
```python
generation_config={
    "temperature": 0.3,           # Lower = more consistent
    "top_p": 0.8,
    "top_k": 40,
    "max_output_tokens": 1024,
}
```

## 📝 File Structure
```
nanobook-backend/
├── src/
│   ├── app.py              # Main Flask application
│   ├── ingest.py           # Document ingestion script
│   └── query.py            # Query processing with reranking
├── Utils/
│   └── Gemini_Api.py       # Gemini API utility functions
├── data_sources/           # Document storage directory
├── .env                    # Environment variables (not in git)
├── .gitignore             
├── requirements.txt        # Python dependencies
└── README.md              # This file
```

## 🐛 Troubleshooting
Qdrant Connection Error
```
Error connecting to Qdrant: Cannot connect to host localhost:6333
```
**Solution:** Ensure Qdrant is running:
```bash
docker run -p 6333:6333 qdrant/qdrant
```

Collection Not Found
```
Collection 'data_sources' not found in Qdrant!
```
**Solution:** Run the ingestion script first:
```
python src/ingest.py
```

Gemini API Error
```
GEMINI_API_KEY not found in environment variables
```
**Solution:** Create a `.env` file with your API key (see Installation step 4).

File Upload Fails
```
Failed to process file: No such file or directory
```
**Solution:** Ensure the `data_sources` directory exists or let the upload endpoint create it automatically.


Module Not Found Errors
```
ModuleNotFoundError: No module named 'sentence_transformers'
```
**Solution:** Install all dependencies:
```bash
pip install -r requirements.txt
```

## 📊 Performance Tips

1. **Increase retrieval candidates** - Fetch more documents before reranking:
```python
initial_results = qdrant.similarity_search(query_text, k=15)
```
2. **Adjust chunk size** - Larger chunks provide more context but may reduce precision:
```python
chunk_size=1000  # Increase for more context
```
3. **Enable caching** - Cache embeddings and queries for faster responses

4. **Use GPU** - Install CUDA-enabled PyTorch for faster embeddings:
```bash
pip install torch --index-url https://download.pytorch.org/whl/cu118
```
> I have AMD GPU so i did not bother but if you do it will be faster then me

## 📄 License

This project is provided as-is for research and educational purposes.

## 🤝 Contributing

Contributions are welcome! Please ensure:

- New features include appropriate documentation
- API changes are reflected in this README

## 📧 Support

For issues and questions:

- Open an issue on GitHub
- Check existing issues for solutions

Built with ❤️ using LangChain, Qdrant, and Google Gemini AI by IamVatsal