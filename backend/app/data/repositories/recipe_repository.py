from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select, delete
from sqlalchemy.exc import IntegrityError
from ..models.food import Food
from ..models.food_micronutrient import FoodMicronutrient
from ..models.recipe_ingredient import RecipeIngredient
from ..schemas.recipe import RecipeCreate
from ...core.exceptions import FoodAlreadyExistsError


class RecipeRepository:

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_ingredients(self, recipe_id: int) -> list[RecipeIngredient]:
        result = await self.db.execute(
            select(RecipeIngredient)
            .options(selectinload(RecipeIngredient.food))
            .where(RecipeIngredient.recipe_id == recipe_id)
        )
        return list(result.scalars().all())

    async def create(self, data: RecipeCreate) -> Food:
        # Load all ingredient foods with their micronutrients
        ingredient_foods: list[tuple[Food, float]] = []
        for ing in data.ingredients:
            result = await self.db.execute(
                select(Food)
                .options(selectinload(Food.micronutrients))
                .where(Food.id == ing.food_id)
            )
            food = result.scalar_one_or_none()
            if food is None:
                raise ValueError(f"Alimentul cu ID {ing.food_id} nu există.")
            ingredient_foods.append((food, ing.quantity_grams))

        total_weight = sum(q for _, q in ingredient_foods)
        if total_weight <= 0:
            raise ValueError("Cantitatea totală a ingredientelor trebuie să fie pozitivă.")

        def calc_req(attr: str) -> float:
            total = sum((getattr(f, attr) or 0.0) * q / 100 for f, q in ingredient_foods)
            return round(total / total_weight * 100, 2)

        def calc_opt(attr: str) -> float | None:
            pairs = [(getattr(f, attr), q) for f, q in ingredient_foods if getattr(f, attr) is not None]
            if not pairs:
                return None
            total = sum(v * q / 100 for v, q in pairs)
            return round(total / total_weight * 100, 2)

        def all_flag(attr: str) -> bool:
            return all(getattr(f, attr) for f, _ in ingredient_foods)

        recipe_food = Food(
            name=data.name,
            description=data.description,
            image_url=data.image_url,
            is_recipe=True,
            kcal=calc_req("kcal"),
            protein=calc_req("protein"),
            carbohydrates=calc_req("carbohydrates"),
            sugars=calc_opt("sugars"),
            fat=calc_req("fat"),
            saturated_fat=calc_opt("saturated_fat"),
            polyunsat_fat=calc_opt("polyunsat_fat"),
            monounsat_fat=calc_opt("monounsat_fat"),
            trans_fat=calc_opt("trans_fat"),
            fiber=calc_opt("fiber"),
            water=calc_opt("water"),
            salt=calc_opt("salt"),
            sodium=calc_opt("sodium"),
            glycemic_index=None,
            is_vegan=all_flag("is_vegan"),
            is_vegetarian=all_flag("is_vegetarian"),
            is_raw_vegan=all_flag("is_raw_vegan"),
            is_mediterranean=all_flag("is_mediterranean"),
            is_gluten_free=all_flag("is_gluten_free"),
            is_lactose_free=all_flag("is_lactose_free"),
            is_fodmap=all_flag("is_fodmap"),
        )
        self.db.add(recipe_food)
        await self.db.flush()

        # Aggregate micronutrients from all ingredients
        micro_totals: dict = {}
        for food, qty in ingredient_foods:
            for m in food.micronutrients:
                key = m.nutrient
                micro_totals[key] = micro_totals.get(key, 0.0) + float(m.amount) * qty / 100

        for nutrient, total_amount in micro_totals.items():
            per_100g = round(total_amount / total_weight * 100, 3)
            self.db.add(FoodMicronutrient(food_id=recipe_food.id, nutrient=nutrient, amount=per_100g))

        # Create ingredient records
        for food, qty in ingredient_foods:
            self.db.add(RecipeIngredient(recipe_id=recipe_food.id, food_id=food.id, quantity_grams=qty))

        try:
            await self.db.commit()
        except IntegrityError:
            await self.db.rollback()
            raise FoodAlreadyExistsError(data.name)

        result = await self.db.execute(
            select(Food)
            .options(selectinload(Food.micronutrients))
            .where(Food.id == recipe_food.id)
        )
        return result.scalar_one()

    async def update(self, recipe_id: int, data: RecipeCreate) -> Food:
        result = await self.db.execute(
            select(Food).where(Food.id == recipe_id, Food.is_recipe.is_(True))
        )
        recipe_food = result.scalar_one_or_none()
        if recipe_food is None:
            raise ValueError(f"Rețeta cu ID {recipe_id} nu există.")

        await self.db.execute(delete(RecipeIngredient).where(RecipeIngredient.recipe_id == recipe_id))
        await self.db.execute(delete(FoodMicronutrient).where(FoodMicronutrient.food_id == recipe_id))

        ingredient_foods: list[tuple[Food, float]] = []
        for ing in data.ingredients:
            result = await self.db.execute(
                select(Food)
                .options(selectinload(Food.micronutrients))
                .where(Food.id == ing.food_id)
            )
            food = result.scalar_one_or_none()
            if food is None:
                raise ValueError(f"Alimentul cu ID {ing.food_id} nu există.")
            ingredient_foods.append((food, ing.quantity_grams))

        total_weight = sum(q for _, q in ingredient_foods)
        if total_weight <= 0:
            raise ValueError("Cantitatea totală a ingredientelor trebuie să fie pozitivă.")

        def calc_req(attr: str) -> float:
            total = sum((getattr(f, attr) or 0.0) * q / 100 for f, q in ingredient_foods)
            return round(total / total_weight * 100, 2)

        def calc_opt(attr: str) -> float | None:
            pairs = [(getattr(f, attr), q) for f, q in ingredient_foods if getattr(f, attr) is not None]
            if not pairs:
                return None
            total = sum(v * q / 100 for v, q in pairs)
            return round(total / total_weight * 100, 2)

        def all_flag(attr: str) -> bool:
            return all(getattr(f, attr) for f, _ in ingredient_foods)

        recipe_food.name = data.name
        recipe_food.description = data.description
        recipe_food.image_url = data.image_url
        recipe_food.kcal = calc_req("kcal")
        recipe_food.protein = calc_req("protein")
        recipe_food.carbohydrates = calc_req("carbohydrates")
        recipe_food.sugars = calc_opt("sugars")
        recipe_food.fat = calc_req("fat")
        recipe_food.saturated_fat = calc_opt("saturated_fat")
        recipe_food.polyunsat_fat = calc_opt("polyunsat_fat")
        recipe_food.monounsat_fat = calc_opt("monounsat_fat")
        recipe_food.trans_fat = calc_opt("trans_fat")
        recipe_food.fiber = calc_opt("fiber")
        recipe_food.water = calc_opt("water")
        recipe_food.salt = calc_opt("salt")
        recipe_food.sodium = calc_opt("sodium")
        recipe_food.glycemic_index = None
        recipe_food.is_vegan = all_flag("is_vegan")
        recipe_food.is_vegetarian = all_flag("is_vegetarian")
        recipe_food.is_raw_vegan = all_flag("is_raw_vegan")
        recipe_food.is_mediterranean = all_flag("is_mediterranean")
        recipe_food.is_gluten_free = all_flag("is_gluten_free")
        recipe_food.is_lactose_free = all_flag("is_lactose_free")
        recipe_food.is_fodmap = all_flag("is_fodmap")

        micro_totals: dict = {}
        for food, qty in ingredient_foods:
            for m in food.micronutrients:
                key = m.nutrient
                micro_totals[key] = micro_totals.get(key, 0.0) + float(m.amount) * qty / 100

        for nutrient, total_amount in micro_totals.items():
            per_100g = round(total_amount / total_weight * 100, 3)
            self.db.add(FoodMicronutrient(food_id=recipe_food.id, nutrient=nutrient, amount=per_100g))

        for food, qty in ingredient_foods:
            self.db.add(RecipeIngredient(recipe_id=recipe_food.id, food_id=food.id, quantity_grams=qty))

        await self.db.commit()
        await self.db.refresh(recipe_food)
        return recipe_food
