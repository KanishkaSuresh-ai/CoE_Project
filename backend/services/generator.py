import os
from pathlib import Path

from dotenv import load_dotenv
from google import genai


BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


def generate_answer(question, context):

    prompt = f"""
You are a document question-answering assistant.

Answer the user's question using ONLY the information contained in the
provided document context.

Important rules:

1. Do not use outside knowledge.
2. Do not invent or assume facts that are not supported by the context.
3. For broad questions such as "What is the main objective?",
   "What are the main takeaways?", or "Summarize this document",
   synthesize the relevant information from the context and provide
   a concise summary.
4. The answer does not need to contain the exact words used in the
   question. You may summarize information that is clearly supported
   by the document.
5. If the context genuinely does not contain enough information to
   answer the question, say:
   "I could not find the answer in the document."

Document context:
{context}

User question:
{question}

Answer:
"""

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )

        return response.text

    except Exception:
        return "An error occurred while generating the answer."