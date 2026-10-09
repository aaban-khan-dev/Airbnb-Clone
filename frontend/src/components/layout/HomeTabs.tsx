"use client";

import { ConciergeBell, House, Ticket } from "lucide-react";
import { toast } from "sonner";

const TABS = [
  { label: "Homes", Icon: House, available: true },
  { label: "Experiences", Icon: Ticket, available: false },
  { label: "Services", Icon: ConciergeBell, available: false },
];

/** Homes / Experiences / Services tabs shown in the tall header at the top of the home page. */
export function HomeTabs({ visible }: { visible: boolean }) {
  return (
    <nav
      aria-hidden={!visible}
      className={`flex items-center justify-center gap-8 transition-all duration-300 ${
        visible ? "opacity-100" : "pointer-events-none -translate-y-3 opacity-0"
      }`}
    >
      {TABS.map(({ label, Icon, available }) => (
        <button
          key={label}
          type="button"
          tabIndex={visible ? 0 : -1}
          onClick={() => !available && toast(`${label} are coming soon`)}
          className={`flex items-center gap-2 border-b-2 pb-2 pt-1 text-[15px] font-semibold ${
            available ? "border-ink text-ink" : "border-transparent text-muted hover:text-ink"
          }`}
        >
          <Icon size={22} strokeWidth={1.8} />
          {label}
        </button>
      ))}
    </nav>
  );
}
