from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from ...core.dependencies import get_current_user, get_user_details_service
from ...core.database import get_db
from ...data.schemas.user_details import UserDetailsUpdate, UserDetailsResponse
from ...services.user_details_service import UserDetailsService
from ...data.models.user import User
from ...data.repositories.user_repository import UserRepository

router = APIRouter(prefix="/api/profile", tags=["profile"])


@router.get("", response_model=UserDetailsResponse)
async def get_user_details(
        current_user: User = Depends(get_current_user),
        service: UserDetailsService = Depends(get_user_details_service),
):
    return await service.get_or_create(current_user.id)


@router.put("", response_model=UserDetailsResponse)
async def update_user_details(
        data: UserDetailsUpdate,
        current_user: User = Depends(get_current_user),
        service: UserDetailsService = Depends(get_user_details_service),
):
    return await service.update_user_details(current_user.id, data)


@router.delete("/account", status_code=204)
async def delete_account(
        current_user: User = Depends(get_current_user),
        db: AsyncSession = Depends(get_db),
):
    await UserRepository(db).delete_user(current_user.id)
