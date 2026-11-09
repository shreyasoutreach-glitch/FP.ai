"""Baseline schema with durable document payloads."""
from alembic import op
from sqlalchemy import inspect, Column, LargeBinary
from app.core.database import Base
from app.models import document, analysis  # noqa: F401

revision = "0001_durable_documents"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    bind = op.get_bind()
    Base.metadata.create_all(bind=bind, checkfirst=True)
    columns = {column["name"] for column in inspect(bind).get_columns("documents")}
    if "file_data" not in columns:
        op.add_column("documents", Column("file_data", LargeBinary(), nullable=True))


def downgrade():
    # Preserve uploaded contract bytes on rollback. Use a forward fix instead.
    pass
