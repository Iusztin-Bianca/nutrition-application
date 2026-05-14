from sqlalchemy import Integer, Float, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ...core.database import Base


class FoodNutrient(Base):
    __tablename__ = "food_nutrients"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    food_id: Mapped[int] = mapped_column(Integer, ForeignKey("foods.id"), nullable=False)
    nutrient_id: Mapped[int] = mapped_column(Integer, ForeignKey("nutrients.id"), nullable=False)
    value_per_100g: Mapped[float] = mapped_column(Float, nullable=False)

    food: Mapped["Food"] = relationship(back_populates="food_nutrients")
    nutrient: Mapped["Nutrient"] = relationship(back_populates="food_nutrients")
