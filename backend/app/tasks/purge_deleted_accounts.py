"""Run periodically (Railway Cron / any scheduler) to permanently erase
accounts whose retention period has elapsed:

    python -m app.tasks.purge_deleted_accounts
"""
from datetime import datetime, timezone

from app.database import SessionLocal
from app.models.user import User


def run() -> int:
    db = SessionLocal()
    try:
        now = datetime.now(timezone.utc)
        expired = db.query(User).filter(User.deleted_at.isnot(None), User.purge_at <= now).all()
        count = len(expired)
        for user in expired:
            db.delete(user)
        db.commit()
        return count
    finally:
        db.close()


if __name__ == "__main__":
    print(f"Purged {run()} account(s).")