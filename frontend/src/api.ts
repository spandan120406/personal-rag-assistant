
const API_URL = "http://127.0.0.1:8000";

export interface Document {
  filename: string;
  size: number;
}

export async function getDocuments(): Promise<Document[]> {
  const response = await fetch(`${API_URL}/documents`);

  if (!response.ok) {
    throw new Error("Failed to load documents");
  }

  const data = await response.json();
  return data.documents;
}

export async function uploadDocument(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Upload failed");
  }

  return response.json();
}

export async function deleteDocument(filename: string) {
  const response = await fetch(
    `${API_URL}/documents/${encodeURIComponent(filename)}`,
    { method: "DELETE" }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Delete failed");
  }

  return response.json();
}
