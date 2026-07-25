"""add notifications table

Revision ID: 4df7fd548ae7
Revises: bafd5d8717ec
Create Date: 2026-07-25 15:13:54.100786

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '4df7fd548ae7'
down_revision: Union[str, Sequence[str], None] = 'bafd5d8717ec'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'notifications',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column(
            'type',
            sa.Enum('ORDER_PLACED', 'ORDER_STATUS_CHANGED', 'LOW_STOCK', name='notificationtype'),
            nullable=False,
        ),
        sa.Column('title', sa.String(length=150), nullable=False),
        sa.Column('body', sa.Text(), nullable=True),
        sa.Column('link', sa.String(length=255), nullable=True),
        sa.Column('is_read', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_notifications_id'), 'notifications', ['id'], unique=False)
    op.create_index(op.f('ix_notifications_user_id'), 'notifications', ['user_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_notifications_user_id'), table_name='notifications')
    op.drop_index(op.f('ix_notifications_id'), table_name='notifications')
    op.drop_table('notifications')
    sa.Enum(name='notificationtype').drop(op.get_bind(), checkfirst=True)