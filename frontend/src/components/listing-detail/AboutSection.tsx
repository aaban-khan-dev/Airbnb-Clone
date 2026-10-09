"use client";

import { useState } from "react";

import { Modal } from "@/components/ui/Modal";

// Airbnb's description block: a clamped summary on the page, and a "Show more"
// dialog ("About this space") with the full summary plus the extra sections.
export function AboutSection({
  summary,
  space,
  guestAccess,
  otherNotes,
}: {
  summary: string;
  space: string | null;
  guestAccess: string | null;
  otherNotes: string | null;
}) {
  const [open, setOpen] = useState(false);

  const sections = [
    { title: "The space", text: space },
    { title: "Guest access", text: guestAccess },
    { title: "Other things to note", text: otherNotes },
  ].filter((section): section is { title: string; text: string } => Boolean(section.text));

  // A rough length check: longer summaries get cut off by line-clamp below
  const hasMore = sections.length > 0 || summary.length > 400;

  return (
    <section className="py-8">
      <p className="line-clamp-6 whitespace-pre-line leading-relaxed">{summary}</p>
      {hasMore && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-6 rounded-xl bg-surface px-6 py-3 font-semibold hover:bg-line"
        >
          Show more
        </button>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="About this space">
        <div className="space-y-8 leading-relaxed">
          <p className="whitespace-pre-line">{summary}</p>
          {sections.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold">{section.title}</h3>
              <p className="mt-1 whitespace-pre-line">{section.text}</p>
            </div>
          ))}
        </div>
      </Modal>
    </section>
  );
}
