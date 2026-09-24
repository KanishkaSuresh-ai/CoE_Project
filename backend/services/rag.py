from services.pdf_reader import extract_text_from_pdf
from services.chunker import split_text_into_chunks
from services.embeddings import create_embedding
from services.vector_store import create_vector_store, search_vector_store
from services.generator import generate_answer


def build_rag_system(file_paths):
    # Store chunks from all uploaded documents
    all_chunks = []

    # Read and chunk every document
    for file_path in file_paths:
        text = extract_text_from_pdf(file_path)

        chunks = split_text_into_chunks(text)

        all_chunks.extend(chunks)

    # Create embeddings for all chunks
    embeddings = []

    for chunk in all_chunks:
        embedding = create_embedding(chunk)
        embeddings.append(embedding)

    # Create one FAISS index containing all documents
    index = create_vector_store(embeddings)

    return all_chunks, index


def ask_question(question, chunks, index):
    # Convert question into an embedding
    question_embedding = create_embedding(question)

    # Search FAISS
    distances, indices = search_vector_store(
        index,
        question_embedding,
        k=5
    )

    # Get relevant chunks
    relevant_chunks = []

    for i in indices[0]:
        if i < len(chunks):
            relevant_chunks.append(chunks[i])

    # Combine relevant chunks
    context = "\n\n".join(relevant_chunks)

    # Generate answer using Gemini
    answer = generate_answer(question, context)

    return answer