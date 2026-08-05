"""One-off CLI to promote an existing user to admin:

    python -m app.tasks.promote_to_admin someone@example.com
"""
import sys

from app.database import SessionLocal
from app.models.user import User, UserRole


def run(email: str) -> None:
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            print(f"No user found with email {email}")
            return
        user.role = UserRole.ADMIN
        db.commit()
        print(f"{user.username} ({email}) is now an admin.")
    finally:
        db.close()


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python -m app.tasks.promote_to_admin <email>")
        sys.exit(1)
    run(sys.argv[1])