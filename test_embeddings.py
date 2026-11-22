
from sentence_transformers import SentenceTransformer

print("Loading embedding model...")

model = SentenceTransformer("all-MiniLM-L6-v2")

sentences = [
    "Personal RAG Assistant uses Python and ChromaDB.",
    "NVIDIA Nemotron generates AI responses.",
    "Documents can be searched using semantic embeddings."
]

embeddings = model.encode(sentences)

print("\nEmbedding test successful!")
print("Number of sentences:", len(embeddings))
print("Embedding dimensions:", embeddings.shape[1])
