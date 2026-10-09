from datetime import date

from sqlalchemy import ColumnElement, func, or_, select
from sqlalchemy.orm import Session, joinedload, selectinload

from app.core.constants import CATEGORIES, PROPERTY_TYPES
from app.models import Amenity, Listing, Review
from app.schemas.listing import (
    AmenityOut,
    DateRangeOut,
    FilterOptions,
    HostOut,
    ListingCard,
    ListingDetail,
    ListingPage,
    ListingSearchParams,
    PriceQuote,
    QuoteParams,
    ReviewOut,
)
from app.services.availability import (
    has_overlapping_booking,
    is_available,
    upcoming_booked_ranges,
)
from app.services.pricing import calculate_price

CARD_IMAGE_COUNT = 5  # photos shown in each card's carousel


def _rating_subquery():
    """Average rating and review count per listing, computed from the reviews table."""
    return (
        select(
            Review.listing_id,
            func.avg(Review.rating).label("rating"),
            func.count(Review.id).label("review_count"),
        )
        .group_by(Review.listing_id)
        .subquery()
    )


def _search_conditions(params: ListingSearchParams) -> list[ColumnElement[bool]]:
    """Turn the search parameters into a list of SQL WHERE conditions."""
    conditions: list[ColumnElement[bool]] = [Listing.is_active.is_(True)]

    if params.location:
        term = f"%{params.location.strip()}%"
        conditions.append(
            or_(
                Listing.city.ilike(term),
                Listing.state.ilike(term),
                Listing.country.ilike(term),
                Listing.title.ilike(term),
            )
        )
    if params.guests:
        conditions.append(Listing.max_guests >= params.guests)
    if params.category:
        conditions.append(Listing.category == params.category)
    if params.property_types:
        conditions.append(Listing.property_type.in_(params.property_types))
    if params.min_price is not None:
        conditions.append(Listing.price_per_night >= params.min_price)
    if params.max_price is not None:
        conditions.append(Listing.price_per_night <= params.max_price)
    for amenity_id in params.amenity_ids:
        # the listing must have ALL selected amenities
        conditions.append(Listing.amenities.any(Amenity.id == amenity_id))
    if params.check_in and params.check_out:
        # hide listings that are already booked for any of the requested nights
        conditions.append(~has_overlapping_booking(params.check_in, params.check_out))

    return conditions


def search_listings(db: Session, params: ListingSearchParams) -> ListingPage:
    conditions = _search_conditions(params)
    ratings = _rating_subquery()

    total = db.scalar(select(func.count()).select_from(Listing).where(*conditions)) or 0

    rows = db.execute(
        select(Listing, ratings.c.rating, ratings.c.review_count)
        .outerjoin(ratings, ratings.c.listing_id == Listing.id)
        .where(*conditions)
        # best-rated first; id as a tie-breaker keeps the order stable between pages
        .order_by(ratings.c.rating.desc().nulls_last(), Listing.id)
        .offset((params.page - 1) * params.page_size)
        .limit(params.page_size)
        # load photos and host in 2 extra queries instead of 1 query per listing
        .options(selectinload(Listing.images), joinedload(Listing.host))
    ).all()

    items = [_to_card(listing, rating, count) for listing, rating, count in rows]
    return ListingPage(
        items=items,
        total=total,
        page=params.page,
        page_size=params.page_size,
        has_more=params.page * params.page_size < total,
    )


def get_filter_options(db: Session) -> FilterOptions:
    active = Listing.is_active.is_(True)
    amenities = db.scalars(select(Amenity).order_by(Amenity.name))
    min_price, max_price = db.execute(
        select(func.min(Listing.price_per_night), func.max(Listing.price_per_night)).where(active)
    ).one()

    return FilterOptions(
        categories=CATEGORIES,
        property_types=PROPERTY_TYPES,
        amenities=[AmenityOut.model_validate(a) for a in amenities],
        min_price=min_price or 0,
        max_price=max_price or 0,
    )


def get_active_listing(db: Session, listing_id: int) -> Listing | None:
    listing = db.get(Listing, listing_id)
    return listing if listing and listing.is_active else None


def get_listing_detail(db: Session, listing: Listing) -> ListingDetail:
    reviews = db.scalars(
        select(Review)
        .where(Review.listing_id == listing.id)
        .order_by(Review.created_at.desc())
        .options(joinedload(Review.author))
    ).all()
    rating = sum(r.rating for r in reviews) / len(reviews) if reviews else None
    card = _to_card(listing, rating, len(reviews), image_limit=None)

    return ListingDetail(
        **card.model_dump(),
        description=listing.description,
        bathrooms=listing.bathrooms,
        cleaning_fee=listing.cleaning_fee,
        host=HostOut.model_validate(listing.host),
        amenities=[AmenityOut.model_validate(a) for a in listing.amenities],
        reviews=[
            ReviewOut(
                id=r.id,
                author_name=r.author.name,
                author_avatar_url=r.author.avatar_url,
                rating=r.rating,
                comment=r.comment,
                created_at=r.created_at,
            )
            for r in reviews
        ],
        unavailable_ranges=[
            DateRangeOut(check_in=start, check_out=end)
            for start, end in upcoming_booked_ranges(db, listing.id, date.today())
        ],
    )


def quote_stay(db: Session, listing: Listing, params: QuoteParams) -> PriceQuote:
    price = calculate_price(
        listing.price_per_night, listing.cleaning_fee, params.check_in, params.check_out
    )
    return PriceQuote(
        check_in=params.check_in,
        check_out=params.check_out,
        **price,
        available=is_available(db, listing.id, params.check_in, params.check_out),
    )


def _to_card(
    listing: Listing,
    rating: float | None,
    review_count: int | None,
    image_limit: int | None = CARD_IMAGE_COUNT,
) -> ListingCard:
    return ListingCard(
        id=listing.id,
        title=listing.title,
        city=listing.city,
        state=listing.state,
        country=listing.country,
        property_type=listing.property_type,
        category=listing.category,
        price_per_night=listing.price_per_night,
        max_guests=listing.max_guests,
        bedrooms=listing.bedrooms,
        beds=listing.beds,
        latitude=listing.latitude,
        longitude=listing.longitude,
        image_urls=[image.url for image in listing.images[:image_limit]],
        rating=round(rating, 2) if rating is not None else None,
        review_count=review_count or 0,
        host_is_superhost=listing.host.is_superhost,
    )
