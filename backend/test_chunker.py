from services.pdf_reader import extract_text_from_pdf
from services.chunker import split_text_into_chunks


text = extract_text_from_pdf("resume (9).pdf")

chunks = split_text_into_chunks(text)

print("Number of chunks:", len(chunks))

for i, chunk in enumerate(chunks):
    print("\n--- Chunk", i + 1, "---")
    print(chunk)