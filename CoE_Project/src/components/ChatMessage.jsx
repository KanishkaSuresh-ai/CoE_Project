import React from 'react'
function ChatMessage({ role, content }) {
  const isUser = role === 'user'

  return (
    <div
      className={`message ${
        isUser ? 'user-message' : 'assistant-message'
      }`}
    >
      <strong>{isUser ? 'You' : 'Assistant'}</strong>

      <p>{content}</p>
    </div>
  )
}

export default ChatMessage