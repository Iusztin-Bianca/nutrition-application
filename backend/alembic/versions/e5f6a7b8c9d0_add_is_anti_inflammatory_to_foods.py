"""add is_anti_inflammatory to foods

Revision ID: e5f6a7b8c9d0
Revises: d4e5f6a7b8c9
Create Date: 2026-09-01 10:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = 'e5f6a7b8c9d0'
down_revision: Union[str, None] = 'd4e5f6a7b8c9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('foods', sa.Column('is_anti_inflammatory', sa.Boolean(), nullable=False, server_default='false'))


def downgrade() -> None:
    op.drop_column('foods', 'is_anti_inflammatory')
