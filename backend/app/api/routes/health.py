from fastapi import APIRouter
from sqlalchemy import text
from ...core.database import engine

router = APIRouter(prefix="/api", tags=["health"])


@router.get("/health")
async def health_check():
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception:
        db_status = "disconnected"
    return {"status": "ok", "db": db_status}
