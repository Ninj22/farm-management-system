"""add INTERNAL_USE value to stocktransactiontype enum

Revision ID: 3bbd161a6587
Revises: 3ba45e229f21
Create Date: 2026-09-02

"""
from alembic import op


# revision identifiers, used by Alembic.
revision = '3bbd161a6587'
down_revision = '3ba45e229f21'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Postgres requires ALTER TYPE ... ADD VALUE run outside a transaction block
    # in older versions; autocommit_block() handles that safely here.
    with op.get_context().autocommit_block():
        op.execute("ALTER TYPE stocktransactiontype ADD VALUE IF NOT EXISTS 'INTERNAL_USE'")


def downgrade() -> None:
    # Postgres does not support removing enum values directly.
    # A downgrade would require recreating the type, which is destructive —
    # intentionally left as a no-op.
    pass
