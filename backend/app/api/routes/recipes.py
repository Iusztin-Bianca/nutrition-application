from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from ...core.database import get_db
from ...data.repositories.recipe_repository import RecipeRepository
from ...data.schemas.food import FoodResponse
from ...data.schemas.recipe import RecipeCreate, RecipeIngredientDetail
from ...services.recipe_service import RecipeService

router = APIRouter(prefix="/api/recipes", tags=["recipes"])


@router.post("", response_model=FoodResponse, status_code=status.HTTP_201_CREATED)
async def create_recipe(data: RecipeCreate, db: AsyncSession = Depends(get_db)):
    if not data.ingredients:
        raise HTTPException(status_code=400, detail="O rețetă trebuie să aibă cel puțin un ingredient.")
    service = RecipeService(RecipeRepository(db))
    try:
        return await service.create_recipe(data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{recipe_id}/ingredients", response_model=list[RecipeIngredientDetail])
async def get_recipe_ingredients(recipe_id: int, db: AsyncSession = Depends(get_db)):
    service = RecipeService(RecipeRepository(db))
    return await service.get_ingredients(recipe_id)


@router.put("/{recipe_id}", response_model=FoodResponse)
async def update_recipe(recipe_id: int, data: RecipeCreate, db: AsyncSession = Depends(get_db)):
    if not data.ingredients:
        raise HTTPException(status_code=400, detail="O rețetă trebuie să aibă cel puțin un ingredient.")
    service = RecipeService(RecipeRepository(db))
    try:
        return await service.update_recipe(recipe_id, data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
