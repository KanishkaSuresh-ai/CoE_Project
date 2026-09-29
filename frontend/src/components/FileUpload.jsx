import React, { useState } from 'react'

function FileUpload({
  selectedFiles,
  onFilesSelect,
  onUpload,
  onLimitExceeded,
  isModal = false,
  onCloseModal,
}) {
  const [progress, setProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const allowedExtensions = ['.pdf', '.txt', '.docx']
  const MAX_FILES = 1
  const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

  const isAllowedFile = (file) =>
    allowedExtensions.some((extension) =>
      file.name.toLowerCase().endsWith(extension)
    )

  const validateAndAdd = (fileList) => {
    setError('')
    setSuccess('')

    const incoming = Array.from(fileList)

    if (incoming.length === 0) {
      return
    }

    const invalidFiles = incoming.filter((file) => !isAllowedFile(file))

    if (invalidFiles.length > 0) {
      setError('Only PDF, TXT, or DOCX files are allowed.')
    }

    const typeValidFiles = incoming.filter(isAllowedFile)

    const oversizedFiles = typeValidFiles.filter(
      (file) => file.size > MAX_FILE_SIZE
    )

    if (oversizedFiles.length > 0) {
      setError('Each file must be smaller than 10 MB.')
    }

    const sizeValidFiles = typeValidFiles.filter(
      (file) => file.size <= MAX_FILE_SIZE
    )

    const newFiles = sizeValidFiles.filter((newFile) =>
      !selectedFiles.some((existingFile) =>
        existingFile.name === newFile.name &&
        existingFile.size === newFile.size &&
        existingFile.lastModified === newFile.lastModified
      )
    )

    if (newFiles.length !== sizeValidFiles.length) {
      setError('Duplicate files were skipped.')
    }

    const combined = [...selectedFiles, ...newFiles]

    if (combined.length > MAX_FILES) {
      if (onLimitExceeded) {
        onLimitExceeded()
      }

      onFilesSelect(combined.slice(0, MAX_FILES))
      setError(`Maximum ${MAX_FILES} documents allowed.`)
      return
    }

    onFilesSelect(combined)

        if (
      combined.length > 0 &&
      invalidFiles.length === 0 &&
      oversizedFiles.length === 0 &&
      newFiles.length === sizeValidFiles.length
    ) {
      setSuccess(`${combined.length} document(s) ready to upload.`)
    }
  }

  const handleFileChange = (event) => {
    validateAndAdd(event.target.files)
    event.target.value = ''
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setDragActive(false)
    validateAndAdd(event.dataTransfer.files)
  }

  const removeFile = (index) => {
    const updated = selectedFiles.filter((_, i) => i !== index)

    onFilesSelect(updated)
    setError('')

    if (updated.length > 0) {
      setSuccess(`${updated.length} document(s) selected.`)
    } else {
      setSuccess('')
    }
  }

  const handleUploadClick = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select at least one document first.')
      return
    }

    setError('')
    setSuccess('')
    setUploading(true)
    setProgress(0)

    const interval = setInterval(() => {
      setProgress((previousProgress) => {
        if (previousProgress >= 85) {
          clearInterval(interval)
          return 85
        }

        return previousProgress + 15
      })
    }, 150)

    try {
      await onUpload()
      clearInterval(interval)
      setProgress(100)
      setSuccess('Documents uploaded and indexed successfully!')

      if (isModal && onCloseModal) {
        setTimeout(() => {
          onCloseModal()
        }, 600)
      }
    } catch (err) {
      clearInterval(interval)
      setProgress(0)
      setError(err?.message || 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const content = (
    <div className={`upload-card-wrapper ${dragActive ? 'drag-active' : ''}`}>
      <div
        className="upload-dropzone"
        onDragOver={(event) => {
          event.preventDefault()
          setDragActive(true)
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
      >
        <div className="upload-icon-circle">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>

        <h3>Drag &amp; drop documents here</h3>
        <p className="upload-subtext">
          Supports <strong>PDF</strong>, <strong>TXT</strong>, and{' '}
          <strong>DOCX</strong> (up to {MAX_FILES} files, max 10 MB each)
        </p>

        <label className="browse-files-btn">
          <span>Browse Files</span>
          <input
            type="file"
            accept=".pdf,.txt,.docx,application/pdf,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            multiple
            onChange={handleFileChange}
            disabled={uploading}
            style={{ display: 'none' }}
          />
        </label>
      </div>

      {error && (
        <div className="upload-alert upload-alert-error">
          <span>⚠️ {error}</span>
        </div>
      )}

      {success && !uploading && (
        <div className="upload-alert upload-alert-success">
          <span>✅ {success}</span>
        </div>
      )}

      {selectedFiles.length > 0 && (
        <div className="selected-files-list-section">
          <div className="selected-files-header">
            <h4>Selected Documents ({selectedFiles.length}/{MAX_FILES})</h4>
          </div>

          <div className="selected-files-list">
            {selectedFiles.map((file, index) => (
              <div
                key={file.name + '-' + file.lastModified}
                className="selected-file-chip"
              >
                <span className="file-chip-icon">
                  {file.name.toLowerCase().endsWith('.txt') ? '📝' : '📄'}
                </span>

                <div className="file-chip-info">
                  <span className="file-chip-name" title={file.name}>
                    {file.name}
                  </span>
                  <span className="file-chip-size">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </div>

                <button
                  type="button"
                  className="remove-chip-btn"
                  onClick={() => removeFile(index)}
                  disabled={uploading}
                  title="Remove document"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="upload-action-row">
            <button
              type="button"
              className="primary-upload-btn"
              onClick={handleUploadClick}
              disabled={uploading || selectedFiles.length === 0}
            >
              {uploading ? (
                <>
                  <span className="mini-spinner"></span>
                  <span>Processing &amp; Indexing ({progress}%)...</span>
                </>
              ) : (
                <>
                  <span>Upload &amp; Index Documents</span>
                  <span className="btn-arrow">→</span>
                </>
              )}
            </button>
          </div>

          {uploading && (
            <div className="upload-progress-box">
              <div className="upload-progress-track">
                <div
                  className="upload-progress-fill"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <span className="upload-progress-label">
                Creating vector embeddings &amp; RAG store...
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )

  if (isModal) {
    return (
      <div className="upload-modal-overlay" onClick={onCloseModal}>
        <div
          className="upload-modal-container"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="modal-header">
            <div>
              <h3>Upload Documents</h3>
              <p>Add PDF, TXT, or DOCX documents to build the RAG knowledge base</p>
            </div>
            <button
              type="button"
              className="close-modal-btn"
              onClick={onCloseModal}
            >
              ✕
            </button>
          </div>

          <div className="modal-content">{content}</div>
        </div>
      </div>
    )
  }

  return content
}

export default FileUpload