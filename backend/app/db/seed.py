"""Fills an empty database with sample users, listings, bookings and reviews.

Dates are generated relative to today, so the demo always has past stays (with reviews)
and upcoming stays (which block dates on the calendar), whenever it is seeded.
A fixed random seed makes the output identical on every run.
"""

import random
from datetime import date, datetime, time, timedelta

from sqlalchemy.orm import Session

from app.db import seed_data as data
from app.models import Amenity, Booking, Listing, ListingImage, Review, User, WishlistItem
from app.services.pricing import calculate_price

NUM_HOSTS = 6


def seed_database(db: Session) -> None:
    rng = random.Random(42)
    today = date.today()

    users = _create_users(db)
    amenities = _create_amenities(db)
    listings = _create_listings(db, rng, users[:NUM_HOSTS], amenities)
    _create_bookings_and_reviews(db, rng, today, listings, users)
    _create_wishlists(db, rng, listings, users)

    db.commit()


def _create_users(db: Session) -> list[User]:
    users = []
    for i, (name, email, is_superhost, bio) in enumerate(data.USERS, start=1):
        user = User(
            name=name,
            email=email,
            is_superhost=is_superhost,
            bio=bio,
            avatar_url=f"https://i.pravatar.cc/150?img={i + 10}",
        )
        db.add(user)
        users.append(user)
    db.flush()  # sends INSERTs so every user gets its id, without committing yet
    return users


def _create_amenities(db: Session) -> dict[str, Amenity]:
    amenities = {name: Amenity(name=name, icon=icon) for name, icon in data.AMENITIES}
    db.add_all(amenities.values())
    db.flush()
    return amenities


def _create_listings(
    db: Session, rng: random.Random, hosts: list[User], amenities: dict[str, Amenity]
) -> list[Listing]:
    listings = []
    for (title, city, state, lat, lng, category, ptype, price,
         guests, bedrooms, beds, baths, host_index) in data.LISTINGS:
        description = data.DESCRIPTION_OPENERS[category].format(
            ptype=ptype.lower(), city=city
        ) + data.DESCRIPTION_CLOSER.format(
            guests=guests, bedrooms=bedrooms, beds=beds, baths=baths
        )

        listing = Listing(
            host=hosts[host_index],
            title=title,
            description=description,
            property_type=ptype,
            category=category,
            city=city,
            state=state,
            country="India",
            latitude=lat,
            longitude=lng,
            price_per_night=price,
            cleaning_fee=_round_to_hundred(price * rng.uniform(0.08, 0.15)),
            max_guests=guests,
            bedrooms=bedrooms,
            beds=beds,
            bathrooms=baths,
        )

        amenity_names = set(data.BASE_AMENITIES) | set(data.CATEGORY_AMENITIES[category])
        amenity_names |= set(rng.sample(data.EXTRA_AMENITIES, k=2))
        listing.amenities = [amenities[name] for name in sorted(amenity_names)]

        listing.images = [
            ListingImage(url=data.UNSPLASH.format(photo_id), position=pos)
            for pos, photo_id in enumerate(_pick_photos(rng, category))
        ]

        db.add(listing)
        listings.append(listing)
    db.flush()
    return listings


def _pick_photos(rng: random.Random, category: str) -> list[str]:
    exterior_pool = data.CATEGORY_EXTERIOR[category]
    return [
        rng.choice(data.IMAGE_POOLS[exterior_pool]),
        rng.choice(data.IMAGE_POOLS["living"]),
        rng.choice(data.IMAGE_POOLS["bedroom"]),
        rng.choice(data.IMAGE_POOLS["kitchen"]),
        rng.choice(data.IMAGE_POOLS["bathroom"]),
    ]


def _create_bookings_and_reviews(
    db: Session, rng: random.Random, today: date, listings: list[Listing], users: list[User]
) -> None:
    for listing in listings:
        possible_guests = [u for u in users if u.id != listing.host_id]

        # Past stays: walk forward from ~10 months ago, leaving gaps so stays never overlap
        cursor = today - timedelta(days=rng.randint(280, 320))
        for _ in range(rng.randint(3, 6)):
            check_in = cursor + timedelta(days=rng.randint(5, 40))
            check_out = check_in + timedelta(days=rng.randint(2, 5))
            if check_out >= today:
                break
            booking = _make_booking(rng, listing, rng.choice(possible_guests), check_in, check_out)
            db.add(booking)

            if rng.random() < 0.85:  # most past guests leave a review
                rating = rng.choices([5, 4, 3], weights=[65, 28, 7])[0]
                db.add(Review(
                    booking=booking,
                    listing=listing,
                    author=booking.guest,
                    rating=rating,
                    comment=rng.choice(data.REVIEW_COMMENTS[rating]),
                    created_at=_at_noon(check_out + timedelta(days=rng.randint(1, 4))),
                ))
            cursor = check_out

        # Upcoming stays: these show up as blocked dates on the listing's calendar
        cursor = today
        for _ in range(rng.randint(1, 3)):
            check_in = cursor + timedelta(days=rng.randint(3, 25))
            check_out = check_in + timedelta(days=rng.randint(2, 6))
            db.add(_make_booking(rng, listing, rng.choice(possible_guests), check_in, check_out))
            cursor = check_out


def _make_booking(
    rng: random.Random, listing: Listing, guest: User, check_in: date, check_out: date
) -> Booking:
    price = calculate_price(listing.price_per_night, listing.cleaning_fee, check_in, check_out)
    return Booking(
        listing=listing,
        guest=guest,
        check_in=check_in,
        check_out=check_out,
        num_guests=rng.randint(1, listing.max_guests),
        nightly_price=price["nightly_price"],
        cleaning_fee=price["cleaning_fee"],
        service_fee=price["service_fee"],
        total_price=price["total_price"],
        status="confirmed",
        created_at=_at_noon(check_in - timedelta(days=rng.randint(7, 45))),
    )


def _create_wishlists(
    db: Session, rng: random.Random, listings: list[Listing], users: list[User]
) -> None:
    for user in users[NUM_HOSTS:]:  # guests save a few listings each
        for listing in rng.sample(listings, k=rng.randint(2, 5)):
            db.add(WishlistItem(user=user, listing=listing))


def _at_noon(day: date) -> datetime:
    return datetime.combine(day, time(12, 0))


def _round_to_hundred(value: float) -> int:
    return int(round(value / 100) * 100)
