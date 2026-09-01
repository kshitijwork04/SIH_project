import type { Collector, PriceEntry, Recycler } from "../lib/types";

// ============================================================================
// Realistic seed data (section 5). Prices include many historical rows so the
// price board shows a believable trend. Location: a Delhi area (OKHLA) used as
// the collector's operating base — recyclers placed at plausible coordinates
// around Delhi NCR. When Supabase is live this seeds the real tables.
// ============================================================================

export const COLLECTOR_LOCATION = { lat: 28.5431, lng: 77.2639 }; // Okhla, Delhi

export const NEW_COLLECTOR: Collector = {
  collector_id: "99999999-9999-4999-8999-999999999999",
  preferred_language: "hi",
  general_operating_location: "Okhla, Delhi",
  operating_lat: COLLECTOR_LOCATION.lat,
  operating_lng: COLLECTOR_LOCATION.lng,
};

export const CATEGORY_PRICE_BASE: Record<string, { low: number; high: number }> =
  {
    crt: { low: 8, high: 14 },
    lcd: { low: 15, high: 28 },
    pcb: { low: 120, high: 260 },
    cables: { low: 110, high: 220 },
    batteries: { low: 60, high: 140 },
    motors: { low: 90, high: 160 },
    plastics: { low: 12, high: 24 },
  };

function seededPrices(): PriceEntry[] {
  const entries: PriceEntry[] = [];
  const weeks = 12;
  const now = Date.now();
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  for (const [cat, range] of Object.entries(CATEGORY_PRICE_BASE)) {
    // gentle upward drift so trend lines look believable
    for (let w = 0; w < weeks; w++) {
      const drift = 1 + w * 0.012;
      const center = (range.low + range.high) / 2;
      const variance = (range.high - range.low) / 2;
      const base = center * drift;
      const low = Math.round((base - variance) * 100) / 100;
      const high = Math.round((base + variance) * 100) / 100;
      const buying = Math.round((base + (Math.random() * 2 - 1) * variance * 0.3) * 100) / 100;
      entries.push({
        price_id: `price-${cat}-${w}`,
        material_category: cat as PriceEntry["material_category"],
        location: "Okhla, Delhi",
        date: new Date(now - (weeks - 1 - w) * weekMs).toISOString(),
        buying_price: Math.max(1, buying),
        unit: "per_kg",
        market_range_low: Math.max(1, low),
        market_range_high: high,
      });
    }
  }
  return entries;
}

export const SEED_PRICES: PriceEntry[] = seededPrices();

export const SEED_RECYCLERS: Recycler[] = [
  {
    recycler_id: "11111111-1111-4111-8111-111111111111",
    name: "GreenCycle E-Waste Pvt Ltd",
    facility_lat: 28.527,
    facility_lng: 77.278,
    facility_location_name: "Jamia Nagar, Delhi",
    materials_accepted: ["crt", "lcd", "pcb", "cables", "batteries", "motors", "plastics"],
    authorization_registration_number: "EPA/REC/2024/0041",
    authorization_status: "authorized",
    contact_details: "+91-98XXXXXX21",
    offered_rates: {
      crt: 13,
      lcd: 26,
      pcb: 250,
      cables: 210,
      batteries: 135,
      motors: 155,
      plastics: 22,
    },
    pickup_availability: true,
    service_area_radius_km: 12,
  },
  {
    recycler_id: "22222222-2222-4222-8222-222222222222",
    name: "EcoRefine Recyclers",
    facility_lat: 28.56,
    facility_lng: 77.24,
    facility_location_name: "Lajpat Nagar, Delhi",
    materials_accepted: ["crt", "lcd", "pcb", "batteries", "motors"],
    authorization_registration_number: "CPCB/REC/2023/0117",
    authorization_status: "authorized",
    contact_details: "+91-97XXXXXX34",
    offered_rates: {
      crt: 12,
      lcd: 24,
      pcb: 240,
      batteries: 140,
      motors: 150,
    },
    pickup_availability: false,
    service_area_radius_km: 8,
  },
  {
    recycler_id: "33333333-3333-4333-8333-333333333333",
    name: "Metro Scrap & Recycle Hub",
    facility_lat: 28.5,
    facility_lng: 77.28,
    facility_location_name: "Sarita Vihar, Delhi",
    materials_accepted: ["cables", "motors", "plastics", "crt"],
    authorization_registration_number: "EPA/REC/2025/0098",
    authorization_status: "pending",
    contact_details: "+91-99XXXXXX87",
    offered_rates: {
      cables: 195,
      motors: 145,
      plastics: 18,
      crt: 11,
    },
    pickup_availability: true,
    service_area_radius_km: 10,
  },
  {
    recycler_id: "44444444-4444-4444-8444-444444444444",
    name: "ReNew Materials Ltd",
    facility_lat: 28.62,
    facility_lng: 77.29,
    facility_location_name: "Noida Sector 63",
    materials_accepted: ["pcb", "batteries", "lcd", "cables"],
    authorization_registration_number: "UP/PCB/REC/2022/0033",
    authorization_status: "expired",
    contact_details: "+91-98XXXXXX55",
    offered_rates: {
      pcb: 200,
      batteries: 90,
      lcd: 20,
      cables: 150,
    },
    pickup_availability: false,
    service_area_radius_km: 15,
  },
];
