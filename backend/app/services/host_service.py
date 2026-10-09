from datetime import date

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import Amenity, Booking, Listing, ListingImage, Review, User
from app.schemas.booking import BookingOut
from app.schemas.host import HostBookingFilter, HostListingForm, HostListingSummary, ListingWrite
from app.services.booking_service import to_booking_out, with_booking_details


def get_owned_listing(db: Session, listing_id: int, host: User) -> Listing:
    """Load an active listing that belongs to this host, or answer 404."""
    listing = db.get(Listing, listing_id)
    if listing is None or not listing.is_active or listing.host_id != host.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Listing not found")
    return listing


def create_listing(db: Session, host: User, data: ListingWrite) -> Listing:
    listing = Listing(host_id=host.id)
    _apply(db, listing, data)
    db.add(listing)
    db.commit()
    return listing


def update_listing(db: Session, listing: Listing, data: ListingWrite) -> Listing:
    # Existing bookings keep their price snapshot, so a new price only affects new bookings
    _apply(db, listing, data)
    db.commit()
    return listing


def delete_listing(db: Session, listing: Listing) -> int:
    """Soft delete: hide the listing and cancel its upcoming stays. Past trips stay intact.
    Returns how many upcoming bookings were cancelled."""
    upcoming = db.scalars(
        select(Booking).where(
            Booking.listing_id == listing.id,
            Booking.status == "confirmed",
            Booking.check_in > date.today(),
        )
    ).all()
    for booking in upcoming:
        booking.status = "cancelled"
    listing.is_active = False
    db.commit()  # one transaction: either everything happens or nothing does
    return len(upcoming)


def to_form(listing: Listing) -> HostListingForm:
    return HostListingForm(
        id=listing.id,
        title=listing.title,
        description=listing.description,
        property_type=listing.property_type,
        category=listing.category,
        city=listing.city,
        state=listing.state,
        country=listing.country,
        latitude=listing.latitude,
        longitude=listing.longitude,
        price_per_night=listing.price_per_night,
        cleaning_fee=listing.cleaning_fee,
        max_guests=listing.max_guests,
        bedrooms=listing.bedrooms,
        beds=listing.beds,
        bathrooms=listing.bathrooms,
        image_urls=[image.url for image in listing.images],
        amenity_ids=[amenity.id for amenity in listing.amenities],
    )


def list_host_listings(db: Session, host: User) -> list[HostListingSummary]:
    today = date.today()
    listings = db.scalars(
        select(Listing)
        .where(Listing.host_id == host.id, Listing.is_active.is_(True))
        .order_by(Listing.created_at.desc(), Listing.id.desc())
    ).all()
    ids = [listing.id for listing in listings]

    # One grouped query per statistic, instead of one query per listing
    ratings = {
        row.listing_id: (row.avg_rating, row.review_count)
        for row in db.execute(
            select(
                Review.listing_id,
                func.avg(Review.rating).label("avg_rating"),
                func.count().label("review_count"),
            )
            .where(Review.listing_id.in_(ids))
            .group_by(Review.listing_id)
        )
    }
    confirmed = Booking.status == "confirmed"
    upcoming = dict(
        db.execute(
            select(Booking.listing_id, func.count())
            .where(Booking.listing_id.in_(ids), confirmed, Booking.check_out > today)
            .group_by(Booking.listing_id)
        ).tuples().all()
    )
    earnings = dict(
        db.execute(
            select(
                Booking.listing_id,
                func.sum(Booking.total_price - Booking.service_fee),  # the service fee goes to the platform
            )
            .where(Booking.listing_id.in_(ids), confirmed)
            .group_by(Booking.listing_id)
        ).tuples().all()
    )

    summaries = []
    for listing in listings:
        avg, count = ratings.get(listing.id, (None, 0))
        summaries.append(
            HostListingSummary(
                id=listing.id,
                title=listing.title,
                city=listing.city,
                state=listing.state,
                property_type=listing.property_type,
                price_per_night=listing.price_per_night,
                cover_image_url=listing.images[0].url if listing.images else None,
                rating=round(avg, 2) if avg is not None else None,
                review_count=count,
                upcoming_bookings=upcoming.get(listing.id, 0),
                total_earnings=int(earnings.get(listing.id) or 0),
            )
        )
    return summaries


def list_host_bookings(db: Session, host: User, filters: HostBookingFilter) -> list[BookingOut]:
    """Reservations across all of the host's listings (including deleted ones, for history)."""
    today = date.today()
    query = with_booking_details(select(Booking)).join(Booking.listing).where(Listing.host_id == host.id)

    if filters.listing_id is not None:
        query = query.where(Booking.listing_id == filters.listing_id)
    if filters.when == "upcoming":
        query = query.where(Booking.status == "confirmed", Booking.check_out > today).order_by(Booking.check_in)
    elif filters.when == "past":
        query = query.where(Booking.status == "confirmed", Booking.check_out <= today).order_by(
            Booking.check_in.desc()
        )
    elif filters.when == "cancelled":
        query = query.where(Booking.status == "cancelled").order_by(Booking.check_in.desc())
    else:
        query = query.order_by(Booking.check_in.desc())

    return [to_booking_out(b) for b in db.scalars(query).unique().all()]


def _apply(db: Session, listing: Listing, data: ListingWrite) -> None:
    """Copy the form values onto the listing, replacing its photos and amenities."""
    amenities = db.scalars(select(Amenity).where(Amenity.id.in_(data.amenity_ids))).all()
    if len(amenities) != len(set(data.amenity_ids)):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Unknown amenity selected")

    fields = data.model_dump(exclude={"image_urls", "amenity_ids"})
    for name, value in fields.items():
        setattr(listing, name, value)
    listing.amenities = list(amenities)
    # delete-orphan cascade removes the old photo rows automatically
    listing.images = [ListingImage(url=url, position=i) for i, url in enumerate(data.image_urls)]
