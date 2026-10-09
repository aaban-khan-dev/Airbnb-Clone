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
