"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { BedroomsInput } from "@/components/host/BedroomsInput";
import { PhotoUrlsInput } from "@/components/host/PhotoUrlsInput";
import { AmenityIcon } from "@/components/ui/AmenityIcon";
import { Counter } from "@/components/ui/Counter";
import { api } from "@/lib/api";
import { CATEGORY_ICONS } from "@/lib/categories";
import { CITY_PRESETS } from "@/lib/cities";
import { formatTime } from "@/lib/format";
import type { FilterOptions, ListingFormValues } from "@/lib/types";

export const EMPTY_LISTING: ListingFormValues = {
  title: "",
  description: "",
  property_type: "",
  category: "",
  city: "",
  state: "",
  country: "India",
  latitude: 20.5937, // centre of India until a location is chosen
  longitude: 78.9629,
  price_per_night: 3000,
  cleaning_fee: 500,
  max_guests: 2,
  bedrooms: 1,
  beds: 1,
  bathrooms: 1,
  image_urls: [],
  amenity_ids: [],
  space: "",
  guest_access: "",
  other_notes: "",
  bedroom_details: [{ beds: "", image_url: "" }],
  check_in_time: "14:00",
  checkout_time: "11:00",
  pets_allowed: false,
  events_allowed: false,
  smoking_allowed: false,
  has_smoke_alarm: true,
  has_co_alarm: false,
};

// Every half hour, "00:00" to "23:30", for the check-in and checkout pickers
const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) =>
  `${String(Math.floor(i / 2)).padStart(2, "0")}:${i % 2 ? "30" : "00"}`,
);

type Room = ListingFormValues["bedroom_details"][number];

/** One row per bedroom: keeps what's typed, adds empty rows or drops extra ones. */
function resizeRooms(rooms: Room[], count: number): Room[] {
  return Array.from({ length: count }, (_, i) => rooms[i] ?? { beds: "", image_url: "" });
}

/** The edit API sends null for empty optional fields; the form works with "" instead. */
export function toFormValues(listing: ListingFormValues): ListingFormValues {
  return {
    ...listing,
    space: listing.space ?? "",
    guest_access: listing.guest_access ?? "",
    other_notes: listing.other_notes ?? "",
    check_in_time: listing.check_in_time.slice(0, 5), // "14:00:00" -> "14:00"
    checkout_time: listing.checkout_time.slice(0, 5),
    bedroom_details: resizeRooms(
      listing.bedroom_details.map((room) => ({ beds: room.beds, image_url: room.image_url ?? "" })),
      listing.bedrooms,
    ),
  };
}

/** What gets sent: bedrooms are all-or-nothing, and a bedroom can only use one of the listing's photos. */
function toPayload(values: ListingFormValues): ListingFormValues {
  const described = values.bedroom_details.some((room) => room.beds.trim());
  return {
    ...values,
    bedroom_details: described
      ? values.bedroom_details.map((room) => ({
          beds: room.beds,
          image_url: values.image_urls.includes(room.image_url) ? room.image_url : "",
        }))
      : [],
  };
}

/** Quick checks before sending. The backend validates everything again: these only
 *  give faster feedback, they are not what keeps bad data out. */
function validate(values: ListingFormValues): string | null {
  if (values.title.trim().length < 5) return "Give your place a title of at least 5 characters";
  if (values.description.trim().length < 20) return "Write a description of at least 20 characters";
  if (!values.property_type) return "Choose a property type";
  if (!values.category) return "Choose a category";
  if (!values.city.trim() || !values.state.trim()) return "Enter the city and state";
  if (values.image_urls.length === 0) return "Add at least one photo";
  const filled = values.bedroom_details.filter((room) => room.beds.trim()).length;
  if (filled > 0 && filled < values.bedroom_details.length)
    return "Describe the beds in every bedroom, or leave them all empty";
  if (values.bedroom_details.some((room) => room.beds.trim() && room.beds.trim().length < 3))
    return "Describe each bedroom's beds, e.g. \"1 queen bed\"";
  if (!(values.price_per_night > 0)) return "Set a nightly price";
  return null;
}

