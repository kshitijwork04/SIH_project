import { supabase, uuid } from "./supabase";
import { LEVEL2_PRICES, LEVEL2_RECYCLERS } from "./seed";
import {
  CATEGORIES,
  type CollectorProfile,
  type Material,
  type Price,
  type PriceBoardRow,
  type Recycler,
  type Traceability,
  type TraceStatus,
  type Transaction,
} from "./types";

// ============================================================================
// Storage layer (Level 2) — Supabase is the SOURCE OF TRUTH.
//
// Supabase is treated as the real multi-user backend after the Level 2 schema
// (see supabase/setup_level2.sql) is applied to the database:
//   - Reads query Supabase first; localStorage is only an offline cache.
//   - Writes go to Supabase first; localStorage is updated as a fallback so the
//     app keeps working offline (and on a dev machine without a live DB).
//   - When Supabase is not configured, the app runs fully self-contained on the
//     seeded localStorage layer using the module-level seed constants below.
//
// The module-level LEVEL2_PRICES / LEVEL2_RECYCLERS constants act as the
// guaranteed fallback so the UI is never empty (7 categories, real trends,
// ranked recyclers) even if the database has not been seeded yet.
// ============================================================================

const LS_PRICES = "kc-l2-prices";
const LS_RECYCLERS = "kc-l2-recyclers";
const LS_MATERIALS = "kc-l2-materials";
const LS_TXNS = "kc-l2-transactions";
const LS_TRACE = "kc-l2-traceability";
const LS_COLLECTORS = "kc-l2-collectors";

function readLocal<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function writeLocal<T>(key: string, rows: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(rows));
  } catch {
    /* ignore */
  }
}

// Seed localStorage only when Supabase is NOT configured, so an offline
// /no-backend environment still gets the reference dataset.
export function ensureLocalSeed(): void {
  if (supabase) return;
  try {
    if (!localStorage.getItem(LS_PRICES)) writeLocal(LS_PRICES, LEVEL2_PRICES);
    if (!localStorage.getItem(LS_RECYCLERS)) writeLocal(LS_RECYCLERS, LEVEL2_RECYCLERS);
    if (!localStorage.getItem(LS_MATERIALS)) writeLocal(LS_MATERIALS, []);
    if (!localStorage.getItem(LS_TXNS)) writeLocal(LS_TXNS, []);
    if (!localStorage.getItem(LS_TRACE)) writeLocal(LS_TRACE, []);
    if (!localStorage.getItem(LS_COLLECTORS)) writeLocal(LS_COLLECTORS, []);
  } catch {
    /* ignore */
  }
}

// Best-effort parse of AsyncStorage-like supabase rows -> typed array.
async function dbRows<T>(table: string): Promise<T[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from(table).select("*");
  if (error) return null;
  return (data as T[]) ?? [];
}

// ============================================================================
// Prices + trends (Step 2.2)
// ============================================================================

export async function fetchAllPrices(): Promise<Price[]> {
  ensureLocalSeed();
  const db = await dbRows<Price>("prices");
  if (db !== null && db.some((p) => typeof p.recycler_offered_price === "number")) {
    if (db.length > 0) {
      writeLocal(LS_PRICES, db); // refresh offline cache
      return db as Price[];
    }
    const local = readLocal<Price>(LS_PRICES);
    return local.length > 0 ? local : (LEVEL2_PRICES as unknown as Price[]);
  }
  const local = readLocal<Price>(LS_PRICES);
  return local.length > 0 ? local : (LEVEL2_PRICES as unknown as Price[]);
}

