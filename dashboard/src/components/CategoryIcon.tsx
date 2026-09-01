import {
  Monitor,
  Tv,
  Cpu,
  Cable,
  BatteryCharging,
  Fan,
  Recycle,
  type LucideIcon,
} from "lucide-react";
import type { MaterialCategory } from "../lib/types";

const ICONS: Record<MaterialCategory, LucideIcon> = {
  crt: Tv,
  lcd: Monitor,
  pcb: Cpu,
  cables: Cable,
  batteries: BatteryCharging,
  motors: Fan,
  plastics: Recycle,
};

export default function CategoryIcon({
  category,
  size = 28,
  className,
}: {
  category: MaterialCategory;
  size?: number;
  className?: string;
}) {
  const Icon = ICONS[category];
  return <Icon size={size} className={className} />;
}
