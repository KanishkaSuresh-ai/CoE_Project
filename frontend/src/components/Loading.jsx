import React from 'react'

function Loading({ text = 'Analyzing documents & thinking' }) {
  return (
    <div className="loading-state">
      <div className="loading-pulse-ring"></div>
      <span className="loading-text">{text}</span>
      <span className="typing-dots">
        <span></span>
        <span></span>
        <span></span>
      </span>
    </div>
  )
}

export default Loading