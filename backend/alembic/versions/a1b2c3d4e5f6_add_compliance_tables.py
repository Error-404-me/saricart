"""add compliance & security tables (audit logs, verification tokens,
store verification, user soft-delete/consent fields)

Revision ID: a1b2c3d4e5f6
Revises: f27a9c1d4e56
Create Date: 2026-07-31 00:00:00.000000
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = 'f27a9c1d4e56'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table('users') as batch_op:
        batch_op.add_column(sa.Column('email_verified', sa.Boolean(), nullable=False, server_default=sa.false()))
        batch_op.add_column(sa.Column('terms_accepted_at', sa.DateTime(), nullable=True))
        batch_op.add_column(sa.Column('privacy_accepted_at', sa.DateTime(), nullable=True))
        batch_op.add_column(sa.Column('deleted_at', sa.DateTime(), nullable=True))
        batch_op.add_column(sa.Column('purge_at', sa.DateTime(), nullable=True))

    op.create_table(
        'email_verification_tokens',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('token', sa.String(length=64), nullable=False),
        sa.Column('expires_at', sa.DateTime(), nullable=False),
        sa.Column('used_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('token'),
    )
    op.create_index('ix_email_verification_tokens_user_id', 'email_verification_tokens', ['user_id'])
    op.create_index('ix_email_verification_tokens_token', 'email_verification_tokens', ['token'])

    op.create_table(
        'password_reset_tokens',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('token', sa.String(length=64), nullable=False),
        sa.Column('expires_at', sa.DateTime(), nullable=False),
        sa.Column('used_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('token'),
    )
    op.create_index('ix_password_reset_tokens_user_id', 'password_reset_tokens', ['user_id'])
    op.create_index('ix_password_reset_tokens_token', 'password_reset_tokens', ['token'])

    op.create_table(
        'audit_logs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('action', sa.Enum(
            'PRODUCT_CREATED', 'PRODUCT_UPDATED', 'PRODUCT_DELETED', 'STOCK_ADJUSTED',
            'PRICE_UPDATED', 'ORDER_STATUS_CHANGED', 'LOGIN_SUCCESS', 'LOGIN_FAILED',
            'PASSWORD_CHANGED', 'PASSWORD_RESET', 'ACCOUNT_DELETED',
            'STORE_VERIFICATION_SUBMITTED', 'STORE_VERIFICATION_REVIEWED',
            name='auditaction',
        ), nullable=False),
        sa.Column('entity_type', sa.String(length=50), nullable=True),
        sa.Column('entity_id', sa.String(length=50), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('ip_address', sa.String(length=64), nullable=True),
        sa.Column('user_agent', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_audit_logs_user_id', 'audit_logs', ['user_id'])
    op.create_index('ix_audit_logs_action', 'audit_logs', ['action'])
    op.create_index('ix_audit_logs_created_at', 'audit_logs', ['created_at'])

    op.create_table(
        'store_verifications',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('owner_id', sa.Integer(), nullable=False),
        sa.Column('status', sa.Enum('UNSUBMITTED', 'PENDING', 'VERIFIED', 'REJECTED', name='verificationstatus'), nullable=False),
        sa.Column('government_id_url', sa.String(length=255), nullable=True),
        sa.Column('business_permit_url', sa.String(length=255), nullable=True),
        sa.Column('barangay_clearance_url', sa.String(length=255), nullable=True),
        sa.Column('bir_registration_url', sa.String(length=255), nullable=True),
        sa.Column('rejection_reason', sa.Text(), nullable=True),
        sa.Column('reviewed_at', sa.DateTime(), nullable=True),
        sa.Column('reviewed_by', sa.Integer(), nullable=True),
        sa.Column('submitted_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['owner_id'], ['users.id']),
        sa.ForeignKeyConstraint(['reviewed_by'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('owner_id'),
    )
    op.create_index('ix_store_verifications_owner_id', 'store_verifications', ['owner_id'])


def downgrade() -> None:
    op.drop_table('store_verifications')
    sa.Enum(name='verificationstatus').drop(op.get_bind(), checkfirst=True)
    op.drop_table('audit_logs')
    sa.Enum(name='auditaction').drop(op.get_bind(), checkfirst=True)
    op.drop_table('password_reset_tokens')
    op.drop_table('email_verification_tokens')
    with op.batch_alter_table('users') as batch_op:
        batch_op.drop_column('purge_at')
        batch_op.drop_column('deleted_at')
        batch_op.drop_column('privacy_accepted_at')
        batch_op.drop_column('terms_accepted_at')
        batch_op.drop_column('email_verified')