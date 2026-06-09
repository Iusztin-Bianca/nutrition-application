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

    async def count(self, search: str | None = None, diets: list[str] | None = None, is_recipe: bool | None = None) -> int:
        q = select(func.count()).select_from(Food)
        q = self._apply_filters(q, search, diets, is_recipe)
        result = await self.db.execute(q)
        return result.scalar_one()

    _VALID_DIET_FLAGS = {
        "is_vegan", "is_vegetarian", "is_raw_vegan", "is_mediterranean",
        "is_gluten_free", "is_lactose_free", "is_fodmap",
    }

    def _apply_filters(self, q, search, diets, is_recipe):
        if search:
            q = q.where(Food.name.ilike(f"%{search}%"))
        if diets:
            for flag in diets:
                if flag in self._VALID_DIET_FLAGS:
                    q = q.where(getattr(Food, flag) == True)
        if is_recipe is not None:
            q = q.where(Food.is_recipe == is_recipe)
        return q

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

    async def get_all(self, skip: int = 0, limit: int = 50, search: str | None = None, diets: list[str] | None = None, is_recipe: bool | None = None) -> list[Food]:
        q = select(Food).options(selectinload(Food.micronutrients)).order_by(Food.name)
        q = self._apply_filters(q, search, diets, is_recipe)
        result = await self.db.execute(q.offset(skip).limit(limit))
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
