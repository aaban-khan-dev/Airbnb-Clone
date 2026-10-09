"use client";

import { ArrowUp, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { ListingPhoto } from "@/components/listings/ListingPhoto";

// Photos are added by URL. The first photo is the cover shown on the listing card.
export function PhotoUrlsInput({ urls, onChange }: { urls: string[]; onChange: (urls: string[]) => void }) {
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  function add() {
    const url = draft.trim();
    if (!/^https?:\/\/\S+$/.test(url)) return setError("Paste a full image link starting with http:// or https://");
    if (urls.includes(url)) return setError("That photo is already added");
    onChange([...urls, url]);
    setDraft("");
    setError(null);
  }

  function makeCover(index: number) {
    onChange([urls[index], ...urls.filter((_, i) => i !== index)]);
  }

  return (
    <div>
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault(); // don't submit the whole form
              add();
            }
          }}
          placeholder="https://images.unsplash.com/photo-..."
          className="flex-1 rounded-lg border border-[#b0b0b0] px-4 py-3 outline-none focus:border-ink"
        />
        <button
          type="button"
          onClick={add}
          className="flex items-center gap-1 rounded-lg bg-ink px-4 font-semibold text-white"
        >
          <Plus size={16} /> Add
        </button>
      </div>
      {error && <p className="mt-2 text-sm font-semibold text-brand">{error}</p>}

      {urls.length > 0 && (
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {urls.map((url, i) => (
            <li key={url} className="group relative aspect-[4/3] overflow-hidden rounded-lg bg-surface">
              <ListingPhoto src={url} alt={`Photo ${i + 1}`} className="h-full w-full" />
              {i === 0 && (
                <span className="absolute left-2 top-2 rounded-full bg-white px-2 py-0.5 text-xs font-semibold shadow">
                  Cover photo
                </span>
              )}
              <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                {i > 0 && (
                  <IconButton label="Make cover photo" onClick={() => makeCover(i)}>
                    <ArrowUp size={14} />
                  </IconButton>
                )}
                <IconButton label="Remove photo" onClick={() => onChange(urls.filter((_, j) => j !== i))}>
                  <Trash2 size={14} />
                </IconButton>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="flex h-7 w-7 items-center justify-center rounded-full bg-white shadow hover:scale-105"
    >
      {children}
    </button>
  );
}
