import io
import uuid
from pathlib import Path

from azure.storage.blob.aio import BlobServiceClient
from azure.storage.blob import ContentSettings

from ..core.config import settings


def _normalize_image(data: bytes, content_type: str, filename: str = "") -> tuple[bytes, str]:
    import pillow_heif
    from PIL import Image

    pillow_heif.register_heif_opener()
    ct = content_type.lower()
    fn = filename.lower()
    is_heic = "heic" in ct or "heif" in ct or fn.endswith(".heic") or fn.endswith(".heif")
    if is_heic:
        img = Image.open(io.BytesIO(data))
        buf = io.BytesIO()
        img.convert("RGB").save(buf, format="JPEG", quality=85)
        return buf.getvalue(), "image/jpeg"
    return data, content_type


async def upload_image(file_bytes: bytes, filename: str, content_type: str) -> str:
    file_bytes, content_type = _normalize_image(file_bytes, content_type, filename)
    ext = ".jpg" if "jpeg" in content_type else (Path(filename).suffix.lower() or ".jpg")
    blob_name = f"{uuid.uuid4()}{ext}"

    async with BlobServiceClient.from_connection_string(
        settings.azure_storage_connection_string
    ) as client:
        blob_client = client.get_blob_client(
            container=settings.azure_storage_container_name,
            blob=blob_name,
        )
        await blob_client.upload_blob(
            file_bytes,
            blob_type="BlockBlob",
            content_settings=ContentSettings(content_type=content_type),
        )
        return blob_client.url
