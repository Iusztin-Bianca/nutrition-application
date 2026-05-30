from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select
from ..models.food import Food
from ..models.food_micronutrient import FoodMicronutrient
from ..schemas.food import FoodCreate


class FoodRepository:

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, data: FoodCreate) -> Food:
        food = Food(**data.model_dump(exclude={"micronutrients"}))
        self.db.add(food)
        await self.db.flush()

        for m in data.micronutrients:
            self.db.add(FoodMicronutrient(
                food_id=food.id,
                nutrient=m.nutrient,
                amount=m.amount,
            ))

        await self.db.commit()
        result = await self.db.execute(
            select(Food).options(selectinload(Food.micronutrients)).where(Food.id == food.id)
        )
        return result.scalar_one()
