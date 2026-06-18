from datetime import datetime
from sqlalchemy import Integer, Float, ForeignKey, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column
from ...core.database import Base


class UserMeasurement(Base):
    __tablename__ = "user_measurements"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    recorded_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)
    weight: Mapped[float | None] = mapped_column(Float, nullable=True)
    waist: Mapped[int | None] = mapped_column(Integer, nullable=True)
