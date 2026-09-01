-- ============================================================================
-- Kabadiwala Connect — seed data (section 5). Run AFTER 0001_schema.sql in the
-- Supabase SQL editor. Inserts 4 recyclers and ~12 weeks of price history so the
-- price board trend works against live data.
-- ============================================================================

-- Recyclers (stable UUIDs) ----------------------------------------------------
insert into recyclers
 (recycler_id, name, facility_lat, facility_lng, facility_location_name,
  materials_accepted, authorization_registration_number, authorization_status,
  contact_details, offered_rates, pickup_availability, service_area_radius_km)
values
 ('11111111-1111-4111-8111-111111111111', 'GreenCycle E-Waste Pvt Ltd', 28.527, 77.278, 'Jamia Nagar, Delhi',
  array['crt','lcd','pcb','cables','batteries','motors','plastics']::material_category[],
  'EPA/REC/2024/0041', 'authorized', '+91-98XXXXXX21',
  '{"crt":13,"lcd":26,"pcb":250,"cables":210,"batteries":135,"motors":155,"plastics":22}', true, 12),
 ('22222222-2222-4222-8222-222222222222', 'EcoRefine Recyclers', 28.56, 77.24, 'Lajpat Nagar, Delhi',
  array['crt','lcd','pcb','batteries','motors']::material_category[],
  'CPCB/REC/2023/0117', 'authorized', '+91-97XXXXXX34',
  '{"crt":12,"lcd":24,"pcb":240,"batteries":140,"motors":150}', false, 8),
 ('33333333-3333-4333-8333-333333333333', 'Metro Scrap & Recycle Hub', 28.5, 77.28, 'Sarita Vihar, Delhi',
  array['cables','motors','plastics','crt']::material_category[],
  'EPA/REC/2025/0098', 'pending', '+91-99XXXXXX87',
  '{"cables":195,"motors":145,"plastics":18,"crt":11}', true, 10),
 ('44444444-4444-4444-8444-444444444444', 'ReNew Materials Ltd', 28.62, 77.29, 'Noida Sector 63',
  array['pcb','batteries','lcd','cables']::material_category[],
  'UP/PCB/REC/2022/0033', 'expired', '+91-98XXXXXX55',
  '{"pcb":200,"batteries":90,"lcd":20,"cables":150}', false, 15)
on conflict (recycler_id) do nothing;

-- Price history (~12 weeks) ----------------------------------------------------
insert into prices
 (material_category, location, date, buying_price, unit, market_range_low, market_range_high)
select
  c.cat,
  'Okhla, Delhi',
  now() - ((12 - w.n) * interval '7 day'),
  round((c.base * (1 + w.n * 0.012) + (random() - 0.5) * c.range * 0.3)::numeric, 2),
  'per_kg',
  round((c.base - c.range/2)::numeric, 2),
  round((c.base + c.range/2)::numeric, 2)
from (
  values
    ('crt'::material_category, 11, 6),
    ('lcd'::material_category, 21.5, 13),
    ('pcb'::material_category, 190, 140),
    ('cables'::material_category, 165, 110),
    ('batteries'::material_category, 100, 80),
    ('motors'::material_category, 125, 70),
    ('plastics'::material_category, 18, 12)
) as c(cat, base, range)
cross join generate_series(1, 12) as w(n)
on conflict do nothing;
