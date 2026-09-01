import type {
  Collector,
  Material,
  MaterialCategory,
  PriceEntry,
  Recycler,
  TraceabilityRecord,
  Transaction,
} from "./types";
import { NEW_COLLECTOR, SEED_PRICES, SEED_RECYCLERS } from "@/data/seed";
import { CATEGORY_LABELS, estimateValue, generateReference } from "./engine";

// ============================================================================
// DATA LAYER (section 7 offline-first; section 11.2 backend)
// ----------------------------------------------------------------------------
// This is the ONLY module that knows where data lives. Right now it persists to
// localStorage (works offline, demoable with zero backend). Later, a Supabase
// implementation of the same interface (same method signatures, same types)
// replaces the bodies — the rest of the app does not change.
//
// Offline queue: actions taken "offline" (simulated / real) are pushed to a
// sync_queue. On sync, queued writes flush to the source (here: write-through).
// Last-write-wins conflict handling, stated plainly (spec section 7 / 9).
// ============================================================================

const STORAGE_VERSION = "kc-v2";
const KEY = `${STORAGE_VERSION}.state`;

// uuid() is only available in secure contexts (https or localhost).
// When served over a LAN IP (e.g. http://10.x.x.x) it is undefined and would
// throw, breaking onboarding create flows. Fall back to a Math.random UUID.
function uuid(): string {
  const c = typeof crypto !== "undefined" ? crypto.randomUUID?.() : undefined;
  if (c) return c;
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (ch) => {
    const r = (Math.random() * 16) | 0;
    const v = ch === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

interface PersistedState {
  collector: Collector;
  onboarded: boolean;
  transactions: Transaction[];
  traceability: Record<string, TraceabilityRecord>;
  materials: Material[];
  syncQueue: { id: string; table: string; operation: string; payload: unknown }[];
  synced: boolean;
  lastSyncedAt?: string;
  lotCounter: number;
  // Live catalog pulled from Supabase (falls back to seed when offline).
  recyclers: Recycler[];
  prices: PriceEntry[];
  catalogSource: "seed" | "supabase";
}

export interface NewLotInput {
  category: MaterialCategory;
  weight: number;
  condition: Material["condition"];
  source_type?: Material["source_type"];
  photographs: string[];
  note?: string;
}

function defaultState(): PersistedState {
  return {
    collector: NEW_COLLECTOR,
    onboarded: false,
    transactions: [],
    traceability: {},
    materials: [],
    syncQueue: [],
    synced: true,
    lastSyncedAt: new Date().toISOString(),
    lotCounter: 0,
    recyclers: SEED_RECYCLERS,
    prices: SEED_PRICES,
    catalogSource: "seed",
  };
}

function load(): PersistedState {
  if (typeof window === "undefined") return defaultState();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return defaultState();
    return { ...defaultState(), ...(JSON.parse(raw) as PersistedState) };
  } catch {
    return defaultState();
  }
}

function save(state: PersistedState): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(state));
}

let state: PersistedState | null = null;
const listeners = new Set<() => void>();
let cloudHook: (() => void) | undefined;

// Register a callback fired (non-blocking) after every local write, so the app
// can push changes to the live backend. Set to undefined when the backend is off.
export function setCloudHook(fn: (() => void) | undefined): void {
  cloudHook = fn;
}

export function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function emit(): void {
  listeners.forEach((fn) => fn());
}

function getState(): PersistedState {
  if (!state) state = load();
  return state;
}

// --- Public read API ---------------------------------------------------------
export const repo = {
  getPrices(): PriceEntry[] {
    return getState().prices;
  },

  getRecyclers(): Recycler[] {
    return getState().recyclers;
  },

  getCatalogSource(): "seed" | "supabase" {
    return getState().catalogSource;
  },

  getCollector(): Collector {
    return getState().collector;
  },

  isOnboarded(): boolean {
    return getState().onboarded;
  },

  getTransactions(): Transaction[] {
    return getState().transactions;
  },

  getTransaction(lotId: string): Transaction | undefined {
    return getState().transactions.find((t) => t.lot_id === lotId);
  },

  getMaterials(): Material[] {
    return getState().materials;
  },

  getTraceability(lotId: string): TraceabilityRecord | undefined {
    return getState().traceability[lotId];
  },

  getSyncStatus(): { synced: boolean; lastSyncedAt?: string; queueLength: number } {
    const s = getState();
    return {
      synced: s.synced,
      lastSyncedAt: s.lastSyncedAt,
      queueLength: s.syncQueue.length,
    };
  },
};

// --- Write API (queues + persists) ------------------------------------------
function queueWrite(
  table: string,
  operation: string,
  payload: unknown
): { table: string; operation: string; payload: unknown; id: string } {
  return { id: uuid(), table, operation, payload };
}

