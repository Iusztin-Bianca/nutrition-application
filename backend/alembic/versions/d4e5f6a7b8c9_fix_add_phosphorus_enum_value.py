"""fix: actually add phosphorus to micronutrient_type enum

Revision ID: d4e5f6a7b8c9
Revises: c3d4e5f6a7b8
Create Date: 2026-08-27 11:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = 'd4e5f6a7b8c9'
down_revision: Union[str, None] = 'c3d4e5f6a7b8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # execution_options returns a NEW connection — must assign it
    conn = op.get_bind().execution_options(isolation_level="AUTOCOMMIT")
    conn.execute(sa.text("ALTER TYPE micronutrient_type ADD VALUE IF NOT EXISTS 'phosphorus'"))


def downgrade() -> None:
    pass
