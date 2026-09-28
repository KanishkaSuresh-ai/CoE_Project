from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, UploadFile, File, HTTPException

from services.rag import build_rag_system
from routes.query import set_rag_system

router = APIRouter()

UPLOAD_DIR = Path(__file__).resolve().parent.parent / "uploads"
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


@router.post("/upload")
async def upload_documents(
    files: list[UploadFile] = File(..., description="Upload up to 3 PDF, TXT, or DOCX files")
):
    if len(files) > 3:
        raise HTTPException(
            status_code=400,
            detail="You can upload a maximum of 3 files."
        )

    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    file_paths = []
    filenames = []

    for file in files:
        filename = Path(file.filename or "").name
        suffix = Path(filename).suffix.lower()

        if suffix not in {".pdf", ".txt", ".docx"}:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type: {suffix or 'unknown'}"
            )

        contents = await file.read(MAX_FILE_SIZE + 1)
        if not contents:
            raise HTTPException(
                status_code=400,
                detail=f"The file '{filename}' is empty."
            )
        if len(contents) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413,
                detail=f"{filename} is larger than 10 MB."
            )

        file_path = UPLOAD_DIR / f"{uuid4().hex}{suffix}"
        file_path.write_bytes(contents)
        file_paths.append(str(file_path))
        filenames.append(filename)

    try:
        chunks, index, chunk_sources = build_rag_system(file_paths, filenames)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    session_id = uuid4().hex
    set_rag_system(session_id, chunks, index, chunk_sources)

    return {
        "session_id": session_id,
        "filenames": filenames,
        "message": "Documents uploaded and RAG system created successfully"
    }

