"""rename sexenum to genenum

Revision ID: 0585c3030aba
Revises: c543abe9c535
Create Date: 2026-05-29 08:33:09.773299

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '0585c3030aba'
down_revision: Union[str, None] = 'c543abe9c535'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("ALTER TABLE user_details ALTER COLUMN sex TYPE genenum USING sex::text::genenum")
    op.execute("DROP TYPE sexenum")


def downgrade() -> None:
    op.execute("CREATE TYPE sexenum AS ENUM('F', 'M')")
    op.execute("ALTER TABLE user_details ALTER COLUMN sex TYPE sexenum USING sex::text::sexenum")
    op.execute("DROP TYPE genenum")
