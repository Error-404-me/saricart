from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import require_owner
from app.models.audit_log import AuditAction
from app.models.user import User
from app.schemas.audit_log import AuditLogOut
from app.services import audit_service

router = APIRouter(prefix="/api/audit-logs", tags=["audit"])


@router.get("", response_model=list[AuditLogOut])
def list_my_audit_logs(
    action: AuditAction | None = None,
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_owner),
):
    """Owner-scoped audit trail (a platform-wide admin view would need a
    separate admin role, not yet modeled)."""
    return audit_service.list_audit_logs(db, owner_id=current_user.id, action=action, limit=limit, offset=offset)