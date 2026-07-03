"""ensure recipe_ingredients table exists

Revision ID: b2c3d4e5f6a7
Revises: a3b4c5d6e7f8
Create Date: 2026-07-03 08:00:00.000000

"""
from typing import Sequence, Union
from alembic import op


revision: str = 'b2c3d4e5f6a7'
down_revision: Union[str, None] = 'a3b4c5d6e7f8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("""
        CREATE TABLE IF NOT EXISTS recipe_ingredients (
            id             SERIAL PRIMARY KEY,
            recipe_id      INTEGER NOT NULL REFERENCES foods(id) ON DELETE CASCADE,
            food_id        INTEGER NOT NULL REFERENCES foods(id),
            quantity_grams FLOAT   NOT NULL
        )
    """)
    op.execute("CREATE INDEX IF NOT EXISTS ix_recipe_ingredients_recipe_id ON recipe_ingredients (recipe_id)")


def downgrade() -> None:
    pass
