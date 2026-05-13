import enum
from sqlalchemy import Integer, String, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..database import Base


class NutrientCategory(enum.Enum):
    macro = "macro"
    vitamin = "vitamin"
    mineral = "mineral"


class Nutrient(Base):
    __tablename__ = "nutrients"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    category: Mapped[NutrientCategory] = mapped_column(SAEnum(NutrientCategory), nullable=False)
    unit: Mapped[str] = mapped_column(String(10), nullable=False)

    food_nutrients: Mapped[list["FoodNutrient"]] = relationship(back_populates="nutrient")
