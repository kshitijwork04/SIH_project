-- ============================================================================
-- Kabadiwala Connect — Level 1 FULL SETUP (schema + seed)
-- Paste this entire file into your NEW Supabase project's SQL editor and Run.
-- Creates the 4 tables with sample data and demo-friendly RLS.
-- ============================================================================

-- Tables ---------------------------------------------------------------------
create table if not exists materials (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  weight numeric not null check (weight >= 0),
  estimated_value numeric not null default 0,
  photo_url text,
  created_at timestamptz not null default now()
);

create table if not exists prices (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  rate_per_kg numeric not null check (rate_per_kg >= 0)
);

create table if not exists recyclers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  materials_accepted text not null,
  offered_rate numeric not null check (offered_rate >= 0)
);

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  lot_id uuid references materials(id),
  collector_id text not null,
  recycler_id uuid references recyclers(id),
  status text not null default 'pending' check (status in ('pending', 'confirmed')),
  created_at timestamptz not null default now()
);

-- RLS (demo-friendly: anonymous read/write so the Level 1 flow works) ---------
alter table materials enable row level security;
alter table prices enable row level security;
alter table recyclers enable row level security;
alter table transactions enable row level security;

create policy "anon all materials" on materials for all using (true) with check (true);
create policy "anon all prices" on prices for all using (true) with check (true);
create policy "anon all recyclers" on recyclers for all using (true) with check (true);
create policy "anon all transactions" on transactions for all using (true) with check (true);

-- Seed data ------------------------------------------------------------------
insert into prices (category, rate_per_kg) values
  ('PCBs', 420.00),
  ('Batteries', 180.00),
  ('Cables', 172.68),
  ('Mixed plastics', 40.00)
on conflict do nothing;

insert into recyclers (id, name, materials_accepted, offered_rate) values
  ('11111111-1111-1111-1111-111111111111', 'GreenCycle Recyclers', 'PCBs, Batteries, Cables', 200.00),
  ('22222222-2222-2222-2222-222222222222', 'EcoMetal Hub', 'Cables, Batteries, Mixed plastics', 150.00),
  ('33333333-3333-3333-3333-333333333333', 'City Scrap Works', 'PCBs, Mixed plastics, Cables', 175.00)
on conflict do nothing;

-- Optional: storage bucket for lot photos (app falls back to inline photos if
-- this bucket is missing, so it is NOT required for the flow to work).
-- insert into storage.buckets (id, name, public) values ('lot-photos', 'lot-photos', true)
-- on conflict do nothing;
