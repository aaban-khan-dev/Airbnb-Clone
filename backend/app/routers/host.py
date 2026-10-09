from typing import Annotated

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.db.session import get_db
from app.models import Listing, User
from app.schemas.booking import BookingOut
from app.schemas.host import HostBookingFilter, HostListingForm, HostListingSummary, ListingWrite
from app.services import host_service

# Every endpoint here acts on the logged-in user's own listings
router = APIRouter(prefix="/host", tags=["host"])


def get_owned_listing(
    listing_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Listing:
    return host_service.get_owned_listing(db, listing_id, current_user)


@router.get("/listings", response_model=list[HostListingSummary])
def my_listings(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """The host dashboard: my listings with ratings, upcoming bookings and earnings."""
    return host_service.list_host_listings(db, current_user)


@router.post("/listings", response_model=HostListingForm, status_code=status.HTTP_201_CREATED)
def create_listing(
    data: ListingWrite,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a listing. Any user becomes a host by creating one."""
    return host_service.to_form(host_service.create_listing(db, current_user, data))


@router.get("/listings/{listing_id}", response_model=HostListingForm)
def get_listing_form(listing: Listing = Depends(get_owned_listing)):
    """Current values of one of my listings, to pre-fill the edit form."""
    return host_service.to_form(listing)


@router.put("/listings/{listing_id}", response_model=HostListingForm)
def update_listing(
    data: ListingWrite,
    listing: Listing = Depends(get_owned_listing),
    db: Session = Depends(get_db),
):
    return host_service.to_form(host_service.update_listing(db, listing, data))


@router.delete("/listings/{listing_id}")
def delete_listing(listing: Listing = Depends(get_owned_listing), db: Session = Depends(get_db)):
    """Soft-delete a listing. Its upcoming bookings are cancelled; past trips are kept."""
    cancelled = host_service.delete_listing(db, listing)
    return {"deleted": True, "cancelled_bookings": cancelled}


@router.get("/bookings", response_model=list[BookingOut])
def my_reservations(
    filters: Annotated[HostBookingFilter, Query()],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Reservations for my listings, optionally for one listing or one time period."""
    return host_service.list_host_bookings(db, current_user, filters)
