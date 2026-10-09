"""Mocked authentication.

There are no passwords or tokens. The frontend sends the id of the user it is
"logged in as" in an X-User-Id header, and endpoints that need a user depend on
get_current_user. Swapping this for real auth (e.g. JWT) later would only mean
changing this file, not the endpoints that use it.
"""

from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models import User


def get_current_user(
    x_user_id: int | None = Header(default=None),
    db: Session = Depends(get_db),
) -> User:
    if x_user_id is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Not logged in")

    user = db.get(User, x_user_id)
    if user is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Unknown user")
    return user
