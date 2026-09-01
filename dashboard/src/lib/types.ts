// ============================================================================
// THE SIX DATASETS — section 5 of the build prompt.
// These TypeScript types mirror the Postgres/Supabase schema 1:1.
// When Supabase is live, each `Xxx` maps to a table `xxx` with the same fields.
// The data layer (repository.ts) is the only module that knows whether rows
// come from localStorage (now) or Postgres (later).
// ============================================================================

export type LanguageCode = "hi" | "mr" | "en";

export type MaterialCategory =
  | "crt"
  | "lcd"
  | "pcb"
  | "cables"
  | "batteries"
  | "motors"
  | "plastics";

export type Condition = "intact" | "damaged" | "degraded";

export type SourceType = "household" | "commercial" | "repair";

export type AuthorizationStatus = "authorized" | "pending" | "expired";

export type PaymentStatus = "paid" | "pending";

export type TransactionStatus =
  | "created"
  | "matched"
  | "in-transit"
  | "handed-over"
  | "confirmed"
  | "completed";

// 5.1 Material dataset ------------------------------------------------------
export interface Material {
  material_id: string; // UUID
  category: MaterialCategory;
  sub_category?: string;
  description?: string;
  image_ref?: string; // pointer to storage object
  approx_weight: number; // kg
  condition: Condition;
  source_type?: SourceType;
  estimated_value: number; // computed (section 6.1)
}

// 5.2 Price dataset ---------------------------------------------------------
export interface PriceEntry {
  price_id: string; // UUID
  material_category: MaterialCategory;
  sub_category?: string;
  location: string; // city / area
  date: string; // ISO timestamp
  buying_price: number; // what collector is typically paid
  unit: "per_kg" | "per_unit";
  market_range_low: number;
  market_range_high: number;
  recycler_offered_price?: number;
  recycler_id?: string; // FK
}

// 5.3 Recycler / aggregator dataset -----------------------------------------
export interface Recycler {
  recycler_id: string; // UUID
  name: string;
  facility_lat: number;
  facility_lng: number;
  facility_location_name: string;
  materials_accepted: MaterialCategory[];
  authorization_registration_number: string;
  authorization_status: AuthorizationStatus;
  contact_details: string;
  offered_rates: Partial<Record<MaterialCategory, number>>; // jsonb, per kg
  pickup_availability: boolean;
  service_area_radius_km: number;
}

// 5.4 Transaction dataset ----------------------------------------------------
export interface Transaction {
  lot_id: string; // UUID — this IS the unique reference ID
  collector_id: string; // FK
  material_category: MaterialCategory;
  weight: number; // kg
  quoted_price: number; // initial estimate
  final_price?: number; // agreed at handover
  recycler_id?: string; // FK
  collection_lat: number;
  collection_lng: number;
  handover_lat?: number;
  handover_lng?: number;
  date_time: string; // ISO timestamp
  payment_status: PaymentStatus;
  transaction_status: TransactionStatus;
}

// 5.5 Traceability dataset ---------------------------------------------------
export interface TraceabilityRecord {
  lot_id: string; // same as transaction lot_id
  photographs: string[]; // image refs
  weight: number;
  timestamp: string;
  gps_lat: number;
  gps_lng: number;
  handover_reference_number: string; // human-readable short code
  recycler_confirmation?: string; // ISO timestamp when recycler confirms
  subsequent_status?: string; // e.g. "dispatched to processing"
}

// 5.6 Collector dataset (minimal, privacy-conscious) -------------------------
export interface Collector {
  collector_id: string; // UUID
  preferred_language: LanguageCode;
  general_operating_location: string; // area-level only
  operating_lat: number;
  operating_lng: number;
  // transaction/earnings history derived via Transaction FK, not stored
}

// UI / derived helpers -------------------------------------------------------
export interface LatLng {
  lat: number;
  lng: number;
}

export interface SyncStatus {
  online: boolean;
  pendingSyncCount: number;
  lastSyncedAt?: string;
}
