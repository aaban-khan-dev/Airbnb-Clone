from sqlalchemy import exists, select
from sqlalchemy.orm import Session

from app.models import Listing, User
from app.schemas.user import UserOut


def _is_host():
    """SQL expression: does this user own at least one active listing?"""
    return exists().where(Listing.host_id == User.id, Listing.is_active.is_(True))


def list_users(db: Session) -> list[UserOut]:
    rows = db.execute(select(User, _is_host()).order_by(User.id)).all()
    return [_to_schema(user, is_host) for user, is_host in rows]


def get_user(db: Session, user_id: int) -> UserOut | None:
    row = db.execute(select(User, _is_host()).where(User.id == user_id)).first()
    return _to_schema(*row) if row else None


def _to_schema(user: User, is_host: bool) -> UserOut:
    return UserOut.model_validate(user).model_copy(update={"is_host": is_host})
