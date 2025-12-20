# NanoBook

NanoBook is a full‑stack, retrieval‑augmented research assistant. It combines a **Next.js + React** frontend with a **Flask + Qdrant + Gemini** backend to analyze and synthesize information from user‑uploaded documents.

---

## 📁 Repository Structure

```text
.
├── README.md                 # Root overview (this file)
├── nanobook-backend/         # Python + Flask RAG backend
│   ├── src/
│   │   ├── app.py           # Flask app / REST API
│   │   ├── ingest.py        # Initial bulk ingestion into Qdrant
│   │   └── query.py         # Query rewriting + retrieval + reranking
│   ├── Utils/
│   │   └── Gemini_Api.py    # Gemini helper utilities
│   ├── data_sources/        # Local document store (ingested files)
│   ├── requirements.txt     # Backend Python dependencies
│   └── README.md            # Backend‑specific docs
└── nanobook-frontend/        # Next.js 16 + React 19 frontend
    ├── app/
    │   ├── (services)/api.ts    # HTTP client to backend
    │   ├── components/          # Chat UI + sidebar components
    │   ├── Utils/types.ts       # Shared TS types
    │   ├── globals.css          # Tailwind v4 + global styles
    │   ├── layout.tsx           # Root layout
    │   └── page.tsx             # Main NanoBook UI
    ├── package.json             # Frontend dependencies
    └── README.md                # Frontend‑specific docs
```

-   Backend details: see [nanobook-backend/README.md](nanobook-backend/README.md)
-   Frontend details: see [nanobook-frontend/README.md](nanobook-frontend/README.md)

---

## 🧠 Features

-   **RAG (Retrieval‑Augmented Generation)**
    -   Query rewriting using Gemini for better retrieval
    -   Dense vector search over documents with Qdrant
    -   Neural reranking via cross‑encoder (`ms-marco-MiniLM-L-6-v2`)
-   **Multi‑format document ingestion**
    -   `.txt`, `.md`, `.pdf`, `.doc/.docx`, `.xlsx/.xls`, `.ppt/.pptx`, `.html/.htm`, `.csv`
-   **Conversational AI**
    -   Google Gemini (Flash / Flash Lite) with custom system instructions
    -   Chat history & context‑aware responses
    -   Scholarly yet accessible tone for research workflows
-   **Modern UI**
    -   Responsive chat interface with typing indicator
    -   Source management sidebar with upload + reset
    -   Dark/light theme toggle
    -   Local persistence of chat + sources in `localStorage`

---

## 🧩 Tech Stack

**Backend (`nanobook-backend/`)**

-   Python 3.8+
-   Flask + Flask‑CORS
-   Qdrant (vector database)
-   HuggingFace `all-MiniLM-L6-v2` embeddings
-   Sentence‑Transformers cross‑encoder reranker
-   Google Gemini API (`google-generativeai`)
-   LangChain + Unstructured for document loading and chunking

**Frontend (`nanobook-frontend/`)**

-   Next.js `16.1.0`
-   React `19.2.3` + TypeScript
-   Tailwind CSS v4 via PostCSS
-   Local state + `localStorage` for persistence

---

## 🚀 Getting Started

### 1. Prerequisites

-   Python 3.8+
-   Node.js 20+
-   Docker (for Qdrant)
-   Google Gemini API key

---

### 2. Backend Setup

From repo root:

```bash
cd nanobook-backend
pip install -r requirements.txt
```

1. **Run Qdrant**

```bash
docker pull qdrant/qdrant
docker run -p 6333:6333 qdrant/qdrant
```

2. **Create `.env` in `nanobook-backend/`**

```bash
GEMINI_API_KEY=your_gemini_api_key
QDRANT_URL=http://localhost:6333
```

3. **Ingest initial documents**

```bash
python src/ingest.py
```

4. **Start the Flask API**

```bash
python src/app.py
```

Backend will be available at:  
`http://localhost:5000`

Key backend entrypoints:

-   [nanobook-backend/src/app.py](nanobook-backend/src/app.py)
-   [nanobook-backend/src/ingest.py](nanobook-backend/src/ingest.py)
-   [nanobook-backend/src/query.py](nanobook-backend/src/query.py)
-   [nanobook-backend/Utils/Gemini_Api.py](nanobook-backend/Utils/Gemini_Api.py)

---

### 3. Frontend Setup

From repo root:

```bash
cd nanobook-frontend
npm install
# or: yarn install
```

1. **Configure environment**

Create `.env.local` in `nanobook-frontend/`:

```bash
BASE_URL=http://localhost:5000
```

2. **Run dev server**

```bash
npm run dev
# or: yarn dev
```

Open `http://localhost:3000` in your browser.

Key frontend entrypoints:

-   [nanobook-frontend/app/page.tsx](nanobook-frontend/app/page.tsx)
-   [nanobook-frontend/app/components/ChatArea.tsx](nanobook-frontend/app/components/ChatArea.tsx)
-   [nanobook-frontend/app/components/Sidebar.tsx](nanobook-frontend/app/components/Sidebar.tsx)
-   [nanobook-frontend/app/(services)/api.ts](<nanobook-frontend/app/(services)/api.ts>)
-   [nanobook-frontend/app/Utils/types.ts](nanobook-frontend/app/Utils/types.ts)

---

## 🔌 Core API Endpoints

All served by [nanobook-backend/src/app.py](nanobook-backend/src/app.py):

-   `POST /chat` – Send user query + chat history, receive Gemini response
-   `POST /upload` – Upload a document and ingest into Qdrant
-   `DELETE /reset` – Clear Qdrant `data_sources` collection and local files

The frontend uses these via [nanobook-frontend/app/(services)/api.ts](<nanobook-frontend/app/(services)/api.ts>).

---

## 🧪 Development Tips

-   Run backend first (`:5000`) and Qdrant (`:6333`) before opening the frontend.
-   Adjust chunk size / overlap in:
    -   [nanobook-backend/src/ingest.py](nanobook-backend/src/ingest.py)
-   Tune retrieval + reranking in:
    -   [nanobook-backend/src/query.py](nanobook-backend/src/query.py)
-   Modify Gemini generation config in:
    -   [nanobook-backend/src/app.py](nanobook-backend/src/app.py)

---

## 📄 License & Contributing

This project is provided as‑is for research and educational purposes.

Contributions are welcome via pull requests. Please:

-   Keep backend and frontend READMEs in sync with any API or UI changes.
-   Add documentation for new features.
