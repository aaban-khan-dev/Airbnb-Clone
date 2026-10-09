"use client";

import { Search } from "lucide-react";

import type { SearchDraft, Section } from "@/components/search/SearchBar";
import { DestinationSuggestions, GuestCounters } from "@/components/search/SearchSections";
import { DateRangeCalendar } from "@/components/ui/DateRangeCalendar";
import { plural } from "@/lib/format";

type Props = {
  expanded?: boolean; // opened from the big bar in the tall home header
  draft: SearchDraft;
  setDraft: (draft: SearchDraft) => void;
  section: Section;
  setSection: (section: Section) => void;
  onSubmit: () => void;
};

/** The expanded search bar with a popover per section (screens md and up). */
export function DesktopSearchPanel({ expanded = false, draft, setDraft, section, setSection, onSubmit }: Props) {
  const guests = draft.adults + draft.children;

  return (
    <div className="hidden md:block">
      {/* Dim the page below the header */}
      <div className={`fixed inset-x-0 bottom-0 z-30 bg-black/25 ${expanded ? "top-[168px]" : "top-20"}`} />

      <div
        className={`absolute left-1/2 z-50 w-[min(850px,94vw)] -translate-x-1/2 ${expanded ? "top-[84px]" : "top-[-4px]"}`}
      >
        <div className="flex items-center rounded-full border border-line bg-surface text-sm shadow-card">
          <Segment active={section === "where"} onClick={() => setSection("where")} className="flex-[1.4]">
            <span className="block text-xs font-semibold">Where</span>
            <input
              autoFocus={section === "where"} // don't steal focus when opened on dates or guests
              value={draft.location}
              onChange={(e) => setDraft({ ...draft, location: e.target.value })}
              onFocus={() => setSection("where")}
              onKeyDown={(e) => e.key === "Enter" && onSubmit()}
              placeholder="Search destinations"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
            />
          </Segment>
          <Segment active={section === "dates"} onClick={() => setSection("dates")} className="flex-1">
            <span className="block text-xs font-semibold">Check in</span>
            <span className={draft.range.from ? "" : "text-muted"}>
              {draft.range.from ? shortDate(draft.range.from) : "Add dates"}
            </span>
          </Segment>
          <Segment active={section === "dates"} onClick={() => setSection("dates")} className="flex-1">
            <span className="block text-xs font-semibold">Check out</span>
            <span className={draft.range.to ? "" : "text-muted"}>
              {draft.range.to ? shortDate(draft.range.to) : "Add dates"}
            </span>
          </Segment>
          <Segment
            active={section === "guests"}
            onClick={() => setSection("guests")}
            className="flex flex-[1.5] items-center justify-between gap-2 !pr-2"
          >
            <span className="whitespace-nowrap">
              <span className="block text-xs font-semibold">Who</span>
              <span className={guests ? "" : "text-muted"}>{guests ? plural(guests, "guest") : "Add guests"}</span>
            </span>
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onSubmit();
              }}
              className="flex h-12 items-center gap-2 rounded-full bg-brand px-4 font-semibold text-white hover:bg-brand-dark"
            >
              <Search size={16} strokeWidth={3} />
              Search
            </span>
          </Segment>
        </div>

        {/* Popover for the active section */}
        <div
          className={`mt-3 rounded-3xl bg-canvas p-6 shadow-card ${
            section === "where" ? "w-[420px] max-w-full" : section === "guests" ? "ml-auto w-[400px] max-w-full" : ""
          }`}
        >
          {section === "where" && (
            <DestinationSuggestions
              onPick={(name) => {
                setDraft({ ...draft, location: name });
                setSection("dates");
              }}
            />
          )}
          {section === "dates" && (
            <DateRangeCalendar
              value={draft.range}
              onChange={(range) => {
                setDraft({ ...draft, range });
                if (range.from && range.to) setSection("guests");
              }}
            />
          )}
          {section === "guests" && (
            <GuestCounters
              adults={draft.adults}
              childCount={draft.children}
              onAdults={(adults) => setDraft({ ...draft, adults })}
              onChildren={(children) => setDraft({ ...draft, children })}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function Segment({
  active,
  onClick,
  className = "",
  children,
}: {
  active: boolean;
  onClick: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded-full px-6 py-3 ${active ? "bg-canvas shadow-card" : "hover:bg-line/60"} ${className}`}
    >
      {children}
    </div>
  );
}

export function shortDate(date: Date): string {
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}
