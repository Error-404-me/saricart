"""add admin role to userrole enum

Revision ID: b7e2f4a9c1d3
Revises: a1b2c3d4e5f6
Create Date: 2026-08-04 00:00:00.000000
"""
from typing import Sequence, Union

from alembic import op

revision: str = 'b7e2f4a9c1d3'
down_revision: Union[str, Sequence[str], None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    if bind.dialect.name == 'postgresql':
        # ALTER TYPE ... ADD VALUE cannot run inside Alembic's implicit
        # transaction on Postgres < 13; committing first is safe on all
        # versions. Requires Postgres 12+ for IF NOT EXISTS.
        op.execute("COMMIT")
        op.execute("ALTER TYPE userrole ADD VALUE IF NOT EXISTS 'ADMIN'")
    # SQLite has no native enum type — the column is a plain VARCHAR with
    # no DB-level constraint, so no schema change is needed there.


def downgrade() -> None:
    # Postgres can't drop a single enum value without recreating the
    # type. This migration is additive-only and safe to leave in place.
    pass