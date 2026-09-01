import type { Price, Recycler } from "./types";

// ============================================================================
// Level 2 local seed data. Used ONLY for the self-contained (localStorage)
// fallback path so features are fully testable without a live schema. The
// live Supabase seed lives in supabase/seed/002_seed_level2.sql and is
// authoritative when the columns exist.
// ============================================================================

const OFFSET_DAYS = (n: number) =>
  new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();

// 7 categories × ~6 historical dates each = real multi-row history for trends.
export const LEVEL2_PRICES: Price[] = [
  { id: "pr-crt-1", category: "CRTs", sub_category: "CRT TV", location: "Andheri", date: OFFSET_DAYS(30), market_range_low: 35, market_range_high: 55, recycler_offered_price: 42, recycler_id: "33333333-3333-3333-3333-333333333333" },
  { id: "pr-crt-2", category: "CRTs", sub_category: "CRT TV", location: "Dadar", date: OFFSET_DAYS(20), market_range_low: 36, market_range_high: 58, recycler_offered_price: 44, recycler_id: "33333333-3333-3333-3333-333333333333" },
  { id: "pr-crt-3", category: "CRTs", sub_category: "CRT TV", location: "Thane", date: OFFSET_DAYS(12), market_range_low: 40, market_range_high: 60, recycler_offered_price: 46, recycler_id: "33333333-3333-3333-3333-333333333333" },
  { id: "pr-crt-4", category: "CRTs", sub_category: "CRT TV", location: "Andheri", date: OFFSET_DAYS(6), market_range_low: 42, market_range_high: 62, recycler_offered_price: 48, recycler_id: "11111111-1111-1111-1111-111111111111" },
  { id: "pr-crt-5", category: "CRTs", sub_category: "CRT TV", location: "Dadar", date: OFFSET_DAYS(2), market_range_low: 43, market_range_high: 64, recycler_offered_price: 50, recycler_id: "11111111-1111-1111-1111-111111111111" },

  { id: "pr-lcd-1", category: "LCD panels", sub_category: "LCD screen", location: "Andheri", date: OFFSET_DAYS(28), market_range_low: 80, market_range_high: 120, recycler_offered_price: 95, recycler_id: "33333333-3333-3333-3333-333333333333" },
  { id: "pr-lcd-2", category: "LCD panels", sub_category: "LCD screen", location: "Thane", date: OFFSET_DAYS(18), market_range_low: 78, market_range_high: 118, recycler_offered_price: 92, recycler_id: "33333333-3333-3333-3333-333333333333" },
  { id: "pr-lcd-3", category: "LCD panels", sub_category: "LCD screen", location: "Dadar", date: OFFSET_DAYS(11), market_range_low: 76, market_range_high: 115, recycler_offered_price: 90, recycler_id: "22222222-2222-2222-2222-222222222222" },
  { id: "pr-lcd-4", category: "LCD panels", sub_category: "LCD screen", location: "Andheri", date: OFFSET_DAYS(5), market_range_low: 75, market_range_high: 114, recycler_offered_price: 88, recycler_id: "22222222-2222-2222-2222-222222222222" },
  { id: "pr-lcd-5", category: "LCD panels", sub_category: "LCD screen", location: "Thane", date: OFFSET_DAYS(1), market_range_low: 74, market_range_high: 112, recycler_offered_price: 86, recycler_id: "22222222-2222-2222-2222-222222222222" },

  { id: "pr-pcb-1", category: "PCBs", sub_category: "Motherboard", location: "Andheri", date: OFFSET_DAYS(32), market_range_low: 380, market_range_high: 460, recycler_offered_price: 420, recycler_id: "11111111-1111-1111-1111-111111111111" },
  { id: "pr-pcb-2", category: "PCBs", sub_category: "Motherboard", location: "Dadar", date: OFFSET_DAYS(22), market_range_low: 390, market_range_high: 470, recycler_offered_price: 430, recycler_id: "11111111-1111-1111-1111-111111111111" },
  { id: "pr-pcb-3", category: "PCBs", sub_category: "Motherboard", location: "Thane", date: OFFSET_DAYS(13), market_range_low: 400, market_range_high: 480, recycler_offered_price: 440, recycler_id: "11111111-1111-1111-1111-111111111111" },
  { id: "pr-pcb-4", category: "PCBs", sub_category: "Motherboard", location: "Andheri", date: OFFSET_DAYS(7), market_range_low: 405, market_range_high: 490, recycler_offered_price: 445, recycler_id: "11111111-1111-1111-1111-111111111111" },
  { id: "pr-pcb-5", category: "PCBs", sub_category: "Motherboard", location: "Dadar", date: OFFSET_DAYS(3), market_range_low: 410, market_range_high: 500, recycler_offered_price: 450, recycler_id: "11111111-1111-1111-1111-111111111111" },

  { id: "pr-cab-1", category: "Cables", sub_category: "Copper cable", location: "Thane", date: OFFSET_DAYS(30), market_range_low: 150, market_range_high: 200, recycler_offered_price: 170, recycler_id: "22222222-2222-2222-2222-222222222222" },
  { id: "pr-cab-2", category: "Cables", sub_category: "Copper cable", location: "Andheri", date: OFFSET_DAYS(20), market_range_low: 152, market_range_high: 205, recycler_offered_price: 173, recycler_id: "22222222-2222-2222-2222-222222222222" },
  { id: "pr-cab-3", category: "Cables", sub_category: "Copper cable", location: "Dadar", date: OFFSET_DAYS(10), market_range_low: 151, market_range_high: 202, recycler_offered_price: 172, recycler_id: "22222222-2222-2222-2222-222222222222" },
  { id: "pr-cab-4", category: "Cables", sub_category: "Copper cable", location: "Andheri", date: OFFSET_DAYS(4), market_range_low: 150, market_range_high: 200, recycler_offered_price: 171, recycler_id: "22222222-2222-2222-2222-222222222222" },
  { id: "pr-cab-5", category: "Cables", sub_category: "Copper cable", location: "Thane", date: OFFSET_DAYS(1), market_range_low: 149, market_range_high: 199, recycler_offered_price: 170, recycler_id: "22222222-2222-2222-2222-222222222222" },

  { id: "pr-bat-1", category: "Batteries", sub_category: "Lithium", location: "Dadar", date: OFFSET_DAYS(28), market_range_low: 160, market_range_high: 210, recycler_offered_price: 180, recycler_id: "33333333-3333-3333-3333-333333333333" },
  { id: "pr-bat-2", category: "Batteries", sub_category: "Lithium", location: "Andheri", date: OFFSET_DAYS(19), market_range_low: 165, market_range_high: 215, recycler_offered_price: 185, recycler_id: "33333333-3333-3333-3333-333333333333" },
  { id: "pr-bat-3", category: "Batteries", sub_category: "Lithium", location: "Thane", date: OFFSET_DAYS(12), market_range_low: 168, market_range_high: 218, recycler_offered_price: 188, recycler_id: "33333333-3333-3333-3333-333333333333" },
  { id: "pr-bat-4", category: "Batteries", sub_category: "Lithium", location: "Dadar", date: OFFSET_DAYS(6), market_range_low: 170, market_range_high: 222, recycler_offered_price: 190, recycler_id: "33333333-3333-3333-3333-333333333333" },
  { id: "pr-bat-5", category: "Batteries", sub_category: "Lithium", location: "Andheri", date: OFFSET_DAYS(2), market_range_low: 172, market_range_high: 225, recycler_offered_price: 192, recycler_id: "33333333-3333-3333-3333-333333333333" },

  { id: "pr-mot-1", category: "Motors & magnets", sub_category: "DC motor", location: "Thane", date: OFFSET_DAYS(30), market_range_low: 90, market_range_high: 130, recycler_offered_price: 105, recycler_id: "11111111-1111-1111-1111-111111111111" },
  { id: "pr-mot-2", category: "Motors & magnets", sub_category: "DC motor", location: "Dadar", date: OFFSET_DAYS(21), market_range_low: 92, market_range_high: 134, recycler_offered_price: 108, recycler_id: "11111111-1111-1111-1111-111111111111" },
  { id: "pr-mot-3", category: "Motors & magnets", sub_category: "DC motor", location: "Andheri", date: OFFSET_DAYS(13), market_range_low: 95, market_range_high: 138, recycler_offered_price: 112, recycler_id: "11111111-1111-1111-1111-111111111111" },
  { id: "pr-mot-4", category: "Motors & magnets", sub_category: "DC motor", location: "Thane", date: OFFSET_DAYS(5), market_range_low: 96, market_range_high: 140, recycler_offered_price: 114, recycler_id: "11111111-1111-1111-1111-111111111111" },
  { id: "pr-mot-5", category: "Motors & magnets", sub_category: "DC motor", location: "Dadar", date: OFFSET_DAYS(2), market_range_low: 97, market_range_high: 142, recycler_offered_price: 115, recycler_id: "11111111-1111-1111-1111-111111111111" },

  { id: "pr-pla-1", category: "Mixed plastics", sub_category: "ABS", location: "Andheri", date: OFFSET_DAYS(30), market_range_low: 30, market_range_high: 55, recycler_offered_price: 40, recycler_id: "22222222-2222-2222-2222-222222222222" },
  { id: "pr-pla-2", category: "Mixed plastics", sub_category: "ABS", location: "Dadar", date: OFFSET_DAYS(20), market_range_low: 32, market_range_high: 58, recycler_offered_price: 42, recycler_id: "22222222-2222-2222-2222-222222222222" },
  { id: "pr-pla-3", category: "Mixed plastics", sub_category: "ABS", location: "Thane", date: OFFSET_DAYS(11), market_range_low: 34, market_range_high: 60, recycler_offered_price: 44, recycler_id: "22222222-2222-2222-2222-222222222222" },
  { id: "pr-pla-4", category: "Mixed plastics", sub_category: "ABS", location: "Andheri", date: OFFSET_DAYS(6), market_range_low: 36, market_range_high: 62, recycler_offered_price: 46, recycler_id: "22222222-2222-2222-2222-222222222222" },
  { id: "pr-pla-5", category: "Mixed plastics", sub_category: "ABS", location: "Dadar", date: OFFSET_DAYS(2), market_range_low: 38, market_range_high: 64, recycler_offered_price: 48, recycler_id: "22222222-2222-2222-2222-222222222222" },
];

