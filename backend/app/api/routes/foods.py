from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession
from ...core.config import settings
from ...core.database import get_db
from ...data.repositories.food_repository import FoodRepository
from ...data.schemas.food import FoodCreate, FoodResponse
from ...services.food_service import FoodService
from ...services import storage_service

router = APIRouter(prefix="/api/foods", tags=["foods"])

_MAX_IMAGE_BYTES = 5 * 1024 * 1024  # 5 MB


@router.post("/upload-image", status_code=status.HTTP_200_OK)
async def upload_food_image(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Fișierul trebuie să fie o imagine.")
    if not settings.azure_storage_connection_string:
        raise HTTPException(status_code=503, detail="Stocarea imaginilor nu este configurată.")

    data = await file.read()
    if len(data) > _MAX_IMAGE_BYTES:
        raise HTTPException(status_code=400, detail="Imaginea depășește 5 MB.")

    url = await storage_service.upload_image(data, file.filename or "image.jpg", file.content_type)
    return {"url": url}


@router.get("/check-name")
async def check_name(name: str, db: AsyncSession = Depends(get_db)):
    exists = await FoodRepository(db).name_exists(name)
    return {"exists": exists}


@router.get("/{food_id}", response_model=FoodResponse)
async def get_food(food_id: int, db: AsyncSession = Depends(get_db)):
    service = FoodService(FoodRepository(db))
    food = await service.get_food_by_id(food_id)
    if food is None:
        raise HTTPException(status_code=404, detail="Alimentul nu există.")
    return food


@router.get("", response_model=list[FoodResponse])
async def list_foods(skip: int = 0, limit: int = 50, db: AsyncSession = Depends(get_db)):
    service = FoodService(FoodRepository(db))
    return await service.get_all_foods(skip=skip, limit=limit)


@router.post("", response_model=FoodResponse, status_code=status.HTTP_201_CREATED)
async def create_food(data: FoodCreate, db: AsyncSession = Depends(get_db)):
    service = FoodService(FoodRepository(db))
    return await service.create_food(data)
