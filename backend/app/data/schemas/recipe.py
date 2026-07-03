from typing import Optional
from pydantic import BaseModel


class RecipeIngredientIn(BaseModel):
    food_id: int
    quantity_grams: float


class RecipeCreate(BaseModel):
    name: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    ingredients: list[RecipeIngredientIn]


class RecipeIngredientDetail(BaseModel):
    food_id: int
    food_name: str
    quantity_grams: float
    food_kcal: float
    food_protein: float
    food_carbohydrates: float
    food_fat: float

    model_config = {"from_attributes": True}
