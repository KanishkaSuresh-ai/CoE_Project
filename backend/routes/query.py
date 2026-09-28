from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from services.rag import ask_question

router = APIRouter()
sessions = {}


class QuestionRequest(BaseModel):
    question: str
    session_id: str


def set_rag_system(session_id, new_chunks, new_index, new_chunk_sources=None):
    sessions[session_id] = {
        "chunks": new_chunks,
        "index": new_index,
        "chunk_sources": new_chunk_sources or [],
    }


@router.post("/ask")
def ask(request: QuestionRequest):
    if not request.question.strip():
        raise HTTPException(
            status_code=400,
            detail="Please enter a question."
        )

    session = sessions.get(request.session_id)
    if session is None:
        raise HTTPException(
            status_code=404,
            detail="This document session was not found. Please upload your documents again."
        )

    answer, sources = ask_question(
        request.question,
        session["chunks"],
        session["index"],
        session["chunk_sources"]
    )

    return {
        "question": request.question,
        "answer": answer,
        "sources": sources
    }
