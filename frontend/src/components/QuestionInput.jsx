import React, { useState } from 'react'

function QuestionInput({ onQuestion, disabled, placeholder }) {
  const [question, setQuestion] = useState('')

  const handleSubmit = (event) => {
    if (event) event.preventDefault()

    const trimmedQuestion = question.trim()
    if (!trimmedQuestion || disabled) {
      return
    }

    onQuestion(trimmedQuestion)
    setQuestion('')
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="question-input-wrapper">
      <form onSubmit={handleSubmit} className="question-form">
        <div className="input-field-container">
          <input
            type="text"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              placeholder ||
              (disabled
                ? 'Upload and select a document to start asking questions...'
                : 'Ask a question about this document...')
            }
            disabled={disabled}
            className="chat-text-input"
          />

          <button
            type="submit"
            disabled={disabled || !question.trim()}
            className="send-message-btn"
            title="Send question (Enter)"
          >
            <span>Send</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </form>
    </div>
  )
}

export default QuestionInput