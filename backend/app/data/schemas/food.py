from decimal import Decimal
from typing import Optional
from pydantic import BaseModel
from ..models.food_micronutrient import MicronutrientType


class MicronutrientCreate(BaseModel):
    nutrient: MicronutrientType
    amount: Decimal


class MicronutrientResponse(BaseModel):
    nutrient: MicronutrientType
    amount: Decimal

    model_config = {"from_attributes": True}


class FoodCreate(BaseModel):
    name: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    # Macros (per 100g)
    kcal: float
    protein: float
    carbohydrates: float
    sugars: Optional[float] = None
    fat: float
    saturated_fat: Optional[float] = None
    polyunsat_fat: Optional[float] = None
    monounsat_fat: Optional[float] = None
    trans_fat: Optional[float] = None
    fiber: Optional[float] = None
    water: Optional[float] = None
    salt: Optional[float] = None
    sodium: Optional[float] = None
    glycemic_index: Optional[int] = None
    # Diet flags
    is_vegan: bool = False
    is_vegetarian: bool = False
    is_raw_vegan: bool = False
    is_mediterranean: bool = False
    is_gluten_free: bool = False
    is_lactose_free: bool = False
    is_fodmap: bool = False
    is_anti_inflammatory: bool = False
    is_recipe: bool = False
    # Micronutrients
    micronutrients: list[MicronutrientCreate] = []


class FoodResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    kcal: float
    protein: float
    carbohydrates: float
    sugars: Optional[float] = None
    fat: float
    saturated_fat: Optional[float] = None
    polyunsat_fat: Optional[float] = None
    monounsat_fat: Optional[float] = None
    trans_fat: Optional[float] = None
    fiber: Optional[float] = None
    water: Optional[float] = None
    salt: Optional[float] = None
    sodium: Optional[float] = None
    glycemic_index: Optional[int] = None
    is_vegan: bool
    is_vegetarian: bool
    is_raw_vegan: bool
    is_mediterranean: bool
    is_gluten_free: bool
    is_lactose_free: bool
    is_fodmap: bool
    is_anti_inflammatory: bool
    is_recipe: bool
    micronutrients: list[MicronutrientResponse] = []

    model_config = {"from_attributes": True}
