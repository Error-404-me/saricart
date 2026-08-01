from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict

from app.models.audit_log import AuditAction


class AuditLogOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: Optional[int] = None
    username: Optional[str] = None
    action: AuditAction
    entity_type: Optional[str] = None
    entity_id: Optional[str] = None
    description: Optional[str] = None
    created_at: datetime