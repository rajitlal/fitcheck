import os
from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from rembg import remove
from supabase import create_client

load_dotenv()  # reads backend/.env into the environment

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

supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_SECRET_KEY")
supabase = create_client(supabase_url, supabase_key)

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/upload-clothing-item")
async def upload_clothing_item(
    file: UploadFile = File(...),
    user_id: str = Form(...),
    name: str = Form(...),
    category: str = Form(...),
):
    contents = await file.read()
    output_bytes = remove(contents)
    filename = f"{os.urandom(8).hex()}.png"

    supabase.storage.from_("clothing-images").upload(
        filename,
        output_bytes,
        {"content-type": "image/png"}
    )

    public_url = supabase.storage.from_("clothing-images").get_public_url(filename)

    # Actually save the item as a row in the database
    result = supabase.table("clothing_items").insert({
        "user_id": user_id,
        "name": name,
        "category": category,
        "image_url": public_url,
    }).execute()

    return {"image_url": public_url, "item": result.data}