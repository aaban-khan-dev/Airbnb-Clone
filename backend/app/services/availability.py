from datetime import date

from sqlalchemy import exists

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
