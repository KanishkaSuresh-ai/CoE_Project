from services.generator import generate_answer
from services.pdf_reader import extract_text_from_pdf
from services.chunker import split_text_into_chunks
from services.embeddings import create_embedding
from services.vector_store import create_vector_store, search_vector_store


# 1. Read the PDF
text = extract_text_from_pdf("resume (9).pdf")


# 2. Split the PDF text into chunks
chunks = split_text_into_chunks(text)

print("Number of chunks:", len(chunks))


# 3. Create an embedding for every chunk
embeddings = []

for chunk in chunks:
    embedding = create_embedding(chunk)
    embeddings.append(embedding)

print("Embeddings created:", len(embeddings))


# 4. Store the embeddings in FAISS
index = create_vector_store(embeddings)

print("FAISS vector store created!")


# 5. Ask a question
question = "What are the technical skills?"


# 6. Convert the question into an embedding
question_embedding = create_embedding(question)


# 7. Search FAISS for the 3 most relevant chunks
distances, indices = search_vector_store(
    index,
    question_embedding,
    k=3
)


print("\nRelevant chunks:")

relevant_chunks = []

for i in indices[0]:
    print("\n--- Chunk", i + 1, "---")
    print(chunks[i])

    relevant_chunks.append(chunks[i])


# Combine the relevant chunks into one context
context = "\n\n".join(relevant_chunks)


# Generate the final answer using Gemini
answer = generate_answer(question, context)


print("\nFinal Answer:")
print(answer)