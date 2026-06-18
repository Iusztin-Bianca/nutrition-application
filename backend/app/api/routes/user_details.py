from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from ...core.dependencies import get_current_user, get_user_details_service
from ...core.database import get_db
from ...data.schemas.user_details import UserDetailsUpdate, UserDetailsResponse, MeasurementResponse
from ...services.user_details_service import UserDetailsService
from ...data.models.user import User
from ...data.repositories.user_repository import UserRepository
from ...data.repositories.user_measurement_repository import UserMeasurementRepository
from ...data.repositories.user_details_repository import UserDetailsRepository

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


@router.get("/measurements", response_model=list[MeasurementResponse])
async def get_measurements(
        current_user: User = Depends(get_current_user),
        db: AsyncSession = Depends(get_db),
):
    repo = UserMeasurementRepository(db)
    measurements = await repo.get_all(current_user.id)

    # For users whose profile predates measurement tracking:
    # permanently store an initial entry so the weight is captured at the
    # value it had at first access (not whatever the current weight is).
    if not measurements:
        details = await UserDetailsRepository(db).get_user_by_id(current_user.id)
        if details and (details.weight is not None or details.waist is not None):
            await repo.add(
                current_user.id,
                details.weight,
                details.waist,
                recorded_at=current_user.created_at,
            )
            measurements = await repo.get_all(current_user.id)

    return measurements


@router.delete("/account", status_code=204)
async def delete_account(
        current_user: User = Depends(get_current_user),
        db: AsyncSession = Depends(get_db),
):
    await UserRepository(db).delete_user(current_user.id)
