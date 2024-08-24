"""empty message

Revision ID: ed85a0b4327a
Revises: 4e744c8b78b2
Create Date: 2024-08-14 19:27:54.521382

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "ed85a0b4327a"
down_revision: Union[str, None] = "4e744c8b78b2"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:

    op.add_column(
        "employees",
        sa.Column("position", sa.String(length=50), nullable=False),
    )
    op.drop_constraint("uq_employees_hashed_password", "employees", type_="unique")


def downgrade() -> None:

    op.create_unique_constraint(
        "uq_employees_hashed_password", "employees", ["hashed_password"]
    )
    op.drop_column("employees", "position")
