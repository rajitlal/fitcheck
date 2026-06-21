import os
from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from rembg import remove
from supabase import create_client
from sentence_transformers import SentenceTransformer, util
import requests
from io import BytesIO
from PIL import Image
import ollama

load_dotenv()  # reads backend/.env into the environment

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_SECRET_KEY")
supabase = create_client(supabase_url, supabase_key)

# Loaded once at startup — loading it fresh on every request would be painfully slow
clip_model = SentenceTransformer('clip-ViT-B-32')

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

    result = supabase.table("clothing_items").insert({
        "user_id": user_id,
        "name": name,
        "category": category,
        "image_url": public_url,
    }).execute()

    return {"image_url": public_url, "item": result.data}

@app.get("/outfit-score/{outfit_id}")
def score_outfit(outfit_id: str):
    outfit_items = supabase.table("outfit_items").select(
        "clothing_item_id, clothing_items(image_url)"
    ).eq("outfit_id", outfit_id).execute()

    image_urls = [row["clothing_items"]["image_url"] for row in outfit_items.data]

    if len(image_urls) < 2:
        return {"score": None, "message": "Need at least 2 items to score"}

    embeddings = []
    for url in image_urls:
        response = requests.get(url)
        image = Image.open(BytesIO(response.content))
        embeddings.append(clip_model.encode(image))

    similarities = []
    for i in range(len(embeddings)):
        for j in range(i + 1, len(embeddings)):
            sim = util.cos_sim(embeddings[i], embeddings[j]).item()
            similarities.append(sim)

    average_score = sum(similarities) / len(similarities)

    return {"score": round(average_score, 3)}

@app.post("/suggest-outfit")
def suggest_outfit(user_id: str = Form(...), occasion: str = Form(...)):
    items = supabase.table("clothing_items").select("name, category").eq("user_id", user_id).execute()
    items_list = "\n".join([f"- {item['name']} ({item['category']})" for item in items.data])

    prompt = f"""Here is a list of clothing items in someone's closet:
{items_list}
Suggest one complete outfit (a top, a bottom, shoes, and optionally outerwear/accessories) suitable for: {occasion}.
Explain briefly why these items work well together."""

    response = ollama.chat(model='llama3.2', messages=[
        {"role": "user", "content": prompt}
    ])

    return {"suggestion": response['message']['content']}