import React, { useState } from 'react'

function FileUpload({
  selectedFiles,
  documentReady,
  onFilesSelect,
  onUpload,
  onLimitExceeded,
}) {
  const [progress, setProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const allowedTypes = ['application/pdf', 'text/plain']
  const MAX_FILES = 3
  const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

  const validateAndAdd = (fileList) => {
    setError('')
    setSuccess('')

    const incoming = Array.from(fileList)

    if (incoming.length === 0) {
      return
    }

    // Check file types
    const invalidFiles = incoming.filter(
      (file) => !allowedTypes.includes(file.type)
    )

    if (invalidFiles.length > 0) {
      setError('Only PDF or TXT files are allowed.')
    }

    const typeValidFiles = incoming.filter(
      (file) => allowedTypes.includes(file.type)
    )

    // Check file size
    const oversizedFiles = typeValidFiles.filter(
      (file) => file.size > MAX_FILE_SIZE
    )

    if (oversizedFiles.length > 0) {
      setError('Each file must be smaller than 10 MB.')
    }

    const sizeValidFiles = typeValidFiles.filter(
      (file) => file.size <= MAX_FILE_SIZE
    )

    // Remove duplicate files
    const newFiles = sizeValidFiles.filter((newFile) => {
      return !selectedFiles.some((existingFile) => {
        return (
          existingFile.name === newFile.name &&
          existingFile.size === newFile.size &&
          existingFile.lastModified === newFile.lastModified
        )
      })
    })

    if (newFiles.length !== sizeValidFiles.length) {
      setError('Duplicate files were removed.')
    }

    const combined = [...selectedFiles, ...newFiles]

    // Maximum 3 files
    if (combined.length > MAX_FILES) {
      onLimitExceeded()
      onFilesSelect(combined.slice(0, MAX_FILES))
      return
    }

    onFilesSelect(combined)

    if (combined.length > 0) {
      setSuccess(combined.length + ' file(s) selected.')
    }
  }

  const handleFileChange = (event) => {
    validateAndAdd(event.target.files)

    // Allows selecting the same file again later
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
      setSuccess(updated.length + ' file(s) selected.')
    } else {
      setSuccess('')
    }
  }

  const handleUploadClick = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select at least one file.')
      return
    }

    setError('')
    setSuccess('')
    setUploading(true)
    setProgress(0)

    // Frontend progress animation
    const interval = setInterval(() => {
      setProgress((previousProgress) => {
        if (previousProgress >= 90) {
          clearInterval(interval)
          return 90
        }

        return previousProgress + 10
      })
    }, 150)

    try {
      // Existing backend connection
      await onUpload()

      clearInterval(interval)
      setProgress(100)
      setSuccess('Documents uploaded successfully.')
    } catch (err) {
      clearInterval(interval)
      setProgress(0)

      if (err && err.message) {
        setError(err.message)
      } else {
        setError('Upload failed. Please try again.')
      }
    } finally {
      setUploading(false)
    }
  }

  return (
    <div
      className={'upload-box ' + (dragActive ? 'drag-active' : '')}
      onDragOver={(event) => {
        event.preventDefault()
        setDragActive(true)
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={handleDrop}
    >
      <p>
        📁 Drag &amp; drop up to {MAX_FILES} PDF/TXT files, or select below
      </p>

      <input
        type="file"
        accept=".pdf,.txt"
        multiple
        onChange={handleFileChange}
      />

      {/* Error message */}
      {error && (
        <div className="upload-error">
          ❌ {error}
        </div>
      )}

      {/* Success message */}
      {success && !uploading && (
        <div className="upload-success">
          ✅ {success}
        </div>
      )}

      {selectedFiles.length > 0 && (
        <div className="file-info">
          <ul className="file-list">
            {selectedFiles.map((file, index) => (
              <li
                key={file.name + '-' + file.lastModified}
              >
                <span className="file-name">
                  📄 {file.name}
                </span>

                <span className="file-size">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </span>

                <button
                  type="button"
                  className="remove-file-btn"
                  onClick={() => removeFile(index)}
                  disabled={uploading}
                  aria-label={'Remove ' + file.name}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>

          <p className="file-count">
            {selectedFiles.length} / {MAX_FILES} files selected
          </p>

          <button
            type="button"
            onClick={handleUploadClick}
            disabled={uploading || selectedFiles.length === 0}
          >
            {uploading ? 'Uploading...' : 'Continue →'}
          </button>

          {uploading && (
            <div className="progress-section">
              <div className="progress-bar-container">
                <div
                  className="progress-bar"
                  style={{ width: progress + '%' }}
                />
              </div>

              <p className="progress-text">
                Uploading documents... {progress}%
              </p>
            </div>
          )}
        </div>
      )}

      {documentReady && !uploading && (
        <p className="success-message">
          ✅ Document(s) ready. You can ask questions.
        </p>
      )}
    </div>
  )
}

export default FileUpload