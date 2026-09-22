import React from 'react'
function FileUpload({
  selectedFile,
  documentReady,
  onFileSelect,
  onUpload,
}) {
  const handleFileChange = (event) => {
    const file = event.target.files[0]

    if (!file) return

    const allowedTypes = [
      'application/pdf',
      'text/plain',
    ]

    if (!allowedTypes.includes(file.type)) {
      alert('Please select a PDF or TXT file.')
      return
    }

    onFileSelect(file)
  }

  return (
    <section className="upload-section">
      <h2>Upload your document</h2>

      <div className="upload-box">
        <p>📁 Select a PDF or TXT file</p>

        <input
          type="file"
          accept=".pdf,.txt"
          onChange={handleFileChange}
        />

        {selectedFile && (
          <div className="file-info">
            <p>
              Selected file: <strong>{selectedFile.name}</strong>
            </p>

            <button onClick={onUpload}>
              Upload Document
            </button>
          </div>
        )}

        {documentReady && (
          <p className="success-message">
            ✅ Document is ready. You can ask questions.
          </p>
        )}
      </div>
    </section>
  )
}

export default FileUpload