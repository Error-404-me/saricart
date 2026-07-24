from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, ConfigDict, Field

from app.models.user import UserRole


class UserBase(BaseModel):
    username: str
    email: EmailStr


class UserCreate(UserBase):
    password: str
    role: UserRole = UserRole.CUSTOMER


class UserUpdate(BaseModel):
    username: Optional[str] = Field(default=None, min_length=3, max_length=50)
    email: Optional[EmailStr] = None


class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8)


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
    notify_order_updates: bool
    notify_promotions: bool
    notify_low_stock: bool