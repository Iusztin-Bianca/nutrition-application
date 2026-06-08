from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select, func
from sqlalchemy.exc import IntegrityError
from ..models.food import Food
from ..models.food_micronutrient import FoodMicronutrient
from ..schemas.food import FoodCreate
from ...core.exceptions import FoodAlreadyExistsError


class FoodRepository:

    def __init__(self, db: AsyncSession):
        self.db = db

    async def count(self) -> int:
        result = await self.db.execute(select(func.count()).select_from(Food))
        return result.scalar_one()

    async def name_exists(self, name: str, exclude_id: int | None = None) -> bool:
        q = select(func.count()).where(Food.name == name)
        if exclude_id is not None:
            q = q.where(Food.id != exclude_id)
        result = await self.db.execute(q)
        return result.scalar_one() > 0

    async def get_by_id(self, food_id: int) -> Food | None:
        result = await self.db.execute(
            select(Food)
            .options(selectinload(Food.micronutrients))
            .where(Food.id == food_id)
        )
        return result.scalar_one_or_none()

    async def get_all(self, skip: int = 0, limit: int = 50) -> list[Food]:
        result = await self.db.execute(
            select(Food)
            .options(selectinload(Food.micronutrients))
            .order_by(Food.name)
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())

    async def update(self, food_id: int, data: FoodCreate) -> Food | None:
        result = await self.db.execute(
            select(Food).options(selectinload(Food.micronutrients)).where(Food.id == food_id)
        )
        food = result.scalar_one_or_none()
        if food is None:
            return None

        for field, value in data.model_dump(exclude={"micronutrients"}).items():
            setattr(food, field, value)

        for m in food.micronutrients:
            await self.db.delete(m)
        await self.db.flush()

        for m in data.micronutrients:
            self.db.add(FoodMicronutrient(food_id=food.id, nutrient=m.nutrient, amount=m.amount))

        try:
            await self.db.commit()
        except IntegrityError:
            await self.db.rollback()
            raise FoodAlreadyExistsError(data.name)

        result = await self.db.execute(
            select(Food).options(selectinload(Food.micronutrients)).where(Food.id == food.id)
        )
        return result.scalar_one()

    async def delete(self, food_id: int) -> bool:
        result = await self.db.execute(select(Food).where(Food.id == food_id))
        food = result.scalar_one_or_none()
        if food is None:
            return False
        await self.db.delete(food)
        await self.db.commit()
        return True

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

        try:
            await self.db.commit()
        except IntegrityError:
            await self.db.rollback()
            raise FoodAlreadyExistsError(data.name)
        result = await self.db.execute(
            select(Food).options(selectinload(Food.micronutrients)).where(Food.id == food.id)
        )
        return result.scalar_one()
