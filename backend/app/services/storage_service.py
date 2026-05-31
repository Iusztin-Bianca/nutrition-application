import uuid
from pathlib import Path

from azure.storage.blob.aio import BlobServiceClient
from azure.storage.blob import ContentSettings

from ..core.config import settings


async def upload_image(file_bytes: bytes, filename: str, content_type: str) -> str:
    ext = Path(filename).suffix.lower() or ".jpg"
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
