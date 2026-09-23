import React from 'react'
import ChatMessage from './ChatMessage'

function ChatWindow({ messages }) {
  return (
    <div className="chat-window">
      {messages.length === 0 ? (
        <div className="empty-chat">
          <p>💬 No questions yet.</p>
          <p>Ask something about your document.</p>
        </div>
      ) : (
        messages.map((message, index) => (
          <ChatMessage
            key={index}
            role={message.role}
            content={message.content}
            source={message.source}
            page={message.page}
          />
        ))
      )}
    </div>
  )
}

export default ChatWindow