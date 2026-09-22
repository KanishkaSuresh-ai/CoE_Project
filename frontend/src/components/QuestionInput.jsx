import React, { useState } from 'react'

function QuestionInput({ onQuestion, disabled }) {
  const [question, setQuestion] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()

    const trimmedQuestion = question.trim()

    if (!trimmedQuestion) {
      return
    }

    onQuestion(trimmedQuestion)
    setQuestion('')
  }

  return (
    <section className="question-section">
      <form onSubmit={handleSubmit} className="question-form">
        <input
          type="text"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder={
            disabled
              ? 'Upload a document first...'
              : 'Ask a question about your document...'
          }
          disabled={disabled}
        />

        <button
          type="submit"
          disabled={disabled || !question.trim()}
        >
          Send
        </button>
      </form>
    </section>
  )
}

export default QuestionInput