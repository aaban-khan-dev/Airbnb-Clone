from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field, model_validator


class ListingSearchParams(BaseModel):
    """Query parameters for GET /api/listings. FastAPI reads them from the URL,
    e.g. /api/listings?location=goa&guests=2&amenity_ids=1&amenity_ids=8"""

    location: str | None = None
    check_in: date | None = None
    check_out: date | None = None
    guests: int | None = Field(default=None, ge=1)
    category: str | None = None
    property_types: list[str] = []
    amenity_ids: list[int] = []
    min_price: int | None = Field(default=None, ge=0)
    max_price: int | None = Field(default=None, ge=0)
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=12, ge=1, le=50)

    @model_validator(mode="after")
    def check_ranges(self):
        if (self.check_in is None) != (self.check_out is None):
            raise ValueError("check_in and check_out must be given together")
        if self.check_in and self.check_out and self.check_out <= self.check_in:
            raise ValueError("check_out must be after check_in")
        if self.min_price is not None and self.max_price is not None:
            if self.min_price > self.max_price:
                raise ValueError("min_price cannot be greater than max_price")
        return self


class ListingCard(BaseModel):
    """The short version of a listing shown in the search results grid."""

    id: int
    title: str
    city: str
    state: str
    country: str
    property_type: str
    category: str
    price_per_night: int
    max_guests: int
    bedrooms: int
    beds: int
    latitude: float
    longitude: float
    image_urls: list[str]
    rating: float | None  # None when the listing has no reviews yet ("New")
    review_count: int
    host_is_superhost: bool


class ListingPage(BaseModel):
    items: list[ListingCard]
    total: int
    page: int
    page_size: int
    has_more: bool


class AmenityOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    icon: str


class FilterOptions(BaseModel):
    """Everything the filter UI needs to draw its options."""

    categories: list[str]
    property_types: list[str]
    amenities: list[AmenityOut]
    min_price: int
    max_price: int


class HostOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    avatar_url: str | None
    bio: str | None
    is_superhost: bool
    created_at: datetime


class ReviewOut(BaseModel):
    id: int
    author_name: str
    author_avatar_url: str | None
    rating: int
    comment: str
    created_at: datetime


class DateRangeOut(BaseModel):
    check_in: date
    check_out: date


class BedroomOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    beds: str
    image_url: str | None


class ListingDetail(ListingCard):
    """Everything the listing page shows. Extends the card with the full details."""

    description: str
    space: str | None
    guest_access: str | None
    other_notes: str | None
    bedroom_details: list[BedroomOut]
    bathrooms: int
    cleaning_fee: int
    host: HostOut
    amenities: list[AmenityOut]
    reviews: list[ReviewOut]
    # Upcoming confirmed stays, so the calendar can cross out booked nights
    unavailable_ranges: list[DateRangeOut]


class QuoteParams(BaseModel):
    check_in: date
    check_out: date
    guests: int = Field(default=1, ge=1)

    @model_validator(mode="after")
    def check_dates(self):
        if self.check_in < date.today():
            raise ValueError("check_in cannot be in the past")
        if self.check_out <= self.check_in:
            raise ValueError("check_out must be after check_in")
        return self


class PriceQuote(BaseModel):
    """Price breakdown for a stay, plus whether those dates are still free."""

    check_in: date
    check_out: date
    nights: int
    nightly_price: int
    subtotal: int
    cleaning_fee: int
    service_fee: int
    total_price: int
    available: bool
