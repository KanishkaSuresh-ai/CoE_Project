import React, { useState } from 'react'

function FileUpload({ selectedFiles, documentReady, onFilesSelect, onUpload, onLimitExceeded }) {
  const [progress, setProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const allowedTypes = ['application/pdf', 'text/plain']
  const MAX_FILES = 3

  const validateAndAdd = (fileList) => {
    const incoming = Array.from(fileList)

    const validFiles = incoming.filter((file) => allowedTypes.includes(file.type))
    if (validFiles.length !== incoming.length) {
      alert('Only PDF or TXT files are allowed.')
    }

    const combined = [...selectedFiles, ...validFiles]

    if (combined.length > MAX_FILES) {
      onLimitExceeded()          // <-- shows the styled popup
      onFilesSelect(combined.slice(0, MAX_FILES))
      return
    }

    onFilesSelect(combined)
  }

  const handleFileChange = (event) => validateAndAdd(event.target.files)

  const handleDrop = (event) => {
    event.preventDefault()
    setDragActive(false)
    validateAndAdd(event.dataTransfer.files)
  }

  const removeFile = (index) => {
    const updated = selectedFiles.filter((_, i) => i !== index)
    onFilesSelect(updated)
  }

  const handleUploadClick = () => {
    setUploading(true)
    setProgress(0)
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setUploading(false)
          return 100
        }
        return prev + 20
      })
    }, 200)
    onUpload()
  }

  return (
    <div
      className={`upload-box ${dragActive ? 'drag-active' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
      onDragLeave={() => setDragActive(false)}
      onDrop={handleDrop}
    >
      <p>📁 Drag &amp; drop up to {MAX_FILES} PDF/TXT files, or select below</p>

      <input type="file" accept=".pdf,.txt" multiple onChange={handleFileChange} />

      {selectedFiles.length > 0 && (
        <div className="file-info">
          <ul className="file-list">
            {selectedFiles.map((file, index) => (
              <li key={index}>
                <span className="file-name">📄 {file.name}</span>
                <button className="remove-file-btn" onClick={() => removeFile(index)}>✕</button>
              </li>
            ))}
          </ul>

          <p className="file-count">{selectedFiles.length} / {MAX_FILES} files selected</p>

          <button onClick={handleUploadClick} disabled={uploading}>
            {uploading ? 'Uploading...' : 'Continue →'}
          </button>

          {uploading && (
            <div className="progress-bar-container">
              <div className="progress-bar" style={{ width: `${progress}%` }} />
            </div>
          )}
        </div>
      )}

      {documentReady && (
        <p className="success-message">✅ Document(s) ready. You can ask questions.</p>
      )}
    </div>
  )
}

export default FileUpload