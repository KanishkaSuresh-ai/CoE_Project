import React, { useState, useEffect } from 'react'
import FileUpload from './components/FileUpload'
import ChatWindow from './components/ChatWindow'
import QuestionInput from './components/QuestionInput'
import Loading from './components/Loading'
import Popup from './components/Popup'
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

  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(messages))
  }, [messages])

  const handleFilesSelect = (files) => {
    setSelectedFiles(files)
    setDocumentReady(false)
    setError(null)
  }

  const handleLimitExceeded = () => {
    setPopupMessage(`You can upload a maximum of ${MAX_FILES} files only.`)
  }

  const handleUpload = () => {
    if (selectedFiles.length === 0) return
    setLoading(true)
    setError(null)

    setTimeout(() => {
      setLoading(false)
      setDocumentReady(true)
      setStep('chat')
    }, 1500)
  }

  const handleQuestion = (question) => {
    if (!documentReady) return

    const userMessage = { role: 'user', content: question }
    setMessages((prev) => [...prev, userMessage])
    setLoading(true)
    setError(null)

    setTimeout(() => {
      const assistantMessage = {
        role: 'assistant',
        content: `Mock answer for: "${question}". Real answer will come from the document(s) once backend is connected.`,
        source: selectedFiles[0] ? selectedFiles[0].name : 'document.pdf',
        page: 3,
      }
      setMessages((prev) => [...prev, assistantMessage])
      setLoading(false)
    }, 1000)
  }

  // ---- IMPORTANT: this does NOT clear selectedFiles anymore ----
  // Going back to Step 1 keeps the same files. User can manually
  // remove (✕) unwanted ones or add new ones (up to MAX_FILES).
  const handleChangeDocument = () => {
    setStep('upload')
    setDocumentReady(false)
  }

  const handleClearChat = () => {
    setMessages([])
    localStorage.removeItem('chatHistory')
  }

  return (
    <div className="app">

      {step === 'upload' && (
        <div className="wizard-screen">
          <div className="wizard-dots">
            <span className="dot active"></span>
            <span className="dot"></span>
          </div>

          <div className="wizard-header">
            <h1>📄 Document Q&A Assistant</h1>
            <p>Step 1: Upload up to {MAX_FILES} documents to get started</p>
          </div>

          <FileUpload
            selectedFiles={selectedFiles}
            documentReady={documentReady}
            onFilesSelect={handleFilesSelect}
            onUpload={handleUpload}
            onLimitExceeded={handleLimitExceeded}
          />

          {loading && <Loading />}
        </div>
      )}

      {step === 'chat' && (
        <div className="wizard-screen chat-screen">
          <div className="wizard-dots">
            <span className="dot"></span>
            <span className="dot active"></span>
          </div>

          <div className="chat-card">
            <div className="chat-top-bar">
              <div>
                <strong>📄 {selectedFiles.length} document{selectedFiles.length > 1 ? 's' : ''} loaded</strong>
                <p className="ready-text">✅ Ready to answer questions</p>
              </div>
              <button className="change-doc-btn" onClick={handleChangeDocument}>
                ← Back
              </button>
            </div>

            <div className="chat-scroll-area">
              {error && <div className="error-message">⚠️ {error}</div>}
              <ChatWindow messages={messages} />
              {loading && <Loading />}
            </div>

            <div className="chat-input-bar">
              {messages.length > 0 && (
                <button className="clear-chat-btn" onClick={handleClearChat}>
                  🗑️ Clear conversation
                </button>
              )}
              <QuestionInput onQuestion={handleQuestion} disabled={loading} />
            </div>
          </div>
        </div>
      )}

      <Popup message={popupMessage} onClose={() => setPopupMessage(null)} />
    </div>
  )
}

export default App