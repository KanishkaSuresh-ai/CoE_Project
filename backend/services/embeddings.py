import os
from pathlib import Path

from dotenv import load_dotenv
from google import genai


BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


def create_embeddings(texts, batch_size=25):
    all_embeddings = []

    for start in range(0, len(texts), batch_size):
        batch = texts[start:start + batch_size]

        result = client.models.embed_content(
            model="gemini-embedding-001",
            contents=batch
        )

        all_embeddings.extend(
            embedding.values for embedding in result.embeddings
        )

    return all_embeddings


def create_embedding(text):
    return create_embeddings([text])[0]