export const repoWrite = {
  createLot(input: NewLotInput): Transaction {
    const s = getState();
    const lotCounter = s.lotCounter + 1;
    const lotId = uuid();
    const now = new Date().toISOString();
    const lat = s.collector.operating_lat ?? 28.5431;
    const lng = s.collector.operating_lng ?? 77.2639;
    const estimated = estimateValue(
      s.prices,
      input.category,
      "Okhla, Delhi",
      input.weight,
      input.condition
    );
    const material: Material = {
      material_id: uuid(),
      category: input.category,
      approx_weight: input.weight,
      condition: input.condition,
      source_type: input.source_type,
      image_ref: input.photographs[0],
      description: input.note,
      estimated_value: estimated,
    };
    const tx: Transaction = {
      lot_id: lotId,
      collector_id: s.collector.collector_id,
      material_category: input.category,
      weight: input.weight,
      quoted_price: estimated,
      collection_lat: lat,
      collection_lng: lng,
      date_time: now,
      payment_status: "pending",
      transaction_status: "created",
    };
    const trace: TraceabilityRecord = {
      lot_id: lotId,
      photographs: input.photographs,
      weight: input.weight,
      timestamp: now,
      gps_lat: lat,
      gps_lng: lng,
      handover_reference_number: generateReference(lotCounter),
    };
    s.transactions = [tx, ...s.transactions];
    s.materials = [material, ...s.materials];
    s.traceability[lotId] = trace;
    s.lotCounter = lotCounter;
    s.syncQueue = [...s.syncQueue, queueWrite("transactions", "insert", tx)];
    s.synced = false;
    save(s);
    emit();
    cloudHook?.();
    return tx;
  },

  setCollectorLanguage(lang: Collector["preferred_language"]): void {
    const s = getState();
    s.collector = { ...s.collector, preferred_language: lang };
    s.syncQueue = [...s.syncQueue, queueWrite("collectors", "update", s.collector)];
    s.synced = false;
    save(s);
    emit();
    cloudHook?.();
  },

  completeOnboarding(area: string, lat?: number, lng?: number): void {
    const s = getState();
    s.collector = {
      ...s.collector,
      general_operating_location: area,
      ...(lat !== undefined ? { operating_lat: lat } : {}),
      ...(lng !== undefined ? { operating_lng: lng } : {}),
    };
    s.onboarded = true;
    s.syncQueue = [...s.syncQueue, queueWrite("collectors", "update", s.collector)];
    s.synced = false;
    save(s);
    emit();
    cloudHook?.();
  },

  // Replace the local catalog with live data pulled from Supabase (if it loads,
  // otherwise the seed catalog stays). Doesn't bump the sync queue — this is a
  // read-path refresh, not a user action.
  setCatalog(recyclers: Recycler[], prices: PriceEntry[]): void {
    const s = getState();
    s.recyclers = recyclers.length ? recyclers : s.recyclers;
    s.prices = prices.length ? prices : s.prices;
    s.catalogSource = recyclers.length || prices.length ? "supabase" : s.catalogSource;
    save(s);
    emit();
  },

  setCollectorLocation(area: string, lat?: number, lng?: number): void {
    const s = getState();
    s.collector = {
      ...s.collector,
      general_operating_location: area,
      ...(lat !== undefined ? { operating_lat: lat } : {}),
      ...(lng !== undefined ? { operating_lng: lng } : {}),
    };
    s.syncQueue = [...s.syncQueue, queueWrite("collectors", "update", s.collector)];
    s.synced = false;
    save(s);
    emit();
    cloudHook?.();
  },

  matchLot(lotId: string, recyclerId: string): void {
    const s = getState();
    const tx = s.transactions.find((t) => t.lot_id === lotId);
    if (!tx) return;
    tx.recycler_id = recyclerId;
    tx.transaction_status = "matched";
    s.transactions = s.transactions.map((t) => (t.lot_id === lotId ? tx : t));
    s.syncQueue = [...s.syncQueue, queueWrite("transactions", "update", tx)];
    s.synced = false;
    save(s);
    emit();
    cloudHook?.();
  },

  // Recycler-side actions ------------------------------------------------------
  confirmHandover(lotId: string, finalPrice: number): Transaction | undefined {
    const s = getState();
    const tx = s.transactions.find((t) => t.lot_id === lotId);
    if (!tx) return undefined;
    tx.final_price = finalPrice;
    tx.transaction_status = "confirmed";
    tx.payment_status = "paid"; // cash on handover (default)
    const trace = s.traceability[lotId];
    if (trace) trace.recycler_confirmation = new Date().toISOString();
    s.transactions = s.transactions.map((t) => (t.lot_id === lotId ? tx : t));
    s.traceability[lotId] = trace;
    s.syncQueue = [...s.syncQueue, queueWrite("traceability", "update", trace)];
    s.synced = false;
    save(s);
    emit();
    cloudHook?.();
    return tx;
  },

  completeLot(lotId: string): void {
    const s = getState();
    const tx = s.transactions.find((t) => t.lot_id === lotId);
    if (!tx) return;
    tx.transaction_status = "completed";
    s.transactions = s.transactions.map((t) => (t.lot_id === lotId ? tx : t));
    s.syncQueue = [...s.syncQueue, queueWrite("transactions", "update", tx)];
    s.synced = false;
    save(s);
    emit();
    cloudHook?.();
  },

  updateLotStatus(lotId: string, status: Transaction["transaction_status"]): void {
    const s = getState();
    const tx = s.transactions.find((t) => t.lot_id === lotId);
    if (!tx) return;
    tx.transaction_status = status;
    s.transactions = s.transactions.map((t) => (t.lot_id === lotId ? tx : t));
    s.syncQueue = [...s.syncQueue, queueWrite("transactions", "update", tx)];
    s.synced = false;
    save(s);
    emit();
    cloudHook?.();
  },
};

export function syncNow(): { synced: boolean; count: number } {
  const s = getState();
  const count = s.syncQueue.length;
  // Write-through: local is already the source of truth; sync just clears the queue.
  s.syncQueue = [];
  s.synced = true;
  s.lastSyncedAt = new Date().toISOString();
  save(s);
  emit();
  return { synced: true, count };
}

export const CATEGORY_DISPLAY = CATEGORY_LABELS;

export function resetForDemo(): void {
  if (typeof window === "undefined") return;
  state = defaultState();
  window.localStorage.removeItem(KEY);
  emit();
}
