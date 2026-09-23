from services.rag import build_rag_system, ask_question


pdf_path = "resume (9).pdf"

chunks, index = build_rag_system(pdf_path)

print("RAG system created!")

question = "What are the technical skills?"

answer = ask_question(question, chunks, index)

print("\nQuestion:", question)
print("\nAnswer:", answer)