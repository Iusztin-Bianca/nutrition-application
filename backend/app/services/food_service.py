from ..data.repositories.food_repository import FoodRepository
from ..data.schemas.food import FoodCreate, FoodResponse


class FoodService:

    def __init__(self, repo: FoodRepository):
        self.repo = repo

    async def create_food(self, data: FoodCreate) -> FoodResponse:
        food = await self.repo.create(data)
        return FoodResponse.model_validate(food)
