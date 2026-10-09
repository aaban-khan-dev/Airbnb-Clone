from datetime import date

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError, OperationalError
from sqlalchemy.orm import Session, joinedload, selectinload

from app.models import Booking, Listing, User
from app.schemas.booking import BookingCreate, BookingGuest, BookingListing, BookingOut
from app.services.availability import is_available
from app.services.pricing import calculate_price

DATES_TAKEN = "Those dates are no longer available. Please choose different dates."


def create_booking(db: Session, guest: User, data: BookingCreate) -> BookingOut:
    listing = db.get(Listing, data.listing_id)
    if listing is None or not listing.is_active:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Listing not found")
    if listing.host_id == guest.id:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "You can't book your own listing")
    if data.num_guests > listing.max_guests:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, f"This place allows up to {listing.max_guests} guests"
        )

    # 1st line of defence: a friendly check with a clear error message
    if not is_available(db, listing.id, data.check_in, data.check_out):
        raise HTTPException(status.HTTP_409_CONFLICT, DATES_TAKEN)

    # The price is calculated here on the server and stored as a snapshot
    price = calculate_price(listing.price_per_night, listing.cleaning_fee, data.check_in, data.check_out)
    booking = Booking(
        listing_id=listing.id,
        guest_id=guest.id,
        check_in=data.check_in,
        check_out=data.check_out,
        num_guests=data.num_guests,
        nightly_price=price["nightly_price"],
        cleaning_fee=price["cleaning_fee"],
        service_fee=price["service_fee"],
        total_price=price["total_price"],
        status="confirmed",
    )
    db.add(booking)
    try:
        db.commit()
    except IntegrityError:
        # 2nd line of defence: the database trigger rejected an overlapping booking
        # that slipped past the check above (two requests at the same moment)
        db.rollback()
        raise HTTPException(status.HTTP_409_CONFLICT, DATES_TAKEN)
    except OperationalError:
        # SQLite stayed locked by another write for too long; nothing was saved
        db.rollback()
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, "The server is busy, please try again")

    db.refresh(booking)
    return to_booking_out(booking)


def list_guest_bookings(db: Session, guest: User) -> list[BookingOut]:
    """All of a guest's bookings, newest stay first. The frontend splits them into tabs."""
    bookings = db.scalars(
        _with_details(select(Booking))
        .where(Booking.guest_id == guest.id)
        .order_by(Booking.check_in.desc())
    ).all()
    return [to_booking_out(b) for b in bookings]


def get_booking_for_user(db: Session, booking_id: int, user: User) -> Booking:
    """A booking can be seen by its guest or by the host of the listing."""
    booking = _load(db, booking_id)
    if booking is None or user.id not in (booking.guest_id, booking.listing.host_id):
        # 404 rather than 403, so we don't reveal that the booking exists
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Booking not found")
    return booking


def cancel_booking(db: Session, booking_id: int, guest: User) -> BookingOut:
    booking = get_booking_for_user(db, booking_id, guest)
    if booking.guest_id != guest.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Only the guest can cancel this booking")
    if booking.status == "cancelled":
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "This booking is already cancelled")
    if booking.check_in <= date.today():
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Trips that have started can't be cancelled")

    booking.status = "cancelled"  # the dates become available again
    db.commit()
    return to_booking_out(booking)


def _with_details(query):
    """Load each booking's listing (with photos and host) and guest in a few queries."""
    return query.options(
        joinedload(Booking.listing).selectinload(Listing.images),
        joinedload(Booking.listing).joinedload(Listing.host),
        joinedload(Booking.guest),
    )


def _load(db: Session, booking_id: int) -> Booking | None:
    return db.scalar(_with_details(select(Booking)).where(Booking.id == booking_id))


def to_booking_out(booking: Booking) -> BookingOut:
    listing = booking.listing
    return BookingOut(
        id=booking.id,
        listing=BookingListing(
            id=listing.id,
            title=listing.title,
            city=listing.city,
            state=listing.state,
            image_url=listing.images[0].url if listing.images else None,
            host_name=listing.host.name,
        ),
        guest=BookingGuest(
            id=booking.guest.id, name=booking.guest.name, avatar_url=booking.guest.avatar_url
        ),
        check_in=booking.check_in,
        check_out=booking.check_out,
        nights=(booking.check_out - booking.check_in).days,
        num_guests=booking.num_guests,
        nightly_price=booking.nightly_price,
        cleaning_fee=booking.cleaning_fee,
        service_fee=booking.service_fee,
        total_price=booking.total_price,
        status=booking.status,
        created_at=booking.created_at,
    )
