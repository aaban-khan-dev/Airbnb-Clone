import { addDays, isBefore } from "date-fns";

import { fromISODate, toISODate } from "@/lib/format";
import type { DateRangeOut } from "@/lib/types";

/** Every booked night as a "yyyy-MM-dd" string. Check-out days are not included:
 *  the guest leaves that morning, so the night is free for someone else. */
export function buildBlockedNights(ranges: DateRangeOut[]): Set<string> {
  const nights = new Set<string>();
  for (const range of ranges) {
    const end = fromISODate(range.check_out);
    for (let day = fromISODate(range.check_in); isBefore(day, end); day = addDays(day, 1)) {
      nights.add(toISODate(day));
    }
  }
  return nights;
}
