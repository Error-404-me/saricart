from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, ConfigDict, Field, field_validator

from app.core.security import validate_password_strength
from app.models.user import UserRole


class UserBase(BaseModel):
    username: str
    email: EmailStr


class UserCreate(UserBase):
    password: str = Field(min_length=8)
    role: UserRole = UserRole.CUSTOMER
    accepted_terms: bool
    accepted_privacy: bool

    @field_validator("password")
    @classmethod
    def check_password_strength(cls, v):
        return validate_password_strength(v)


class UserUpdate(BaseModel):
    username: Optional[str] = Field(default=None, min_length=3, max_length=50)
    email: Optional[EmailStr] = None


class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8)

    @field_validator("new_password")
    @classmethod
    def check_password_strength(cls, v):
        return validate_password_strength(v)


class NotificationPreferences(BaseModel):
    notify_order_updates: bool
    notify_promotions: bool
    notify_low_stock: bool


class AccountDeleteRequest(BaseModel):
    password: str


class UserOut(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    role: UserRole
    created_at: datetime
    email_verified: bool
    notify_order_updates: bool
    notify_promotions: bool
    notify_low_stock: bool