function latestRows(category: string, prices: Price[]): Price[] {
  return prices
    .filter((p) => p.category === category)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

function currentPriceOf(category: string, prices: Price[]): number {
  return latestRows(category, prices)[0]?.recycler_offered_price ?? 0;
}

function lowHighOf(category: string, prices: Price[]): { low: number; high: number } {
  const latest = latestRows(category, prices)[0];
  return { low: latest?.market_range_low ?? 0, high: latest?.market_range_high ?? 0 };
}

// Compare the average of the most recent N entries against the previous N.
export function computeTrend(
  category: string,
  prices: Price[],
  n = 3
): "up" | "down" | "stable" {
  const rows = latestRows(category, prices);
  if (rows.length < 2) return "stable";
  const recent = rows.slice(0, n).map((r) => r.recycler_offered_price);
  const prior = rows.slice(n, n + n).map((r) => r.recycler_offered_price);
  if (prior.length === 0) return "stable";
  const avgRecent = recent.reduce((s, v) => s + v, 0) / recent.length;
  const avgPrior = prior.reduce((s, v) => s + v, 0) / prior.length;
  const delta = avgRecent - avgPrior;
  if (Math.abs(delta) < 0.5) return "stable";
  return delta > 0 ? "up" : "down";
}

export async function fetchPriceBoard(): Promise<PriceBoardRow[]> {
  const prices = await fetchAllPrices();
  const rows: PriceBoardRow[] = [];
  for (const category of CATEGORIES) {
    const current = currentPriceOf(category, prices) || latestLocalFromSeed(category);
    if (current <= 0) continue;
    const { low, high } = lowHighOf(category, prices);
    rows.push({ category, current, low, high, trend: computeTrend(category, prices) });
  }
  return rows;
}

function latestLocalFromSeed(category: string): number {
  const rows = latestRows(category, LEVEL2_PRICES);
  return rows[0]?.recycler_offered_price ?? 0;
}

// ============================================================================
// Recyclers + ranking (Steps 2.3, 2.4)
// ============================================================================

export async function fetchRecyclers(): Promise<Recycler[]> {
  ensureLocalSeed();
  const db = await dbRows<Recycler>("recyclers");
  if (db !== null && db.some((r) => typeof r.offered_rate === "number")) {
    if (db.length > 0) {
      writeLocal(LS_RECYCLERS, db); // refresh offline cache
      return db as Recycler[];
    }
    const local = readLocal<Recycler>(LS_RECYCLERS);
    return local.length > 0 ? local : (LEVEL2_RECYCLERS as unknown as Recycler[]);
  }
  const local = readLocal<Recycler>(LS_RECYCLERS);
  return local.length > 0 ? local : (LEVEL2_RECYCLERS as unknown as Recycler[]);
}

// Step 2.4 — ranking weights (documented):
//   w1 = 0.30  distance closeness
//   w2 = 0.30  offered rate
//   w3 = 0.20  pickup availability
//   w4 = 0.20  authorization status
function authWeight(status: Recycler["authorization_status"]): number {
  switch (status) {
    case "authorized":
      return 1;
    case "pending":
      return 0.6;
    case "expired":
      return 0.1;
    default:
      return 0;
  }
}

export function recyclerScore(r: Recycler): number {
  const w1 = 0.3;
  const w2 = 0.3;
  const w3 = 0.2;
  const w4 = 0.2;

  const distNorm = r.distance_km > 0 ? Math.min(1, 5 / r.distance_km) : 0.4;
  const rateNorm = Math.min(1, r.offered_rate / 250);
  const pickupNorm = r.pickup_availability ? 1 : 0;

  return (
    w1 * distNorm +
    w2 * rateNorm +
    w3 * pickupNorm +
    w4 * authWeight(r.authorization_status)
  );
}

export async function fetchRankedRecyclers(): Promise<Recycler[]> {
  const all = await fetchRecyclers();
  return [...all].sort((a, b) => recyclerScore(b) - recyclerScore(a));
}

// ============================================================================
// Materials / lots (Step 2.1)
// ============================================================================

export async function createMaterial(input: {
  category: string;
  sub_category: string;
  description: string;
  condition: string;
  source_type: string;
  weight: number;
  estimated_value: number;
  photo_url: string | null;
}): Promise<Material> {
  const row: Material = {
    id: uuid(),
    category: input.category,
    sub_category: input.sub_category,
    description: input.description,
    condition: input.condition,
    source_type: input.source_type,
    weight: input.weight,
    estimated_value: input.estimated_value,
    photo_url: input.photo_url,
    created_at: new Date().toISOString(),
  };

  if (supabase) {
    const { error } = await supabase.from("materials").insert(row as never);
    if (!error) {
      const all = readLocal<Material>(LS_MATERIALS);
      all.push(row);
      writeLocal(LS_MATERIALS, all);
      return row;
    }
  }

  // Supabase not configured or write failed -> keep local so nothing is lost.
  ensureLocalSeed();
  const all = readLocal<Material>(LS_MATERIALS);
  all.push(row);
  writeLocal(LS_MATERIALS, all);
  return row;
}

export async function fetchMaterial(id: string): Promise<Material | null> {
  ensureLocalSeed();
  if (supabase) {
    const { data, error } = await supabase.from("materials").select("*").eq("id", id).maybeSingle();
    if (!error && data) return data as unknown as Material;
  }
  return readLocal<Material>(LS_MATERIALS).find((m) => m.id === id) ?? null;
}

export async function fetchMaterialsByIds(ids: string[]): Promise<Material[]> {
  ensureLocalSeed();
  if (ids.length === 0) return [];
  if (supabase) {
    const { data, error } = await supabase.from("materials").select("*").in("id", ids);
    if (!error && data && data.length > 0) return data as unknown as Material[];
  }
  const all = readLocal<Material>(LS_MATERIALS);
  return all.filter((m) => ids.includes(m.id));
}

// ============================================================================
// Transactions (Step 1.x + 2.10)
// ============================================================================

export async function createTransaction(input: {
  lot_id: string;
  collector_id: string;
  recycler_id: string;
  estimated_value: number;
}): Promise<Transaction> {
  const row: Transaction = {
    id: uuid(),
    lot_id: input.lot_id,
    collector_id: input.collector_id,
    recycler_id: input.recycler_id,
    status: "pending",
    payment_status: "pending",
    estimated_value: input.estimated_value,
    final_price: input.estimated_value,
    created_at: new Date().toISOString(),
  };

  if (supabase) {
    const { error } = await supabase.from("transactions").insert(row as never);
    if (!error) {
      const all = readLocal<Transaction>(LS_TXNS);
      all.push(row);
      writeLocal(LS_TXNS, all);
      return row;
    }
  }

  ensureLocalSeed();
  const all = readLocal<Transaction>(LS_TXNS);
  all.push(row);
  writeLocal(LS_TXNS, all);
  return row;
}

export async function fetchTransactionsByCollector(collectorId: string): Promise<Transaction[]> {
  ensureLocalSeed();
  if (supabase) {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("collector_id", collectorId)
      .order("created_at", { ascending: false });
    const rows = (data as Transaction[]) ?? [];
    const complete = rows.every(
      (t) => typeof t.final_price === "number" && typeof t.payment_status === "string"
    );
    if (!error && rows.length > 0 && complete) {
      writeLocal(LS_TXNS, ([...rows]));
      return rows;
    }
  }
  return readLocal<Transaction>(LS_TXNS)
    .filter((x) => x.collector_id === collectorId)
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
}

export async function fetchPendingTransactions(): Promise<Transaction[]> {
  ensureLocalSeed();
  if (supabase) {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    const rows = (data as Transaction[]) ?? [];
    const complete = rows.every(
      (t) => typeof t.final_price === "number" && typeof t.payment_status === "string"
    );
    if (!error && rows.length > 0 && complete) return rows;
  }
  return readLocal<Transaction>(LS_TXNS)
    .filter((x) => x.status === "pending")
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
}

// Step 2.10 — confirm with optional final price (defaults to quoted value).
export async function confirmTransaction(id: string, finalPrice?: number): Promise<Transaction> {
  const base = readLocal<Transaction>(LS_TXNS).find((x) => x.id === id);
  const final = finalPrice ?? base?.estimated_value ?? 0;

  if (supabase) {
    const { error } = await supabase
      .from("transactions")
      .update({
        status: "confirmed",
        payment_status: "paid",
        final_price: final,
      })
      .eq("id", id);
    if (!error) {
      const all = readLocal<Transaction>(LS_TXNS);
      const idx = all.findIndex((x) => x.id === id);
      if (idx !== -1) {
        all[idx] = { ...all[idx], status: "confirmed", payment_status: "paid", final_price: final };
        writeLocal(LS_TXNS, all);
        return all[idx];
      }
      return { ...(base as Transaction), id, status: "confirmed", payment_status: "paid", final_price: final };
    }
  }

  ensureLocalSeed();
  const all = readLocal<Transaction>(LS_TXNS);
  const idx = all.findIndex((x) => x.id === id);
  if (idx === -1) throw new Error("Transaction not found");
  all[idx] = {
    ...all[idx],
    status: "confirmed",
    payment_status: "paid",
    final_price: final,
  };
  writeLocal(LS_TXNS, all);
  return all[idx];
}

// ============================================================================
// Traceability (Step 2.5)
// ============================================================================

function makeHandoverRef(): string {
  const ts = new Date().getTime().toString(36).toUpperCase().slice(-4);
  const rand = Math.random().toString(36).toUpperCase().slice(2, 6);
  return `KC-${ts}-${rand}`;
}

async function getPosition(): Promise<{ lat: number | null; lng: number | null }> {
  if (typeof navigator !== "undefined" && "geolocation" in navigator) {
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 5000,
          enableHighAccuracy: false,
        })
      );
      return { lat: pos.coords.latitude, lng: pos.coords.longitude };
    } catch {
      return { lat: null, lng: null };
    }
  }
  return { lat: null, lng: null };
}

