-- ============================================================================
-- Kabadiwala Connect — Level 2 seed data
-- Apply AFTER 0002_level2_schema.sql. Populates:
--   * prices: 7 categories × ~5 historical rows (real trend inputs)
--   * recyclers: full authorization / location / contact dataset
-- ============================================================================

-- ---- Recyclers (Step 2.3) ----------------------------------------------------
-- Keep the 3 Level 1 recyclers (same UUIDs) and expand them; add 2 more.
insert into recyclers (
  id, name, materials_accepted, offered_rate,
  authorization_registration_number, authorization_status,
  facility_location, service_area, contact_details, pickup_availability, distance_km
) values
  ('11111111-1111-1111-1111-111111111111', 'GreenCycle Recyclers', 'PCBs, Batteries, Cables, Motors & magnets', 200.00,
   'MAH-EW-2021-0041', 'authorized', 'Andheri East, Mumbai', 'Andheri, Jogeshwari, Powai', '+91 98200 00011', true, 2.4),
  ('22222222-2222-2222-2222-222222222222', 'EcoMetal Hub', 'Cables, Batteries, Mixed plastics', 150.00,
   'MAH-EW-2022-0192', 'authorized', 'Dadar West, Mumbai', 'Dadar, Parel, Lower Parel', '+91 98200 00022', false, 6.8),
  ('33333333-3333-3333-3333-333333333333', 'City Scrap Works', 'PCBs, Mixed plastics, Cables, CRTs', 175.00,
   'MAH-EW-2020-0077', 'authorized', 'Thane West', 'Thane, Mulund, Bhandup', '+91 98200 00033', true, 4.1),
  ('44444444-4444-4444-4444-444444444444', 'Metro E-Waste Partners', 'LCD panels, Batteries, PCBs', 210.00,
   'MAH-EW-2023-0033', 'pending', 'Kurla, Mumbai', 'Kurla, Vidyavihar, Ghatkopar', '+91 98200 00044', true, 3.0),
  ('55555555-5555-5555-5555-555555555555', 'SafeScrap Solutions', 'CRTs, LCD panels, Motors & magnets', 160.00,
   'MAH-EW-2019-0021', 'expired', 'Chembur, Mumbai', 'Chembur, Vashi, Turbhe', '+91 98200 00055', false, 5.5)
on conflict (id) do update set
  materials_accepted = excluded.materials_accepted,
  offered_rate = excluded.offered_rate,
  authorization_registration_number = excluded.authorization_registration_number,
  authorization_status = excluded.authorization_status,
  facility_location = excluded.facility_location,
  service_area = excluded.service_area,
  contact_details = excluded.contact_details,
  pickup_availability = excluded.pickup_availability,
  distance_km = excluded.distance_km;

