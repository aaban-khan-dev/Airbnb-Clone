from datetime import date

from sqlalchemy import exists, select
from sqlalchemy.orm import Session

from app.models import Booking, Listing


def has_overlapping_booking(check_in: date, check_out: date):
    """SQL condition: the listing has a confirmed booking that overlaps [check_in, check_out).

    Two stays overlap when each one starts before the other ends:
        existing.check_in < new.check_out  AND  existing.check_out > new.check_in
    Because check-out days are free, a stay ending on the 10th does NOT overlap
    one starting on the 10th.
    """
    return exists().where(
        Booking.listing_id == Listing.id,
        Booking.status == "confirmed",
        Booking.check_in < check_out,
        Booking.check_out > check_in,
    )


def is_available(db: Session, listing_id: int, check_in: date, check_out: date) -> bool:
    """True if no confirmed booking for this listing overlaps the requested nights."""
    overlap = db.scalar(
        select(has_overlapping_booking(check_in, check_out)).where(Listing.id == listing_id)
    )
    return not overlap


def upcoming_booked_ranges(db: Session, listing_id: int, today: date) -> list[tuple[date, date]]:
    """(check_in, check_out) of confirmed stays that haven't ended yet, oldest first."""
    rows = db.execute(
        select(Booking.check_in, Booking.check_out)
        .where(
            Booking.listing_id == listing_id,
            Booking.status == "confirmed",
            Booking.check_out > today,
        )
        .order_by(Booking.check_in)
    ).all()
    return [(row.check_in, row.check_out) for row in rows]
