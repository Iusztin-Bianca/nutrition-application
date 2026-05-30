"""add foods and food_micronutrients tables

Revision ID: d7e4f1a2b3c8
Revises: 0585c3030aba
Create Date: 2026-05-30 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = 'd7e4f1a2b3c8'
down_revision: Union[str, None] = '0585c3030aba'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Drop old/existing tables (order matters: child before parent)
    op.execute("DROP TABLE IF EXISTS food_micronutrients CASCADE")
    op.execute("DROP TABLE IF EXISTS food_nutrients CASCADE")
    op.execute("DROP TABLE IF EXISTS nutrients CASCADE")
    op.execute("DROP TABLE IF EXISTS foods CASCADE")
    op.execute("DROP TYPE IF EXISTS nutrientcategory CASCADE")
    op.execute("DROP TYPE IF EXISTS micronutrient_type CASCADE")

    # Create micronutrient_type ENUM
    micronutrient_type = postgresql.ENUM(
        'calcium', 'magnesium', 'potassium', 'iron', 'zinc', 'selenium', 'iodine', 'vitamin_d',
        'vitamin_a', 'vitamin_c', 'vitamin_e', 'vitamin_k',
        'vitamin_b1', 'vitamin_b2', 'vitamin_b3', 'vitamin_b6', 'vitamin_b7',
        'vitamin_b9', 'vitamin_b12',
        'cholesterol', 'caffeine', 'alcohol', 'omega_3', 'omega_6', 'copper', 'manganese',
        name='micronutrient_type',
    )
    micronutrient_type.create(op.get_bind())

    op.create_table(
        'foods',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('image_url', sa.String(500), nullable=True),
        sa.Column('kcal', sa.Float(), nullable=False),
        sa.Column('protein', sa.Float(), nullable=False),
        sa.Column('carbohydrates', sa.Float(), nullable=False),
        sa.Column('sugars', sa.Float(), nullable=True),
        sa.Column('fat', sa.Float(), nullable=False),
        sa.Column('saturated_fat', sa.Float(), nullable=True),
        sa.Column('polyunsat_fat', sa.Float(), nullable=True),
        sa.Column('monounsat_fat', sa.Float(), nullable=True),
        sa.Column('trans_fat', sa.Float(), nullable=True),
        sa.Column('fiber', sa.Float(), nullable=True),
        sa.Column('water', sa.Float(), nullable=True),
        sa.Column('salt', sa.Float(), nullable=True),
        sa.Column('sodium', sa.Float(), nullable=True),
        sa.Column('glycemic_index', sa.Integer(), nullable=True),
        sa.Column('is_vegan', sa.Boolean(), server_default='false', nullable=False),
        sa.Column('is_vegetarian', sa.Boolean(), server_default='false', nullable=False),
        sa.Column('is_raw_vegan', sa.Boolean(), server_default='false', nullable=False),
        sa.Column('is_mediterranean', sa.Boolean(), server_default='false', nullable=False),
        sa.Column('is_gluten_free', sa.Boolean(), server_default='false', nullable=False),
        sa.Column('is_lactose_free', sa.Boolean(), server_default='false', nullable=False),
        sa.Column('is_fodmap', sa.Boolean(), server_default='false', nullable=False),
        sa.Column('is_recipe', sa.Boolean(), server_default='false', nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name', name='uq_foods_name'),
    )
    op.create_index('ix_foods_name', 'foods', ['name'])

    op.create_table(
        'food_micronutrients',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('food_id', sa.Integer(), nullable=False),
        sa.Column('nutrient', postgresql.ENUM(name='micronutrient_type', create_type=False), nullable=False),
        sa.Column('amount', sa.Numeric(8, 3), nullable=False),
        sa.ForeignKeyConstraint(['food_id'], ['foods.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('food_id', 'nutrient', name='uq_food_nutrient'),
    )
    op.create_index('ix_food_micronutrients_food_id', 'food_micronutrients', ['food_id'])


def downgrade() -> None:
    op.drop_index('ix_food_micronutrients_food_id', table_name='food_micronutrients')
    op.drop_table('food_micronutrients')
    op.drop_index('ix_foods_name', table_name='foods')
    op.drop_table('foods')
    op.execute("DROP TYPE IF EXISTS micronutrient_type")