-- ---- Prices: 7 categories × ~5 historical rows (Step 2.2) ---------------------
-- date column is timestamptz; use now() - interval offsets.
insert into prices (
  category, sub_category, location, date,
  market_range_low, market_range_high, recycler_offered_price, recycler_id
) values
  -- CRTs (rising)
  ('CRTs', 'CRT TV', 'Andheri', now() - interval '30 days', 35, 55, 42, '33333333-3333-3333-3333-333333333333'),
  ('CRTs', 'CRT TV', 'Dadar',   now() - interval '20 days', 36, 58, 44, '33333333-3333-3333-3333-333333333333'),
  ('CRTs', 'CRT TV', 'Thane',   now() - interval '12 days', 40, 60, 46, '33333333-3333-3333-3333-333333333333'),
  ('CRTs', 'CRT TV', 'Andheri', now() - interval '6 days',  42, 62, 48, '11111111-1111-1111-1111-111111111111'),
  ('CRTs', 'CRT TV', 'Dadar',   now() - interval '2 days',  43, 64, 50, '11111111-1111-1111-1111-111111111111'),
  -- LCD panels (falling)
  ('LCD panels', 'LCD screen', 'Andheri', now() - interval '28 days', 80, 120, 95, '33333333-3333-3333-3333-333333333333'),
  ('LCD panels', 'LCD screen', 'Thane',   now() - interval '18 days', 78, 118, 92, '33333333-3333-3333-3333-333333333333'),
  ('LCD panels', 'LCD screen', 'Dadar',   now() - interval '11 days', 76, 115, 90, '22222222-2222-2222-2222-222222222222'),
  ('LCD panels', 'LCD screen', 'Andheri', now() - interval '5 days',  75, 114, 88, '22222222-2222-2222-2222-222222222222'),
  ('LCD panels', 'LCD screen', 'Thane',   now() - interval '1 days',  74, 112, 86, '22222222-2222-2222-2222-222222222222'),
  -- PCBs (rising)
  ('PCBs', 'Motherboard', 'Andheri', now() - interval '32 days', 380, 460, 420, '11111111-1111-1111-1111-111111111111'),
  ('PCBs', 'Motherboard', 'Dadar',   now() - interval '22 days', 390, 470, 430, '11111111-1111-1111-1111-111111111111'),
  ('PCBs', 'Motherboard', 'Thane',   now() - interval '13 days', 400, 480, 440, '11111111-1111-1111-1111-111111111111'),
  ('PCBs', 'Motherboard', 'Andheri', now() - interval '7 days',  405, 490, 445, '11111111-1111-1111-1111-111111111111'),
  ('PCBs', 'Motherboard', 'Dadar',   now() - interval '3 days',  410, 500, 450, '11111111-1111-1111-1111-111111111111'),
  -- Cables (stable ~170)
  ('Cables', 'Copper cable', 'Thane',   now() - interval '30 days', 150, 200, 170, '22222222-2222-2222-2222-222222222222'),
  ('Cables', 'Copper cable', 'Andheri', now() - interval '20 days', 152, 205, 173, '22222222-2222-2222-2222-222222222222'),
  ('Cables', 'Copper cable', 'Dadar',   now() - interval '10 days', 151, 202, 172, '22222222-2222-2222-2222-222222222222'),
  ('Cables', 'Copper cable', 'Andheri', now() - interval '4 days',  150, 200, 171, '22222222-2222-2222-2222-222222222222'),
  ('Cables', 'Copper cable', 'Thane',   now() - interval '1 days',  149, 199, 170, '22222222-2222-2222-2222-222222222222'),
  -- Batteries (rising)
  ('Batteries', 'Lithium', 'Dadar',   now() - interval '28 days', 160, 210, 180, '33333333-3333-3333-3333-333333333333'),
  ('Batteries', 'Lithium', 'Andheri', now() - interval '19 days', 165, 215, 185, '33333333-3333-3333-3333-333333333333'),
  ('Batteries', 'Lithium', 'Thane',   now() - interval '12 days', 168, 218, 188, '33333333-3333-3333-3333-333333333333'),
  ('Batteries', 'Lithium', 'Dadar',   now() - interval '6 days',  170, 222, 190, '33333333-3333-3333-3333-333333333333'),
  ('Batteries', 'Lithium', 'Andheri', now() - interval '2 days',  172, 225, 192, '33333333-3333-3333-3333-333333333333'),
  -- Motors & magnets (rising)
  ('Motors & magnets', 'DC motor', 'Thane',   now() - interval '30 days', 90, 130, 105, '11111111-1111-1111-1111-111111111111'),
  ('Motors & magnets', 'DC motor', 'Dadar',   now() - interval '21 days', 92, 134, 108, '11111111-1111-1111-1111-111111111111'),
  ('Motors & magnets', 'DC motor', 'Andheri', now() - interval '13 days', 95, 138, 112, '11111111-1111-1111-1111-111111111111'),
  ('Motors & magnets', 'DC motor', 'Thane',   now() - interval '5 days',  96, 140, 114, '11111111-1111-1111-1111-111111111111'),
  ('Motors & magnets', 'DC motor', 'Dadar',   now() - interval '2 days',  97, 142, 115, '11111111-1111-1111-1111-111111111111'),
  -- Mixed plastics (rising)
  ('Mixed plastics', 'ABS', 'Andheri', now() - interval '30 days', 30, 55, 40, '22222222-2222-2222-2222-222222222222'),
  ('Mixed plastics', 'ABS', 'Dadar',   now() - interval '20 days', 32, 58, 42, '22222222-2222-2222-2222-222222222222'),
  ('Mixed plastics', 'ABS', 'Thane',   now() - interval '11 days', 34, 60, 44, '22222222-2222-2222-2222-222222222222'),
  ('Mixed plastics', 'ABS', 'Andheri', now() - interval '6 days',  36, 62, 46, '22222222-2222-2222-2222-222222222222'),
  ('Mixed plastics', 'ABS', 'Dadar',   now() - interval '2 days',  38, 64, 48, '22222222-2222-2222-2222-222222222222')
on conflict do nothing;
