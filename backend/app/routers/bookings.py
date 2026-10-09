from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.db.session import get_db
from app.models import User
from app.schemas.booking import BookingCreate, BookingOut, ReviewCreate
from app.services import booking_service

router = APIRouter(prefix="/bookings", tags=["bookings"])


@router.post("", response_model=BookingOut, status_code=status.HTTP_201_CREATED)
def create_booking(
    data: BookingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Book a stay. Fails with 409 if any of the nights are already booked."""
    return booking_service.create_booking(db, current_user, data)


@router.get("/me", response_model=list[BookingOut])
def my_trips(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """The logged-in guest's bookings (the "Trips" page)."""
    return booking_service.list_guest_bookings(db, current_user)


@router.get("/{booking_id}", response_model=BookingOut)
def get_booking(
    booking_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    booking = booking_service.get_booking_for_user(db, booking_id, current_user)
    return booking_service.to_booking_out(booking)


@router.post("/{booking_id}/cancel", response_model=BookingOut)
def cancel_booking(
    booking_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Cancel an upcoming trip. Its nights become available again."""
    return booking_service.cancel_booking(db, booking_id, current_user)


@router.post("/{booking_id}/review", response_model=BookingOut, status_code=status.HTTP_201_CREATED)
def review_stay(
    booking_id: int,
    data: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Leave a review after a completed stay (one per booking)."""
    return booking_service.leave_review(db, booking_id, current_user, data)
