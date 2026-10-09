from sqlalchemy import select

from app import models  # noqa: F401  (registers every table on Base.metadata)
from app.db.seed import seed_database
from app.db.session import Base, SessionLocal, engine


def init_db() -> None:
    """Create any missing tables, then seed sample data if the database is empty."""
    Base.metadata.create_all(bind=engine)

    with SessionLocal() as db:
        already_seeded = db.scalar(select(models.User.id).limit(1)) is not None
        if not already_seeded:
            seed_database(db)