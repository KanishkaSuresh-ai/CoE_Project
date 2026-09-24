import React, { useEffect, useState } from 'react'
import FileUpload from './components/FileUpload'
import ChatWindow from './components/ChatWindow'
import QuestionInput from './components/QuestionInput'
import Loading from './components/Loading'
import Popup from './components/Popup'
import { uploadDocument, askQuestion } from './services/api'
import './App.css'

const MAX_FILES = 3

function App() {
  const [step, setStep] = useState('upload')
  const [selectedFiles, setSelectedFiles] = useState([])
  const [documentReady, setDocumentReady] = useState(false)

  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('chatHistory')
    return saved ? JSON.parse(saved) : []
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [popupMessage, setPopupMessage] = useState(null)

  // Save chat history
  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(messages))
  }, [messages])

  // Handle file selection
  const handleFilesSelect = (files) => {
    setSelectedFiles(files)
    setDocumentReady(false)
    setError(null)
  }

  // Handle maximum file limit
  const handleLimitExceeded = () => {
    setPopupMessage(
      `You can upload a maximum of ${MAX_FILES} files only.`
    )
  }

  // Upload document to backend
  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Backend currently processes one document at a time
      await uploadDocument(selectedFiles)

      setDocumentReady(true)
      setStep('chat')
    } catch (err) {
      setError(err.message || 'Document upload failed')
    } finally {
      setLoading(false)
    }
  }

  // Send question to backend
  const handleQuestion = async (question) => {
    if (!documentReady) {
      return
    }

    // Add user's question to chat
    const userMessage = {
      role: 'user',
      content: question,
    }

    setMessages((prev) => [...prev, userMessage])

    setLoading(true)
    setError(null)

    try {
      // Send question to FastAPI backend
      const result = await askQuestion(question)

      // Add backend answer to chat
      const assistantMessage = {
        role: 'assistant',
        content: result.answer,
        source: selectedFiles[0]
          ? selectedFiles[0].name
          : 'document.pdf',
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (err) {
      setError(err.message || 'Question request failed')
    } finally {
      setLoading(false)
    }
  }

  // Go back to document upload screen
  const handleChangeDocument = () => {
    setStep('upload')
    setDocumentReady(false)
  }

  // Clear chat history
  const handleClearChat = () => {
    setMessages([])
    localStorage.removeItem('chatHistory')
  }

  return (
    <div className="app">

      {/* Upload screen */}
      {step === 'upload' && (
        <div className="wizard-screen">

          <div className="wizard-dots">
            <span className="dot active"></span>
            <span className="dot"></span>
          </div>

          <div className="wizard-header">
            <h1>📄 Document Q&A Assistant</h1>

            <p>
              Step 1: Upload up to {MAX_FILES} documents to get started
            </p>
          </div>

          <FileUpload
            selectedFiles={selectedFiles}
            documentReady={documentReady}
            onFilesSelect={handleFilesSelect}
            onUpload={handleUpload}
            onLimitExceeded={handleLimitExceeded}
          />

          {loading && <Loading />}

          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}
        </div>
      )}

      {/* Chat screen */}
      {step === 'chat' && (
        <div className="wizard-screen chat-screen">

          <div className="wizard-dots">
            <span className="dot"></span>
            <span className="dot active"></span>
          </div>

          <div className="chat-card">

            {/* Chat header */}
            <div className="chat-top-bar">

              <div>
                <strong>
                  📄 {selectedFiles.length} document
                  {selectedFiles.length > 1 ? 's' : ''} loaded
                </strong>

                <p className="ready-text">
                  ✅ Ready to answer questions
                </p>
              </div>

              <button
                className="change-doc-btn"
                onClick={handleChangeDocument}
              >
                ← Back
              </button>

            </div>

            {/* Chat messages */}
            <div className="chat-scroll-area">

              {error && (
                <div className="error-message">
                  ⚠️ {error}
                </div>
              )}

              <ChatWindow messages={messages} />

              {loading && <Loading />}

            </div>

            {/* Question input */}
            <div className="chat-input-bar">

              {messages.length > 0 && (
                <button
                  className="clear-chat-btn"
                  onClick={handleClearChat}
                >
                  🗑️ Clear conversation
                </button>
              )}

              <QuestionInput
                onQuestion={handleQuestion}
                disabled={loading}
              />

            </div>

          </div>
        </div>
      )}

      {/* Popup */}
      <Popup
        message={popupMessage}
        onClose={() => setPopupMessage(null)}
      />

    </div>
  )
}

export default App