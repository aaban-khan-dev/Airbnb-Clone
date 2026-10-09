import { startOfDay } from "date-fns";

import { fromISODate } from "@/lib/format";
import type { Booking } from "@/lib/types";

export type TripTab = "upcoming" | "past" | "cancelled";

/** Which tab a booking belongs to. "Completed" isn't stored in the database:
 *  it follows from the dates, so it can never be out of date. */
export function tripTab(booking: Booking, today = startOfDay(new Date())): TripTab {
  if (booking.status === "cancelled") return "cancelled";
  return fromISODate(booking.check_out) <= today ? "past" : "upcoming";
}

/** Guests can cancel only trips that haven't started yet. */
export function canCancel(booking: Booking, today = startOfDay(new Date())): boolean {
  return booking.status === "confirmed" && fromISODate(booking.check_in) > today;
}
