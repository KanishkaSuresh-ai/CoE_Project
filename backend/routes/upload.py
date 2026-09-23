from fastapi import APIRouter, UploadFile, File

from services.rag import build_rag_system
from routes.query import set_rag_system


router = APIRouter()


@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):

    file_path = f"uploaded_{file.filename}"

    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())

    chunks, index = build_rag_system(file_path)

    set_rag_system(chunks, index)

    return {
        "filename": file.filename,
        "message": "File uploaded and RAG system created successfully"
    }