"""add gdpr_accepted_at to users

Revision ID: b7e3f9a1c2d4
Revises: f2b3c4d5e6a7
Create Date: 2026-06-12 00:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = 'b7e3f9a1c2d4'
down_revision: Union[str, None] = 'f2b3c4d5e6a7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('users', sa.Column('gdpr_accepted_at', sa.DateTime(), nullable=True))


def downgrade() -> None:
    op.drop_column('users', 'gdpr_accepted_at')
