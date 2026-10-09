// TypeScript shapes of the JSON the backend returns. They mirror the Pydantic schemas.

export type User = {
  id: number;
  name: string;
  email: string;
  avatar_url: string | null;
  bio: string | null;
  is_superhost: boolean;
  is_host: boolean;
};

export type Amenity = {
  id: number;
  name: string;
  icon: string;
};

export type ListingCard = {
  id: number;
  title: string;
  city: string;
  state: string;
  country: string;
  property_type: string;
  category: string;
  price_per_night: number;
  max_guests: number;
  bedrooms: number;
  beds: number;
  latitude: number;
  longitude: number;
  image_urls: string[];
  rating: number | null;
  review_count: number;
  host_is_superhost: boolean;
};

export type ListingPage = {
  items: ListingCard[];
  total: number;
  page: number;
  page_size: number;
  has_more: boolean;
};

export type FilterOptions = {
  categories: string[];
  property_types: string[];
  amenities: Amenity[];
  min_price: number;
  max_price: number;
};

export type Host = {
  id: number;
  name: string;
  avatar_url: string | null;
  bio: string | null;
  is_superhost: boolean;
  created_at: string;
};

export type Review = {
  id: number;
  author_name: string;
  author_avatar_url: string | null;
  rating: number;
  comment: string;
  created_at: string;
};

export type DateRangeOut = {
  check_in: string;
  check_out: string;
};

export type Bedroom = {
  beds: string; // e.g. "1 double bed, 1 single bed"
  image_url: string | null;
};

export type ListingDetail = ListingCard & {
  description: string; // the summary shown on the page
  space: string | null; // the rest of "About this space", shown in the Show more dialog
  guest_access: string | null;
  other_notes: string | null;
  bedroom_details: Bedroom[];
  bathrooms: number;
  cleaning_fee: number;
  host: Host;
  amenities: Amenity[];
  reviews: Review[];
  unavailable_ranges: DateRangeOut[];
};

export type PriceQuote = {
  check_in: string;
  check_out: string;
  nights: number;
  nightly_price: number;
  subtotal: number;
  cleaning_fee: number;
  service_fee: number;
  total_price: number;
  available: boolean;
};

export type Booking = {
  id: number;
  listing: {
    id: number;
    title: string;
    city: string;
    state: string;
    image_url: string | null;
    host_name: string;
  };
  guest: { id: number; name: string; avatar_url: string | null };
  check_in: string;
  check_out: string;
  nights: number;
  num_guests: number;
  nightly_price: number;
  cleaning_fee: number;
  service_fee: number;
  total_price: number;
  status: "confirmed" | "cancelled";
  created_at: string;
  review: { rating: number; comment: string; created_at: string } | null;
};

// Values of the host's create/edit listing form (matches the backend's ListingWrite)
export type ListingFormValues = {
  title: string;
  description: string;
  property_type: string;
  category: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  price_per_night: number;
  cleaning_fee: number;
  max_guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  image_urls: string[];
  amenity_ids: number[];
  // Optional extras. Empty strings are saved as "not set".
  space: string;
  guest_access: string;
  other_notes: string;
  bedroom_details: { beds: string; image_url: string }[];
};

export type HostListingSummary = {
  id: number;
  title: string;
  city: string;
  state: string;
  property_type: string;
  price_per_night: number;
  cover_image_url: string | null;
  rating: number | null;
  review_count: number;
  upcoming_bookings: number;
  total_earnings: number;
};
