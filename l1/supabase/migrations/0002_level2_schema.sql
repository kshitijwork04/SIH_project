-- ============================================================================
-- Kabadiwala Connect — Level 2 schema (diff on top of Level 1)
-- Apply AFTER running setup.sql / 0001_schema.sql from Level 1.
-- Adds columns to the 4 core tables, plus the new traceability and collectors
-- tables. This is the schema the app's Supabase path expects. Until this is
-- applied, the app transparently runs on the self-contained localStorage layer.
-- ============================================================================

-- Step 2.1 — materials: extend the create-a-lot fields.
alter table materials
  add column if not exists sub_category text,
  add column if not exists description text,
  add column if not exists condition text,
  add column if not exists source_type text;

-- Step 2.2 — prices: full historical dataset + trend inputs.
-- Drop the old rate_per_kg-only shape constraint approach (table rebuilt).
alter table prices
  add column if not exists sub_category text,
  add column if not exists location text,
  add column if not exists date timestamptz default now(),
  add column if not exists market_range_low numeric default 0 check (market_range_low >= 0),
  add column if not exists market_range_high numeric default 0 check (market_range_high >= 0),
  add column if not exists recycler_offered_price numeric default 0 check (recycler_offered_price >= 0),
  add column if not exists recycler_id uuid references recyclers(id);

-- Step 2.3 — recyclers: full authorized dataset.
alter table recyclers
  add column if not exists authorization_registration_number text,
  add column if not exists authorization_status text default 'authorized'
    check (authorization_status in ('authorized', 'pending', 'expired')),
  add column if not exists facility_location text,
  add column if not exists service_area text,
  add column if not exists contact_details text,
  add column if not exists pickup_availability boolean default false,
  add column if not exists distance_km numeric default 0;

-- Step 2.10 — transactions: payment tracking + final price.
alter table transactions
  add column if not exists estimated_value numeric default 0,
  add column if not exists final_price numeric default 0,
  add column if not exists payment_status text default 'pending'
    check (payment_status in ('pending', 'paid'));

-- Step 2.5 — traceability: GPS-based handover record.
create table if not exists traceability (
  id uuid primary key default gen_random_uuid(),
  lot_id uuid references materials(id),
  photo_url text,
  weight numeric default 0,
  timestamp timestamptz default now(),
  gps_lat numeric,
  gps_lng numeric,
  handover_reference_number text,
  recycler_confirmed boolean default false,
  subsequent_status text default 'handed_over'
);

-- Step 2.6 — collectors: MINIMAL profile. Deliberately NO name / ID proof /
-- precise address fields.
create table if not exists collectors (
  id text primary key,
  preferred_language text default 'en' check (preferred_language in ('en', 'hi', 'mr')),
  general_operating_location text default ''
);

-- Demo RLS (mirror Level 1's open, demo-friendly policy).
alter table traceability enable row level security;
alter table collectors enable row level security;

create policy "anon all traceability" on traceability for all using (true) with check (true);
create policy "anon all collectors" on collectors for all using (true) with check (true);
