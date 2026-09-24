from fastapi import APIRouter, UploadFile, File, HTTPException

from services.rag import build_rag_system
from routes.query import set_rag_system


router = APIRouter()


@router.post("/upload")
async def upload_documents(files: list[UploadFile] = File(...)):

    # Check maximum number of files
    if len(files) > 3:
        raise HTTPException(
            status_code=400,
            detail="You can upload a maximum of 3 files."
        )

    file_paths = []

    for file in files:

        # Read file content
        contents = await file.read()

        # Check if file is empty
        if not contents:
            raise HTTPException(
                status_code=400,
                detail=f"The file '{file.filename}' is empty."
            )

        file_path = f"uploaded_{file.filename}"

        # Save file
        with open(file_path, "wb") as buffer:
            buffer.write(contents)

        file_paths.append(file_path)

    # Build one RAG system using all documents
    chunks, index = build_rag_system(file_paths)

    # Store RAG system
    set_rag_system(chunks, index)

    return {
        "filenames": [file.filename for file in files],
        "message": "Documents uploaded and RAG system created successfully"
    }