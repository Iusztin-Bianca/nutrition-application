from pydantic import BaseModel, EmailStr, field_validator
from datetime import datetime

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    gdpr_accepted: bool = False

    @field_validator("password")
    @classmethod
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError("Parola trebuie să aibă minim 6 caractere.")
        if len(v) > 72:
            raise ValueError("Parola nu poate depăși 72 de caractere.")
        return v

    @field_validator("gdpr_accepted")
    @classmethod
    def validate_gdpr(cls, v):
        if not v:
            raise ValueError("Trebuie să accepți politica de confidențialitate.")
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    role: str
    created_at: datetime

    model_config = {"from_attributes": True}

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    gdpr_accepted: bool = False

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError("Parola trebuie să aibă minim 6 caractere.")
        if len(v) > 72:
            raise ValueError("Parola nu poate depăși 72 de caractere.")
        return v