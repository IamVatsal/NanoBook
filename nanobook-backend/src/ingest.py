import requests
from langchain_community.document_loaders import DirectoryLoader, TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_qdrant import QdrantVectorStore
import os
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


# 1. Load Documents
print("Loading documents...")
loader = DirectoryLoader('data_sources/', glob="**/*.txt", loader_cls=TextLoader)
documents = loader.load()
print(f"Loaded {len(documents)} documents.")

# Check if documents are loaded
if not documents:
    print("No documents found in data_sources/ directory!")
    exit(1)

# 2. Split Documents into Chunks
print("Splitting documents...")
text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=100)
text_chunks = text_splitter.split_documents(documents)
print(f"Split documents into {len(text_chunks)} chunks.")

# 3. Create Embeddings
print("Loading embedding model...")
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
print("Embedding model loaded successfully!")

# 4. Store in Vector Database (Qdrant)
print("Storing embeddings in Qdrant...")
try:
    qdrant = QdrantVectorStore.from_documents(
        documents=text_chunks,
        embedding=embeddings,
        url=qdrant_url,
        collection_name="data_sources",
    )
    print("Vector database has been updated successfully!")
except Exception as e:
    print(f"Error connecting to Qdrant: {e}")
    print(f"Make sure Qdrant server is running on {qdrant_url}")

try:
    response = requests.get(f"{qdrant_url}/health")
    if response.status_code == 200:
        print("Qdrant server is running!")
    else:
        print(f"Qdrant server responded with status: {response.status_code}")
except requests.exceptions.ConnectionError:
    print("Cannot connect to Qdrant server. Make sure it's running on port 6333")