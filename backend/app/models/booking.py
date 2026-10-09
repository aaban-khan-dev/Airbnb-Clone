from datetime import date, datetime

from sqlalchemy import CheckConstraint, Date, DateTime, ForeignKey, Index, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


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