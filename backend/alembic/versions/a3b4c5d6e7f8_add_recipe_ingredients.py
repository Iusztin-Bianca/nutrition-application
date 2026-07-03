"""add recipe_ingredients table

Revision ID: a3b4c5d6e7f8
Revises: f2b3c4d5e6a7
Create Date: 2026-06-25 10:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = 'a3b4c5d6e7f8'
down_revision: Union[str, None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("""
        CREATE TABLE recipe_ingredients (
            id             SERIAL PRIMARY KEY,
            recipe_id      INTEGER NOT NULL REFERENCES foods(id) ON DELETE CASCADE,
            food_id        INTEGER NOT NULL REFERENCES foods(id),
            quantity_grams FLOAT   NOT NULL
        )
    """)
    op.execute("CREATE INDEX ix_recipe_ingredients_recipe_id ON recipe_ingredients (recipe_id)")


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ix_recipe_ingredients_recipe_id")
    op.execute("DROP TABLE IF EXISTS recipe_ingredients")
