from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..models.user import User


class UserRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_email(self, email: str) -> User | None:
        result = await self.db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    async def create_user(self, email: str, hashed_password: str, gdpr_accepted_at: datetime | None = None) -> User:
        user = User(email=email, hashed_password=hashed_password, role="user", email_verified=True, gdpr_accepted_at=gdpr_accepted_at)
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def update_gdpr_accepted(self, email: str) -> None:
        user = await self.get_by_email(email)
        if user:
            user.gdpr_accepted_at = datetime.utcnow()
            await self.db.commit()

    async def update_email_verified(self, email: str) -> None:
        user = await self.get_by_email(email)
        if user:
            user.email_verified = True
            await self.db.commit()

    async def update_password(self, email: str, hashed_password: str) -> None:
        user = await self.get_by_email(email)
        if user:
            user.hashed_password = hashed_password
            await self.db.commit()

    async def delete_user(self, user_id: int) -> None:
        user = await self.db.get(User, user_id)
        if user:
            await self.db.delete(user)
            await self.db.commit()
