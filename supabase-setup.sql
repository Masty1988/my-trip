-- ============================================
-- 🏰 Trip App - Supabase Setup
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Create tables
create table trips (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  start_date date not null,
  created_at timestamp with time zone default now()
);

create table categories (
  id uuid default gen_random_uuid() primary key,
  trip_id uuid not null references trips(id) on delete cascade,
  name text not null,
  position int not null default 0,
  created_at timestamp with time zone default now()
);

create table items (
  id uuid default gen_random_uuid() primary key,
  category_id uuid not null references categories(id) on delete cascade,
  name text not null,
  checked boolean not null default false,
  position int not null default 0,
  created_at timestamp with time zone default now()
);

-- 2. Enable RLS with permissive policies (MVP - no auth)
alter table trips enable row level security;
alter table categories enable row level security;
alter table items enable row level security;

create policy "Allow all on trips" on trips for all using (true) with check (true);
create policy "Allow all on categories" on categories for all using (true) with check (true);
create policy "Allow all on items" on items for all using (true) with check (true);

-- 3. Enable realtime
alter publication supabase_realtime add table items;

-- 4. Seed data
do $$
declare
  trip_id uuid;
  cat_sac uuid;
  cat_main uuid;
  cat_voiture uuid;
  cat_nuits uuid;
begin
  -- Trip
  insert into trips (name, start_date)
  values ('🏰 Opération Mickey', '2025-04-17')
  returning id into trip_id;

  -- Category 1: Check list sac
  insert into categories (trip_id, name, position)
  values (trip_id, '🎒 Check list sac', 0)
  returning id into cat_sac;

  insert into items (category_id, name, position) values
    (cat_sac, 'POUSSETTE DOUBLE (Vital)', 0),
    (cat_sac, 'Gourdes d''eau (x2 ou x3)', 1),
    (cat_sac, 'Snacks', 2),
    (cat_sac, 'Ponchos de pluie (x3)', 3),
    (cat_sac, 'Parapluie', 4),
    (cat_sac, 'Vêtements de rechange', 5),
    (cat_sac, 'Batterie externe + Câble', 6),
    (cat_sac, 'Casquette/Lunettes OU Bonnets', 7);

  -- Category 2: Check-list sac à main
  insert into categories (trip_id, name, position)
  values (trip_id, '👜 Check-list sac à main', 1)
  returning id into cat_main;

  insert into items (category_id, name, position) values
    (cat_main, 'Vignette Crit''Air', 0),
    (cat_main, 'Billets Disney sur 2 téléphones', 1),
    (cat_main, 'Carte d''identité des enfants', 2);

  -- Category 3: Check-list voiture
  insert into categories (trip_id, name, position)
  values (trip_id, '🚗 Check-list voiture', 2)
  returning id into cat_voiture;

  insert into items (category_id, name, position) values
    (cat_voiture, 'Réservoir plein', 0),
    (cat_voiture, 'Niveaux', 1),
    (cat_voiture, 'Roues', 2),
    (cat_voiture, 'Clé usb photos musique', 3),
    (cat_voiture, 'Support iPad', 4);

  -- Category 4: Check-list nuits
  insert into categories (trip_id, name, position)
  values (trip_id, '🛏️ Check-list nuits', 3)
  returning id into cat_nuits;

  insert into items (category_id, name, position) values
    (cat_nuits, 'Pyjamas', 0),
    (cat_nuits, 'Doudous', 1),
    (cat_nuits, 'Couches', 2),
    (cat_nuits, 'Oreilles maman papa Nono', 3),
    (cat_nuits, 'Serviette bain', 4);
end $$;
