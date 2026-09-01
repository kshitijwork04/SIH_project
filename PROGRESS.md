# Kabadiwala Connect — Level 2 Progress
Last updated: 2026-09-01

## Current step
**Step 2.11 — Regression test.** Steps 2.1–2.10 are built and tested. The full 3× walkthrough in en/hi/mr is complete and passing. Step 2.11 is effectively done; remaining work is only human verification against the live Supabase once the Level 2 SQL is applied.

## Completed steps (tested, working)
All Level 2 features run **self-contained** on the app's localStorage layer (the decision made for this build session). Supabase writes are best-effort write-through so nothing breaks when the Level 2 schema is applied later. Verified via a headless-Chrome end-to-end harness driving the real SPA.

- **Step 2.1 — 7 categories + material fields.** Category picker expanded to CRTs, LCD panels, PCBs, Cables, Batteries, Motors & magnets, Mixed plastics. Added `sub_category` (dropdown), `condition` (dropdown), `source_type` (dropdown), `description` (optional free text) to the create-a-lot form; all saved to the `materials` row. Verified: a PCB lot saved all new fields.
- **Step 2.2 — Full price dataset + real trend.** `prices` seeded with 7 categories × ~5 historical rows with `sub_category/location/date/market_range_low/market_range_high/recycler_offered_price/recycler_id`. Real trend logic compares recent-N avg vs previous-N avg. Verified: changing seed data flipped PCB trend up→down, and the price-board arrow reflected it. Audio button added here too (Step 2.8).
- **Step 2.3 — Full authorized recycler dataset.** Added `authorization_registration_number`, `authorization_status` (authorized/pending/expired), `facility_location`, `service_area`, `contact_details`, `pickup_availability`, plus a placeholder `distance_km`. Recycler list now shows an authorization badge + service/contact info on every card.
- **Step 2.4 — Recycler ranking.** Weighted score `w1(0.30)·distance + w2(0.30)·rate + w3(0.20)·pickup + w4(0.20)·auth`, documented in code. Sorted highest-first. Verified: boosting EcoMetal's rate/pickup/auth/distance moved it up in rank.
- **Step 2.5 — Traceability + GPS handover.** New `traceability` storage: lot_id, photo_url, weight, timestamp, gps_lat/lng, handover_reference_number (KC-XXXX-XXXX), recycler_confirmed, subsequent_status. Created on handover via browser Geolocation API alongside the transaction row; recycler confirmation updates recycler_confirmed=true + subsequent_status=confirmed. Built a traceability view showing created → matched → handed_over → confirmed.
- **Step 2.6 — Collector minimal profile.** `collectors` stores only `id`, `preferred_language`, `general_operating_location`. NO name/ID-proof/address fields anywhere in the schema. Language + general operating area collected on the enter screen and linked to the collector id.
- **Step 2.7 — Hindi + Marathi everywhere.** en.json/hi.json/mr.json dictionaries cover every UI string (labels, buttons, confirmations, empty states, errors). A reactive language store switches all screens instantly, no English fallback left behind (technical material names like PCB/CRT kept as-is by design).
- **Step 2.8 — Audio price info.** SpeechSynthesis button per category on the price board reads category + current rate in the collector's language.
- **Step 2.9 — Safety guidance.** New screen reachable from the main bottom nav + home, with pictorial (icon) cards for no open-air burning, no acid leaching, battery handling, CRT handling; each card has an audio narration button (SpeechSynthesis).
- **Step 2.10 — Full payment tracking.** `transactions` now track `payment_status` (pending/paid) and `final_price` (may differ from quoted). Recycler can enter a final price (defaults to quoted) before confirming. Cash default, no payment gateway. Ledger shows quoted vs final + payment status.
- **Step 2.11 — Regression (3×, en/hi/mr).** Full walkthrough run 9× (3 per language): enter → create lot (7 categories) → price board with audio → ranked recyclers → GPS handover → safety → recycler confirm with final price → collector ledger + traceability. **9/9 passed**, no page errors, no Level 1 regressions.

## In progress
- Nothing. All 10 steps are built and passing.

## Blockers
- **Live Supabase schema not yet updated.** The Level 2 columns/tables require DDL, but only the anon publishable key was available (cannot run ALTER/CREATE), so this build runs fully self-contained on localStorage per the session's decision. To go live: paste `l1/supabase/setup_level2.sql` (schema + seed) into the Supabase SQL editor. Once applied, the app's Supabase write-through already keeps the live DB in sync going forward. The canonical migration is `supabase/migrations/0002_level2_schema.sql`; the additive seed is `supabase/seed/002_seed_level2.sql`.

## Level 1 regression check
The original Level 1 loop still works end-to-end (verified within each of the 9 run-throughs): enter → create lot → price board → recycler → handover → recycler confirms → ledger reflects. No Level 1 breakage.

## Level 2 status
**Complete** (all 11 steps built and passing the end-to-end test in en/hi/mr — 9/9).

Backend refactor done (2026-09-01): `src/lib/data.ts` is now **Supabase-first** — Supabase is the source of truth for reads and writes, with localStorage kept only as an offline cache and the module-level seed constants (`LEVEL2_PRICES` / `LEVEL2_RECYCLERS`) as the guaranteed fallback so the UI is never empty. Live-Supabase activation is pending only on applying the provided SQL (see Blocker below).

## How to go live (backend)
The live Supabase project is confirmed to be at Level 1 only: `traceability` and `collectors` tables are missing, and `prices`/`recyclers`/`materials`/`transactions` lack the Level 2 columns (verified directly against the DB). The anon key also cannot run DDL, so apply the SQL from the Supabase SQL editor:
1. `l1/supabase/setup_level2.sql` — full Level 2 schema + seed (must run after Level 1's setup.sql).
Once applied, the app automatically reads/writes real shared data with no code changes. RLS policies are already included (anon read/write for the demo).

## How to deploy (frontend hosting)
```
cd l1
npm run build                       # → dist/
npx vercel                          # or: npx netlify deploy --prod
```
Build command: `npm run build`, output dir: `dist`. Vite inlines the `.env` Supabase keys at build time, so the deployed site points at the live backend automatically.

## How to run locally
```
cd l1
npm install
npm run dev      # → http://localhost:5173
```
Routes: `/collector/enter` (language+name+area) → `/collector` home → new-lot (7 categories) / prices (trend + audio) / safety / trace / ledger; `/recycler` to confirm handovers with a final price.

