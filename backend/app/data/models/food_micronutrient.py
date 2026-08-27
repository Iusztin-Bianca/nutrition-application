import enum
from decimal import Decimal
from sqlalchemy import Integer, ForeignKey, Numeric, UniqueConstraint, Index
from sqlalchemy import Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ...core.database import Base


class MicronutrientType(enum.Enum):
    # Advanced
    calcium = "calcium"
    magnesium = "magnesium"
    potassium = "potassium"
    iron = "iron"
    zinc = "zinc"
    selenium = "selenium"
    iodine = "iodine"
    vitamin_d = "vitamin_d"
    # More advanced
    vitamin_a = "vitamin_a"
    vitamin_c = "vitamin_c"
    vitamin_e = "vitamin_e"
    vitamin_k = "vitamin_k"
    vitamin_b1 = "vitamin_b1"
    vitamin_b2 = "vitamin_b2"
    vitamin_b3 = "vitamin_b3"
    vitamin_b6 = "vitamin_b6"
    vitamin_b7 = "vitamin_b7"
    vitamin_b9 = "vitamin_b9"
    vitamin_b12 = "vitamin_b12"
    cholesterol = "cholesterol"
    caffeine = "caffeine"
    alcohol = "alcohol"
    omega_3 = "omega_3"
    omega_6 = "omega_6"
    copper = "copper"
    manganese = "manganese"
    phosphorus = "phosphorus"


class FoodMicronutrient(Base):
    __tablename__ = "food_micronutrients"
    __table_args__ = (
        UniqueConstraint("food_id", "nutrient", name="uq_food_nutrient"),
        Index("ix_food_micronutrients_food_id", "food_id"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    food_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("foods.id", ondelete="CASCADE"), nullable=False
    )
    nutrient: Mapped[MicronutrientType] = mapped_column(
        SAEnum(MicronutrientType, name="micronutrient_type"), nullable=False
    )
    amount: Mapped[Decimal] = mapped_column(Numeric(8, 3), nullable=False)

    food: Mapped["Food"] = relationship(back_populates="micronutrients")  # type: ignore[name-defined]
