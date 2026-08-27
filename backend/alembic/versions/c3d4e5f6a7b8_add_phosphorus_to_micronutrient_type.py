"""add phosphorus to micronutrient_type enum

Revision ID: c3d4e5f6a7b8
Revises: b2c3d4e5f6a7
Create Date: 2026-08-27 10:00:00.000000

"""
from typing import Sequence, Union
from alembic import op

revision: str = 'c3d4e5f6a7b8'
down_revision: Union[str, None] = 'b2c3d4e5f6a7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# ALTER TYPE ... ADD VALUE cannot run inside a transaction on some PostgreSQL versions
def upgrade() -> None:
    connection = op.get_bind()
    connection.execution_options(isolation_level="AUTOCOMMIT")
    connection.execute(
        "ALTER TYPE micronutrient_type ADD VALUE IF NOT EXISTS 'phosphorus'"
    )


def downgrade() -> None:
    pass
