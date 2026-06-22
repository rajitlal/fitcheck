import os
from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_origin_regex=r"https://fitcheck.*\.vercel\.app",
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
    from rembg import remove

    contents = await file.read()
    output_bytes = remove(contents)
    filename = f"{os.urandom(8).hex()}.png"

    supabase.storage.from_("clothing-images").upload(
        filename,
        output_bytes,
        {"content-type": "image/png"}
    )

    public_url = supabase.storage.from_("clothing-images").get_public_url(filename)

    result = supabase.table("clothing_items").insert({
        "user_id": user_id,
        "name": name,
        "category": category,
        "image_url": public_url,
    }).execute()

    return {"image_url": public_url, "item": result.data}