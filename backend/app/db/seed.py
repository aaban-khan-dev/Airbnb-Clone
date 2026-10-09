"""Fills an empty database with sample users, listings, bookings and reviews.

Dates are generated relative to today, so the demo always has past stays (with reviews)
and upcoming stays (which block dates on the calendar), whenever it is seeded.
A fixed random seed makes the output identical on every run.
"""

import random
from datetime import date, datetime, time, timedelta

from sqlalchemy.orm import Session

from app.db import seed_data as data
from app.db.seed_listing_text import LISTING_TEXT
from app.models import (
    Amenity,
    Booking,
    Listing,
    ListingBedroom,
    ListingImage,
    Review,
    User,
    WishlistItem,
)
from app.services.pricing import calculate_price

NUM_HOSTS = 6


def seed_database(db: Session) -> None:
    rng = random.Random(42)
    today = date.today()

    users = _create_users(db)
    amenities = _create_amenities(db)
    listings = _create_listings(db, rng, users[:NUM_HOSTS], amenities)
    _create_bookings_and_reviews(db, rng, today, listings, users)
    _create_wishlists(db, rng, today, listings, users)

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
    _check_sample_data()
    listings = []
    for (title, city, state, lat, lng, category, ptype, price,
         guests, bedrooms, beds, baths, host_index) in data.LISTINGS:
        text = LISTING_TEXT[title]
        listing = Listing(
            host=hosts[host_index],
            title=title,
            description=text["summary"],
            space=text["space"],
            guest_access=text["guest_access"],
            other_notes=text["other_notes"],
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
            check_in_time=time(rng.choice([13, 14, 15]), 0),
            checkout_time=time(rng.choice([10, 11]), 0),
            pets_allowed=category in data.PET_FRIENDLY_CATEGORIES,
            events_allowed=title in data.EVENTS_ALLOWED,
            smoking_allowed=title in data.SMOKING_ALLOWED,
            has_smoke_alarm=rng.random() < 0.85,
            has_co_alarm=rng.random() < 0.4,
        )

        amenity_names = set(data.BASE_AMENITIES) | set(data.CATEGORY_AMENITIES[category])
        amenity_names |= set(rng.sample(data.EXTRA_AMENITIES, k=2))
        listing.amenities = [amenities[name] for name in sorted(amenity_names)]

        # One different bedroom photo per bedroom, also used in "Where you'll sleep"
        bedroom_photos = [_photo_url(p) for p in rng.sample(data.ROOM_PHOTOS["bedroom"], k=len(text["sleep"]))]
        listing.bedroom_details = [
            ListingBedroom(beds=beds_text, image_url=photo, position=i)
            for i, (beds_text, photo) in enumerate(zip(text["sleep"], bedroom_photos))
        ]

        # Photo order: cover, living room, first bedroom, kitchen, bathroom, other bedrooms
        photos = [
            _photo_url(data.COVERS[title]),
            _photo_url(rng.choice(data.ROOM_PHOTOS["living"])),
            bedroom_photos[0],
            _photo_url(rng.choice(data.ROOM_PHOTOS["kitchen"])),
            _photo_url(rng.choice(data.ROOM_PHOTOS["bathroom"])),
            *bedroom_photos[1:],
        ]
        listing.images = [ListingImage(url=url, position=pos) for pos, url in enumerate(photos)]

        db.add(listing)
        listings.append(listing)
    db.flush()
    return listings


def _check_sample_data() -> None:
    """Fail loudly if the sample data is inconsistent, instead of seeding a broken demo."""
    covers = [data.COVERS[row[0]] for row in data.LISTINGS]
    duplicates = {c for c in covers if covers.count(c) > 1}
    if duplicates:
        raise ValueError(f"Cover photos used by more than one listing: {duplicates}")

    for title, *_, bedrooms, beds, _baths, _host in data.LISTINGS:
        sleep = LISTING_TEXT[title]["sleep"]
        bed_total = sum(int(part.split()[0]) for room in sleep for part in room.split(","))
        if len(sleep) != bedrooms or bed_total != beds:
            raise ValueError(f"'{title}': sleeping arrangements don't match {bedrooms} bedrooms / {beds} beds")


def _photo_url(photo_id: str) -> str:
    return data.UNSPLASH.format(photo_id)


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
    db: Session, rng: random.Random, today: date, listings: list[Listing], users: list[User]
) -> None:
    for user in users[NUM_HOSTS:]:  # guests save a few listings each
        for listing in rng.sample(listings, k=rng.randint(2, 5)):
            saved_on = _at_noon(today - timedelta(days=rng.randint(5, 60)))
            db.add(WishlistItem(user=user, listing=listing, created_at=saved_on))


def _at_noon(day: date) -> datetime:
    return datetime.combine(day, time(12, 0))


def _round_to_hundred(value: float) -> int:
    return int(round(value / 100) * 100)
