from datetime import datetime

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Table,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base

# Many-to-many link table: one listing has many amenities, one amenity belongs to many listings.
# The composite primary key stops the same amenity being attached to a listing twice.
listing_amenities = Table(
    "listing_amenities",
    Base.metadata,
    Column("listing_id", ForeignKey("listings.id", ondelete="CASCADE"), primary_key=True),
    Column("amenity_id", ForeignKey("amenities.id", ondelete="CASCADE"), primary_key=True),
)


class Listing(Base):
    __tablename__ = "listings"
    __table_args__ = (
        CheckConstraint("price_per_night > 0", name="ck_listings_price_positive"),
        CheckConstraint("cleaning_fee >= 0", name="ck_listings_cleaning_fee_non_negative"),
        CheckConstraint("max_guests >= 1", name="ck_listings_max_guests_positive"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    host_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)

    title: Mapped[str] = mapped_column(String(150))
    description: Mapped[str] = mapped_column(Text)
    property_type: Mapped[str] = mapped_column(String(50), index=True)  # House, Villa, Cabin...
    category: Mapped[str] = mapped_column(String(50), index=True)  # icon row: Beachfront, Cabins...

    city: Mapped[str] = mapped_column(String(100), index=True)
    state: Mapped[str] = mapped_column(String(100))
    country: Mapped[str] = mapped_column(String(100))
    latitude: Mapped[float] = mapped_column(Float)
    longitude: Mapped[float] = mapped_column(Float)

    # Money is stored as whole rupees (integers) to avoid floating-point rounding errors
    price_per_night: Mapped[int] = mapped_column(Integer, index=True)
    cleaning_fee: Mapped[int] = mapped_column(Integer, default=0)

    max_guests: Mapped[int] = mapped_column(Integer)
    bedrooms: Mapped[int] = mapped_column(Integer)
    beds: Mapped[int] = mapped_column(Integer)
    bathrooms: Mapped[int] = mapped_column(Integer)

    # Soft delete: "deleting" a listing hides it but keeps guests' past bookings intact
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

    host: Mapped["User"] = relationship(back_populates="listings")
    images: Mapped[list["ListingImage"]] = relationship(
        back_populates="listing",
        cascade="all, delete-orphan",
        order_by="ListingImage.position",
    )
    amenities: Mapped[list["Amenity"]] = relationship(secondary=listing_amenities)
    bookings: Mapped[list["Booking"]] = relationship(back_populates="listing")
    reviews: Mapped[list["Review"]] = relationship(back_populates="listing")


class ListingImage(Base):
    __tablename__ = "listing_images"

    id: Mapped[int] = mapped_column(primary_key=True)
    listing_id: Mapped[int] = mapped_column(
        ForeignKey("listings.id", ondelete="CASCADE"), index=True
    )
    url: Mapped[str] = mapped_column(String(1000))
    position: Mapped[int] = mapped_column(Integer, default=0)  # 0 = cover photo

    listing: Mapped["Listing"] = relationship(back_populates="images")


class Amenity(Base):
    __tablename__ = "amenities"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), unique=True)
    icon: Mapped[str] = mapped_column(String(50))  # key the frontend maps to an icon