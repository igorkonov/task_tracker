"""update employees table

Revision ID: 98c8d21badc1
Revises: 383e0ff9e564
Create Date: 2024-06-02 18:49:12.864293

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "98c8d21badc1"
down_revision: Union[str, None] = "383e0ff9e564"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:

    op.alter_column(
        "employees",
        "age",
        existing_type=sa.INTEGER(),
        type_=sa.String(length=10),
        existing_nullable=False,
    )


def downgrade() -> None:

    op.alter_column(
        "employees",
        "age",
        existing_type=sa.String(length=10),
        type_=sa.INTEGER(),
        existing_nullable=False,
    )
