import { supabase, isSupabaseConfigured } from "./supabase";
import { repo, repoWrite, syncNow } from "./repository";
import type { PriceEntry, Recycler, TraceabilityRecord } from "./types";

// ============================================================================
// LIVE BACKEND SYNC (section 7 / 11.2)
// Offline-first: the app always works from the local layer. When online and
// Supabase is configured, we (a) pull the catalog (recyclers + prices) into the
// local cache, and (b) push created/updated transactions + traceability up.
// All functions are safe no-ops when Supabase is not configured or offline.
// ============================================================================

function mapRecycler(row: any): Recycler {
  return {
    recycler_id: row.recycler_id,
    name: row.name,
    facility_lat: Number(row.facility_lat),
    facility_lng: Number(row.facility_lng),
    facility_location_name: row.facility_location_name || "",
    materials_accepted: row.materials_accepted ?? [],
    authorization_registration_number: row.authorization_registration_number || "",
    authorization_status: row.authorization_status,
    contact_details: row.contact_details || "",
    offered_rates: row.offered_rates ?? {},
    pickup_availability: row.pickup_availability ?? false,
    service_area_radius_km: Number(row.service_area_radius_km),
  };
}

function mapPrice(row: any): PriceEntry {
  return {
    price_id: row.price_id,
    material_category: row.material_category,
    sub_category: row.sub_category ?? undefined,
    location: row.location,
    date: row.date,
    buying_price: Number(row.buying_price),
    unit: row.unit,
    market_range_low: row.market_range_low != null ? Number(row.market_range_low) : Number(row.buying_price),
    market_range_high: row.market_range_high != null ? Number(row.market_range_high) : Number(row.buying_price),
  };
}

// Pull recyclers + prices from Supabase into the local cache.
export async function pullCatalog(): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) return false;
  try {
    const [rec, prc] = await Promise.all([
      supabase.from("recyclers").select("*"),
      supabase.from("prices").select("*").order("date", { ascending: false }),
    ]);
    if (rec.error) throw rec.error;
    if (prc.error) throw prc.error;
    const recyclers = (rec.data ?? []).map(mapRecycler);
    const prices = (prc.data ?? []).map(mapPrice);
    repoWrite.setCatalog(recyclers, prices);
    return true;
  } catch (e) {
    console.warn("[supabase] pullCatalog failed, using seed catalog", e);
    return false;
  }
}

// Push the live user data (collector + transactions + traceability) to Supabase.
export async function pushLiveData(): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) return false;
  try {
    const collector = repo.getCollector();
    const transactions = repo.getTransactions();
    const errors = [];

    const c = await supabase.from("collectors").upsert(
      {
        collector_id: collector.collector_id,
        preferred_language: collector.preferred_language,
        general_operating_location: collector.general_operating_location,
        operating_lat: collector.operating_lat,
        operating_lng: collector.operating_lng,
      },
      { onConflict: "collector_id" }
    );
    if (c.error) errors.push(c.error);

    if (transactions.length) {
      const t = await supabase.from("transactions").upsert(transactions, {
        onConflict: "lot_id",
      });
      if (t.error) errors.push(t.error);

      const traces = transactions
        .map((tx) => repo.getTraceability(tx.lot_id))
        .filter((x): x is TraceabilityRecord => !!x);
      if (traces.length) {
        const tr = await supabase.from("traceability").upsert(traces, {
          onConflict: "lot_id",
        });
        if (tr.error) errors.push(tr.error);
      }
    }

    if (errors.length) throw errors[0];
    // Everything pushed: clear the local pending queue.
    syncNow();
    return true;
  } catch (e) {
    console.warn("[supabase] pushLiveData failed (will retry later)", e);
    return false;
  }
}
