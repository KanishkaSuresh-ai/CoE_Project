import React,{ useState } from 'react'
import FileUpload from './components/FileUpload'
import ChatWindow from './components/ChatWindow'
import QuestionInput from './components/QuestionInput'
import Loading from './components/Loading'
import './App.css'

function App() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [documentReady, setDocumentReady] = useState(false)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)

  const handleFileSelect = (file) => {
    setSelectedFile(file)
    setDocumentReady(false)
  }

  const handleUpload = () => {
    if (!selectedFile) return

    setLoading(true)

    // Temporary simulation.
    // Tomorrow this will be replaced with the backend API call.
    setTimeout(() => {
      setLoading(false)
      setDocumentReady(true)
    }, 1500)
  }

  const handleQuestion = (question) => {
    if (!documentReady) return

    const userMessage = {
      role: 'user',
      content: question,
    }

    setMessages((previousMessages) => [
      ...previousMessages,
      userMessage,
    ])

    setLoading(true)

    // Temporary dummy answer.
    // Later this will come from the backend/RAG system.
    setTimeout(() => {
      const assistantMessage = {
        role: 'assistant',
        content:
          'This is a temporary answer. The real answer will come from the uploaded document through the RAG backend.',
      }

      setMessages((previousMessages) => [
        ...previousMessages,
        assistantMessage,
      ])

      setLoading(false)
    }, 1000)
  }

  return (
    <div className="app">
      <header className="header">
        <h1>📄 Document Q&A Assistant</h1>
        <p>Ask questions based on your uploaded document</p>
      </header>

      <main className="main-content">

        <FileUpload
          selectedFile={selectedFile}
          documentReady={documentReady}
          onFileSelect={handleFileSelect}
          onUpload={handleUpload}
        />

        {loading && <Loading />}

        <ChatWindow messages={messages} />

        <QuestionInput
          onQuestion={handleQuestion}
          disabled={!documentReady || loading}
        />

      </main>
    </div>
  )
}

export default App