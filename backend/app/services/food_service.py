from ..data.repositories.food_repository import FoodRepository
from ..data.schemas.food import FoodCreate, FoodResponse


class FoodService:

    def __init__(self, repo: FoodRepository):
        self.repo = repo

    async def get_food_by_id(self, food_id: int) -> FoodResponse | None:
        food = await self.repo.get_by_id(food_id)
        if food is None:
            return None
        return FoodResponse.model_validate(food)

    async def update_food(self, food_id: int, data: FoodCreate) -> FoodResponse | None:
        food = await self.repo.update(food_id, data)
        if food is None:
            return None
        return FoodResponse.model_validate(food)

    async def delete_food(self, food_id: int) -> bool:
        return await self.repo.delete(food_id)

    async def get_all_foods(self, skip: int = 0, limit: int = 50, search: str | None = None, diets: list[str] | None = None, is_recipe: bool | None = None) -> list[FoodResponse]:
        foods = await self.repo.get_all(skip=skip, limit=limit, search=search, diets=diets, is_recipe=is_recipe)
        return [FoodResponse.model_validate(f) for f in foods]

    async def count_foods(self, search: str | None = None, diets: list[str] | None = None, is_recipe: bool | None = None) -> int:
        return await self.repo.count(search=search, diets=diets, is_recipe=is_recipe)

    async def create_food(self, data: FoodCreate) -> FoodResponse:
        food = await self.repo.create(data)
        return FoodResponse.model_validate(food)
