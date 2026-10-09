"use client";

import { Search, X } from "lucide-react";
import { type RefObject, useEffect } from "react";
import { createPortal } from "react-dom";

import { shortDate } from "@/components/search/DesktopSearchPanel";
import type { SearchDraft, Section } from "@/components/search/SearchBar";
import { DestinationSuggestions, GuestCounters } from "@/components/search/SearchSections";
import { DateRangeCalendar } from "@/components/ui/DateRangeCalendar";
import { plural } from "@/lib/format";

type Props = {
  draft: SearchDraft;
  setDraft: (draft: SearchDraft) => void;
  section: Section;
  setSection: (section: Section) => void;
  onSubmit: () => void;
  onClose: () => void;
  sheetRef: RefObject<HTMLDivElement | null>;
};

/** Full-screen search on phones, like Airbnb's app: three cards, one open at a time. */
export function MobileSearchSheet({ draft, setDraft, section, setSection, onSubmit, onClose, sheetRef }: Props) {
  // Stop the page behind the sheet from scrolling
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const guests = draft.adults + draft.children;
  const { from, to } = draft.range;

  // Rendered into <body> so it covers the navbar and the bottom tab bar
  return createPortal(
    <div ref={sheetRef} className="fixed inset-0 z-[70] flex flex-col bg-surface md:hidden">
      <div className="flex items-center px-4 pt-4">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close search"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-canvas"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        <Card
          active={section === "where"}
          onOpen={() => setSection("where")}
          label="Where"
          summary={draft.location || "I'm flexible"}
          title="Where to?"
        >
          <label className="mb-4 flex items-center gap-3 rounded-xl border border-line-strong px-4 py-3">
            <Search size={16} />
            <input
              value={draft.location}
              onChange={(e) => setDraft({ ...draft, location: e.target.value })}
              placeholder="Search destinations"
              className="w-full bg-transparent outline-none placeholder:text-muted"
            />
          </label>
          <DestinationSuggestions
            onPick={(name) => {
              setDraft({ ...draft, location: name });
              setSection("dates");
            }}
          />
        </Card>

        <Card
          active={section === "dates"}
          onOpen={() => setSection("dates")}
          label="When"
          summary={from && to ? `${shortDate(from)} – ${shortDate(to)}` : "Add dates"}
          title="When's your trip?"
        >
          <DateRangeCalendar
            value={draft.range}
            onChange={(range) => {
              setDraft({ ...draft, range });
              if (range.from && range.to) setSection("guests");
            }}
          />
        </Card>

        <Card
          active={section === "guests"}
          onOpen={() => setSection("guests")}
          label="Who"
          summary={guests ? plural(guests, "guest") : "Add guests"}
          title="Who's coming?"
        >
          <GuestCounters
            adults={draft.adults}
            childCount={draft.children}
            onAdults={(adults) => setDraft({ ...draft, adults })}
            onChildren={(children) => setDraft({ ...draft, children })}
          />
        </Card>
      </div>

      <div className="flex items-center justify-between border-t border-line bg-canvas px-4 py-3">
        <button
          type="button"
          onClick={() => setDraft({ location: "", range: { from: null, to: null }, adults: 0, children: 0 })}
          className="font-semibold underline"
        >
          Clear all
        </button>
        <button
          type="button"
          onClick={onSubmit}
          className="flex items-center gap-2 rounded-lg bg-brand-gradient px-6 py-3 font-semibold text-white"
        >
          <Search size={16} strokeWidth={3} />
          Search
        </button>
      </div>
    </div>,
    document.body,
  );
}

function Card({
  active,
  onOpen,
  label,
  summary,
  title,
  children,
}: {
  active: boolean;
  onOpen: () => void;
  label: string;
  summary: string;
  title: string;
  children: React.ReactNode;
}) {
  if (!active) {
    return (
      <button
        type="button"
        onClick={onOpen}
        className="flex w-full items-center justify-between rounded-2xl bg-canvas px-5 py-4 text-sm shadow-pill"
      >
        <span className="text-muted">{label}</span>
        <span className="font-semibold">{summary}</span>
      </button>
    );
  }
  return (
    <section className="rounded-2xl bg-canvas p-5 shadow-card">
      <h2 className="mb-4 text-2xl font-semibold">{title}</h2>
      {children}
    </section>
  );
}
