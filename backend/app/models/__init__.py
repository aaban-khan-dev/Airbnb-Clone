# Importing every model here registers all tables on Base.metadata,
# so Base.metadata.create_all() knows about them.
from app.models.booking import Booking
from app.models.listing import Amenity, Listing, ListingImage, listing_amenities
from app.models.review import Review
from app.models.user import User
from app.models.wishlist import WishlistItem

__all__ = [
    "Amenity",
    "Booking",
    "Listing",
    "ListingImage",
    "Review",
    "User",
    "WishlistItem",
    "listing_amenities",
]