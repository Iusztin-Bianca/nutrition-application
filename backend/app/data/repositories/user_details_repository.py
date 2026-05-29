from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..models.user_details import UserDetails


class UserDetailsRepository:
   
    def __init__(self, db: AsyncSession):
        self.db = db
 
    async def get_user_by_id(self, user_id: int) -> UserDetails | None:
        result = await self.db.execute(select(UserDetails).where(UserDetails.id == user_id))
        return result.scalar_one_or_none()
    
    async def add_user(self, user_id: int) -> UserDetails:
        details = UserDetails(id=user_id)
        self.db.add(details)
        await self.db.commit()
        await self.db.refresh(details)
        return details
    
    async def update(self, details: UserDetails, data: dict) -> UserDetails:
        for key, value in data.items():
            setattr(details, key, value)
        await self.db.commit()
        await self.db.refresh(details)
        return details
