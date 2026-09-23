from fastapi import APIRouter
from pydantic import BaseModel

from services.rag import ask_question


router = APIRouter()

chunks = None
index = None


class QuestionRequest(BaseModel):
    question: str


def set_rag_system(new_chunks, new_index):
    global chunks, index

    chunks = new_chunks
    index = new_index


@router.post("/ask")
def ask(request: QuestionRequest):

    if chunks is None or index is None:
        return {
            "error": "Please upload a document first."
        }

    answer = ask_question(
        request.question,
        chunks,
        index
    )

    return {
        "question": request.question,
        "answer": answer
    }