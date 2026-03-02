"""Database engine, session, and dependency."""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from apps.api.config import DATABASE_URL
from db.base import Base

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    echo=False,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    """Dependency that yields a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
