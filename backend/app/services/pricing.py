from datetime import date

# Airbnb charges guests a service fee of roughly 14% of the booking subtotal
SERVICE_FEE_RATE = 0.14


def calculate_price(
    price_per_night: int, cleaning_fee: int, check_in: date, check_out: date
) -> dict[str, int]:
    """Price breakdown for a stay. Used by the booking flow and the seed script,
    so both always agree on how a total is calculated."""
    nights = (check_out - check_in).days
    subtotal = price_per_night * nights
    service_fee = round(subtotal * SERVICE_FEE_RATE)
    return {
        "nights": nights,
        "nightly_price": price_per_night,
        "subtotal": subtotal,
        "cleaning_fee": cleaning_fee,
        "service_fee": service_fee,
        "total_price": subtotal + cleaning_fee + service_fee,
    }