from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.db.session import get_db
from app.models import User
from app.schemas.listing import ListingCard
from app.services import wishlist_service

router = APIRouter(prefix="/wishlist", tags=["wishlist"])


@router.get("", response_model=list[ListingCard])
def my_wishlist(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """The listings I saved, most recent first."""
    return wishlist_service.saved_listings(db, current_user)


@router.get("/ids", response_model=list[int])
def my_wishlist_ids(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Just the ids, so every heart icon on the page knows whether it's filled."""
    return wishlist_service.saved_listing_ids(db, current_user)


# PUT and DELETE are idempotent: repeating them has no extra effect
@router.put("/{listing_id}", status_code=status.HTTP_204_NO_CONTENT)
def save_listing(
    listing_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    wishlist_service.save(db, current_user, listing_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.delete("/{listing_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_listing(
    listing_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    wishlist_service.remove(db, current_user, listing_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
