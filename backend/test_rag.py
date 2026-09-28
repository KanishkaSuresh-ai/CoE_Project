from services.rag import build_rag_system, ask_question

pdf_path = "resume (9).pdf"

chunks, index, chunk_sources = build_rag_system([pdf_path])

print("RAG system created!")

question = "What are the technical skills?"
answer, sources = ask_question(question, chunks, index, chunk_sources)

print("\nQuestion:", question)
print("\nAnswer:", answer)
print("\nSources:", ", ".join(sources))
