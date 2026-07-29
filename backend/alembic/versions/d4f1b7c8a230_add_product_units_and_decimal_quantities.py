"""add product units and decimal stock/quantity support

Revision ID: d4f1b7c8a230
Revises: e93a1847739f
Create Date: 2026-07-29 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = 'd4f1b7c8a230'
down_revision: Union[str, Sequence[str], None] = 'e93a1847739f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

PRODUCT_UNIT_VALUES = (
    'PIECE', 'KILOGRAM', 'GRAM', 'LITER', 'MILLILITER',
    'DOZEN', 'PACK', 'BOX', 'SACK', 'BUNDLE', 'METER',
)


def upgrade() -> None:
    product_unit_enum = sa.Enum(*PRODUCT_UNIT_VALUES, name='productunit')
    product_unit_enum.create(op.get_bind(), checkfirst=True)

    with op.batch_alter_table('products') as batch_op:
        batch_op.add_column(
            sa.Column('unit', product_unit_enum, nullable=False, server_default='PIECE')
        )
        batch_op.alter_column(
            'stock',
            type_=sa.Numeric(12, 3),
            existing_type=sa.Integer(),
            existing_nullable=False,
        )

    with op.batch_alter_table('order_items') as batch_op:
        batch_op.add_column(sa.Column('product_unit', sa.String(length=20), nullable=True))
        batch_op.alter_column(
            'quantity',
            type_=sa.Numeric(12, 3),
            existing_type=sa.Integer(),
            existing_nullable=False,
        )

    with op.batch_alter_table('stock_history') as batch_op:
        for col in ('change', 'previous_stock', 'new_stock'):
            batch_op.alter_column(
                col, type_=sa.Numeric(12, 3), existing_type=sa.Integer(), existing_nullable=False,
            )


def downgrade() -> None:
    with op.batch_alter_table('stock_history') as batch_op:
        for col in ('new_stock', 'previous_stock', 'change'):
            batch_op.alter_column(col, type_=sa.Integer(), existing_type=sa.Numeric(12, 3))

    with op.batch_alter_table('order_items') as batch_op:
        batch_op.alter_column('quantity', type_=sa.Integer(), existing_type=sa.Numeric(12, 3))
        batch_op.drop_column('product_unit')

    with op.batch_alter_table('products') as batch_op:
        batch_op.alter_column('stock', type_=sa.Integer(), existing_type=sa.Numeric(12, 3))
        batch_op.drop_column('unit')

    sa.Enum(name='productunit').drop(op.get_bind(), checkfirst=True)