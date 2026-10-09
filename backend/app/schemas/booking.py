from datetime import date, datetime

from pydantic import BaseModel, Field, model_validator

MAX_NIGHTS = 30


class BookingCreate(BaseModel):
    """Body of POST /api/bookings. The guest is the logged-in user (X-User-Id header)."""

    listing_id: int
    check_in: date
    check_out: date
    num_guests: int = Field(ge=1)

    @model_validator(mode="after")
    def check_dates(self):
        if self.check_in < date.today():
            raise ValueError("check_in cannot be in the past")
        if self.check_out <= self.check_in:
            raise ValueError("check_out must be after check_in")
        if (self.check_out - self.check_in).days > MAX_NIGHTS:
            raise ValueError(f"stays can be at most {MAX_NIGHTS} nights")
        return self


class BookingListing(BaseModel):
    """The few listing details a trip card needs."""

    id: int
    title: str
    city: str
    state: str
    image_url: str | None
    host_name: str


class BookingGuest(BaseModel):
    id: int
    name: str
    avatar_url: str | None


class BookingOut(BaseModel):
    id: int
    listing: BookingListing
    guest: BookingGuest
    check_in: date
    check_out: date
    nights: int
    num_guests: int
    nightly_price: int
    cleaning_fee: int
    service_fee: int
    total_price: int
    status: str
    created_at: datetime
