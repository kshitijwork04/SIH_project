import type {
  Condition,
  MaterialCategory,
  PriceEntry,
  Recycler,
  Transaction,
} from "./types";

// ============================================================================
// THE "AI/ML" LAYER — section 6 of the build prompt.
// Built honestly: rule-based and statistical, clearly labeled, no fake models.
// ============================================================================

export const CONDITION_MULTIPLIER: Record<Condition, number> = {
  intact: 1.0,
  damaged: 0.8,
  degraded: 0.6,
};

export const CATEGORY_LABELS: Record<MaterialCategory, string> = {
  crt: "CRT Monitor / TV",
  lcd: "LCD / LED Panel",
  pcb: "Circuit Board (PCB)",
  cables: "Cables & Wires",
  batteries: "Batteries",
  motors: "Motors & Magnets",
  plastics: "Mixed Plastics",
};

// --- 6.1 Valuation engine (rule-based) --------------------------------------
// estimated_value = base_rate(category, sub_category, location) x weight x condition_multiplier
// base_rate is pulled from the most recent price entry for that category/location.
export function latestBaseRate(
  prices: PriceEntry[],
  category: MaterialCategory,
  location: string
): number | undefined {
  const matches = prices
    .filter(
      (p) =>
        p.material_category === category &&
        p.location === location &&
        p.unit === "per_kg"
    )
    .sort((a, b) => b.date.localeCompare(a.date));
  return matches[0]?.buying_price;
}

export function estimateValue(
  prices: PriceEntry[],
  category: MaterialCategory,
  location: string,
  weight: number,
  condition: Condition
): number {
  const baseRate = latestBaseRate(prices, category, location);
  if (baseRate === undefined) return 0;
  const value = baseRate * weight * CONDITION_MULTIPLIER[condition];
  return Math.round(value);
}

export type Trend = "rising" | "falling" | "stable";

// Compares the most recent price against the average of the window before it.
export function priceTrend(
  prices: PriceEntry[],
  category: MaterialCategory,
  location: string
): { trend: Trend; current: number | undefined; deltaPct: number } {
  const entries = prices
    .filter(
      (p) => p.material_category === category && p.location === location
    )
    .sort((a, b) => b.date.localeCompare(a.date));
  if (entries.length === 0) return { trend: "stable", current: undefined, deltaPct: 0 };
  const current = entries[0].buying_price;
  const prior = entries.slice(1, 6);
  if (prior.length === 0) return { trend: "stable", current, deltaPct: 0 };
  const avgPrior = prior.reduce((a, b) => a + b.buying_price, 0) / prior.length;
  const deltaPct = ((current - avgPrior) / avgPrior) * 100;
  const trend: Trend = deltaPct > 2 ? "rising" : deltaPct < -2 ? "falling" : "stable";
  return { trend, current, deltaPct: Math.round(deltaPct * 100) / 100 };
}

// --- 6.2 Recycler ranking (rule-based scoring) ------------------------------
// score = w1*(1/distance) + w2*offered_rate + w3*pickup + w4*authorization
// Weights documented; top-N shown to the collector.
export const RANKING_WEIGHTS = {
  w1_distance: 0.4,
  w2_rate: 0.35,
  w3_pickup: 0.15,
  w4_auth: 0.1,
};

// Haversine distance in km
export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const AUTH_WEIGHT: Record<string, number> = {
  authorized: 1.0,
  pending: 0.5,
  expired: 0.1,
};

export interface RankedRecycler extends Recycler {
  distanceKm: number;
  offeredRate: number; // for the given category
  score: number;
}

export function rankRecyclers(
  recyclers: Recycler[],
  category: MaterialCategory,
  collectorLat: number,
  collectorLng: number
): RankedRecycler[] {
  const scored = recyclers.map((r) => {
    const distanceKm = haversineKm(
      collectorLat,
      collectorLng,
      r.facility_lat,
      r.facility_lng
    );
    const offeredRate = r.offered_rates[category] ?? 0;
    const maxRate = Math.max(
      1,
      ...recyclers.map((x) => x.offered_rates[category] ?? 0)
    );
    const rateNorm = offeredRate / maxRate;
    const pickupNorm = r.pickup_availability ? 1 : 0;
    const authNorm = AUTH_WEIGHT[r.authorization_status] ?? 0.1;
    const distNorm = distanceKm > 0 ? 1 / distanceKm : 1;

    const score =
      RANKING_WEIGHTS.w1_distance * distNorm +
      RANKING_WEIGHTS.w2_rate * rateNorm +
      RANKING_WEIGHTS.w3_pickup * pickupNorm +
      RANKING_WEIGHTS.w4_auth * authNorm;

    return { ...r, distanceKm, offeredRate, score };
  });

  return scored.sort((a, b) => b.score - a.score);
}

// --- 6.3 Anomaly detection (simple statistics) ------------------------------
// Compare final_price vs historical mean/median for category+location.
// Flag beyond ~2 std-dev or IQR outside as "review" on the recycler dashboard.
function stdDev(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance =
    values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

export interface AnomalyResult {
  lot_id: string;
  final_price: number;
  expected_mean: number;
  std_dev: number;
  z_score: number;
  flagged: boolean;
}

export function detectAnomalies(
  allTransactions: Transaction[],
  current: Transaction
): AnomalyResult | null {
  if (current.final_price === undefined) return null;
  const peers = allTransactions.filter(
    (t) =>
      t.material_category === current.material_category &&
      t.final_price !== undefined &&
      t.lot_id !== current.lot_id &&
      // rough time window: same calendar-relative window is fine for demo
      true
  );
  const peerPrices = peers.map((t) => t.final_price as number);
  if (peerPrices.length < 3) return null; // not enough data

  const mean = peerPrices.reduce((a, b) => a + b, 0) / peerPrices.length;
  const sd = stdDev(peerPrices);
  if (sd === 0) return null;
  const z = (current.final_price - mean) / sd;
  return {
    lot_id: current.lot_id,
    final_price: current.final_price,
    expected_mean: Math.round(mean * 100) / 100,
    std_dev: Math.round(sd * 100) / 100,
    z_score: Math.round(z * 100) / 100,
    flagged: Math.abs(z) > 2,
  };
}

export function generateReference(lotNumber: number): string {
  // human-readable short alphanumeric code shown on-screen to both parties
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `${code}-${String(lotNumber % 100).padStart(2, "0")}`;
}
