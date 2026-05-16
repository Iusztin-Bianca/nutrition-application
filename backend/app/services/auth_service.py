from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from ..data.repositories.user_repository import UserRepository
from ..data.schemas.user import UserCreate
from ..core.security import hash_password, verify_password, create_access_token


class AuthService:
    def __init__(self, db: AsyncSession):
        self.repo = UserRepository(db)

    async def register(self, user_data: UserCreate):
        existing = await self.repo.get_by_email(user_data.email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Emailul este deja înregistrat!"
            )
        hashed = hash_password(user_data.password)
        return await self.repo.create_user(user_data.email, hashed)

    async def login(self, email: str, password: str):
        user = await self.repo.get_by_email(email)
        if not user or not verify_password(password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email sau parolă incorectă!"
            )
        token = create_access_token({"sub": user.email})
        return {"access_token": token, "token_type": "bearer"}
