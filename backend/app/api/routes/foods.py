from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession
from ...core.config import settings
from ...core.database import get_db
from ...data.repositories.food_repository import FoodRepository
from ...data.schemas.food import FoodCreate, FoodResponse
from ...services.food_service import FoodService
from ...services import storage_service
from ...services.ocr_service import scan_label, scan_book_page

router = APIRouter(prefix="/api/foods", tags=["foods"])

_MAX_IMAGE_BYTES = 5 * 1024 * 1024  # 5 MB


@router.post("/scan-label", status_code=status.HTTP_200_OK)
async def scan_food_label(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Fișierul trebuie să fie o imagine.")
    data = await file.read()
    try:
        result = scan_label(data)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception:
        raise HTTPException(status_code=422, detail="Nu s-au putut extrage valorile din imagine.")
    return result


@router.post("/scan-book", status_code=status.HTTP_200_OK)
async def scan_book_page_route(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Fișierul trebuie să fie o imagine.")
    data = await file.read()
    try:
        result = scan_book_page(data)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception:
        raise HTTPException(status_code=422, detail="Nu s-au putut extrage datele din imagine.")
    return result


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


@router.get("/count")
async def count_foods(search: str | None = None, diets: str | None = None, is_recipe: bool | None = None, db: AsyncSession = Depends(get_db)):
    service = FoodService(FoodRepository(db))
    diet_list = diets.split(",") if diets else None
    count = await service.count_foods(search=search, diets=diet_list, is_recipe=is_recipe)
    return {"count": count}


@router.get("/check-name")
async def check_name(name: str, exclude_id: int | None = None, db: AsyncSession = Depends(get_db)):
    exists = await FoodRepository(db).name_exists(name, exclude_id=exclude_id)
    return {"exists": exists}


@router.put("/{food_id}", response_model=FoodResponse)
async def update_food(food_id: int, data: FoodCreate, db: AsyncSession = Depends(get_db)):
    service = FoodService(FoodRepository(db))
    food = await service.update_food(food_id, data)
    if food is None:
        raise HTTPException(status_code=404, detail="Alimentul nu există.")
    return food


@router.delete("/{food_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_food(food_id: int, db: AsyncSession = Depends(get_db)):
    service = FoodService(FoodRepository(db))
    deleted = await service.delete_food(food_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Alimentul nu există.")


@router.get("/{food_id}", response_model=FoodResponse)
async def get_food(food_id: int, db: AsyncSession = Depends(get_db)):
    service = FoodService(FoodRepository(db))
    food = await service.get_food_by_id(food_id)
    if food is None:
        raise HTTPException(status_code=404, detail="Alimentul nu există.")
    return food


@router.get("", response_model=list[FoodResponse])
async def list_foods(skip: int = 0, limit: int = 50, search: str | None = None, diets: str | None = None, is_recipe: bool | None = None, db: AsyncSession = Depends(get_db)):
    service = FoodService(FoodRepository(db))
    diet_list = diets.split(",") if diets else None
    return await service.get_all_foods(skip=skip, limit=limit, search=search, diets=diet_list, is_recipe=is_recipe)


@router.post("", response_model=FoodResponse, status_code=status.HTTP_201_CREATED)
async def create_food(data: FoodCreate, db: AsyncSession = Depends(get_db)):
    service = FoodService(FoodRepository(db))
    return await service.create_food(data)
