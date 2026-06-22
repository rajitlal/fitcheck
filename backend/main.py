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
        # Check Supabase connection first
        if not supabase_url or not supabase_key:
            print("ERROR: Missing SUPABASE_URL or SUPABASE_SECRET_KEY environment variables")
            raise HTTPException(status_code=500, detail="Server configuration error - missing Supabase credentials")
        
        # Read and validate file
        contents = await file.read()
        if not contents:
            print("ERROR: File is empty")
            raise HTTPException(status_code=400, detail="File is empty")

        print(f"[UPLOAD START] Processing image for user {user_id}: {name}")
        
        # Remove background
        try:
            print("[STEP 1] Removing background...")
            output_bytes = remove(contents)
            filename = f"{os.urandom(8).hex()}.png"
            print(f"[STEP 1] ✓ Background removed, filename: {filename}")
        except Exception as e:
            print(f"[STEP 1] ✗ Background removal failed: {e}")
            raise HTTPException(status_code=500, detail=f"Background removal failed: {str(e)}")

        # Upload to storage
        try:
            print("[STEP 2] Uploading to Supabase storage...")
            supabase.storage.from_("clothing-images").upload(
                filename,
                output_bytes,
                {"content-type": "image/png"}
            )
            print(f"[STEP 2] ✓ Uploaded to storage: {filename}")
        except Exception as e:
            print(f"[STEP 2] ✗ Storage upload failed: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to upload image: {str(e)}")

        # Get public URL
        try:
            print("[STEP 3] Getting public URL...")
            public_url = supabase.storage.from_("clothing-images").get_public_url(filename)
            print(f"[STEP 3] ✓ Public URL generated: {public_url}")
        except Exception as e:
            print(f"[STEP 3] ✗ URL generation failed: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to generate URL: {str(e)}")

        # Save to database
        try:
            print("[STEP 4] Saving to database...")
            result = supabase.table("clothing_items").insert({
                "user_id": user_id,
                "name": name,
                "category": category,
                "image_url": public_url,
            }).execute()
            print(f"[STEP 4] ✓ Saved to database: {result.data}")
        except Exception as e:
            print(f"[STEP 4] ✗ Database insert failed: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to save item: {str(e)}")

        print(f"[UPLOAD COMPLETE] ✓ Successfully uploaded {name}")
        return {"image_url": public_url, "item": result.data}
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"[UPLOAD ERROR] Unexpected error: {e}")
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")