"""fix foods schema with raw sql

Revision ID: f2b3c4d5e6a7
Revises: e9c2d4f1a8b3
Create Date: 2026-05-30 20:00:00.000000

"""
from typing import Sequence, Union
from alembic import op


revision: str = 'f2b3c4d5e6a7'
down_revision: Union[str, None] = 'e9c2d4f1a8b3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("DROP TABLE IF EXISTS food_micronutrients CASCADE")
    op.execute("DROP TABLE IF EXISTS food_nutrients CASCADE")
    op.execute("DROP TABLE IF EXISTS foods CASCADE")
    op.execute("DROP TYPE IF EXISTS micronutrient_type CASCADE")

    op.execute("""
        CREATE TYPE micronutrient_type AS ENUM (
            'calcium', 'magnesium', 'potassium', 'iron', 'zinc', 'selenium', 'iodine', 'vitamin_d',
            'vitamin_a', 'vitamin_c', 'vitamin_e', 'vitamin_k',
            'vitamin_b1', 'vitamin_b2', 'vitamin_b3', 'vitamin_b6', 'vitamin_b7',
            'vitamin_b9', 'vitamin_b12',
            'cholesterol', 'caffeine', 'alcohol', 'omega_3', 'omega_6', 'copper', 'manganese'
        )
    """)

    op.execute("""
        CREATE TABLE foods (
            id              SERIAL PRIMARY KEY,
            name            VARCHAR(200) NOT NULL,
            description     TEXT,
            image_url       VARCHAR(500),
            kcal            FLOAT NOT NULL,
            protein         FLOAT NOT NULL,
            carbohydrates   FLOAT NOT NULL,
            sugars          FLOAT,
            fat             FLOAT NOT NULL,
            saturated_fat   FLOAT,
            polyunsat_fat   FLOAT,
            monounsat_fat   FLOAT,
            trans_fat       FLOAT,
            fiber           FLOAT,
            water           FLOAT,
            salt            FLOAT,
            sodium          FLOAT,
            glycemic_index  INTEGER,
            is_vegan        BOOLEAN NOT NULL DEFAULT FALSE,
            is_vegetarian   BOOLEAN NOT NULL DEFAULT FALSE,
            is_raw_vegan    BOOLEAN NOT NULL DEFAULT FALSE,
            is_mediterranean BOOLEAN NOT NULL DEFAULT FALSE,
            is_gluten_free  BOOLEAN NOT NULL DEFAULT FALSE,
            is_lactose_free BOOLEAN NOT NULL DEFAULT FALSE,
            is_fodmap       BOOLEAN NOT NULL DEFAULT FALSE,
            is_recipe       BOOLEAN NOT NULL DEFAULT FALSE,
            created_at      TIMESTAMP NOT NULL DEFAULT now(),
            updated_at      TIMESTAMP NOT NULL DEFAULT now(),
            CONSTRAINT uq_foods_name UNIQUE (name)
        )
    """)

    op.execute("CREATE INDEX ix_foods_name ON foods (name)")

    op.execute("""
        CREATE TABLE food_micronutrients (
            id       SERIAL PRIMARY KEY,
            food_id  INTEGER NOT NULL REFERENCES foods(id) ON DELETE CASCADE,
            nutrient micronutrient_type NOT NULL,
            amount   NUMERIC(8, 3) NOT NULL,
            CONSTRAINT uq_food_nutrient UNIQUE (food_id, nutrient)
        )
    """)

    op.execute("CREATE INDEX ix_food_micronutrients_food_id ON food_micronutrients (food_id)")


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS food_micronutrients CASCADE")
    op.execute("DROP TABLE IF EXISTS foods CASCADE")
    op.execute("DROP TYPE IF EXISTS micronutrient_type CASCADE")
