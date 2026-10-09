from datetime import date, datetime
from typing import TYPE_CHECKING

from sqlalchemy import (
    DDL,
    CheckConstraint,
    Date,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    event,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base

if TYPE_CHECKING:  # imports for type hints only; avoids circular imports at runtime
    from app.models.listing import Listing
    from app.models.review import Review
    from app.models.user import User


class Booking(Base):
    __tablename__ = "bookings"
    __table_args__ = (
        CheckConstraint("check_out > check_in", name="ck_bookings_dates_in_order"),
        CheckConstraint("num_guests >= 1", name="ck_bookings_guests_positive"),
        CheckConstraint("status IN ('confirmed', 'cancelled')", name="ck_bookings_status_valid"),
        # Speeds up the overlap check: "bookings for listing X between these dates"
        Index("ix_bookings_listing_dates", "listing_id", "check_in", "check_out"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    listing_id: Mapped[int] = mapped_column(ForeignKey("listings.id"))
    guest_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)

    # Dates are half-open: [check_in, check_out). The check-out day itself is free,
    # so one guest can check out on the same day the next guest checks in.
    check_in: Mapped[date] = mapped_column(Date)
    check_out: Mapped[date] = mapped_column(Date)
    num_guests: Mapped[int] = mapped_column(Integer)

    # Price snapshot at booking time, so later edits to the listing's price
    # never change what an existing guest was charged
    nightly_price: Mapped[int] = mapped_column(Integer)
    cleaning_fee: Mapped[int] = mapped_column(Integer)
    service_fee: Mapped[int] = mapped_column(Integer)
    total_price: Mapped[int] = mapped_column(Integer)

    status: Mapped[str] = mapped_column(String(20), default="confirmed")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    listing: Mapped["Listing"] = relationship(back_populates="bookings")
    guest: Mapped["User"] = relationship(back_populates="bookings")
    review: Mapped["Review | None"] = relationship(back_populates="booking")


# Database-level guard against double bookings.
# The booking service already checks availability before inserting, but two requests
# arriving at the same moment could both pass that check. SQLite lets only one writer
# at a time run, and this trigger runs inside that write, so the second booking for
# overlapping nights is always rejected, even if the application check was skipped.
_REJECT_OVERLAP = """
    SELECT RAISE(ABORT, 'booking_overlap')
    WHERE NEW.status = 'confirmed' AND EXISTS (
        SELECT 1 FROM bookings
        WHERE listing_id = NEW.listing_id
          AND status = 'confirmed'
          AND id IS NOT NEW.id
          AND check_in < NEW.check_out
          AND check_out > NEW.check_in
    );
"""

for _ddl in (
    f"CREATE TRIGGER trg_bookings_no_overlap_insert BEFORE INSERT ON bookings "
    f"BEGIN {_REJECT_OVERLAP} END;",
    f"CREATE TRIGGER trg_bookings_no_overlap_update "
    f"BEFORE UPDATE OF status, check_in, check_out ON bookings "
    f"BEGIN {_REJECT_OVERLAP} END;",
):
    # created together with the bookings table
    event.listen(Booking.__table__, "after_create", DDL(_ddl))
