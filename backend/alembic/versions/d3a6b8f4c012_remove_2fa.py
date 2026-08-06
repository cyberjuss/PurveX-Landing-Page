"""remove two-factor authentication columns

Revision ID: d3a6b8f4c012
Revises: 9f2f6a7d1c21
Create Date: 2026-08-05

2FA was never wired to a self-service enrollment UI in this backend either
-- removed for the same reason as the PurveX product repo (see its
migration 0018): half-built security surface area nobody could actually
turn on.
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "d3a6b8f4c012"
down_revision = "9f2f6a7d1c21"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    user_columns = {col["name"] for col in sa.inspect(bind).get_columns("users")}
    with op.batch_alter_table("users") as batch:
        if "two_factor_backup_codes" in user_columns:
            batch.drop_column("two_factor_backup_codes")
        if "two_factor_secret" in user_columns:
            batch.drop_column("two_factor_secret")
        if "two_factor_enabled" in user_columns:
            batch.drop_column("two_factor_enabled")


def downgrade() -> None:
    bind = op.get_bind()
    user_columns = {col["name"] for col in sa.inspect(bind).get_columns("users")}
    with op.batch_alter_table("users") as batch:
        if "two_factor_enabled" not in user_columns:
            batch.add_column(sa.Column("two_factor_enabled", sa.Boolean(), nullable=False, server_default=sa.false()))
        if "two_factor_secret" not in user_columns:
            batch.add_column(sa.Column("two_factor_secret", sa.String(), nullable=True))
        if "two_factor_backup_codes" not in user_columns:
            batch.add_column(sa.Column("two_factor_backup_codes", sa.Text(), nullable=True))
