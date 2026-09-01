export type TransactionStatus = "pending" | "confirmed";
export type PaymentStatus = "pending" | "paid";
export type AuthStatus = "authorized" | "pending" | "expired";
export type Lang = "en" | "hi" | "mr";
export type TraceStatus =
  | "created"
  | "matched"
  | "handed_over"
  | "confirmed";

// Full set of 7 material categories.
export const CATEGORIES = [
  "CRTs",
  "LCD panels",
  "PCBs",
  "Cables",
  "Batteries",
  "Motors & magnets",
  "Mixed plastics",
] as const;
export type Category = (typeof CATEGORIES)[number];

// Condition + source dropdown options (Step 2.1).
export const CONDITIONS = ["New", "Used", "Damaged", "Scrap"] as const;
export const SOURCE_TYPES = [
  "Home",
  "Workshop",
  "Office",
  "Market",
  "Dump",
] as const;

export interface Material {
  id: string;
  category: string;
  sub_category: string;
  description: string;
  condition: string;
  source_type: string;
  weight: number;
  estimated_value: number;
  photo_url: string | null;
  created_at: string;
}

// A single historical price observation for a category (Step 2.2).
export interface Price {
  id: string;
  category: string;
  sub_category: string;
  location: string;
  date: string;
  market_range_low: number;
  market_range_high: number;
  recycler_offered_price: number;
  recycler_id: string | null;
}

export interface PriceBoardRow {
  category: string;
  current: number;
  trend: "up" | "down" | "stable";
  low: number;
  high: number;
}

export interface Recycler {
  id: string;
  name: string;
  materials_accepted: string;
  offered_rate: number;
  authorization_registration_number: string;
  authorization_status: AuthStatus;
  facility_location: string;
  service_area: string;
  contact_details: string;
  pickup_availability: boolean;
  distance_km: number;
}

export interface Transaction {
  id: string;
  lot_id: string;
  collector_id: string;
  recycler_id: string;
  status: TransactionStatus;
  payment_status: PaymentStatus;
  estimated_value: number;
  final_price: number;
  created_at: string;
}

// Step 2.5 — handover traceability record.
export interface Traceability {
  id: string;
  lot_id: string;
  photo_url: string | null;
  weight: number;
  timestamp: string;
  gps_lat: number | null;
  gps_lng: number | null;
  handover_reference_number: string;
  recycler_confirmed: boolean;
  subsequent_status: TraceStatus;
}

// Step 2.6 — collector minimal profile. Deliberately NO name / ID proof /
// precise address fields.
export interface CollectorProfile {
  id: string;
  preferred_language: Lang;
  general_operating_location: string;
}

export const CATEGORY_INFO: Record<string, { hasSub: string[] }> = {
  CRTs: { hasSub: ["CRT TV", "CRT monitor", "Other CRT"] },
  "LCD panels": { hasSub: ["LCD screen", "LED screen", "OLED panel"] },
  PCBs: { hasSub: ["Motherboard", "Mobile PCB", "Power board", "Other PCB"] },
  Cables: { hasSub: ["Copper cable", "Power cord", "Data cable", "Other cable"] },
  Batteries: { hasSub: ["Lithium", "Lead-acid", "NiMH", "Other battery"] },
  "Motors & magnets": { hasSub: ["AC motor", "DC motor", "Hard-drive magnet"] },
  "Mixed plastics": { hasSub: ["ABS", "PP", "PVC", "Mixed/other plastic"] },
};
