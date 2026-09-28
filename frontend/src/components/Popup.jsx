import React from 'react'

function Popup({ message, onClose }) {
  if (!message) return null

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-card" onClick={(e) => e.stopPropagation()}>
        <div className="popup-header">
          <div className="popup-icon">⚠️</div>
          <h3>Notice</h3>
        </div>
        <p className="popup-body">{message}</p>
        <div className="popup-actions">
          <button type="button" className="popup-confirm-btn" onClick={onClose}>
            Got it
          </button>
        </div>
      </div>
    </div>
  )
}

export default Popup