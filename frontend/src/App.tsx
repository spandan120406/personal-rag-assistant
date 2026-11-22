
import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import {
  getDocuments,
  uploadDocument,
  deleteDocument,
  type Document,
} from './api'
import './App.css'

type Message = {
  role: 'user' | 'assistant'
  content: string
  sources?: string[]
}

type Page = 'chat' | 'documents'

function App() {
  const [page, setPage] = useState<Page>('chat')

  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)

  const [documents, setDocuments] = useState<Document[]>([])
  const [documentsLoading, setDocumentsLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [documentError, setDocumentError] = useState('')
  const [documentMessage, setDocumentMessage] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load documents from FastAPI
  const loadDocuments = async () => {
    setDocumentsLoading(true)
    setDocumentError('')

    try {
      const data = await getDocuments()
      setDocuments(data)
    } catch (error) {
      console.error(error)
      setDocumentError('Could not load documents. Check your backend connection.')
    } finally {
      setDocumentsLoading(false)
    }
  }

  useEffect(() => {
    if (page === 'documents') {
      loadDocuments()
    }
  }, [page])

  // Upload a document
  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) return

    setUploading(true)
    setDocumentError('')
    setDocumentMessage('')

    try {
      await uploadDocument(file)
      setDocumentMessage(`${file.name} uploaded and indexed successfully!`)
      await loadDocuments()
    } catch (error) {
      console.error(error)
      setDocumentError(
        error instanceof Error ? error.message : 'Document upload failed.'
      )
    } finally {
      setUploading(false)

      // Allow selecting the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Delete a document
  const handleDelete = async (filename: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete ${filename}?`
    )

    if (!confirmed) return

    setDocumentError('')
    setDocumentMessage('')

    try {
      await deleteDocument(filename)
      setDocumentMessage(`${filename} deleted successfully!`)
      await loadDocuments()
    } catch (error) {
      console.error(error)
      setDocumentError(
        error instanceof Error ? error.message : 'Document deletion failed.'
      )
    }
  }

  // Send a chat message
  const sendMessage = async (text = question) => {
    const cleanQuestion = text.trim()

    if (!cleanQuestion || loading) return

    setMessages((previous) => [
      ...previous,
      { role: 'user', content: cleanQuestion },
    ])

    setQuestion('')
    setLoading(true)

    try {
      const response = await fetch('http://127.0.0.1:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: cleanQuestion }),
      })

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`)
      }

      const data = await response.json()

      setMessages((previous) => [
        ...previous,
        {
          role: 'assistant',
          content: data.answer,
          sources: data.sources || [],
        },
      ])
    } catch (error) {
      console.error(error)

      setMessages((previous) => [
        ...previous,
        {
          role: 'assistant',
          content:
            'I could not connect to the backend. Please make sure your FastAPI server is running on port 8000.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const newChat = () => {
    setMessages([])
    setQuestion('')
    setPage('chat')
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="workspace">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">✦</div>
          <span>Personal RAG</span>
        </div>

        <button className="new-chat" onClick={newChat}>
          + New Chat
        </button>

        <div className="sidebar-section">
          <p className="section-label">WORKSPACE</p>

          <button
            className={`nav-item ${page === 'chat' ? 'active' : ''}`}
            onClick={() => setPage('chat')}
          >
            ◈ &nbsp; AI Chat
          </button>

          <button
            className={`nav-item ${page === 'documents' ? 'active' : ''}`}
            onClick={() => setPage('documents')}
          >
            ▤ &nbsp; Documents
          </button>
        </div>

        <div className="sidebar-bottom">
          <div className="connection">
            <span className="status-dot"></span>
            Backend connected
          </div>
          <p>Powered by NVIDIA Nemotron</p>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <span>
            {page === 'chat' ? 'AI Workspace' : 'Document Library'}
          </span>
          <span className="model-label">Nemotron 3.5 Lightning</span>
        </header>

        {page === 'chat' ? (
          <>
            <section className="chat-area">
              {messages.length === 0 ? (
                <div className="welcome">
                  <div className="welcome-icon">✦</div>
                  <h1>What would you like to know?</h1>
                  <p>
                    Ask questions about your documents and let AI find the answers.
                  </p>

                  <div className="suggestions">
                    <button
                      onClick={() => sendMessage('Summarize my documents')}
                    >
                      Summarize my documents
                    </button>

                    <button
                      onClick={() => sendMessage('What are the key topics?')}
                    >
                      Find key topics
                    </button>
                  </div>
                </div>
              ) : (
                <div className="messages">
                  {messages.map((message, index) => (
                    <div className={`message ${message.role}`} key={index}>
                      <div className="message-avatar">
                        {message.role === 'user' ? 'You' : '✦'}
                      </div>

                      <div className="message-content">
                        <ReactMarkdown>{message.content}</ReactMarkdown>

                        {message.sources && message.sources.length > 0 && (
                          <div className="sources">
                            <strong>Sources</strong>
                            {message.sources.map((source) => (
                              <span className="source-tag" key={source}>
                                ▤ {source}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {loading && (
                    <div className="loading-message">
                      <span className="status-dot"></span>
                      Nemotron is thinking...
                    </div>
                  )}
                </div>
              )}
            </section>

            <div className="composer-area">
              <form
                className="composer"
                onSubmit={(event) => {
                  event.preventDefault()
                  sendMessage()
                }}
              >
                <input
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  placeholder="Ask anything about your documents..."
                  disabled={loading}
                />

                <button
                  className="send-button"
                  type="submit"
                  disabled={!question.trim() || loading}
                >
                  ↑
                </button>
              </form>

              <p className="disclaimer">
                AI responses are generated from your indexed documents.
              </p>
            </div>
          </>
        ) : (
          <section className="documents-area">
            <div className="documents-header">
              <div>
                <h1>Your Documents</h1>
                <p>Manage the files used by your AI assistant.</p>
              </div>

              <button
                className="upload-button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : '+ Upload Document'}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt,application/pdf,text/plain"
                hidden
                onChange={handleUpload}
              />
            </div>

            {documentMessage && (
              <div className="document-success">
                {documentMessage}
              </div>
            )}

            {documentError && (
              <div className="document-error">
                {documentError}
              </div>
            )}

            <div className="document-summary">
              <span>DOCUMENTS</span>
              <strong>{documents.length}</strong>
            </div>

            {documentsLoading ? (
              <div className="documents-empty">
                Loading your documents...
              </div>
            ) : documents.length === 0 ? (
              <div className="documents-empty">
                <div className="welcome-icon">▤</div>
                <h2>No documents yet</h2>
                <p>Upload a PDF or TXT file to start building your knowledge base.</p>
                <button
                  className="upload-button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  Upload your first document
                </button>
              </div>
            ) : (
              <div className="document-list">
                {documents.map((document) => (
                  <div className="document-card" key={document.filename}>
                    <div className="document-icon">
                      {document.filename.toLowerCase().endsWith('.pdf')
                        ? '📕'
                        : '📄'}
                    </div>

                    <div className="document-info">
                      <strong>{document.filename}</strong>
                      <span>{formatFileSize(document.size)}</span>
                    </div>

                    <span className="document-status">Indexed</span>

                    <button
                      className="delete-button"
                      onClick={() => handleDelete(document.filename)}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  )
}

export default App

