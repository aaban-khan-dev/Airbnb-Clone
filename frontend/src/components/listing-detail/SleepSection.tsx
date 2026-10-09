"use client";

import { BedDouble, ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState } from "react";

import { ListingPhoto } from "@/components/listings/ListingPhoto";
import type { Bedroom } from "@/lib/types";

const PER_PAGE = 2; // cards visible at once on desktop

// "Where you'll sleep": one card per bedroom with its photo and beds.
// A horizontal scroll row; on desktop the arrows page through two cards at a time.
export function SleepSection({ bedrooms }: { bedrooms: Bedroom[] }) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const pageCount = Math.ceil(bedrooms.length / PER_PAGE);

  if (bedrooms.length === 0) return null;

  function scrollToPage(next: number) {
    const row = rowRef.current;
    if (!row) return;
    row.scrollTo({ left: next * row.clientWidth, behavior: "smooth" });
  }

  return (
    <section className="py-10">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-[22px] font-semibold">Where you&apos;ll sleep</h2>
        {pageCount > 1 && (
          <div className="hidden items-center gap-2 text-sm md:flex">
            <span className="mr-1">
              {page + 1} / {pageCount}
            </span>
            <ArrowButton label="Previous" disabled={page === 0} onClick={() => scrollToPage(page - 1)}>
              <ChevronLeft size={14} strokeWidth={2.5} />
            </ArrowButton>
            <ArrowButton label="Next" disabled={page === pageCount - 1} onClick={() => scrollToPage(page + 1)}>
              <ChevronRight size={14} strokeWidth={2.5} />
            </ArrowButton>
          </div>
        )}
      </div>

      <div
        ref={rowRef}
        // Keep the page counter in sync however the row was scrolled (arrows, swipe, trackpad)
        onScroll={(e) => {
          const row = e.currentTarget;
          setPage(Math.round(row.scrollLeft / row.clientWidth));
        }}
        className="no-scrollbar -mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-6 px-6 md:mx-0 md:px-0 md:scroll-px-0"
      >
        {bedrooms.map((room, i) => (
          <div
            key={i}
            className="w-[70%] shrink-0 snap-start md:w-[calc((100%-16px)/2)]"
          >
            {room.image_url ? (
              <ListingPhoto
                src={room.image_url}
                alt={`Bedroom ${i + 1}`}
                className="aspect-[3/2] w-full rounded-xl"
              />
            ) : (
              <div className="flex aspect-[3/2] w-full items-center justify-center rounded-xl border border-line">
                <BedDouble size={32} strokeWidth={1.4} />
              </div>
            )}
            <p className="mt-3 font-semibold">Bedroom {i + 1}</p>
            <p className="text-sm text-muted">{room.beds}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ArrowButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-full border border-line hover:border-ink disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-line"
    >
      {children}
    </button>
  );
}
