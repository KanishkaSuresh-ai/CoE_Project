import React, { useEffect, useState } from 'react'
import FileUpload from './components/FileUpload'
import ChatWindow from './components/ChatWindow'
import QuestionInput from './components/QuestionInput'
import Loading from './components/Loading'
import Popup from './components/Popup'
import PDFViewer from './components/PDFViewer'
import { uploadDocument, askQuestion } from './services/api'
import './App.css'

const MAX_FILES = 1

function App() {
  const [selectedFiles, setSelectedFiles] = useState([]) // all uploaded docs (history)
  const [pendingFiles, setPendingFiles] = useState([]) // files chosen in upload modal
  const [fileSessions, setFileSessions] = useState({}) // fileKey -> session_id
  const [activeFileIndex, setActiveFileIndex] = useState(0)
  const [documentReady, setDocumentReady] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [rightTab, setRightTab] = useState('preview') // 'sources' | 'preview' | 'details'
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [rightSidebarWidth, setRightSidebarWidth] = useState(360)
  const [chatHistories, setChatHistories] = useState(() => {
    try {
      const saved = localStorage.getItem('chatHistories')
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })

  const [messages, setMessages] = useState([])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [popupMessage, setPopupMessage] = useState(null)
  const getFileKey = (file) => {
    if (!file) return null
    return `${file.name}-${file.lastModified}`
  }

  useEffect(() => {
    localStorage.setItem('chatHistories', JSON.stringify(chatHistories))
  }, [chatHistories])

  // Keep the active document's chat saved automatically
  useEffect(() => {
    const file = selectedFiles[activeFileIndex]
    if (!file) return
    const key = getFileKey(file)
    setChatHistories((prev) => ({ ...prev, [key]: messages }))
  }, [messages])

  const handleFilesSelect = (files) => {
    setPendingFiles(files)
    setError(null)
  }

  const handleOpenUploadModal = () => {
    setPendingFiles([])
    setError(null)
    setShowUploadModal(true)
  }

  const handleLimitExceeded = () => {
    setPopupMessage(`You can upload a maximum of ${MAX_FILES} files only.`)
  }

  const handleUpload = async () => {
    if (pendingFiles.length === 0) {
      setError('Please select at least one document.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const uploadResult = await uploadDocument(pendingFiles)
      const newSessionId = uploadResult.session_id

      // Add new files to history (skip duplicates), keep old ones
      const existingKeys = selectedFiles.map(getFileKey)
      const filesToAdd = pendingFiles.filter((f) => !existingKeys.includes(getFileKey(f)))
      const updatedFiles = [...selectedFiles, ...filesToAdd]

      const sessionUpdates = {}
      pendingFiles.forEach((f) => {
        sessionUpdates[getFileKey(f)] = newSessionId
      })
      setFileSessions((prev) => ({ ...prev, ...sessionUpdates }))

      // Make the newly uploaded file active
      const newActiveFile = pendingFiles[0]
      const newActiveKey = getFileKey(newActiveFile)
      const newActiveIndex = updatedFiles.findIndex((f) => getFileKey(f) === newActiveKey)

      setSelectedFiles(updatedFiles)
      setActiveFileIndex(newActiveIndex)
      setSessionId(newSessionId)
      setDocumentReady(true)
      setPendingFiles([])
      setShowUploadModal(false)
      setMessages(chatHistories[newActiveKey] || [])
    } catch (err) {
      setError(err.message || 'Document upload failed')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const handleQuestion = async (question) => {
    if (!documentReady) {
      setError('Please upload your documents first.')
      setShowUploadModal(true)
      return
    }

    if (!question || !question.trim()) {
      return
    }

    const userMessage = {
      role: 'user',
      content: question,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMessage])
    setLoading(true)
    setError(null)

    try {
      const result = await askQuestion(question, sessionId)

      const assistantMessage = {
        role: 'assistant',
        content: result.answer,
        source: result.sources?.join(', ') || 'Uploaded document',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (err) {
      setError(err.message || 'Question request failed')
    } finally {
      setLoading(false)
    }
  }

  const handleDocumentSelect = (index) => {
  const currentFile = selectedFiles[activeFileIndex]
  const nextFile = selectedFiles[index]

  // Save the current document's chat
  if (currentFile) {
    const currentKey = getFileKey(currentFile)

    setChatHistories((prev) => ({
      ...prev,
      [currentKey]: messages,
    }))
  }

  // Load the selected document's chat
  const nextKey = getFileKey(nextFile)
  const nextMessages = chatHistories[nextKey] || []

    // Current chat is already auto-saved; just load the selected document's chat
    setActiveFileIndex(index)
    setSessionId(fileSessions[nextKey] || null)
    setError(null)
    setMessages(chatHistories[nextKey] || [])
  }

  const handleClearChat = () => {
    const activeKey = getFileKey(selectedFiles[activeFileIndex])

    setMessages([])

    if (activeKey) {
      setChatHistories((prev) => ({
        ...prev,
        [activeKey]: [],
      }))
    }
  }

  const activeFile = selectedFiles[activeFileIndex]

  // Suggested questions list
  const suggestedQuestions = [
    { text: 'What is the main objective of this document?', label: '💡 Main Objective' },
    { text: 'Give me a concise summary of this document.', label: '📝 Summarize' },
    { text: 'What are the key takeaways and important points?', label: '🔎 Key Takeaways' },
    { text: 'What conclusions or recommendations are mentioned?', label: '📋 Conclusions' },
  ]

  // Sources collected from assistant messages
  const assistantMessages = messages.filter((m) => m.role === 'assistant')
  const latestAssistantMessage = assistantMessages[assistantMessages.length - 1]

  // Resize bar between chat and right sidebar
  const handleResizeStart = (e) => {
    e.preventDefault()

    const startX = e.clientX
    const startWidth = rightSidebarWidth

    document.body.classList.add('resizing')

    const handleMouseMove = (moveEvent) => {
      const delta = startX - moveEvent.clientX

      const newWidth = Math.min(800, Math.max(280, startWidth + delta))

      setRightSidebarWidth(newWidth)
    }

    const handleMouseUp = () => {
      document.body.classList.remove('resizing')
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  return (
    <div className="app-container">
      {/* ================= TOP NAVBAR ================= */}
      <header className="app-navbar">
        <div className="navbar-brand">
  <img
    src="/logo.svg"
    alt="DocX Assistant"
    width="44"
    height="44"
    className="brand-logo-img"
  />
  <div>
    <div className="brand-title-row">
      <h1 className="brand-title">DocX Assistant</h1>
    </div>
    <p className="brand-subtitle">Ask anything from your documents with AI precision</p>
  </div>
</div>

        <div className="navbar-right">
          <div className={`status-pill ${documentReady ? 'status-ready' : 'status-waiting'}`}>
            <span className="status-indicator-dot"></span>
            <span>{documentReady ? 'RAG Index Active' : 'No Document Loaded'}</span>
          </div>
        </div>
      </header>

      {/* ================= 3-COLUMN DASHBOARD LAYOUT ================= */}
      <div
        className="dashboard-grid"
        style={{ '--right-sidebar-width': `${rightSidebarWidth}px` }}
      >
        {/* ================= COLUMN 1: LEFT SIDEBAR (DOCUMENTS) ================= */}
        <aside className="sidebar-column documents-sidebar">
          {/* Upload button (top of left sidebar) */}
          <button
            type="button"
            className="sidebar-upload-btn"
            onClick={handleOpenUploadModal}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <span>Upload Document</span>
          </button>

          <div className="sidebar-section-header">
            <div>
              <h2 className="sidebar-heading-title">Documents</h2>
              <p className="sidebar-heading-subtitle">
                {selectedFiles.length} uploaded
              </p>
            </div>
            <span className="doc-count-badge">{selectedFiles.length}</span>
          </div>

          <div className="documents-list-wrapper">
            <div className="documents-list-label">MY DOCUMENTS</div>

            {selectedFiles.length === 0 ? (
              <div className="no-docs-empty-card" onClick={handleOpenUploadModal}>
                <div className="empty-card-icon">📂</div>
                <h4>No documents yet</h4>
                <p>Click to upload PDF, DOCX, or TXT files to start asking questions.</p>
              </div>
            ) : (
              <div className="documents-list">
                {selectedFiles.map((file, index) => {
                  const isActive = activeFileIndex === index
                  const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf')
                  const isDocx = file.name.toLowerCase().endsWith('.docx')
                  return (
                    <button
                      type="button"
                      key={file.name + '-' + file.lastModified}
                      className={`doc-card-item ${isActive ? 'doc-card-active' : ''}`}
                      onClick={() => handleDocumentSelect(index)}
                    >
                      <div className="doc-card-icon-box">
                        {isPdf ? (
                          <span className="file-icon-pdf">📄</span>
                        ) : (
                          <span className="file-icon-txt">📝</span>
                        )}
                      </div>

                      <div className="doc-card-content">
                        <span className="doc-card-name" title={file.name}>
                          {file.name}
                        </span>
                        <div className="doc-card-meta">
                          <span className="doc-type-tag">{isPdf ? 'PDF' : isDocx ? 'DOCX' : 'TXT'}</span>
                          <span className="doc-size-text">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                          </span>
                        </div>
                      </div>

                      {isActive && (
                        <div className="active-check-badge" title="Active document">
                          ✓
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </aside>

        {/* ================= COLUMN 2: CENTER (Q&A CHAT) ================= */}
        <main className="center-column chat-column">
          <div className="chat-column-header">
            <div className="active-doc-info">
              <div className="active-doc-icon-badge">
                {activeFile ? (activeFile.name.endsWith('.txt') ? '📝' : '📄') : '📄'}
              </div>
              <div>
                <span className="active-doc-tag">SELECTED DOCUMENT</span>
                <h2 className="active-doc-title" title={activeFile ? activeFile.name : 'No document selected'}>
                  {activeFile ? activeFile.name : 'No document selected'}
                </h2>
              </div>
            </div>

            <div className="chat-header-actions">
              {documentReady && (
                <span className="doc-status-indicator">
                  <span className="pulse-dot"></span> Ready for Q&amp;A
                </span>
              )}
              {messages.length > 0 && (
                <button
                  type="button"
                  className="clear-conversation-btn"
                  onClick={handleClearChat}
                  title="Clear conversation history"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                  <span>Clear Chat</span>
                </button>
              )}
            </div>
          </div>

          <div className="chat-scroll-area">
            {error && (
              <div className="chat-alert-banner chat-alert-error">
                <span>⚠️ {error}</span>
                <button type="button" className="close-alert-btn" onClick={() => setError(null)}>✕</button>
              </div>
            )}

            {!documentReady && selectedFiles.length === 0 ? (
              <div className="welcome-chat-hero">
                <div className="hero-icon-container">
                  <div className="hero-icon-glow"></div>
                  <span className="hero-icon">📄</span>
                </div>
                <h3>Welcome to DocX Assistant</h3>
                <p>
                  Upload your documents on the left sidebar to start asking questions, summarizing content, and retrieving exact citations.
                </p>
                <button
                  type="button"
                  className="hero-upload-cta"
                  onClick={handleOpenUploadModal}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <span>Upload Document to Begin</span>
                </button>
              </div>
            ) : messages.length === 0 && !loading ? (
              <div className="welcome-chat-hero">
                <div className="hero-icon-container">
                  <div className="hero-icon-glow"></div>
                  <span className="hero-icon">💬</span>
                </div>
                <h3>Ask anything about your document</h3>
                <p>
                  Your questions are answered strictly using the context from{' '}
                  <strong>{activeFile ? activeFile.name : 'your uploaded documents'}</strong>.
                </p>

                <div className="suggested-questions-section">
                  <span className="suggested-label">SUGGESTED QUESTIONS</span>
                  <div className="suggested-chips-grid">
                    {suggestedQuestions.map((sq, i) => (
                      <button
                        key={i}
                        type="button"
                        className="suggested-chip"
                        onClick={() => handleQuestion(sq.text)}
                      >
                        <span className="chip-label">{sq.label}</span>
                        <span className="chip-text">{sq.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="chat-messages-wrapper">
                <ChatWindow messages={messages} />

                {loading && (
                  <div className="assistant-loading-card">
                    <div className="message-avatar">
                      <span className="avatar-assistant">✨</span>
                    </div>
                    <div className="message-card assistant-message loading-bubble">
                      <Loading text="Searching document chunks & generating answer..." />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="chat-bottom-input-bar">
            {messages.length > 0 && (
              <div className="mini-suggestions-bar">
                <span className="mini-suggest-title">Suggestions:</span>
                <button
                  type="button"
                  className="mini-suggest-chip"
                  onClick={() => handleQuestion('Summarize key points of this document')}
                  disabled={loading}
                >
                  📝 Summarize key points
                </button>
                <button
                  type="button"
                  className="mini-suggest-chip"
                  onClick={() => handleQuestion('What are the main takeaways?')}
                  disabled={loading}
                >
                  💡 Main takeaways
                </button>
              </div>
            )}

            <QuestionInput
              onQuestion={handleQuestion}
              disabled={loading || !documentReady}
              placeholder={
                !documentReady
                  ? 'Upload a document first to start asking questions...'
                  : 'Ask a question about this document...'
              }
            />
          </div>
        </main>

        {/* ================= COLUMN 3: RIGHT SIDE (SOURCES / PREVIEW / DETAILS) ================= */}
        <aside className="sidebar-column right-details-sidebar" style={{ position: 'relative' }}>
          {/* Resize bar (drag to adjust width) */}
          <div
            className="sidebar-resize-bar"
            onMouseDown={handleResizeStart}
            title="Drag to resize"
          />

          <div className="right-sidebar-tabs">
            <button
              type="button"
              className={`tab-item ${rightTab === 'sources' ? 'tab-item-active' : ''}`}
              onClick={() => setRightTab('sources')}
            >
              <span>Sources</span>
              {assistantMessages.length > 0 && (
                <span className="tab-badge">{assistantMessages.length}</span>
              )}
            </button>

            <button
              type="button"
              className={`tab-item ${rightTab === 'preview' ? 'tab-item-active' : ''}`}
              onClick={() => setRightTab('preview')}
            >
              <span>Document Preview</span>
            </button>

            <button
              type="button"
              className={`tab-item ${rightTab === 'details' ? 'tab-item-active' : ''}`}
              onClick={() => setRightTab('details')}
            >
              <span>Details</span>
            </button>
          </div>

          <div className="right-tab-content-area">
            {/* TAB 1: SOURCES */}
            {rightTab === 'sources' && (
              <div className="tab-pane sources-pane">
                <div className="pane-header">
                  <h3>Retrieved Sources</h3>
                  <p>Document chunks &amp; citations used for AI responses</p>
                </div>

                {assistantMessages.length === 0 ? (
                  <div className="empty-tab-state">
                    <div className="empty-tab-icon">📑</div>
                    <h4>No Sources Queried Yet</h4>
                  </div>
                ) : (
                  <div className="sources-list">
                    {assistantMessages.map((msg, index) => (
                      <div key={index} className="source-card">
                        <div className="source-card-header">
                          <span className="source-card-title">
                            📄 {msg.source || (activeFile ? activeFile.name : 'Document')}
                          </span>
                        </div>
                        <div className="source-card-footer">
                          <span className="source-time">Response #{index + 1}</span>
                          <span className="source-grounded-badge">✓ Source Used</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: DOCUMENT PREVIEW */}
            {rightTab === 'preview' && (
              <div className="tab-pane preview-pane">
                <div className="pane-header">
                  <h3>Document Preview</h3>
                  <p>{activeFile ? activeFile.name : 'No file selected'}</p>
                </div>

                <div className="pdf-viewer-tab-wrapper">
                  <PDFViewer file={activeFile} />
                </div>
              </div>
            )}

            {/* TAB 3: DETAILS */}
            {rightTab === 'details' && (
              <div className="tab-pane details-pane">
                <div className="pane-header">
                  <h3>Document Details</h3>
                  <p>Metadata &amp; processing status</p>
                </div>

                {activeFile ? (
                  <div className="details-card-list">
                    <div className="detail-row-card">
                      <span className="detail-label">File Name</span>
                      <strong className="detail-value file-name-value">{activeFile.name}</strong>
                    </div>

                    <div className="detail-row-card">
                      <span className="detail-label">File Format</span>
                      <span className="detail-value">
                        {activeFile.name.toLowerCase().endsWith('.docx')
                          ? 'Word Document (DOCX)'
                          : activeFile.type === 'application/pdf'
                            ? 'PDF Document'
                            : 'Text Document (TXT)'}
                      </span>
                    </div>

                    <div className="detail-row-card">
                      <span className="detail-label">File Size</span>
                      <span className="detail-value">
                        {(activeFile.size / (1024 * 1024)).toFixed(2)} MB ({activeFile.size.toLocaleString()} bytes)
                      </span>
                    </div>

                    <div className="detail-row-card">
                      <span className="detail-label">Last Modified</span>
                      <span className="detail-value">
                        {activeFile.lastModified ? new Date(activeFile.lastModified).toLocaleDateString() : 'Recent'}
                      </span>
                    </div>

                    <div className="detail-row-card">
                      <span className="detail-label">RAG Index Status</span>
                      <span className="detail-badge-success">
                        ✓ {documentReady ? 'Active & Searchable' : 'Pending Upload'}
                      </span>
                    </div>

                    <div className="detail-row-card">
                      <span className="detail-label">Total Documents</span>
                      <span className="detail-value">{selectedFiles.length} file(s) in knowledge base</span>
                    </div>
                  </div>
                ) : (
                  <div className="empty-tab-state">
                    <div className="empty-tab-icon">ℹ️</div>
                    <h4>No Document Selected</h4>
                    <p>Upload and select a document to inspect its metadata and properties.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* ================= UPLOAD MODAL ================= */}
      {showUploadModal && (
        <FileUpload
          selectedFiles={pendingFiles}
          documentReady={false}
          onFilesSelect={handleFilesSelect}
          onUpload={handleUpload}
          onLimitExceeded={handleLimitExceeded}
          isModal={true}
          onCloseModal={() => setShowUploadModal(false)}
        />
      )}

      {/* ================= POPUP NOTIFICATION ================= */}
      <Popup
        message={popupMessage}
        onClose={() => setPopupMessage(null)}
      />
    </div>
  )
}

export default App