export async function createTraceability(input: {
  lot_id: string;
  photo_url: string | null;
  weight: number;
  transaction_id: string;
}): Promise<Traceability> {
  const { lat, lng } = await getPosition();
  const timestamp = new Date().toISOString();
  const ref = makeHandoverRef();
  const row: Traceability = {
    id: uuid(),
    lot_id: input.lot_id,
    photo_url: input.photo_url,
    weight: input.weight,
    timestamp,
    gps_lat: lat,
    gps_lng: lng,
    handover_reference_number: ref,
    recycler_confirmed: false,
    subsequent_status: "handed_over",
  };

  if (supabase) {
    const { error } = await supabase.from("traceability").insert(row as never);
    if (!error) {
      const all = readLocal<Traceability>(LS_TRACE);
      all.push(row);
      writeLocal(LS_TRACE, all);
      return row;
    }
  }

  ensureLocalSeed();
  const all = readLocal<Traceability>(LS_TRACE);
  all.push(row);
  writeLocal(LS_TRACE, all);
  return row;
}

export async function confirmTraceabilityByLot(lotId: string): Promise<Traceability | null> {
  if (supabase) {
    const { error } = await supabase
      .from("traceability")
      .update({ recycler_confirmed: true, subsequent_status: "confirmed" })
      .eq("lot_id", lotId);
    if (!error) {
      const all = readLocal<Traceability>(LS_TRACE);
      const idx = all.findIndex((x) => x.lot_id === lotId);
      if (idx !== -1) {
        all[idx] = { ...all[idx], recycler_confirmed: true, subsequent_status: "confirmed" };
        writeLocal(LS_TRACE, all);
        return all[idx];
      }
    }
  }

  ensureLocalSeed();
  const all = readLocal<Traceability>(LS_TRACE);
  const idx = all.findIndex((x) => x.lot_id === lotId);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], recycler_confirmed: true, subsequent_status: "confirmed" };
  writeLocal(LS_TRACE, all);
  return all[idx];
}

