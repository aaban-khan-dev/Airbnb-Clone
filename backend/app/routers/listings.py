from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models import Listing
from app.schemas.listing import (
    FilterOptions,
    ListingDetail,
    ListingPage,
    ListingSearchParams,
    PriceQuote,
    QuoteParams,
)
from app.services import listing_service

router = APIRouter(prefix="/listings", tags=["listings"])


def get_listing_or_404(listing_id: int, db: Session = Depends(get_db)) -> Listing:
    """Shared dependency: load an active listing or answer 404."""
    listing = listing_service.get_active_listing(db, listing_id)
    if listing is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Listing not found")
    return listing


@router.get("", response_model=ListingPage)
def search_listings(
    params: Annotated[ListingSearchParams, Query()],
    db: Session = Depends(get_db),
):
    """Search, filter and paginate listings."""
    return listing_service.search_listings(db, params)


@router.get("/filters", response_model=FilterOptions)
def get_filter_options(db: Session = Depends(get_db)):
    """Options for the filter UI: categories, property types, amenities, price range."""
    return listing_service.get_filter_options(db)


@router.get("/{listing_id}", response_model=ListingDetail)
def get_listing(listing: Listing = Depends(get_listing_or_404), db: Session = Depends(get_db)):
    """Full details for the listing page."""
    return listing_service.get_listing_detail(db, listing)


@router.get("/{listing_id}/quote", response_model=PriceQuote)
def get_quote(
    params: Annotated[QuoteParams, Query()],
    listing: Listing = Depends(get_listing_or_404),
    db: Session = Depends(get_db),
):
    """Price breakdown for the chosen dates, and whether they're still available."""
    if params.guests > listing.max_guests:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, f"This place allows up to {listing.max_guests} guests"
        )
    return listing_service.quote_stay(db, listing, params)
