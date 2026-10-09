import { Search } from "lucide-react";

// The compact search bar in the navbar. Only the look for now:
// Phase 3 replaces it with the real search (location, dates, guests).
export function SearchPill() {
  return (
    <button
      type="button"
      className="flex items-center rounded-full border border-line py-2 pl-6 pr-2 text-sm shadow-pill transition-shadow hover:shadow-card"
    >
      <span className="font-semibold">Anywhere</span>
      <span className="mx-4 h-6 w-px bg-line" />
      <span className="font-semibold">Any week</span>
      <span className="mx-4 h-6 w-px bg-line" />
      <span className="text-muted">Add guests</span>
      <span className="ml-4 flex h-8 w-8 items-center justify-center rounded-full bg-brand text-white">
        <Search size={14} strokeWidth={3} />
      </span>
    </button>
  );
}
