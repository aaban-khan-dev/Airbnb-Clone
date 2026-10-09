from pydantic import BaseModel, ConfigDict


class UserOut(BaseModel):
    """What the API returns for a user. Email is included because the mock
    'log in as' menu shows it; a real app would hide it from other users."""

    model_config = ConfigDict(from_attributes=True)  # lets Pydantic read SQLAlchemy objects

    id: int
    name: str
    email: str
    avatar_url: str | None
    bio: str | None
    is_superhost: bool
    is_host: bool = False  # true if the user owns at least one active listing
