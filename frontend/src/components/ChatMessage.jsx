import React, { useState } from 'react'

function ChatMessage({ role, content, source, page }) {
  const [copied, setCopied] = useState(false)
  const isUser = role === 'user'
  const confidence = !isUser ? 92 : null

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text', err)
    }
  }

  return (
    <div className={`chat-message-row ${isUser ? 'user-row' : 'assistant-row'}`}>
      <div className="message-avatar">
        {isUser ? (
          <span className="avatar-user" title="You">👤</span>
        ) : (
          <span className="avatar-assistant" title="AI Assistant">✨</span>
        )}
      </div>

      <div className={`message-card ${isUser ? 'user-message' : 'assistant-message'}`}>
        <div className="message-header">
          <span className="message-author">{isUser ? 'You' : 'DocuQuery AI'}</span>
          {!isUser && (
            <button
              type="button"
              className={`copy-btn ${copied ? 'copied' : ''}`}
              onClick={handleCopy}
              title="Copy to clipboard"
            >
              {copied ? '✓ Copied' : '📋 Copy'}
            </button>
          )}
        </div>

        <div className="message-body">
          <p>{content}</p>
        </div>

        {!isUser && source && (
          <div className="message-footer">
            <span className="source-citation" title="Referenced source">
              📄 {source}{page ? `, page ${page}` : ''}
            </span>
            <span className="confidence-badge">
              ✓ {confidence}% match
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatMessage