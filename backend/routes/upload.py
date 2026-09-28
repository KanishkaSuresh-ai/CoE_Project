from fastapi import APIRouter, UploadFile, File

from services.rag import build_rag_system
from routes.query import set_rag_system


router = APIRouter()


@router.post("/upload")
async def upload_documents(files: list[UploadFile] = File(...)):

    if len(files) > 3:
        return {
            "error": "You can upload a maximum of 3 files."
        }

    file_paths = []

    for file in files:
        file_path = f"uploaded_{file.filename}"

        with open(file_path, "wb") as buffer:
            buffer.write(await file.read())

        file_paths.append(file_path)

    # Build one RAG system using all uploaded documents
    chunks, index = build_rag_system(file_paths)

    set_rag_system(chunks, index)

    return {
        "filenames": [file.filename for file in files],
        "message": "Documents uploaded and RAG system created successfully"
    }