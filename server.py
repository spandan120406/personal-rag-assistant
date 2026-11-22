
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pathlib import Path
import shutil

from rag import (
    initialize,
    process_documents,
    retrieve_documents,
    generate_answer
)

# Initialize FastAPI
app = FastAPI(title="Personal RAG Assistant API")

# Allow React frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DOCS_DIR = Path("docs")
DOCS_DIR.mkdir(exist_ok=True)

# Initialize RAG components
llm, model_name, embedding_model, collection = initialize()

# Request model
class ChatRequest(BaseModel):
    question: str


@app.get("/")
def home():
    return {
        "message": "Personal RAG Assistant API is running!"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "model": model_name,
        "documents_indexed": collection.count()
    }


@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):

    filename = Path(file.filename or "").name

    if Path(filename).suffix.lower() not in [".pdf", ".txt"]:
        raise HTTPException(
            status_code=400,
            detail="Only PDF and TXT files are supported."
        )

    if not filename:
        raise HTTPException(
            status_code=400,
            detail="Invalid filename."
        )

    destination = DOCS_DIR / filename

    try:
        with destination.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        process_documents(embedding_model, collection)

        return {
            "message": "Document uploaded and indexed successfully!",
            "filename": filename,
            "total_chunks": collection.count()
        }

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@app.post("/chat")
def chat(request: ChatRequest):

    question = request.question.strip()

    if not question:
        raise HTTPException(
            status_code=400,
            detail="Question cannot be empty."
        )

    documents = retrieve_documents(
        question,
        embedding_model,
        collection
    )

    if not documents:
        return {
            "answer": "No documents are available. Please upload a PDF or TXT file.",
            "sources": []
        }

    try:
        answer = generate_answer(
            question,
            documents,
            llm,
            model_name
        )

        sources = sorted({
            document["source"] for document in documents
        })

        return {
            "answer": answer,
            "sources": sources
        }

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))



@app.get("/documents")
def list_documents():
    files = []

    for file in DOCS_DIR.iterdir():
        if file.is_file() and file.suffix.lower() in [".pdf", ".txt"]:
            files.append({
                "filename": file.name,
                "size": file.stat().st_size
            })

    return {"documents": files}


@app.delete("/documents/{filename}")
def delete_document(filename: str):
    # Prevent path traversal
    if Path(filename).name != filename:
        raise HTTPException(status_code=400, detail="Invalid filename.")

    if Path(filename).suffix.lower() not in [".pdf", ".txt"]:
        raise HTTPException(status_code=400, detail="Only PDF and TXT files are supported.")

    file_path = DOCS_DIR / filename

    if not file_path.is_file():
        raise HTTPException(status_code=404, detail="Document not found.")

    try:
        # Remove all chunks belonging to this document from ChromaDB
        collection.delete(where={"source": filename})

        # Remove the original file
        file_path.unlink()

        return {
            "message": "Document deleted successfully!",
            "filename": filename
        }

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))
