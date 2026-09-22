import React from 'react'
import ChatMessage from './ChatMessage'

function ChatWindow({ messages }) {
  return (
    <section className="chat-section">
      <h2>Conversation</h2>

      <div className="chat-window">
        {messages.length === 0 ? (
          <div className="empty-chat">
            <p>💬 No questions yet.</p>
            <p>Upload a document and ask a question.</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <ChatMessage
              key={index}
              role={message.role}
              content={message.content}
            />
          ))
        )}
      </div>
    </section>
  )
}

export default ChatWindow