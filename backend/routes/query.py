from fastapi import APIRouter
from pydantic import BaseModel

from services.rag import build_rag_system, ask_question


router = APIRouter()

# Build the RAG system using our PDF
chunks, index = build_rag_system("resume (9).pdf")


class QuestionRequest(BaseModel):
    question: str


@router.post("/ask")
def ask(request: QuestionRequest):

    answer = ask_question(
        request.question,
        chunks,
        index
    )

    return {
        "question": request.question,
        "answer": answer
    }