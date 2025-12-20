# NanoBook

A modern, intelligent research assistant that combines advanced RAG (Retrieval-Augmented Generation) with a beautiful, responsive frontend interface.

## Overview

NanoBook is a full-stack application designed for intelligent document analysis and research assistance. It features a Next.js frontend with real-time chat capabilities and a Python-powered backend using advanced semantic search and AI generation.

## 🚀 Features
Frontend (Next.js + React)
- **Modern UI/UX:** Clean, responsive design with dark mode support
- **Real-time Chat Interface:** Conversational AI interactions with typing indicators
- **Document Management:** Drag-and-drop file uploads with visual source tracking
- **Local Persistence:** Chat history and sources stored in browser localStorage
- **Mobile-First Design:** Fully responsive with sidebar drawer on mobile devices
- **Tailwind CSS v4:** Modern styling with custom color schemes

Backend (Python + Flask)
- **Advanced Document Retrieval**
    - Query rewriting for optimized semantic matching
    - Vector similarity search using Qdrant database
    - Cross-encoder reranking (`ms-marco-MiniLM-L-6-v2`)
    - Retrieves 3x documents, reranks to top K relevant chunks

- **Multi-Format Document Processing**
    - Text files (`.txt`, `.md`)
    - PDFs (`.pdf`)
    - Word documents (`.doc`, `.docx`)
    - Excel spreadsheets (`.xlsx`, `.xls`)
    - PowerPoint presentations (`.pptx`, `.ppt`)
    - HTML/Web pages (`.html`, `.htm`)
    - CSV files (`.csv`)

- **Intelligent Chunking**
    - RecursiveCharacterTextSplitter with 500 character chunks
    - 100 character overlap for context preservation
    - Document metadata tracking

- **Conversational AI**
    - Model: Google Gemini 2.5 Flash Lite
    - Context-aware with chat history support
    - Scholarly tone for research assistance
    - Source attribution and verification
    - Temperature 0.3 for consistent responses


## 🏗️ Architecture

Frontend Stack
- **Framework:** Next.js 16.1.0 (React 19.2.3)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS v4 with PostCSS
- **Fonts:** Inter (sans-serif), Lora (serif), Geist
- **API Communication:** Native Fetch API

Backend Stack
- **Vector Database:** Qdrant (local instance on port 6333)
- **Embeddings:** HuggingFace all-MiniLM-L6-v2 (384 dimensions)
- **Reranker:** Cross-Encoder for relevance scoring
- **LLM:** Google Gemini for response generation
- **Backend:** Flask with CORS support
- **Lazy Initialization:** Efficient resource management

## 📁 Project Structure

```
nanobook-frontend/
├── app/
│   ├── (services)/
│   │   └── api.ts                 # API client functions
│   ├── components/
│   │   ├── ChatArea.tsx          # Main chat interface
│   │   ├── Sidebar.tsx           # Source management sidebar
│   │   └── SourceCard.tsx        # Document card component
│   ├── Utils/
│   │   └── types.ts              # TypeScript type definitions
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout component
│   └── page.tsx                  # Main page (client component)
├── public/                       # Static assets
├── .next/                        # Next.js build output
├── next.config.ts                # Next.js configuration
├── tsconfig.json                 # TypeScript configuration
├── postcss.config.mjs            # PostCSS configuration
├── eslint.config.mjs             # ESLint configuration
├── package.json                  # Dependencies
└── README.md                     # This file
```

## 🚦 Getting Started

Prerequisites

- Node.js 20+ and npm/yarn
- Python 3.8+
- Qdrant running on `localhost:6333`
- Google Gemini API key

Frontend Installation
1. **Clone the repository**

    ```shell
    git clone https://github.com/IamVatsal/NanoBook.git
    cd NanoBook
    cd nanobook-frontend
    ```

2. **Install dependencies**

    ```shell
    npm install
    # or
    yarn install
    ```

3. **Configure environment variables**

    Create a .env.local file:
    ```
    NEXT_PUBLIC_BASE_URL=http://localhost:5000
    ```


4. **Run development server**

    ```shell
    npm run dev
    ```
Open http://localhost:3000 in your browser.

5. **Build for production**

    ```shell
    npm run build
    npm start
    ```

Backend Setup

> Make sure that backend is runnig at BASE_URL

> Backend runs on BASE_URL

## 🔌 API Endpoints

POST `/chat`

Submit queries with chat history.

**Request:**

```json
{
  "user_query": "What are the key findings?",
  "history": [
    {
      "role": "user",
      "parts": ["Previous question"]
    },
    {
      "role": "model",
      "parts": ["Previous answer"]
    }
  ]
}
```

**Response:**

```json
{
  "response": "Based on the documents, the key findings are..."
}
```

POST `/upload`

Upload documents for processing.

**Request:** multipart/form-data with file field

**Response:**

```json
{
  "message": "File uploaded successfully",
  "filename": "document.pdf"
}
```

DELETE `/reset`

Clear all documents from the vector database.

**Response:**

```json
{
  "message": "Collection reset successfully"
}
```

## 🎨 Key Components
[`page.tsx`](./app/page.tsx): 
Main client component handling state management, localStorage persistence, and API communication.

[`ChatArea.tsx`](./app/components/ChatArea.tsx): 
Chat interface with message rendering, typing indicators, and input handling.

[`Sidebar.tsx`](./app/components/Sidebar.tsx): 
Source management panel with upload functionality, theme toggle, and reset controls.

[`app/(services)/api.ts`](./app/(services)/api.ts):
API client with functions for sendChatMessage, uploadDocument, and resetSources.

[`types.ts`](./app/Utils/types.ts): 
TypeScript interfaces including Message, Source, ChatRequest, and ChatResponse.

## 🎯 Workflow

1. **User uploads documents** → Files sent to backend
2. **Backend processes and chunks** → Stored in Qdrant with embeddings
3. **User submits query** → Query rewritten for optimization
4. **Semantic search retrieves candidates** → Cross-encoder reranks top K
5. **Context injected into Gemini** → AI generates grounded response
6. **Frontend displays response** → Markdown-formatted with source awareness

## 🛠️ Development

Run linter

```shell
npm run lint
```

Styling

- Uses Tailwind CSS v4 via PostCSS
- Custom color: `electric-blue` (oklch(0.61 0.23 248.07))
- Dark mode with `dark`: variant prefix

## 📦 Dependencies

Production

- `next`: 16.1.0
- `react`: 19.2.3
- `react-dom`: 19.2.3

Development

- `@tailwindcss/postcss`: ^4
- `typescript`: ^5
- `eslint`: ^9
- `eslint-config-next`: 16.1.0

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License
This project is private and proprietary.

🙏 Acknowledgments
- **Next.js Team** for the amazing framework
- **Vercel** for deployment platform
- **Tailwind CSS** for utility-first styling
- **Google Gemini** for AI capabilities
- **Qdrant** for vector database
- **HuggingFace** for embeddings and reranking models

## 📞 Support

For questions or issues, please open an issue in the repository.

**Build by IamVatsal with ❤️**