/** Shared by "Create listing" and "Edit listing". */
export function ListingForm({
  initialValues,
  submitLabel,
  onSubmit,
}: {
  initialValues: ListingFormValues;
  submitLabel: string;
  onSubmit: (values: ListingFormValues) => Promise<void>;
}) {
  const [values, setValues] = useState(initialValues);
  const [options, setOptions] = useState<FilterOptions | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get<FilterOptions>("/api/listings/filters").then(setOptions).catch(() => setOptions(null));
  }, []);

  // Update one field, keeping the rest
  function set<K extends keyof ListingFormValues>(key: K, value: ListingFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const problem = validate(values);
    setError(problem);
    if (problem) return;
    setSaving(true);
    try {
      await onSubmit(toPayload(values));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save. Please try again.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="divide-y divide-line">
      <Section title="Basics">
        <TextField label="Title" value={values.title} onChange={(v) => set("title", v)} maxLength={150} />
        <TextArea
          label="Summary"
          hint="Shown on your listing page. A few short paragraphs about what makes your place special."
          value={values.description}
          onChange={(v) => set("description", v)}
          rows={6}
        />
      </Section>

      <Section title="More about your place (optional)">
        <p className="-mt-3 mb-4 text-sm text-muted">Guests see these when they click Show more.</p>
        <div className="space-y-4">
          <TextArea label="The space" value={values.space} onChange={(v) => set("space", v)} rows={5} />
          <TextArea
            label="Guest access"
            value={values.guest_access}
            onChange={(v) => set("guest_access", v)}
            rows={2}
          />
          <TextArea
            label="Other things to note"
            value={values.other_notes}
            onChange={(v) => set("other_notes", v)}
            rows={2}
          />
        </div>
      </Section>

      <Section title="Which of these best describes your place?">
        <div className="flex flex-wrap gap-3">
          {options?.property_types.map((type) => (
            <Choice key={type} selected={values.property_type === type} onClick={() => set("property_type", type)}>
              {type}
            </Choice>
          ))}
        </div>
        <p className="mb-3 mt-6 text-sm font-semibold">Category (shown in the icon row on the home page)</p>
        <div className="flex flex-wrap gap-3">
          {options?.categories.map((category) => {
            const Icon = CATEGORY_ICONS[category];
            return (
              <Choice key={category} selected={values.category === category} onClick={() => set("category", category)}>
                {Icon && <Icon size={18} strokeWidth={1.6} />}
                {category}
              </Choice>
            );
          })}
        </div>
      </Section>

      <Section title="Where's your place located?">
        <label className="block">
          <span className="mb-1 block text-sm font-semibold">Quick fill</span>
          <select
            defaultValue=""
            onChange={(e) => {
              const preset = CITY_PRESETS.find((p) => p.city === e.target.value);
              if (preset) setValues((v) => ({ ...v, ...preset, country: "India" }));
            }}
            className="w-full rounded-lg border border-line-strong px-4 py-3 outline-none focus:border-ink"
          >
            <option value="">Choose a city to fill in the location…</option>
            {CITY_PRESETS.map((p) => (
              <option key={p.city} value={p.city}>
                {p.city}, {p.state}
              </option>
            ))}
          </select>
        </label>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <TextField label="City" value={values.city} onChange={(v) => set("city", v)} />
          <TextField label="State" value={values.state} onChange={(v) => set("state", v)} />
          <TextField label="Country" value={values.country} onChange={(v) => set("country", v)} />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <NumberField label="Latitude" value={values.latitude} step="any" onChange={(v) => set("latitude", v)} />
          <NumberField label="Longitude" value={values.longitude} step="any" onChange={(v) => set("longitude", v)} />
        </div>
        <p className="mt-2 text-xs text-muted">
          Used for the map on your listing page. In Google Maps, right-click a spot to copy its coordinates.
        </p>
      </Section>

      <Section title="Share some basics about your place">
        <div className="divide-y divide-line">
          <Counter label="Guests" value={values.max_guests} min={1} max={16} onChange={(n) => set("max_guests", n)} />
          <Counter
            label="Bedrooms"
            value={values.bedrooms}
            min={0}
            max={50}
            onChange={(n) =>
              setValues((v) => ({ ...v, bedrooms: n, bedroom_details: resizeRooms(v.bedroom_details, n) }))
            }
          />
          <Counter label="Beds" value={values.beds} min={1} max={50} onChange={(n) => set("beds", n)} />
          <Counter label="Bathrooms" value={values.bathrooms} min={1} max={50} onChange={(n) => set("bathrooms", n)} />
        </div>
      </Section>

      <Section title="Tell guests what your place has to offer">
        <div className="flex flex-wrap gap-3">
          {options?.amenities.map((amenity) => {
            const selected = values.amenity_ids.includes(amenity.id);
            return (
              <Choice
                key={amenity.id}
                selected={selected}
                onClick={() =>
                  set(
                    "amenity_ids",
                    selected
                      ? values.amenity_ids.filter((id) => id !== amenity.id)
                      : [...values.amenity_ids, amenity.id],
                  )
                }
              >
                <AmenityIcon iconKey={amenity.icon} size={18} strokeWidth={1.6} />
                {amenity.name}
              </Choice>
            );
          })}
        </div>
      </Section>

      <Section title="Add some photos">
        <PhotoUrlsInput urls={values.image_urls} onChange={(urls) => set("image_urls", urls)} />
      </Section>

      <Section title="Where guests will sleep (optional)">
        <BedroomsInput
          rooms={values.bedroom_details}
          photos={values.image_urls}
          onChange={(rooms) => set("bedroom_details", rooms)}
        />
      </Section>

      <Section title="House rules and safety">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TimeField label="Check-in after" value={values.check_in_time} onChange={(v) => set("check_in_time", v)} />
          <TimeField label="Checkout before" value={values.checkout_time} onChange={(v) => set("checkout_time", v)} />
        </div>
        <div className="mt-4 divide-y divide-line">
          <ToggleRow label="Pets allowed" checked={values.pets_allowed} onChange={(v) => set("pets_allowed", v)} />
          <ToggleRow label="Events allowed" checked={values.events_allowed} onChange={(v) => set("events_allowed", v)} />
          <ToggleRow label="Smoking allowed" checked={values.smoking_allowed} onChange={(v) => set("smoking_allowed", v)} />
          <ToggleRow label="Smoke alarm" checked={values.has_smoke_alarm} onChange={(v) => set("has_smoke_alarm", v)} />
          <ToggleRow label="Carbon monoxide alarm" checked={values.has_co_alarm} onChange={(v) => set("has_co_alarm", v)} />
        </div>
      </Section>

      <Section title="Set your price">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <NumberField
            label="Price per night (₹)"
            value={values.price_per_night}
            min={1}
            onChange={(v) => set("price_per_night", v)}
          />
          <NumberField
            label="Cleaning fee (₹)"
            value={values.cleaning_fee}
            min={0}
            onChange={(v) => set("cleaning_fee", v)}
          />
        </div>
        <p className="mt-2 text-xs text-muted">
          Price changes apply to new bookings only. Existing guests keep the price they booked at.
        </p>
      </Section>

      {/* Sticky footer with the save button, like Airbnb's listing editor */}
      <div className="sticky bottom-0 z-10 flex items-center justify-between gap-4 border-t border-line bg-canvas py-4">
        <Link href="/host" className="font-semibold underline">
          Cancel
        </Link>
        <div className="flex flex-1 items-center justify-end gap-4">
          {error && <p className="text-right text-sm font-semibold text-brand">{error}</p>}
          <button
            type="submit"
            disabled={saving}
            className="shrink-0 rounded-lg bg-ink px-8 py-3 font-semibold text-canvas hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Saving…" : submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="py-8">
      <h2 className="mb-5 text-[22px] font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function TextField({
  label,
  value,
  onChange,
  maxLength = 100,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold">{label}</span>
      <input
        value={value}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-line-strong px-4 py-3 outline-none focus:border-ink"
      />
    </label>
  );
}

