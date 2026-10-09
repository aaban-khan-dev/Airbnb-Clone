import {
  Building,
  Landmark,
  type LucideIcon,
  Mountain,
  Sailboat,
  Tractor,
  TreePalm,
  TreePine,
  WavesLadder,
} from "lucide-react";

// Icon for each category in the category bar. Order here = order on screen.
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "Amazing views": Mountain,
  Beachfront: TreePalm,
  Cabins: TreePine,
  "Amazing pools": WavesLadder,
  "Iconic cities": Building,
  "Historical homes": Landmark,
  Lakefront: Sailboat,
  Countryside: Tractor,
};
