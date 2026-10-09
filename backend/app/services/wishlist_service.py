from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import User, WishlistItem
from app.schemas.listing import ListingCard
from app.services.listing_service import get_active_listing, get_cards


def saved_listing_ids(db: Session, user: User) -> list[int]:
    """Ids of the listings this user saved, most recently saved first."""
    return list(
        db.scalars(
            select(WishlistItem.listing_id)
            .where(WishlistItem.user_id == user.id)
            .order_by(WishlistItem.created_at.desc(), WishlistItem.listing_id.desc())
        )
    )


def saved_listings(db: Session, user: User) -> list[ListingCard]:
    return get_cards(db, saved_listing_ids(db, user))


def save(db: Session, user: User, listing_id: int) -> None:
    """Idempotent: saving an already-saved listing is not an error."""
    if get_active_listing(db, listing_id) is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Listing not found")
    if db.get(WishlistItem, (user.id, listing_id)) is None:
        db.add(WishlistItem(user_id=user.id, listing_id=listing_id))
        db.commit()


def remove(db: Session, user: User, listing_id: int) -> None:
    item = db.get(WishlistItem, (user.id, listing_id))
    if item is not None:
        db.delete(item)
        db.commit()
