📄 DocX Assistant

A RAG-based Document Question Answering system that allows users to upload PDF/TXT documents and ask questions based on their content.

👥 Team Contributions

👤 Member 1 — Frontend

Responsibility: User Interface & Frontend Integration



Developed the React-based frontend interface.

Implemented the document upload interface.

Added support for uploading PDF/TXT documents.

Implemented the question input and answer display components.

Connected the frontend with the backend APIs.

Handled frontend loading states, success messages, and error handling.

Designed the user flow for:

Document Upload

Document Processing

Question Input

Answer Display

👤 Member 2 — Backend

Responsibility: API Development & Document Processing



Developed the FastAPI backend.

Implemented the document upload API.

Implemented the question-answering API.

Handled communication between the frontend and RAG pipeline.

Implemented document text extraction.

Managed document processing and data flow.

Connected the backend with the vector retrieval and LLM components.

Handled API errors and request/response processing.

👤 Member 3 — LLM / RAG

Responsibility: RAG Pipeline & LLM Integration



Designed and implemented the Retrieval-Augmented Generation (RAG) pipeline.

Implemented document chunking.

Generated embeddings for document chunks.

Implemented vector similarity search.

Retrieved relevant document chunks for user questions.

Integrated the retrieved context with the Gemini LLM.

Designed the prompt/context flow for generating document-grounded answers.

Worked on reducing unsupported or hallucinated responses.

🔄 System Workflow

                 USER
                   │
                   ▼
          ┌─────────────────┐
          │ React Frontend  │
          │    Member 1     │
          └────────┬────────┘
                   │
                   ▼
          ┌─────────────────┐
          │ FastAPI Backend │
          │    Member 2     │
          └────────┬────────┘
                   │
          ┌────────┴─────────┐
          │                  │
          ▼                  ▼
   Document Processing    User Question
          │                  │
          ▼                  ▼
       Chunking       Query Embedding
          │                  │
          ▼                  ▼
      Embeddings      Similarity Search
          │                  │
          └────────┬─────────┘
                   ▼
          Relevant Chunks
                   │
                   ▼
          ┌─────────────────┐
          │   Gemini LLM    │
          │    Member 3     │
          └────────┬────────┘
                   │
                   ▼
             Final Answer
                   │
                   ▼
          React Frontend
                   │
                   ▼
                 USER


🛠️ Technology Stack

Component

Technology

Frontend

React

Backend

FastAPI / Python

LLM

Google Gemini

RAG

Retrieval-Augmented Generation

Embeddings

Embedding Model

Vector Search

Vector Database / Similarity Search

Documents

PDF / TXT

🎯 Project Objective

The objective of this project is to build a simple document-based question answering system using RAG. The system retrieves relevant information from uploaded documents and provides context-aware answers using an LLM.

🔑 Key RAG Pipeline

Document
   ↓
Text Extraction
   ↓
Chunking
   ↓
Embeddings
   ↓
Vector Storage
   ↓
User Question
   ↓
Query Embedding
   ↓
Similarity Search
   ↓
Relevant Context
   ↓
Gemini LLM
   ↓
Answer
