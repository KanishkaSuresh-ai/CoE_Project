import os
from dotenv import load_dotenv
from google import genai

# Load variables from .env
load_dotenv()

# Get API key
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError("GEMINI_API_KEY is not set")

# Create Gemini client
client = genai.Client(api_key=api_key)


def generate_answer(context, question):
    """
    Generate an answer using only the provided document context.
    """

    prompt = f"""
You are a document question-answering assistant.

Answer the user's question ONLY using the information
provided in the context below.

Rules:
1. Do not use outside knowledge.
2. Do not make up information.
3. If the answer is not present in the context,
   say: "I could not find the answer in the document."
4. Keep the answer clear and concise.

Context:
{context}

Question:
{question}

Answer:
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    return response.text