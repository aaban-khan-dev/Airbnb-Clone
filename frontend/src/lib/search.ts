// The search state lives in the page URL (?location=goa&guests=2...).
// That makes searches shareable, and the browser back button just works.
// The same parameter names are sent to the backend, so one function builds both.

export type SearchFilters = {
  location?: string;
  checkIn?: string; // "yyyy-MM-dd"
  checkOut?: string;
  guests?: number;
  category?: string;
  propertyTypes: string[];
  amenityIds: number[];
  minPrice?: number;
  maxPrice?: number;
};

type ParamsLike = { get(name: string): string | null; getAll(name: string): string[] };

function toNumber(value: string | null): number | undefined {
  if (value === null || value === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export function parseFilters(params: ParamsLike): SearchFilters {
  const checkIn = params.get("check_in") ?? undefined;
  const checkOut = params.get("check_out") ?? undefined;
  const bothDates = Boolean(checkIn && checkOut); // ignore half a date range
  return {
    location: params.get("location") ?? undefined,
    checkIn: bothDates ? checkIn : undefined,
    checkOut: bothDates ? checkOut : undefined,
    guests: toNumber(params.get("guests")),
    category: params.get("category") ?? undefined,
    propertyTypes: params.getAll("property_types"),
    amenityIds: params.getAll("amenity_ids").map(Number).filter(Number.isFinite),
    minPrice: toNumber(params.get("min_price")),
    maxPrice: toNumber(params.get("max_price")),
  };
}

export function filtersToQuery(filters: SearchFilters): string {
  const params = new URLSearchParams();
  if (filters.location) params.set("location", filters.location);
  if (filters.checkIn && filters.checkOut) {
    params.set("check_in", filters.checkIn);
    params.set("check_out", filters.checkOut);
  }
  if (filters.guests) params.set("guests", String(filters.guests));
  if (filters.category) params.set("category", filters.category);
  filters.propertyTypes.forEach((t) => params.append("property_types", t));
  filters.amenityIds.forEach((id) => params.append("amenity_ids", String(id)));
  if (filters.minPrice !== undefined) params.set("min_price", String(filters.minPrice));
  if (filters.maxPrice !== undefined) params.set("max_price", String(filters.maxPrice));
  return params.toString();
}

// Number shown on the "Filters" button badge
export function countActiveFilters(filters: SearchFilters): number {
  const priceSet = filters.minPrice !== undefined || filters.maxPrice !== undefined;
  return filters.propertyTypes.length + filters.amenityIds.length + (priceSet ? 1 : 0);
}

export const POPULAR_DESTINATIONS = [
  { name: "Goa", hint: "For sights like Baga Beach" },
  { name: "Kerala", hint: "Backwaters and tea estates" },
  { name: "Manali", hint: "For its mountain views" },
  { name: "Jaipur", hint: "For its historic havelis" },
  { name: "Mumbai", hint: "For its sea-facing apartments" },
  { name: "Rishikesh", hint: "Popular riverside destination" },
];
