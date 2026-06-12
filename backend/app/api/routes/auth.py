from fastapi import APIRouter, Depends, status
from ...core.dependencies import get_auth_service, get_current_user
from ...data.schemas.user import UserCreate, UserLogin, UserResponse, Token, ForgotPasswordRequest, ResetPasswordRequest
from ...services.auth_service import AuthService

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, service: AuthService = Depends(get_auth_service)):
    return await service.register(user_data)


@router.post("/login", response_model=Token)
async def login(user_data: UserLogin, service: AuthService = Depends(get_auth_service)):
    return await service.login(user_data.email, user_data.password)


@router.get("/verify-email")
async def verify_email(token: str, service: AuthService = Depends(get_auth_service)):
    return await service.verify_email(token)


@router.post("/forgot-password")
async def forgot_password(body: ForgotPasswordRequest, service: AuthService = Depends(get_auth_service)):
    return await service.forgot_password(body.email)


@router.post("/reset-password")
async def reset_password(body: ResetPasswordRequest, service: AuthService = Depends(get_auth_service)):
    return await service.reset_password(body.token, body.new_password)


@router.post("/accept-gdpr", status_code=status.HTTP_200_OK)
async def accept_gdpr(current_user=Depends(get_current_user), service: AuthService = Depends(get_auth_service)):
    await service.accept_gdpr(current_user.email)
    return {"message": "GDPR acceptat."}
