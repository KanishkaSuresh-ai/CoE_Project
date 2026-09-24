const API_URL = 'http://127.0.0.1:8001'

export async function uploadDocument(files) {
  const formData = new FormData()

  files.forEach((file) => {
    formData.append('files', file)
  })

  const response = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    body: formData,
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.detail || data.error || 'Document upload failed'
    )
  }

  return data
}

export async function askQuestion(question) {
  const response = await fetch(`${API_URL}/ask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      question,
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.detail || data.error || 'Question request failed'
    )
  }

  return data
}