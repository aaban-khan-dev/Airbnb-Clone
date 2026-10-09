from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Integer, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class Review(Base):
    __tablename__ = "reviews"
    __table_args__ = (
        CheckConstraint("rating BETWEEN 1 AND 5", name="ck_reviews_rating_range"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    # unique=True: a review belongs to exactly one completed stay, one review per stay
    booking_id: Mapped[int] = mapped_column(ForeignKey("bookings.id"), unique=True)
    # listing_id and author_id can be reached through the booking, but are stored directly
    # because reviews are read constantly by listing (detail page, rating averages)
    listing_id: Mapped[int] = mapped_column(ForeignKey("listings.id"), index=True)
    author_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)

    rating: Mapped[int] = mapped_column(Integer)
    comment: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    booking: Mapped["Booking"] = relationship(back_populates="review")
    listing: Mapped["Listing"] = relationship(back_populates="reviews")
    author: Mapped["User"] = relationship(back_populates="reviews")