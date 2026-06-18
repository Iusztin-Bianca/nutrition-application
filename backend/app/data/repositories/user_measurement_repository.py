from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..models.user_measurement import UserMeasurement


class UserMeasurementRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def add(
        self,
        user_id: int,
        weight: float | None,
        waist: int | None,
        recorded_at: datetime | None = None,
    ) -> UserMeasurement:
        m = UserMeasurement(user_id=user_id, weight=weight, waist=waist)
        if recorded_at is not None:
            m.recorded_at = recorded_at
        self.db.add(m)
        await self.db.commit()
        await self.db.refresh(m)
        return m

    async def get_all(self, user_id: int) -> list[UserMeasurement]:
        result = await self.db.execute(
            select(UserMeasurement)
            .where(UserMeasurement.user_id == user_id)
            .order_by(UserMeasurement.recorded_at)
        )
        return list(result.scalars().all())
