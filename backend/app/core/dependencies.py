from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from .database import get_db
from .security import decode_token
from ..data.repositories.user_repository import UserRepository
from ..data.repositories.user_details_repository import UserDetailsRepository
from ..data.repositories.user_measurement_repository import UserMeasurementRepository
from ..services.auth_service import AuthService
from ..services.user_details_service import UserDetailsService

bearer_scheme = HTTPBearer()


async def get_current_user(
        credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
        db: AsyncSession = Depends(get_db)
):
    token = credentials.credentials
    email = decode_token(token)
    if not email:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token invalid")

    user = await UserRepository(db).get_by_email(email)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token invalid")

    return user


def get_auth_service(db: AsyncSession = Depends(get_db)) -> AuthService:
    return AuthService(UserRepository(db))


def get_user_details_service(db: AsyncSession = Depends(get_db)) -> UserDetailsService:
    return UserDetailsService(UserDetailsRepository(db), UserMeasurementRepository(db))