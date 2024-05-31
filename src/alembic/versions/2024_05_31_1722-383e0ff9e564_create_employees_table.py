"""create employees table

Revision ID: 383e0ff9e564
Revises: 
Create Date: 2024-05-31 17:22:08.689035

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "383e0ff9e564"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "employees",
        sa.Column("fullname", sa.String(length=50), nullable=False),
        sa.Column("age", sa.Integer(), nullable=False),
        sa.Column("email", sa.String(length=50), nullable=True),
        sa.Column("hashed_password", sa.String(length=1024), nullable=False),
        sa.Column("refresh_token", sa.String(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("id", sa.Integer(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
        sa.UniqueConstraint("fullname"),
        sa.UniqueConstraint("hashed_password"),
    )


def downgrade() -> None:
    op.drop_table("employees")
