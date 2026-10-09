from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.listing import FilterOptions, ListingPage, ListingSearchParams
from app.services import listing_service

router = APIRouter(prefix="/listings", tags=["listings"])


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
