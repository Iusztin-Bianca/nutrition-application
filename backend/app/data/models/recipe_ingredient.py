from sqlalchemy import Integer, Float, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ...core.database import Base


class RecipeIngredient(Base):
    __tablename__ = "recipe_ingredients"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    recipe_id: Mapped[int] = mapped_column(Integer, ForeignKey("foods.id", ondelete="CASCADE"), nullable=False)
    food_id: Mapped[int] = mapped_column(Integer, ForeignKey("foods.id"), nullable=False)
    quantity_grams: Mapped[float] = mapped_column(Float, nullable=False)

    recipe: Mapped["Food"] = relationship(  # type: ignore[name-defined]
        "Food",
        foreign_keys="[RecipeIngredient.recipe_id]",
        back_populates="recipe_ingredients",
    )
    food: Mapped["Food"] = relationship(  # type: ignore[name-defined]
        "Food",
        foreign_keys="[RecipeIngredient.food_id]",
    )
