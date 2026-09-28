import React, { useEffect, useRef } from 'react'
import ChatMessage from './ChatMessage'

function ChatWindow({ messages }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="chat-messages-container">
      {messages.map((message, index) => (
        <ChatMessage
          key={index}
          role={message.role}
          content={message.content}
          source={message.source}
          page={message.page}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  )
}

export default ChatWindow