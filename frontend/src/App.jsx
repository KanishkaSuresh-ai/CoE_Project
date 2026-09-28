import React, { useEffect, useState } from 'react'
import FileUpload from './components/FileUpload'
import ChatWindow from './components/ChatWindow'
import QuestionInput from './components/QuestionInput'
import Loading from './components/Loading'
import Popup from './components/Popup'
import PDFViewer from './components/PDFViewer'
import { uploadDocument, askQuestion } from './services/api'
import './App.css'

const MAX_FILES = 3

function App() {
  const [selectedFiles, setSelectedFiles] = useState([])
  const [activeFileIndex, setActiveFileIndex] = useState(0)
  const [documentReady, setDocumentReady] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [rightTab, setRightTab] = useState('preview') // 'sources' | 'preview' | 'details'
  const [showUploadModal, setShowUploadModal] = useState(false)

  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('chatHistory')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [popupMessage, setPopupMessage] = useState(null)

  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(messages))
  }, [messages])

  const handleFilesSelect = (files) => {
    setSelectedFiles(files)
    setError(null)
    setDocumentReady(false)
    setSessionId(null)
    setMessages([])
    if (files.length > 0) {
      setActiveFileIndex(0)
    }
  }

  const handleLimitExceeded = () => {
    setPopupMessage(`You can upload a maximum of ${MAX_FILES} files only.`)
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select at least one document.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const uploadResult = await uploadDocument(selectedFiles)
      setSessionId(uploadResult.session_id)
      setDocumentReady(true)
      setActiveFileIndex(0)
      setShowUploadModal(false)
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
      const result = await askQuestion(question,sessionId)
  
      const activeFile = selectedFiles[activeFileIndex]

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
    setActiveFileIndex(index)
    setError(null)
  }

  const handleClearChat = () => {
    setMessages([])
    localStorage.removeItem('chatHistory')
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

  return (
    <div className="app-container">
      {/* ================= TOP NAVBAR ================= */}
      <header className="app-navbar">
        <div className="navbar-brand">
          <div className="brand-logo">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <div>
            <div className="brand-title-row">
              <h1 className="brand-title">DocuQuery AI</h1>
              <span className="brand-badge">RAG Assistant</span>
            </div>
            <p className="brand-subtitle">Ask anything from your documents with AI precision</p>
          </div>
        </div>

        <div className="navbar-right">
          <div className={`status-pill ${documentReady ? 'status-ready' : 'status-waiting'}`}>
            <span className="status-indicator-dot"></span>
            <span>{documentReady ? 'RAG Index Active' : 'No Document Loaded'}</span>
          </div>

          <button
            type="button"
            className="navbar-upload-btn"
            onClick={() => setShowUploadModal(true)}
          >
            <span className="btn-icon">+</span>
            <span>Upload Document</span>
          </button>
        </div>
      </header>

      {/* ================= 3-COLUMN DASHBOARD LAYOUT ================= */}
      <div className="dashboard-grid">
        {/* ================= COLUMN 1: LEFT SIDEBAR (DOCUMENTS) ================= */}
        <aside className="sidebar-column documents-sidebar">
          <div className="sidebar-section-header">
            <div>
              <h2 className="sidebar-heading-title">Documents</h2>
              <p className="sidebar-heading-subtitle">
                {selectedFiles.length} of {MAX_FILES} uploaded
              </p>
            </div>
            <span className="doc-count-badge">{selectedFiles.length}/{MAX_FILES}</span>
          </div>

          <div className="sidebar-upload-trigger">
            <button
              type="button"
              className="sidebar-upload-btn"
              onClick={() => setShowUploadModal(true)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span>Upload Document</span>
            </button>
          </div>

          <div className="documents-list-wrapper">
            <div className="documents-list-label">MY DOCUMENTS</div>

            {selectedFiles.length === 0 ? (
              <div className="no-docs-empty-card" onClick={() => setShowUploadModal(true)}>
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

          <div className="sidebar-status-footer">
            <div className="system-health-card">
              <div className="health-icon">⚡</div>
              <div className="health-text">
                <strong>{documentReady ? 'RAG Ready' : 'Awaiting Upload'}</strong>
                <p>{documentReady ? 'Embeddings indexed in memory' : 'Upload up to 3 files'}</p>
              </div>
            </div>
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
                <h3>Welcome to DocuQuery AI</h3>
                <p>
                  Upload your documents on the left sidebar to start asking questions, summarizing content, and retrieving exact citations.
                </p>
                <button
                  type="button"
                  className="hero-upload-cta"
                  onClick={() => setShowUploadModal(true)}
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

            <div className="chat-footer-caption">
              <span>Answers are generated from your uploaded document via RAG.</span>
            </div>
          </div>
        </main>

        {/* ================= COLUMN 3: RIGHT SIDE (SOURCES / PREVIEW / DETAILS) ================= */}
        <aside className="sidebar-column right-details-sidebar">
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
          selectedFiles={selectedFiles}
          documentReady={documentReady}
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
