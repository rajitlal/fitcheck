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
    from fastapi import HTTPException

    try:
        # Read and validate file
        contents = await file.read()
        if not contents:
            raise HTTPException(status_code=400, detail="File is empty")

        print(f"Processing image for user {user_id}: {name}")
        
        # Remove background
        output_bytes = remove(contents)
        filename = f"{os.urandom(8).hex()}.png"

        # Upload to storage
        try:
            supabase.storage.from_("clothing-images").upload(
                filename,
                output_bytes,
                {"content-type": "image/png"}
            )
            print(f"Uploaded to storage: {filename}")
        except Exception as e:
            print(f"Storage upload error: {e}")
            raise HTTPException(status_code=500, detail="Failed to upload image to storage")

        # Get public URL
        try:
            public_url = supabase.storage.from_("clothing-images").get_public_url(filename)
        except Exception as e:
            print(f"URL generation error: {e}")
            raise HTTPException(status_code=500, detail="Failed to generate image URL")

        # Save to database
        try:
            result = supabase.table("clothing_items").insert({
                "user_id": user_id,
                "name": name,
                "category": category,
                "image_url": public_url,
            }).execute()
            print(f"Saved to database: {result.data}")
        except Exception as e:
            print(f"Database insert error: {e}")
            raise HTTPException(status_code=500, detail="Failed to save item to database")

        return {"image_url": public_url, "item": result.data}
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred during upload")