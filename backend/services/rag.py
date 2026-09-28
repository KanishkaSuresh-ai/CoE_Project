from pathlib import Path

from services.pdf_reader import extract_text_from_pdf
from services.chunker import split_text_into_chunks
from services.embeddings import create_embedding
from services.vector_store import create_vector_store, search_vector_store
from services.generator import generate_answer


def build_rag_system(file_paths, filenames=None):
    if isinstance(file_paths, (str, Path)):
        file_paths = [file_paths]

    if filenames is None:
        filenames = [Path(file_path).name for file_path in file_paths]

    all_chunks = []
    chunk_sources = []

    for file_path, filename in zip(file_paths, filenames):
        text = extract_text_from_pdf(file_path)

        if not text or not text.strip():
            raise ValueError(
                f"No readable text found in the uploaded file: {filename}"
            )

        chunks = split_text_into_chunks(text)
        all_chunks.extend(chunks)
        chunk_sources.extend([filename] * len(chunks))

    embeddings = []
    for chunk in all_chunks:
        embeddings.append(create_embedding(chunk))

    index = create_vector_store(embeddings)
    return all_chunks, index, chunk_sources


def ask_question(question, chunks, index, chunk_sources=None):
    question_embedding = create_embedding(question)
    _, indices = search_vector_store(index, question_embedding, k=5)

    valid_indices = [int(i) for i in indices[0] if 0 <= i < len(chunks)]
    relevant_chunks = [chunks[i] for i in valid_indices]
    context = "\n\n".join(relevant_chunks)
    answer = generate_answer(question, context)

    chunk_sources = chunk_sources or []
    sources = list(dict.fromkeys(
        chunk_sources[i]
        for i in valid_indices
        if i < len(chunk_sources)
    ))

    return answer, sources
