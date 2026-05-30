from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from ...core.database import get_db
from ...data.repositories.food_repository import FoodRepository
from ...data.schemas.food import FoodCreate, FoodResponse
from ...services.food_service import FoodService

router = APIRouter(prefix="/api/foods", tags=["foods"])


@router.post("", response_model=FoodResponse, status_code=status.HTTP_201_CREATED)
async def create_food(data: FoodCreate, db: AsyncSession = Depends(get_db)):
    service = FoodService(FoodRepository(db))
    return await service.create_food(data)