function TextArea({
  label,
  hint,
  value,
  onChange,
  rows,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  rows: number;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold">{label}</span>
      {hint && <span className="mb-2 block text-xs text-muted">{hint}</span>}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        maxLength={5000}
        className="w-full rounded-lg border border-line-strong bg-canvas px-4 py-3 outline-none focus:border-ink"
      />
    </label>
  );
}

function TimeField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-line-strong bg-canvas px-4 py-3 outline-none focus:border-ink"
      >
        {/* Keep a non-standard saved time (e.g. "14:15") selectable */}
        {!TIME_OPTIONS.includes(value) && <option value={value}>{formatTime(value)}</option>}
        {TIME_OPTIONS.map((time) => (
          <option key={time} value={time}>
            {formatTime(time)}
          </option>
        ))}
      </select>
    </label>
  );
}

// A row with a label and an on/off switch, like Airbnb's listing editor
function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-4">
      <span>{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-8 w-12 shrink-0 rounded-full transition-colors ${checked ? "bg-ink" : "bg-line-strong"}`}
      >
        <span
          className={`absolute top-1 h-6 w-6 rounded-full bg-canvas shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-1"
          } left-0`}
        />
      </button>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  min,
  step,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  step?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold">{label}</span>
      <input
        type="number"
        value={Number.isNaN(value) ? "" : value}
        min={min}
        step={step}
        onChange={(e) => onChange(e.target.valueAsNumber)}
        className="w-full rounded-lg border border-line-strong px-4 py-3 outline-none focus:border-ink"
      />
    </label>
  );
}

function Choice({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex items-center gap-2 rounded-xl border px-5 py-3 text-sm ${
        selected ? "border-ink bg-surface font-semibold ring-1 ring-ink" : "border-line hover:border-ink"
      }`}
    >
      {children}
    </button>
  );
}
