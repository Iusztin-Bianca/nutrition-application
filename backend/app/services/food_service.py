from ..data.repositories.food_repository import FoodRepository
from ..data.schemas.food import FoodCreate, FoodResponse


class FoodService:

    def __init__(self, repo: FoodRepository):
        self.repo = repo

    async def get_all_foods(self, skip: int = 0, limit: int = 50) -> list[FoodResponse]:
        foods = await self.repo.get_all(skip=skip, limit=limit)
        return [FoodResponse.model_validate(f) for f in foods]

    async def create_food(self, data: FoodCreate) -> FoodResponse:
        food = await self.repo.create(data)
        return FoodResponse.model_validate(food)
