-- Level 1 seed data: categories + recyclers, realistic sample rows.

-- Prices: 4 categories
insert into prices (category, rate_per_kg) values
  ('PCBs', 420.00),
  ('Batteries', 180.00),
  ('Cables', 172.68),
  ('Mixed plastics', 40.00)
on conflict do nothing;

-- Recyclers: 3 realistic recyclers
insert into recyclers (id, name, materials_accepted, offered_rate) values
  ('11111111-1111-1111-1111-111111111111', 'GreenCycle Recyclers', 'PCBs, Batteries, Cables', 200.00),
  ('22222222-2222-2222-2222-222222222222', 'EcoMetal Hub', 'Cables, Batteries, Mixed plastics', 150.00),
  ('33333333-3333-3333-3333-333333333333', 'City Scrap Works', 'PCBs, Mixed plastics, Cables', 175.00)
on conflict do nothing;
