from sqlalchemy import Integer, Float, String, ForeignKey, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ...core.database import Base
from ...core.enums import GenderEnum, ActivityLevelEnum


class UserDetails(Base):
    __tablename__ = "user_details"

    id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    first_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    last_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    weight: Mapped[float | None] = mapped_column(Float, nullable=True)
    height: Mapped[float | None] = mapped_column(Float, nullable=True)
    age: Mapped[int | None] = mapped_column(Integer, nullable=True)
    sex: Mapped[GenderEnum | None] = mapped_column(Enum(GenderEnum, name="genenum"), nullable=True)
    waist: Mapped[int | None] = mapped_column(Integer, nullable=True)
    hip: Mapped[int | None] = mapped_column(Integer, nullable=True)
    activity_level: Mapped[ActivityLevelEnum | None] = mapped_column(Enum(ActivityLevelEnum), nullable=True)
    imc: Mapped[float | None] = mapped_column(Float, nullable=True)
    bmr: Mapped[float | None] = mapped_column(Float, nullable=True)
    mzt: Mapped[float | None] = mapped_column(Float, nullable=True)
    ts: Mapped[float | None] = mapped_column(Float, nullable=True)

    user: Mapped["User"] = relationship("User", back_populates="details")  # type: ignore[name-defined]
