"use client";

import { X } from "lucide-react";
import { useEffect } from "react";
import { createPortal } from "react-dom";

// Centered dialog with a dark backdrop, like Airbnb's filters and booking modals.
// Closes on the X button, a click on the backdrop, or the Escape key.
// It is rendered into <body> through a portal, so it always sits above the
// navbar, even when opened from inside a sticky element like the category bar.
export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden"; // stop the page behind from scrolling
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 md:items-center"
      onMouseDown={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="flex max-h-[90vh] w-full max-w-[780px] flex-col rounded-t-2xl bg-white md:rounded-2xl"
        onMouseDown={(event) => event.stopPropagation()} // clicks inside don't close it
      >
        <header className="relative flex items-center justify-center border-b border-line px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute left-4 rounded-full p-2 hover:bg-surface"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
          <h2 className="font-semibold">{title}</h2>
        </header>
        <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>
        {footer && <footer className="border-t border-line px-6 py-4">{footer}</footer>}
      </div>
    </div>,
    document.body,
  );
}
