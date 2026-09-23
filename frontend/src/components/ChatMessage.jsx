import React from 'react'

function ChatMessage({ role, content, source, page }) {
  const isUser = role === 'user'
  const confidence = !isUser ? Math.floor(Math.random() * 15) + 80 : null // mock 80-95%

  return (
    <div className={`message ${isUser ? 'user-message' : 'assistant-message'}`}>
      <strong>{isUser ? 'You' : 'Assistant'}</strong>
      <p>{content}</p>

      {!isUser && source && (
        <>
          <span className="source-citation">📄 {source}{page ? `, page ${page}` : ''}</span>
          <span className="confidence-badge">✓ {confidence}% match</span>
        </>
      )}
    </div>
  )
}

export default ChatMessage