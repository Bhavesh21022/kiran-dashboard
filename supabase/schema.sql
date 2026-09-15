-- ============================================================
-- KIRAN — Supabase schema (Phase 2)
-- Run this in: Supabase Dashboard → SQL Editor → New query → Run
-- ============================================================

-- 1. LOCATIONS: every monitored city
create table if not exists locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  state text not null,
  jurisdiction text not null default 'general', -- used to scope admin portal access
  lat double precision not null,
  lng double precision not null,
  created_at timestamptz not null default now()
);
create unique index if not exists locations_name_state_idx on locations (name, state);

-- 2. THERMAL_INDEX: every computed reading, one row per location per fetch
create table if not exists thermal_index (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references locations(id) on delete cascade,
  temp_c numeric not null,
  rh numeric not null,
  wind_kmh numeric not null default 0,
  score numeric not null,
  heat_index_c numeric not null,
  category text not null check (category in ('Low','Moderate','High','Extreme')),
  ndma_tier text not null check (ndma_tier in ('Yellow','Orange','Red')),
  recorded_at timestamptz not null default now()
);
create index if not exists thermal_index_location_time_idx
  on thermal_index (location_id, recorded_at desc);

-- 3. SUBSCRIPTIONS: who wants alerts for which location
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references locations(id) on delete cascade,
  email text,
  phone text,
  channel_email boolean not null default false,
  channel_sms boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists subscriptions_location_idx on subscriptions (location_id);

-- 4. ALERTS: log of every alert actually sent (for de-dup + admin log)
create table if not exists alerts (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references locations(id) on delete cascade,
  category text not null,
  ndma_tier text not null,
  channel text not null check (channel in ('email','sms')),
  status text not null default 'sent' check (status in ('sent','failed')),
  triggered_by text not null default 'auto' check (triggered_by in ('auto','manual')),
  sent_at timestamptz not null default now()
);
create index if not exists alerts_location_time_idx on alerts (location_id, sent_at desc);

-- 5. ADMIN_PROFILES: maps an authenticated Supabase user to a jurisdiction
create table if not exists admin_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  jurisdiction text not null default 'general',
  display_name text
);

-- 6. MODEL_PERFORMANCE: past predictions vs actual recorded heatwave events
create table if not exists model_performance (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references locations(id) on delete cascade,
  predicted_category text not null,
  actual_category text,
  event_date date not null,
  notes text
);

-- ============================================================
-- ROW LEVEL SECURITY
-- Public (anon) can READ locations + thermal_index + model_performance.
-- Public can INSERT their own subscription + alerts (distress reports later).
-- Only authenticated admins can write locations / trigger manual alerts / see full alert log.
-- ============================================================

alter table locations enable row level security;
alter table thermal_index enable row level security;
alter table subscriptions enable row level security;
alter table alerts enable row level security;
alter table admin_profiles enable row level security;
alter table model_performance enable row level security;

create policy "public read locations" on locations for select using (true);
create policy "public read thermal_index" on thermal_index for select using (true);
create policy "public read model_performance" on model_performance for select using (true);

create policy "public insert own subscription" on subscriptions for insert with check (true);
create policy "public read own subscription by email" on subscriptions
  for select using (true); -- tighten later: match auth.email() once you add user auth for subscribers

create policy "admins read alerts" on alerts for select using (
  exists (select 1 from admin_profiles where user_id = auth.uid())
);
create policy "admins read own profile" on admin_profiles for select using (user_id = auth.uid());

-- Edge Functions use the service_role key (bypasses RLS) to write
-- thermal_index and alerts — that's expected and safe since that key
-- never ships to the browser.

-- ============================================================
-- SEED DATA — a few starter cities so the app has something to show
-- ============================================================
insert into locations (name, state, jurisdiction, lat, lng) values
  ('Nagpur', 'Maharashtra', 'maharashtra', 21.1458, 79.0882),
  ('Jaipur', 'Rajasthan', 'rajasthan', 26.9124, 75.7873),
  ('Delhi', 'Delhi', 'delhi', 28.6139, 77.2090),
  ('Bhopal', 'Madhya Pradesh', 'madhya_pradesh', 23.2599, 77.4126),
  ('Bengaluru', 'Karnataka', 'karnataka', 12.9716, 77.5946),
  ('Ahmedabad', 'Gujarat', 'gujarat', 23.0225, 72.5714),
  ('Prayagraj', 'Uttar Pradesh', 'uttar_pradesh', 25.4358, 81.8463)
on conflict (name, state) do nothing;
