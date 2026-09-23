from services.embeddings import create_embedding


text = "Python is a programming language."

vector = create_embedding(text)

print("Embedding created successfully!")
print("Vector length:", len(vector))
print("First 10 values:", vector[:10])