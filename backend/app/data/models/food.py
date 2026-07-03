from datetime import datetime
from sqlalchemy import Integer, String, Float, Boolean, Text, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ...core.database import Base


class Food(Base):
    __tablename__ = "foods"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False, unique=True, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # Base macros (per 100g)
    kcal: Mapped[float] = mapped_column(Float, nullable=False)
    protein: Mapped[float] = mapped_column(Float, nullable=False)
    carbohydrates: Mapped[float] = mapped_column(Float, nullable=False)
    sugars: Mapped[float | None] = mapped_column(Float, nullable=True)
    fat: Mapped[float] = mapped_column(Float, nullable=False)
    saturated_fat: Mapped[float | None] = mapped_column(Float, nullable=True)
    polyunsat_fat: Mapped[float | None] = mapped_column(Float, nullable=True)
    monounsat_fat: Mapped[float | None] = mapped_column(Float, nullable=True)
    trans_fat: Mapped[float | None] = mapped_column(Float, nullable=True)
    fiber: Mapped[float | None] = mapped_column(Float, nullable=True)
    water: Mapped[float | None] = mapped_column(Float, nullable=True)
    salt: Mapped[float | None] = mapped_column(Float, nullable=True)
    sodium: Mapped[float | None] = mapped_column(Float, nullable=True)
    glycemic_index: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # Diet flags
    is_vegan: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="false")
    is_vegetarian: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="false")
    is_raw_vegan: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="false")
    is_mediterranean: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="false")
    is_gluten_free: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="false")
    is_lactose_free: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="false")
    is_fodmap: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="false")
    is_recipe: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="false")

    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    micronutrients: Mapped[list["FoodMicronutrient"]] = relationship(  # type: ignore[name-defined]
        back_populates="food", cascade="all, delete-orphan"
    )
    recipe_ingredients: Mapped[list["RecipeIngredient"]] = relationship(  # type: ignore[name-defined]
        "RecipeIngredient",
        foreign_keys="[RecipeIngredient.recipe_id]",
        back_populates="recipe",
        cascade="all, delete-orphan",
    )
