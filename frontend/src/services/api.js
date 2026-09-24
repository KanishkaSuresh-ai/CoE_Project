const API_URL = 'http://127.0.0.1:8001'

export async function uploadDocument(file) {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    throw new Error('Document upload failed')
  }

  return response.json()
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

  if (!response.ok) {
    throw new Error('Question request failed')
  }

  return response.json()
}