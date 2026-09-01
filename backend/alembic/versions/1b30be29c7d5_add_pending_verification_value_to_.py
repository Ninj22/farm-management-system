"""add PENDING_VERIFICATION value to livestockstatus enum

Revision ID: 1b30be29c7d5
Revises: 3bbd161a6587
Create Date: 2026-09-02

"""
from alembic import op


# revision identifiers, used by Alembic.
revision = '1b30be29c7d5'
down_revision = '3bbd161a6587'
branch_labels = None
depends_on = None


def upgrade() -> None:
    with op.get_context().autocommit_block():
        op.execute("ALTER TYPE livestockstatus ADD VALUE IF NOT EXISTS 'PENDING_VERIFICATION'")


def downgrade() -> None:
    # Postgres does not support removing enum values directly — no-op.
    pass
