"""add product sub-unit selling and increase decimal precision

Revision ID: f27a9c1d4e56
Revises: d4f1b7c8a230
Create Date: 2026-07-29 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = 'f27a9c1d4e56'
down_revision: Union[str, Sequence[str], None] = 'd4f1b7c8a230'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# Reuses the 'productunit' enum type created in d4f1b7c8a230.
PRODUCT_UNIT_ENUM = sa.Enum(
    'PIECE', 'KILOGRAM', 'GRAM', 'LITER', 'MILLILITER',
    'DOZEN', 'PACK', 'BOX', 'SACK', 'BUNDLE', 'METER',
    name='productunit',
)


def upgrade() -> None:
    with op.batch_alter_table('products') as batch_op:
        batch_op.add_column(sa.Column('sub_unit', PRODUCT_UNIT_ENUM, nullable=True))
        batch_op.add_column(sa.Column('sub_unit_ratio', sa.Numeric(12, 4), nullable=True))
        batch_op.alter_column('stock', type_=sa.Numeric(14, 4), existing_type=sa.Numeric(12, 3))

    with op.batch_alter_table('order_items') as batch_op:
        batch_op.alter_column('quantity', type_=sa.Numeric(14, 4), existing_type=sa.Numeric(12, 3))
        batch_op.add_column(sa.Column('selling_unit_quantity', sa.Numeric(14, 4), nullable=True))

    with op.batch_alter_table('stock_history') as batch_op:
        for col in ('change', 'previous_stock', 'new_stock'):
            batch_op.alter_column(col, type_=sa.Numeric(14, 4), existing_type=sa.Numeric(12, 3))


def downgrade() -> None:
    with op.batch_alter_table('stock_history') as batch_op:
        for col in ('new_stock', 'previous_stock', 'change'):
            batch_op.alter_column(col, type_=sa.Numeric(12, 3), existing_type=sa.Numeric(14, 4))

    with op.batch_alter_table('order_items') as batch_op:
        batch_op.drop_column('selling_unit_quantity')
        batch_op.alter_column('quantity', type_=sa.Numeric(12, 3), existing_type=sa.Numeric(14, 4))

    with op.batch_alter_table('products') as batch_op:
        batch_op.alter_column('stock', type_=sa.Numeric(12, 3), existing_type=sa.Numeric(14, 4))
        batch_op.drop_column('sub_unit_ratio')
        batch_op.drop_column('sub_unit')