export const LEVEL2_RECYCLERS: Recycler[] = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    name: "GreenCycle Recyclers",
    materials_accepted: "PCBs, Batteries, Cables, Motors & magnets",
    offered_rate: 200,
    authorization_registration_number: "MAH-EW-2021-0041",
    authorization_status: "authorized",
    facility_location: "Andheri East, Mumbai",
    service_area: "Andheri, Jogeshwari, Powai",
    contact_details: "+91 98200 00011",
    pickup_availability: true,
    distance_km: 2.4,
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    name: "EcoMetal Hub",
    materials_accepted: "Cables, Batteries, Mixed plastics",
    offered_rate: 150,
    authorization_registration_number: "MAH-EW-2022-0192",
    authorization_status: "authorized",
    facility_location: "Dadar West, Mumbai",
    service_area: "Dadar, Parel, Lower Parel",
    contact_details: "+91 98200 00022",
    pickup_availability: false,
    distance_km: 6.8,
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    name: "City Scrap Works",
    materials_accepted: "PCBs, Mixed plastics, Cables, CRTs",
    offered_rate: 175,
    authorization_registration_number: "MAH-EW-2020-0077",
    authorization_status: "authorized",
    facility_location: "Thane West",
    service_area: "Thane, Mulund, Bhandup",
    contact_details: "+91 98200 00033",
    pickup_availability: true,
    distance_km: 4.1,
  },
  {
    id: "44444444-4444-4444-4444-444444444444",
    name: "Metro E-Waste Partners",
    materials_accepted: "LCD panels, Batteries, PCBs",
    offered_rate: 210,
    authorization_registration_number: "MAH-EW-2023-0033",
    authorization_status: "pending",
    facility_location: "Kurla, Mumbai",
    service_area: "Kurla, Vidyavihar, Ghatkopar",
    contact_details: "+91 98200 00044",
    pickup_availability: true,
    distance_km: 3.0,
  },
  {
    id: "55555555-5555-5555-5555-555555555555",
    name: "SafeScrap Solutions",
    materials_accepted: "CRTs, LCD panels, Motors & magnets",
    offered_rate: 160,
    authorization_registration_number: "MAH-EW-2019-0021",
    authorization_status: "expired",
    facility_location: "Chembur, Mumbai",
    service_area: "Chembur, Vashi, Turbhe",
    contact_details: "+91 98200 00055",
    pickup_availability: false,
    distance_km: 5.5,
  },
];