export async function fetchTraceabilityForCollector(collectorId: string): Promise<Traceability[]> {
  ensureLocalSeed();
  const txns = await fetchTransactionsByCollector(collectorId);
  const lotIds = txns.map((t) => t.lot_id);
  if (lotIds.length === 0) return [];
  if (supabase) {
    const { data, error } = await supabase
      .from("traceability")
      .select("*")
      .in("lot_id", lotIds)
      .order("timestamp", { ascending: false });
    if (!error && data && data.length > 0) return data as unknown as Traceability[];
  }
  return readLocal<Traceability>(LS_TRACE)
    .filter((t) => lotIds.includes(t.lot_id))
    .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
}

export function journeyStatus(t: Traceability): TraceStatus {
  if (t.recycler_confirmed) return "confirmed";
  if (t.subsequent_status === "handed_over") return "handed_over";
  return "matched";
}

// ============================================================================
// Collector minimal profile (Step 2.6)
// ============================================================================

export async function saveCollectorProfile(profile: CollectorProfile): Promise<void> {
  if (supabase) {
    const { error } = await supabase.from("collectors").upsert({
      id: profile.id,
      preferred_language: profile.preferred_language,
      general_operating_location: profile.general_operating_location,
    });
    if (!error) {
      const all = readLocal<CollectorProfile>(LS_COLLECTORS);
      const rest = all.filter((c) => c.id !== profile.id);
      rest.push(profile);
      writeLocal(LS_COLLECTORS, rest);
      return;
    }
  }

  ensureLocalSeed();
  const all = readLocal<CollectorProfile>(LS_COLLECTORS);
  const rest = all.filter((c) => c.id !== profile.id);
  rest.push(profile);
  writeLocal(LS_COLLECTORS, rest);
}

export async function fetchCollectorProfile(id: string): Promise<CollectorProfile | null> {
  ensureLocalSeed();
  if (supabase) {
    const { data, error } = await supabase.from("collectors").select("*").eq("id", id).maybeSingle();
    if (!error && data) return data as unknown as CollectorProfile;
  }
  return readLocal<CollectorProfile>(LS_COLLECTORS).find((c) => c.id === id) ?? null;
}
