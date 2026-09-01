-- ============================================================================
-- Kabadiwala Connect — Level 1 schema (Section 1.1 of the build prompt)
-- 4 tables, basic fields only. Apply in the Supabase SQL editor.
-- ============================================================================

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

-- Demo-friendly RLS: allow anonymous reads/writes so the Level 1 flow works.
alter table materials enable row level security;
alter table prices enable row level security;
alter table recyclers enable row level security;
alter table transactions enable row level security;

create policy "anon all materials" on materials for all using (true) with check (true);
create policy "anon all prices" on prices for all using (true) with check (true);
create policy "anon all recyclers" on recyclers for all using (true) with check (true);
create policy "anon all transactions" on transactions for all using (true) with check (true);
