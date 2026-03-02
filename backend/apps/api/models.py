"""SQLAlchemy ORM models."""

from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from pgvector.sqlalchemy import Vector

from db.base import Base


class Policy(Base):
    """Policy entity."""

    __tablename__ = "policies"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    clauses: Mapped[list["Clause"]] = relationship(
        "Clause", back_populates="policy", cascade="all, delete-orphan"
    )


class Clause(Base):
    """Clause entity; belongs to a policy."""

    __tablename__ = "clauses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    policy_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("policies.id", ondelete="CASCADE"), nullable=False
    )
    clause_number: Mapped[str] = mapped_column(String(64), nullable=False)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    embedding: Mapped[list[float] | None] = mapped_column(Vector(1024), nullable=True)

    policy: Mapped["Policy"] = relationship("Policy", back_populates="clauses")
