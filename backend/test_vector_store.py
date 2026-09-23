from services.vector_store import create_vector_store, search_vector_store


# Three example embeddings
embeddings = [
    [1.0, 0.0, 0.0],
    [0.0, 1.0, 0.0],
    [0.9, 0.1, 0.0]
]


# Create FAISS store
index = create_vector_store(embeddings)

print("FAISS vector store created!")


# Search using a question vector
query = [1.0, 0.0, 0.0]

distances, indices = search_vector_store(index, query, k=2)

print("Closest vectors:", indices)
print("Distances:", distances)