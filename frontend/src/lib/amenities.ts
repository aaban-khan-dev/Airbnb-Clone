import {
  AirVent,
  Bath,
  Check,
  Coffee,
  CookingPot,
  Flame,
  Laptop,
  type LucideIcon,
  Mountain,
  SquareParking,
  Sprout,
  TreePalm,
  Tv,
  Utensils,
  WashingMachine,
  WavesHorizontal,
  WavesLadder,
  Wifi,
} from "lucide-react";

// The backend stores an icon key per amenity; this maps it to an icon component
export const AMENITY_ICONS: Record<string, LucideIcon> = {
  wifi: Wifi,
  kitchen: CookingPot,
  parking: SquareParking,
  ac: AirVent,
  washer: WashingMachine,
  tv: Tv,
  workspace: Laptop,
  pool: WavesLadder,
  hot_tub: Bath,
  beach: TreePalm,
  mountain_view: Mountain,
  lake_view: WavesHorizontal,
  fireplace: Flame,
  bbq: Utensils,
  breakfast: Coffee,
  garden: Sprout,
};

export const FALLBACK_AMENITY_ICON: LucideIcon = Check;
