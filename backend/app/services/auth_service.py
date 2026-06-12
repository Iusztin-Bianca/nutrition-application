from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from ..data.repositories.user_repository import UserRepository
from ..data.schemas.user import UserCreate
from ..core.security import (
    hash_password, verify_password, create_access_token,
    create_verification_token, create_reset_token, decode_token,
)
from ..core.exceptions import (
    EmailAlreadyExistsError, InvalidCredentialsError,
    EmailNotVerifiedError, InvalidTokenError, UserNotFoundError,
)
from .email_service import send_verification_email, send_reset_password_email


class AuthService:
    def __init__(self, repo: UserRepository):
        self.repo = repo

    async def register(self, user_data: UserCreate):
        existing = await self.repo.get_by_email(user_data.email)
        if existing:
            raise EmailAlreadyExistsError()
        hashed = hash_password(user_data.password)
        gdpr_ts = datetime.utcnow() if user_data.gdpr_accepted else None
        user = await self.repo.create_user(user_data.email, hashed, gdpr_accepted_at=gdpr_ts)
        try:
            token = create_verification_token(user.email)
            await send_verification_email(user.email, token)
        except Exception as e:
            print(f"[EMAIL ERROR] send_verification_email failed: {e}")
        return user

    async def login(self, email: str, password: str):
        user = await self.repo.get_by_email(email)
        if not user or not verify_password(password, user.hashed_password):
            raise InvalidCredentialsError()
        if not user.email_verified:
            raise EmailNotVerifiedError()
        token = create_access_token({"sub": user.email})
        return {"access_token": token, "token_type": "bearer", "gdpr_accepted": user.gdpr_accepted_at is not None}

    async def accept_gdpr(self, email: str) -> None:
        await self.repo.update_gdpr_accepted(email)

    async def verify_email(self, token: str):
        email = decode_token(token, expected_type="verify")
        if not email:
            raise InvalidTokenError()
        user = await self.repo.get_by_email(email)
        if not user:
            raise UserNotFoundError()
        if user.email_verified:
            return {"message": "Emailul este deja confirmat."}
        await self.repo.update_email_verified(email)
        return {"message": "Emailul a fost confirmat cu succes!"}

    async def forgot_password(self, email: str):
        user = await self.repo.get_by_email(email)
        if user:
            try:
                token = create_reset_token(email)
                await send_reset_password_email(email, token)
            except Exception:
                pass
        return {"message": "Dacă emailul există în sistem, vei primi un link de resetare."}

    async def reset_password(self, token: str, new_password: str):
        email = decode_token(token, expected_type="reset")
        if not email:
            raise InvalidTokenError()
        user = await self.repo.get_by_email(email)
        if not user:
            raise UserNotFoundError()
        hashed = hash_password(new_password)
        await self.repo.update_password(email, hashed)
        return {"message": "Parola a fost resetată cu succes!"}
