import React, { useEffect, useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/TextLayer.css'
import 'react-pdf/dist/Page/AnnotationLayer.css'

pdfjs.GlobalWorkerOptions.workerSrc =
  `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

function PDFViewer({ file }) {
  const [numPages, setNumPages] = useState(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [scale, setScale] = useState(0.85)
  const [textContent, setTextContent] = useState('')

  useEffect(() => {
    setPageNumber(1)
    setNumPages(null)
    setTextContent('')

    if (file && file.type === 'text/plain') {
      const reader = new FileReader()

      reader.onload = (event) => {
        setTextContent(event.target?.result || '')
      }

      reader.readAsText(file)
    }
  }, [file])

  if (!file) {
    return (
      <div className="preview-empty-state">
        <div className="preview-empty-icon">📄</div>
        <h3>No Document Selected</h3>
        <p>Select a document from the Documents sidebar to preview its contents.</p>
      </div>
    )
  }

  const fileName = file.name.toLowerCase()
  const isPdf = file.type === 'application/pdf' || fileName.endsWith('.pdf')
  const isDocx = fileName.endsWith('.docx')

  if (isDocx) {
    return (
      <div className="text-preview-container">
        <div className="text-preview-header">
          <div className="text-preview-badge">📝 DOCX Document</div>
          <span className="text-preview-name">{file.name}</span>
        </div>
        <div className="text-preview-content">
          <p>Preview is unavailable, but you can ask questions about this document.</p>
        </div>
      </div>
    )
  }

  if (!isPdf) {
    return (
      <div className="text-preview-container">
        <div className="text-preview-header">
          <div className="text-preview-badge">📝 TXT Document</div>
          <span className="text-preview-name">{file.name}</span>
        </div>
        <div className="text-preview-content">
          <pre>{textContent || 'Loading text preview...'}</pre>
        </div>
      </div>
    )
  }

  const handleDocumentLoad = ({ numPages }) => {
    setNumPages(numPages)
  }

  const goToPreviousPage = () => {
    setPageNumber((page) => Math.max(page - 1, 1))
  }

  const goToNextPage = () => {
    setPageNumber((page) => Math.min(page + 1, numPages || 1))
  }

  const zoomOut = () => {
    setScale((value) => Math.max(Number((value - 0.1).toFixed(1)), 0.5))
  }

  const zoomIn = () => {
    setScale((value) => Math.min(Number((value + 0.1).toFixed(1)), 1.5))
  }

  return (
    <div className="pdf-viewer-container">
      <div className="pdf-toolbar">
        <div className="pdf-page-controls">
          <button
            type="button"
            className="tool-btn"
            onClick={goToPreviousPage}
            disabled={pageNumber <= 1}
            title="Previous page"
          >
            ‹
          </button>

          <span className="page-indicator">
            {pageNumber} / {numPages || '...'}
          </span>

          <button
            type="button"
            className="tool-btn"
            onClick={goToNextPage}
            disabled={!numPages || pageNumber >= numPages}
            title="Next page"
          >
            ›
          </button>
        </div>

        <div className="pdf-zoom-controls">
          <button
            type="button"
            className="tool-btn"
            onClick={zoomOut}
            disabled={scale <= 0.5}
            title="Zoom out"
          >
            −
          </button>

          <span className="zoom-indicator">
            {Math.round(scale * 100)}%
          </span>

          <button
            type="button"
            className="tool-btn"
            onClick={zoomIn}
            disabled={scale >= 1.5}
            title="Zoom in"
          >
            +
          </button>
        </div>
      </div>

      <div className="pdf-document-area">
        <Document
          file={file}
          onLoadSuccess={handleDocumentLoad}
          loading={
            <div className="pdf-loading-state">
              <div className="loading-pulse-ring"></div>
              <span>Rendering PDF preview...</span>
            </div>
          }
          error={
            <div className="pdf-error-state">
              <span>⚠️ Unable to render this PDF file.</span>
            </div>
          }
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            renderTextLayer={true}
            renderAnnotationLayer={true}
          />
        </Document>
      </div>
    </div>
  )
}

export default PDFViewer