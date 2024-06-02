"""update employees table

Revision ID: ff92d75927e0
Revises: 383e0ff9e564
Create Date: 2024-06-02 22:08:56.888759

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "ff92d75927e0"
down_revision: Union[str, None] = "383e0ff9e564"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:

    op.alter_column(
        "employees",
        "age",
        existing_type=sa.VARCHAR(length=10),
        type_=sa.Integer(),
        existing_nullable=False,
    )


def downgrade() -> None:

    op.alter_column(
        "employees",
        "age",
        existing_type=sa.Integer(),
        type_=sa.VARCHAR(length=10),
        existing_nullable=False,
    )
