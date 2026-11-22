# Personal RAG Assistant

A personal AI assistant that reads your documents, retrieves relevant information, and generates answers using Retrieval-Augmented Generation (RAG).

The application allows users to upload PDF and TXT documents and ask questions about their contents through a simple web interface.

## Features

- **Document Upload:** Upload PDF and TXT files.
- **Text Extraction:** Extract text from uploaded documents.
- **Text Chunking:** Split documents into smaller chunks for efficient retrieval.
- **Local Embeddings:** Generate document embeddings using Sentence Transformers.
- **Vector Database:** Store and search document embeddings using ChromaDB.
- **AI-Powered Answers:** Generate contextual answers using NVIDIA Nemotron.
- **Source References:** Display the documents used to generate an answer.
- **Document Management:** View and delete uploaded documents.
- **Web Interface:** Interact with the assistant through a React-based frontend.

## Technology Stack

| Component | Technology |
|---|---|
| Programming Language | Python |
| Frontend | React, TypeScript, Vite |
| Backend | FastAPI |
| AI Language Model | NVIDIA Nemotron 3.5 Lightning 30B A3B |
| Embedding Model | all-MiniLM-L6-v2 |
| Vector Database | ChromaDB |
| AI Integration | OpenAI-compatible NVIDIA API |
| Document Processing | PyPDF |
| Markdown Rendering | React Markdown |

## Architecture

```text
                 USER
                   |
                   v
          React Web Interface
                   |
                   v
             FastAPI Backend
                   |
          +--------+--------+
          |                 |
          v                 v
     Document Upload     User Question
          |                 |
          v                 v
     Text Extraction   Query Embedding
          |                 |
          v                 v
      Text Chunking    ChromaDB Search
          |                 |
          v                 v
     Sentence          Relevant Chunks
     Transformers          |
          |                |
          v                |
       ChromaDB <----------+
          |
          v
    Retrieved Context
          |
          v
    NVIDIA Nemotron
          |
          v
     AI-Generated Answer
          |
          v
      React Interface
```

## Project Structure

```text
personal_rag_assistant/
│
├── docs/
│   └── sample.txt
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── App.css
│   │   ├── api.ts
│   │   ├── index.css
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── rag.py
├── server.py
├── requirements.txt
├── test_nvidia.py
├── test_embeddings.py
├── test_chromadb.py
├── .env.example
├── .gitignore
└── README.md
```

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/spandan120406/personal-rag-assistant.git

cd personal-rag-assistant
```

### 2. Create a Python virtual environment

```bash
python3 -m venv venv

source venv/bin/activate
```

### 3. Install Python dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure environment variables

Create a `.env` file in the project root.

Add your NVIDIA API configuration:

```env
NVIDIA_API_KEY=your_nvidia_api_key
NVIDIA_CHAT_MODEL=nvidia/nemotron-3.5-lightning-30b-a3b
NVIDIA_BASE_URL=https://integrate.api.nvidia.com/v1
```

Get your API key from [NVIDIA Build](https://build.nvidia.com/).

**Important:** Never upload your actual `.env` file or API key to GitHub.

### 5. Start the backend

From the project root:

```bash
uvicorn server:app --reload
```

Backend URL:

`http://127.0.0.1:8000`

API documentation:

`http://127.0.0.1:8000/docs`

### 6. Start the frontend

Open another terminal:

```bash
cd frontend

npm install

npm run dev
```

Frontend URL:

`http://localhost:5173`

## How It Works

1. The user uploads a PDF or TXT document.
2. The backend extracts the document text.
3. The extracted text is divided into smaller chunks.
4. Sentence Transformers converts the chunks into numerical embeddings.
5. ChromaDB stores the embeddings for semantic search.
6. When the user asks a question, the system searches for relevant document chunks.
7. The retrieved context is sent to NVIDIA Nemotron.
8. The model generates an answer based on the retrieved information.
9. The answer and source references are displayed in the frontend.

## Future Improvements

- Chat history and conversation management.
- Streaming AI responses.
- Improved source citations.
- PDF preview.
- More advanced retrieval and reranking.
- Better document processing and OCR support.

## Author

**Spandan**

GitHub: [@spandan120406](https://github.com/spandan120406)

---

*Built as a personal AI and Retrieval-Augmented Generation project.*