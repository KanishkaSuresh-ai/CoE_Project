import React from 'react'

function Popup({ message, onClose }) {
  if (!message) return null

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-box" onClick={(e) => e.stopPropagation()}>
        <p>⚠️ {message}</p>
        <button onClick={onClose}>OK</button>
      </div>
    </div>
  )
}

export default Popup