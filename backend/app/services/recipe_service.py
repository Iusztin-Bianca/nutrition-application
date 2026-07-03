from ..data.repositories.recipe_repository import RecipeRepository
from ..data.schemas.food import FoodResponse
from ..data.schemas.recipe import RecipeCreate, RecipeIngredientDetail


class RecipeService:

    def __init__(self, repo: RecipeRepository):
        self.repo = repo

    async def create_recipe(self, data: RecipeCreate) -> FoodResponse:
        food = await self.repo.create(data)
        return FoodResponse.model_validate(food)

    async def get_ingredients(self, recipe_id: int) -> list[RecipeIngredientDetail]:
        ingredients = await self.repo.get_ingredients(recipe_id)
        return [
            RecipeIngredientDetail(
                food_id=ing.food_id,
                food_name=ing.food.name,
                quantity_grams=ing.quantity_grams,
                food_kcal=ing.food.kcal,
                food_protein=ing.food.protein,
                food_carbohydrates=ing.food.carbohydrates,
                food_fat=ing.food.fat,
            )
            for ing in ingredients
        ]

    async def update_recipe(self, recipe_id: int, data: RecipeCreate) -> FoodResponse:
        food = await self.repo.update(recipe_id, data)
        return FoodResponse.model_validate(food)
