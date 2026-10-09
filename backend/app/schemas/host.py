from typing import Annotated, Literal

from pydantic import BaseModel, Field, StringConstraints, field_validator, model_validator

from app.core.constants import CATEGORIES, PROPERTY_TYPES

ImageUrl = Annotated[str, StringConstraints(strip_whitespace=True, max_length=1000, pattern=r"^https?://\S+$")]
ShortText = Annotated[str, StringConstraints(strip_whitespace=True, min_length=2, max_length=100)]
OptionalLongText = Annotated[str, StringConstraints(strip_whitespace=True, max_length=5000)] | None


class BedroomWrite(BaseModel):
    """One bedroom in "Where you'll sleep"."""

    beds: Annotated[str, StringConstraints(strip_whitespace=True, min_length=3, max_length=100)]
    image_url: ImageUrl | None = None

    @field_validator("image_url", mode="before")
    @classmethod
    def blank_url_is_none(cls, value: str | None) -> str | None:
        return value.strip() or None if isinstance(value, str) else value


class ListingWrite(BaseModel):
    """Body for creating or updating a listing (POST / PUT /api/host/listings)."""

    title: Annotated[str, StringConstraints(strip_whitespace=True, min_length=5, max_length=150)]
    description: Annotated[str, StringConstraints(strip_whitespace=True, min_length=20, max_length=5000)]
    # Optional "Show more" sections; empty text is stored as NULL
    space: OptionalLongText = None
    guest_access: OptionalLongText = None
    other_notes: OptionalLongText = None
    property_type: str
    category: str

    city: ShortText
    state: ShortText
    country: ShortText = "India"
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)

    price_per_night: int = Field(gt=0, le=1_000_000)
    cleaning_fee: int = Field(default=0, ge=0, le=100_000)

    max_guests: int = Field(ge=1, le=16)
    bedrooms: int = Field(ge=0, le=50)
    beds: int = Field(ge=1, le=50)
    bathrooms: int = Field(ge=1, le=50)

    image_urls: list[ImageUrl] = Field(min_length=1, max_length=20)  # first = cover photo
    amenity_ids: list[int] = []
    bedroom_details: list[BedroomWrite] = Field(default=[], max_length=50)

    @field_validator("space", "guest_access", "other_notes", mode="after")
    @classmethod
    def blank_is_none(cls, value: str | None) -> str | None:
        return value or None

    @model_validator(mode="after")
    def bedrooms_fit(self):
        if len(self.bedroom_details) > self.bedrooms:
            raise ValueError("bedroom_details can't list more rooms than the number of bedrooms")
        return self

    @field_validator("property_type")
    @classmethod
    def known_property_type(cls, value: str) -> str:
        if value not in PROPERTY_TYPES:
            raise ValueError(f"must be one of: {', '.join(PROPERTY_TYPES)}")
        return value

    @field_validator("category")
    @classmethod
    def known_category(cls, value: str) -> str:
        if value not in CATEGORIES:
            raise ValueError(f"must be one of: {', '.join(CATEGORIES)}")
        return value


class HostListingForm(ListingWrite):
    """A listing's current values, used to pre-fill the edit form."""

    id: int


class HostListingSummary(BaseModel):
    """One row on the host dashboard."""

    id: int
    title: str
    city: str
    state: str
    property_type: str
    price_per_night: int
    cover_image_url: str | None
    rating: float | None
    review_count: int
    upcoming_bookings: int
    total_earnings: int  # what the host receives from confirmed stays (nights + cleaning)


class HostBookingFilter(BaseModel):
    listing_id: int | None = None
    when: Literal["upcoming", "past", "cancelled", "all"] = "all"
