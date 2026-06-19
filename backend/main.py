from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Browsers block requests between different ports by default.
# Your frontend runs on 5173, this backend runs on 8000 — without
# this middleware, the frontend's fetch calls would just fail.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "ok"}