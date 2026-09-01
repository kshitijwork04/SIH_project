-- ============================================================================
-- Kabadiwala Connect — Postgres/Supabase schema (section 5 of the build prompt)
-- Run in the Supabase SQL editor to create the six datasets as real tables.
-- Order matters: referenced tables are created before referencing tables.
-- ============================================================================

-- Enums ----------------------------------------------------------------------
do $$ begin
  create type language_code as enum ('hi', 'mr', 'en');
exception when duplicate_object then null; end $$;
do $$ begin
  create type material_category as enum ('crt','lcd','pcb','cables','batteries','motors','plastics');
exception when duplicate_object then null; end $$;
do $$ begin
  create type material_condition as enum ('intact','damaged','degraded');
exception when duplicate_object then null; end $$;
do $$ begin
  create type source_type as enum ('household','commercial','repair');
exception when duplicate_object then null; end $$;
do $$ begin
  create type authorization_status as enum ('authorized','pending','expired');
exception when duplicate_object then null; end $$;
do $$ begin
  create type payment_status as enum ('paid','pending');
exception when duplicate_object then null; end $$;
do $$ begin
  create type transaction_status as enum ('created','matched','in-transit','handed-over','confirmed','completed');
exception when duplicate_object then null; end $$;

-- 5.5 Collector dataset (minimal, privacy-conscious) -------------------------
create table if not exists collectors (
  collector_id uuid primary key default gen_random_uuid(),
  preferred_language language_code not null default 'hi',
  general_operating_location text,
  operating_lat numeric,
  operating_lng numeric,
  created_at timestamptz not null default now()
);

-- 5.3 Recycler / aggregator dataset ------------------------------------------
create table if not exists recyclers (
  recycler_id uuid primary key default gen_random_uuid(),
  name text not null,
  facility_lat numeric not null,
  facility_lng numeric not null,
  facility_location_name text,
  materials_accepted material_category[] not null default '{}',
  authorization_registration_number text,
  authorization_status authorization_status not null default 'pending',
  contact_details text,
  offered_rates jsonb not null default '{}',
  pickup_availability boolean not null default false,
  service_area_radius_km numeric not null default 5
);

-- 5.1 Material dataset -------------------------------------------------------
create table if not exists materials (
  material_id uuid primary key default gen_random_uuid(),
  category material_category not null,
  sub_category text,
  description text,
  image_ref text,
  approx_weight numeric not null check (approx_weight >= 0),
  condition material_condition not null default 'intact',
  source_type source_type,
  estimated_value numeric not null default 0,
  created_at timestamptz not null default now()
);

-- 5.2 Price dataset ----------------------------------------------------------
create table if not exists prices (
  price_id uuid primary key default gen_random_uuid(),
  material_category material_category not null,
  sub_category text,
  location text not null,
  date timestamptz not null default now(),
  buying_price numeric not null,
  unit text not null default 'per_kg',
  market_range_low numeric,
  market_range_high numeric,
  recycler_offered_price numeric,
  recycler_id uuid references recyclers(recycler_id)
);
create index if not exists prices_cat_loc_date on prices (material_category, location, date desc);

-- 5.4 Transaction dataset ----------------------------------------------------
create table if not exists transactions (
  lot_id uuid primary key default gen_random_uuid(),
  collector_id uuid references collectors(collector_id),
  material_category material_category not null,
  weight numeric not null check (weight >= 0),
  quoted_price numeric not null default 0,
  final_price numeric,
  recycler_id uuid references recyclers(recycler_id),
  collection_lat numeric,
  collection_lng numeric,
  handover_lat numeric,
  handover_lng numeric,
  date_time timestamptz not null default now(),
  payment_status payment_status not null default 'pending',
  transaction_status transaction_status not null default 'created'
);
create index if not exists tx_collector on transactions (collector_id, date_time desc);
create index if not exists tx_recycler on transactions (recycler_id, transaction_status);

-- 5.5 Traceability dataset ---------------------------------------------------
create table if not exists traceability (
  lot_id uuid primary key references transactions(lot_id),
  photographs text[] not null default '{}',
  weight numeric not null,
  timestamp timestamptz not null default now(),
  gps_lat numeric,
  gps_lng numeric,
  handover_reference_number text unique,
  recycler_confirmation timestamptz,
  subsequent_status text
);

-- ============================================================================
-- Row Level Security (section 11.2)
-- NOTE: These are DEMO-friendly policies. The app (for now) authenticates as a
-- single anonymous client, so we allow general read/write on the demo tables.
-- Before production, tighten these so collectors see only their own rows and
-- recyclers see only lots matched to them (see commented "tight" example at the
-- bottom). Flag this clearly to judges: demo-mode RLS, production-tight planned.
-- ============================================================================
alter table collectors enable row level security;
alter table recyclers enable row level security;
alter table materials enable row level security;
alter table prices enable row level security;
alter table transactions enable row level security;
alter table traceability enable row level security;

-- Demo-mode policies: allow anonymous client full access so the demo works.
create policy "anon all collectors" on collectors for all using (true) with check (true);
create policy "anon all recyclers" on recyclers for all using (true) with check (true);
create policy "anon all materials" on materials for all using (true) with check (true);
create policy "anon all prices" on prices for all using (true) with check (true);
create policy "anon all transactions" on transactions for all using (true) with check (true);
create policy "anon all traceability" on traceability for all using (true) with check (true);

-- ----------------------------------------------------------------------------
-- PRODUCTION-TIGHT alternative (uncomment + adapt when real auth lands):
--   alter table transactions disable row level security;  -- reset demo policy
--   create policy "collectors see own tx" on transactions
--     for select using (auth.uid()::text = collector_id::text);
--   create policy "recyclers see matched tx" on transactions
--     for select using (recycler_id in (
--       select recycler_id from recyclers where auth.uid()::text = recycler_id::text));
-- ----------------------------------------------------------------------------
