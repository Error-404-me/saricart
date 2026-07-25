from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict

from app.models.notification import NotificationType


class NotificationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    type: NotificationType
    title: str
    body: Optional[str] = None
    link: Optional[str] = None
    is_read: bool
    created_at: datetime


class NotificationSummary(BaseModel):
    unread_count: int