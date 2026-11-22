
import chromadb
from sentence_transformers import SentenceTransformer

print("Loading embedding model...")

model = SentenceTransformer("all-MiniLM-L6-v2")

documents = [
    "Python is a programming language.",
    "ChromaDB is a vector database used for semantic search.",
    "NVIDIA Nemotron is an AI model used to generate responses.",
    "A Personal RAG Assistant retrieves information from documents."
]

print("Creating embeddings...")

embeddings = model.encode(documents).tolist()

print("Creating ChromaDB collection...")

client = chromadb.Client()

collection = client.create_collection(
    name="personal_rag_test"
)

collection.add(
    documents=documents,
    embeddings=embeddings,
    ids=["doc1", "doc2", "doc3", "doc4"]
)

question = "Which database is used for vector search?"

query_embedding = model.encode([question]).tolist()

results = collection.query(
    query_embeddings=query_embedding,
    n_results=2
)

print("\nSearch question:", question)
print("\nRetrieved documents:")

for result in results["documents"][0]:
    print("-", result)

print("\nChromaDB test successful!")
