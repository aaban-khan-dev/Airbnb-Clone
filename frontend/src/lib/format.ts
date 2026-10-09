import { differenceInCalendarDays, format, isSameMonth, parseISO } from "date-fns";

const rupees = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

// 18500 -> "₹18,500"
export function formatPrice(amount: number): string {
  return rupees.format(amount);
}

// Dates travel through the URL and API as "yyyy-MM-dd" strings
export function toISODate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function fromISODate(value: string): Date {
  return parseISO(value); // local midnight, so no timezone shifts
}

export function countNights(checkIn: string, checkOut: string): number {
  return differenceInCalendarDays(fromISODate(checkOut), fromISODate(checkIn));
}

// "12–15 Oct" or "30 Oct – 2 Nov"
export function formatDateRange(checkIn: string, checkOut: string): string {
  const start = fromISODate(checkIn);
  const end = fromISODate(checkOut);
  return isSameMonth(start, end)
    ? `${format(start, "d")}–${format(end, "d MMM")}`
    : `${format(start, "d MMM")} – ${format(end, "d MMM")}`;
}

export function plural(count: number, word: string): string {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

// "2026-10-17" -> "Sat, 17 Oct 2026"
export function formatLongDate(value: string): string {
  return format(fromISODate(value), "EEE, d MMM yyyy");
}
