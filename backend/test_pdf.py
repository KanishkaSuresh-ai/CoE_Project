from services.pdf_reader import extract_text_from_pdf

text = extract_text_from_pdf("resume (9).pdf")

print(text)