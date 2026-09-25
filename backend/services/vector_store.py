import faiss
import numpy as np


def create_vector_store(embeddings):
    if not embeddings:
        raise ValueError("No embeddings were generated from the uploaded file.")

    vectors = np.asarray(embeddings, dtype="float32")

    if vectors.ndim == 1:
        vectors = vectors.reshape(1, -1)
    elif vectors.ndim != 2:
        raise ValueError("Embedding data is not in the expected 2D shape.")

    dimension = vectors.shape[1]

    index = faiss.IndexFlatL2(dimension)

    index.add(vectors)

    return index


def search_vector_store(index, query_embedding, k=3):
    query_vector = np.array([query_embedding]).astype("float32")

    distances, indices = index.search(query_vector, k)

    return distances, indices