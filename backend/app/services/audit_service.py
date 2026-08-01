from typing import Optional

from fastapi import Request
from sqlalchemy.orm import Session, joinedload

from app.models.audit_log import AuditLog, AuditAction


def log_action(
    db: Session,
    action: AuditAction,
    user_id: Optional[int] = None,
    entity_type: Optional[str] = None,
    entity_id: Optional[str] = None,
    description: Optional[str] = None,
    request: Optional[Request] = None,
) -> None:
    """Best-effort insert in its own SAVEPOINT — a logging failure never
    breaks the operation it's recording (same isolation as notifications)."""
    try:
        with db.begin_nested():
            db.add(
                AuditLog(
                    user_id=user_id,
                    action=action,
                    entity_type=entity_type,
                    entity_id=str(entity_id) if entity_id is not None else None,
                    description=description,
                    ip_address=request.client.host if request and request.client else None,
                    user_agent=request.headers.get("user-agent") if request else None,
                )
            )
    except Exception:
        pass


def list_audit_logs(
    db: Session,
    owner_id: Optional[int] = None,
    action: Optional[AuditAction] = None,
    limit: int = 50,
    offset: int = 0,
) -> list[AuditLog]:
    query = db.query(AuditLog).options(joinedload(AuditLog.user))
    if owner_id is not None:
        query = query.filter(AuditLog.user_id == owner_id)
    if action is not None:
        query = query.filter(AuditLog.action == action)
    return query.order_by(AuditLog.created_at.desc()).offset(offset).limit(limit).all()