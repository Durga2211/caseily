import os
import uuid
import io
import base64
from PIL import Image, ImageOps
import boto3
from botocore.config import Config

S3_ENDPOINT_URL = os.getenv("S3_ENDPOINT_URL")
S3_ACCESS_KEY_ID = os.getenv("S3_ACCESS_KEY_ID")
S3_SECRET_ACCESS_KEY = os.getenv("S3_SECRET_ACCESS_KEY")
S3_BUCKET_NAME = os.getenv("S3_BUCKET_NAME")
S3_PUBLIC_URL = os.getenv("S3_PUBLIC_URL")

s3_client = None
if S3_ENDPOINT_URL and S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY and S3_BUCKET_NAME:
    s3_client = boto3.client(
        "s3",
        endpoint_url=S3_ENDPOINT_URL,
        aws_access_key_id=S3_ACCESS_KEY_ID,
        aws_secret_access_key=S3_SECRET_ACCESS_KEY,
        config=Config(signature_version="s3v4")
    )

def upload_to_s3(file_bytes, filename, content_type):
    if not s3_client:
        return None
    try:
        s3_client.put_object(
            Bucket=S3_BUCKET_NAME,
            Key=filename,
            Body=file_bytes,
            ContentType=content_type,
            CacheControl="public, max-age=31536000, immutable"
        )
        base_url = S3_PUBLIC_URL.rstrip("/") if S3_PUBLIC_URL else f"{S3_ENDPOINT_URL}/{S3_BUCKET_NAME}"
        return f"{base_url}/{filename}"
    except Exception as e:
        print(f"S3 Upload Error: {e}")
        return None

def process_and_upload_image(file_bytes: bytes, filename_prefix: str = "img"):
    """
    Process image: Fix EXIF, generate 3 WebP versions, generate blur placeholder,
    upload to S3, return dictionary with URLs and metadata.
    """
    try:
        img = Image.open(io.BytesIO(file_bytes))
        img = ImageOps.exif_transpose(img)
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")
    except Exception as e:
        print(f"Image processing error: {e}")
        return None

    base_id = str(uuid.uuid4())
    original_width, original_height = img.size
    
    # Generate blur placeholder
    blur_img = img.copy()
    blur_img.thumbnail((20, 20))
    blur_io = io.BytesIO()
    blur_img.save(blur_io, format="JPEG", quality=20)
    blur_b64 = "data:image/jpeg;base64," + base64.b64encode(blur_io.getvalue()).decode("utf-8")

    sizes = {
        "thumb": 300,
        "medium": 700,
        "large": 1200
    }
    
    result = {
        "width": original_width,
        "height": original_height,
        "blur": blur_b64
    }

    if not s3_client:
        print("S3 not configured, skipping uploads.")
        return None

    for size_name, max_width in sizes.items():
        if original_width > max_width:
            ratio = max_width / float(original_width)
            new_height = int(float(original_height) * float(ratio))
            resized = img.resize((max_width, new_height), Image.Resampling.LANCZOS)
        else:
            resized = img.copy()
            
        out_io = io.BytesIO()
        resized.save(out_io, format="WEBP", quality=75)
        
        filename = f"{filename_prefix}_{base_id}_{size_name}.webp"
        url = upload_to_s3(out_io.getvalue(), filename, "image/webp")
        result[size_name] = url

    return result
