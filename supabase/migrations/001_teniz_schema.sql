create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  role text not null check (role in ('fisherman', 'buyer', 'inspector')),
  created_at timestamptz not null default now()
);

create table if not exists public.catches (
  id uuid primary key default gen_random_uuid(),
  fisherman_id uuid not null references public.users(id) on delete cascade,
  fish_type text not null,
  weight_kg numeric(10,2) not null check (weight_kg >= 0),
  size_cm numeric(10,2) not null check (size_cm >= 0),
  photo_url text,
  latitude double precision not null,
  longitude double precision not null,
  is_legal boolean not null default false,
  ai_verdict jsonb,
  quota_used numeric(10,2) not null default 0,
  qr_code text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.lots (
  id uuid primary key default gen_random_uuid(),
  catch_id uuid not null references public.catches(id) on delete cascade,
  fisherman_id uuid not null references public.users(id) on delete cascade,
  price_per_kg numeric(10,2) not null check (price_per_kg >= 0),
  weight_kg numeric(10,2) not null check (weight_kg >= 0),
  status text not null default 'active' check (status in ('active', 'sold')),
  buyer_id uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.quotas (
  id uuid primary key default gen_random_uuid(),
  fish_type text not null,
  total_kg numeric(10,2) not null,
  used_kg numeric(10,2) not null default 0,
  season_year int not null
);

create table if not exists public.zones (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  latitude double precision not null,
  longitude double precision not null,
  risk_level int not null check (risk_level between 1 and 10)
);

alter table public.users enable row level security;
alter table public.catches enable row level security;
alter table public.lots enable row level security;
alter table public.quotas enable row level security;
alter table public.zones enable row level security;

create policy "public read users" on public.users for select using (true);
create policy "public read catches" on public.catches for select using (true);
create policy "public read lots" on public.lots for select using (true);
create policy "public read quotas" on public.quotas for select using (true);
create policy "public read zones" on public.zones for select using (true);
create policy "mvp insert catches" on public.catches for insert with check (true);
create policy "mvp insert lots" on public.lots for insert with check (true);

insert into public.users (id, name, phone, role) values
  ('00000000-0000-0000-0000-000000000001', 'Арман Сагындык', '+7 701 225 44 10', 'fisherman'),
  ('00000000-0000-0000-0000-000000000002', 'Марат Жанабай', '+7 702 118 91 42', 'fisherman'),
  ('00000000-0000-0000-0000-000000000003', 'Aqtau Fish Market', '+7 7292 55 13 77', 'buyer'),
  ('00000000-0000-0000-0000-000000000004', 'Инспектор Айдана', '+7 701 700 80 20', 'inspector')
on conflict (id) do nothing;

insert into public.quotas (fish_type, total_kg, used_kg, season_year) values
  ('сазан', 1200, 487, 2026),
  ('вобла', 2200, 1218, 2026),
  ('судак', 980, 642, 2026),
  ('осётр', 120, 88, 2026)
on conflict do nothing;

insert into public.zones (name, latitude, longitude, risk_level) values
  ('Актау порт', 43.65, 51.16, 3),
  ('Форт-Шевченко', 44.51, 50.26, 5),
  ('Кендерли', 42.51, 52.05, 4),
  ('Северная линия', 45.08, 51.05, 8)
on conflict do nothing;

insert into public.catches (
  id, fisherman_id, fish_type, weight_kg, size_cm, photo_url,
  latitude, longitude, is_legal, ai_verdict, quota_used, qr_code, created_at
) values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'судак', 18.4, 44, '/fish-demo.svg', 43.674, 51.172, true, '{"вид":"судак","размер_см":44,"законно":true,"вердикт":"МОЖНО ПРОДАВАТЬ","причина":"Судак больше минимального размера 38 см."}', 18.4, 'TNZ-SDK-001', now() - interval '1 hour'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'вобла', 32.8, 19, '/fish-demo.svg', 43.735, 51.198, true, null, 32.8, 'TNZ-VBL-002', now() - interval '3 hours'),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', 'сазан', 21.2, 46, '/fish-demo.svg', 43.884, 51.284, true, null, 21.2, 'TNZ-SZN-003', now() - interval '5 hours'),
  ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002', 'осётр', 9.8, 55, '/fish-demo.svg', 44.190, 51.515, false, null, 0, 'TNZ-OST-004', now() - interval '7 hours'),
  ('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'судак', 46.1, 49, '/fish-demo.svg', 44.435, 51.612, true, null, 46.1, 'TNZ-SDK-005', now() - interval '9 hours'),
  ('10000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000002', 'вобла', 15.5, 18, '/fish-demo.svg', 44.639, 51.406, true, null, 15.5, 'TNZ-VBL-006', now() - interval '11 hours'),
  ('10000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', 'сазан', 28.6, 41, '/fish-demo.svg', 44.840, 51.236, true, null, 28.6, 'TNZ-SZN-007', now() - interval '14 hours'),
  ('10000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000002', 'судак', 12.7, 36, '/fish-demo.svg', 45.020, 51.064, false, null, 0, 'TNZ-SDK-008', now() - interval '18 hours'),
  ('10000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000001', 'осётр', 6.9, 67, '/fish-demo.svg', 45.163, 50.923, true, null, 6.9, 'TNZ-OST-009', now() - interval '21 hours'),
  ('10000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000002', 'вобла', 52.3, 20, '/fish-demo.svg', 44.280, 50.840, true, null, 52.3, 'TNZ-VBL-010', now() - interval '23 hours')
on conflict (id) do nothing;

insert into public.lots (catch_id, fisherman_id, price_per_kg, weight_kg, status, buyer_id, created_at) values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 3100, 18.4, 'active', null, now() - interval '50 minutes'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 1180, 32.8, 'active', null, now() - interval '2 hours'),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', 1950, 21.2, 'active', null, now() - interval '4 hours'),
  ('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 3300, 46.1, 'active', null, now() - interval '8 hours'),
  ('10000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000001', 8900, 6.9, 'sold', '00000000-0000-0000-0000-000000000003', now() - interval '20 hours')
on conflict do nothing;

insert into storage.buckets (id, name, public)
values ('catch-photos', 'catch-photos', true)
on conflict (id) do nothing;
