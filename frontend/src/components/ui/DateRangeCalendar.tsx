"use client";

import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isAfter,
  isBefore,
  isSameDay,
  startOfDay,
  startOfMonth,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

export type DateRange = { from: Date | null; to: Date | null };

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

/**
 * Two-month range picker in Airbnb's style.
 * `isNightBlocked(day)` marks nights that can't be booked (already booked).
 * A blocked day can still be chosen as the check-out day, because guests
 * leave in the morning before the next guests arrive.
 */
export function DateRangeCalendar({
  value,
  onChange,
  isNightBlocked = () => false,
}: {
  value: DateRange;
  onChange: (range: DateRange) => void;
  isNightBlocked?: (day: Date) => boolean;
}) {
  const today = startOfDay(new Date());
  const [viewMonth, setViewMonth] = useState(startOfMonth(value.from ?? today));
  const [hovered, setHovered] = useState<Date | null>(null);

  const choosingCheckOut = value.from !== null && value.to === null;

  // Every night from check-in up to (not including) check-out must be free
  function rangeIsFree(from: Date, to: Date): boolean {
    for (let day = from; isBefore(day, to); day = addDays(day, 1)) {
      if (isNightBlocked(day)) return false;
    }
    return true;
  }

  function canSelect(day: Date): boolean {
    if (isBefore(day, today)) return false;
    if (choosingCheckOut && isAfter(day, value.from!)) return rangeIsFree(value.from!, day);
    return !isNightBlocked(day);
  }

  function handleClick(day: Date) {
    if (!canSelect(day)) return;
    if (choosingCheckOut && isAfter(day, value.from!)) {
      onChange({ from: value.from, to: day });
    } else {
      onChange({ from: day, to: null }); // start a new range
    }
  }

  // While choosing check-out, hovering previews the range
  const rangeEnd = value.to ?? (choosingCheckOut && hovered && isAfter(hovered, value.from!) ? hovered : null);

  function renderMonth(month: Date) {
    const days = eachDayOfInterval({ start: month, end: endOfMonth(month) });
    const blanks = getDay(month); // weekday of the 1st, so the grid lines up

    return (
      <div className="w-full">
        <h3 className="mb-4 text-center font-semibold">{format(month, "MMMM yyyy")}</h3>
        <div className="grid grid-cols-7 text-center text-xs font-semibold text-muted">
          {WEEKDAYS.map((d) => (
            <span key={d} className="pb-2">
              {d}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {Array.from({ length: blanks }, (_, i) => (
            <span key={`blank-${i}`} />
          ))}
          {days.map((day) => {
            const selectable = canSelect(day);
            const isStart = value.from !== null && isSameDay(day, value.from);
            const isEnd = rangeEnd !== null && isSameDay(day, rangeEnd);
            const inRange =
              value.from !== null && rangeEnd !== null && isAfter(day, value.from) && isBefore(day, rangeEnd);
            const blocked = !isBefore(day, today) && isNightBlocked(day);

            return (
              <div key={day.toISOString()} className={`py-0.5 ${inRange ? "bg-surface" : ""}`}>
                <button
                  type="button"
                  disabled={!selectable}
                  onClick={() => handleClick(day)}
                  onMouseEnter={() => setHovered(day)}
                  aria-label={format(day, "EEEE, d MMMM yyyy")}
                  aria-pressed={isStart || isEnd}
                  className={`mx-auto flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold
                    ${isStart || isEnd ? "bg-ink text-canvas" : "hover:border hover:border-ink"}
                    ${!selectable ? "cursor-not-allowed text-muted/40 hover:border-0" : ""}
                    ${blocked && !isEnd ? "line-through" : ""}`}
                >
                  {format(day, "d")}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const canGoBack = isAfter(viewMonth, startOfMonth(today));

  return (
    <div onMouseLeave={() => setHovered(null)}>
      <div className="relative flex gap-8">
        <button
          type="button"
          aria-label="Previous month"
          disabled={!canGoBack}
          onClick={() => setViewMonth(addMonths(viewMonth, -1))}
          className="absolute left-0 top-0 rounded-full p-1.5 hover:bg-surface disabled:opacity-30"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          type="button"
          aria-label="Next month"
          onClick={() => setViewMonth(addMonths(viewMonth, 1))}
          className="absolute right-0 top-0 rounded-full p-1.5 hover:bg-surface"
        >
          <ChevronRight size={18} />
        </button>
        {renderMonth(viewMonth)}
        {/* Second month only on wider screens */}
        <div className="hidden w-full md:block">{renderMonth(addMonths(viewMonth, 1))}</div>
      </div>
      {(value.from || value.to) && (
        <div className="mt-4 text-right">
          <button
            type="button"
            onClick={() => onChange({ from: null, to: null })}
            className="text-sm font-semibold underline"
          >
            Clear dates
          </button>
        </div>
      )}
    </div>
  );
}
