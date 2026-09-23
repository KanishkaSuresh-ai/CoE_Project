from fastapi import FastAPI

from routes.upload import router as upload_router
from routes.query import router as query_router


app = FastAPI()

app.include_router(upload_router)
app.include_router(query_router)


@app.get("/")
def home():
    return {"message": "Backend is working!"}