"use client";

import {
  AlarmSmoke,
  CalendarX,
  Cigarette,
  CigaretteOff,
  Clock,
  DoorOpen,
  KeyRound,
  PartyPopper,
  PawPrint,
  ShieldAlert,
  Users,
  Waves,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";

import { Modal } from "@/components/ui/Modal";
import { formatLongDate, formatTime } from "@/lib/format";
import type { ListingDetail } from "@/lib/types";

type Line = { Icon: LucideIcon; text: string };
type Group = { heading: string; lines: Line[] };
type Column = { title: string; Icon: LucideIcon; preview: string[]; groups: Group[] };

// Airbnb's "Things to know": house rules, safety and cancellation side by side,
// each with a short preview and a "Show more" dialog with the full list.
export function ThingsToKnow({ listing, checkIn }: { listing: ListingDetail; checkIn: string | null }) {
  const [openColumn, setOpenColumn] = useState<Column | null>(null);
  const columns = buildColumns(listing, checkIn);

  return (
    <section className="py-10">
      <h2 className="mb-6 text-[22px] font-semibold">Things to know</h2>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {columns.map((column) => (
          <div key={column.title} className="border-b border-line pb-8 last:border-0 md:border-0 md:pb-0">
            <column.Icon size={24} strokeWidth={1.5} />
            <h3 className="mt-4 font-semibold">{column.title}</h3>
            <ul className="mt-2 space-y-1">
              {column.preview.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => setOpenColumn(column)}
              className="mt-3 font-semibold underline"
            >
              Show more
            </button>
          </div>
        ))}
      </div>

      <Modal open={openColumn !== null} onClose={() => setOpenColumn(null)} title={openColumn?.title ?? ""}>
        <div className="space-y-8">
          {openColumn?.groups.map((group) => (
            <div key={group.heading}>
              <h3 className="mb-2 text-lg font-semibold">{group.heading}</h3>
              <ul className="divide-y divide-line">
                {group.lines.map(({ Icon, text }) => (
                  <li key={text} className="flex items-center gap-4 py-4">
                    <Icon size={24} strokeWidth={1.5} className="shrink-0" />
                    {text}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Modal>
    </section>
  );
}

function buildColumns(l: ListingDetail, checkIn: string | null): Column[] {
  const checkInText = `Check-in after ${formatTime(l.check_in_time)}`;
  const checkoutText = `Checkout before ${formatTime(l.checkout_time)}`;
  const guestsText = `${l.max_guests} guest${l.max_guests === 1 ? "" : "s"} maximum`;
  const petsText = l.pets_allowed ? "Pets allowed" : "No pets";
  const eventsText = l.events_allowed ? "Events allowed" : "No parties or events";
  const smokingText = l.smoking_allowed ? "Smoking allowed" : "No smoking";

  const hasPool = l.amenities.some((a) => a.icon === "pool" || a.icon === "hot_tub");
  const smokeText = l.has_smoke_alarm ? "Smoke alarm" : "Smoke alarm not reported";
  const coText = l.has_co_alarm ? "Carbon monoxide alarm" : "Carbon monoxide alarm not reported";
  const safetyLines: Line[] = [
    { Icon: AlarmSmoke, text: smokeText },
    { Icon: ShieldAlert, text: coText },
  ];
  const poolLine: Line = { Icon: Waves, text: "Pool/hot tub without a gate or lock" };

  // Matches the real rule in the backend: a trip can be cancelled until the day before check-in
  const cancelText = checkIn
    ? `Free cancellation before ${formatLongDate(checkIn)}.`
    : "Free cancellation until the day before check-in.";

  return [
    {
      title: "House rules",
      Icon: KeyRound,
      preview: [checkInText, checkoutText, guestsText],
      groups: [
        {
          heading: "Checking in and out",
          lines: [
            { Icon: Clock, text: checkInText },
            { Icon: DoorOpen, text: checkoutText },
          ],
        },
        {
          heading: "During your stay",
          lines: [
            { Icon: Users, text: guestsText },
            { Icon: PawPrint, text: petsText },
            { Icon: PartyPopper, text: eventsText },
            { Icon: l.smoking_allowed ? Cigarette : CigaretteOff, text: smokingText },
          ],
        },
      ],
    },
    {
      title: "Safety & property",
      Icon: ShieldAlert,
      preview: [...(hasPool ? [poolLine.text] : []), coText, smokeText].slice(0, 3),
      groups: [
        { heading: "Safety devices", lines: safetyLines },
        ...(hasPool ? [{ heading: "Property info", lines: [poolLine] }] : []),
      ],
    },
    {
      title: "Cancellation policy",
      Icon: CalendarX,
      preview: [cancelText, "Review this host's full policy for details."],
      groups: [
        {
          heading: "Before you book",
          lines: [
            { Icon: CalendarX, text: cancelText },
            {
              Icon: Clock,
              text: "Once the trip has started, it can't be cancelled. Cancel any time before that from Trips.",
            },
          ],
        },
      ],
    },
  ];
}
