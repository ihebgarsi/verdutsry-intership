"""add companies table and users.company_id

Revision ID: a1b2c3d4e5f6
Revises: db26568daa9f
Create Date: 2026-07-23 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "a1b2c3d4e5f6"
down_revision: Union[str, Sequence[str], None] = "db26568daa9f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "companies",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("sector", sa.String(length=255), nullable=False),
        sa.Column("country", sa.String(length=255), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=True,
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_companies_id"), "companies", ["id"], unique=False)

    # Default company for existing users
    op.execute(
        """
        INSERT INTO companies (id, name, sector, country)
        VALUES (1, 'Verdustry Demo', 'Technology', 'Tunisia')
        """
    )

    bind = op.get_bind()
    if bind.dialect.name == "sqlite":
        with op.batch_alter_table("users") as batch_op:
            batch_op.add_column(sa.Column("company_id", sa.Integer(), nullable=True))
            batch_op.create_foreign_key(
                "fk_users_company_id",
                "companies",
                ["company_id"],
                ["id"],
            )
    else:
        op.add_column("users", sa.Column("company_id", sa.Integer(), nullable=True))
        op.create_foreign_key(
            "fk_users_company_id",
            "users",
            "companies",
            ["company_id"],
            ["id"],
        )

    op.execute("UPDATE users SET company_id = 1 WHERE company_id IS NULL")


def downgrade() -> None:
    bind = op.get_bind()
    if bind.dialect.name == "sqlite":
        with op.batch_alter_table("users") as batch_op:
            batch_op.drop_constraint("fk_users_company_id", type_="foreignkey")
            batch_op.drop_column("company_id")
    else:
        op.drop_constraint("fk_users_company_id", "users", type_="foreignkey")
        op.drop_column("users", "company_id")

    op.drop_index(op.f("ix_companies_id"), table_name="companies")
    op.drop_table("companies")
