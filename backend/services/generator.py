import os

from dotenv import load_dotenv
from google import genai


load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


def generate_answer(question, context):

    prompt = f"""
You are a document question-answering assistant.

Answer the question using ONLY the information provided in the context.

If the answer is not present in the context, say:
"I could not find the answer in the document."

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