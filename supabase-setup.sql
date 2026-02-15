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

create table days (
  id uuid default gen_random_uuid() primary key,
  trip_id uuid not null references trips(id) on delete cascade,
  name text not null,
  date date not null,
  position int not null default 0,
  created_at timestamp with time zone default now()
);

create table zones (
  id uuid default gen_random_uuid() primary key,
  day_id uuid not null references days(id) on delete cascade,
  name text not null,
  icon text not null default '',
  position int not null default 0,
  created_at timestamp with time zone default now()
);

create table suggestions (
  id uuid default gen_random_uuid() primary key,
  zone_id uuid not null references zones(id) on delete cascade,
  title text not null,
  description text,
  time_hint text,
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

alter table days enable row level security;
alter table zones enable row level security;
alter table suggestions enable row level security;

create policy "Allow all on days" on days for all using (true) with check (true);
create policy "Allow all on zones" on zones for all using (true) with check (true);
create policy "Allow all on suggestions" on suggestions for all using (true) with check (true);

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

-- 5. Seed guide data (days / zones / suggestions)
do $$
declare
  v_trip_id uuid;
  v_day_id uuid;
  v_zone_id uuid;
begin
  -- Get the existing trip
  select id into v_trip_id from trips where name = '🏰 Opération Mickey' limit 1;

  -- === VENDREDI 17/04 - Le Déploiement ===
  insert into days (trip_id, name, date, position)
  values (v_trip_id, 'Vendredi : Le Déploiement', '2025-04-17', 0)
  returning id into v_day_id;

  -- Zone: Après-midi
  insert into zones (day_id, name, icon, position)
  values (v_day_id, 'Après-midi', '🚗', 0)
  returning id into v_zone_id;

  insert into suggestions (zone_id, title, description, time_hint, position) values
    (v_zone_id, 'Arrêt de travail', 'Mentalement', '~16h30', 0),
    (v_zone_id, 'Chargement voiture', 'Tétris niveau Expert - Sac "Nuit 1" accessible', '~17h15', 1),
    (v_zone_id, 'Dîner express enfants', 'Solide avant de partir', '~17h45', 2),
    (v_zone_id, 'DÉPART', null, '~18h00', 3);

  -- Zone: Soirée
  insert into zones (day_id, name, icon, position)
  values (v_day_id, 'Soirée', '🌙', 1)
  returning id into v_zone_id;

  insert into suggestions (zone_id, title, description, time_hint, position) values
    (v_zone_id, 'Rouler jusqu''à la pause', 'A10 > Niort > Poitiers', '18h-20h', 0),
    (v_zone_id, 'PAUSE TACTIQUE', '30 min max - Pipi, couches, café - ASTUCE: Mettre les enfants en pyjama MAINTENANT', '~20h30', 1),
    (v_zone_id, 'Arrivée Paris 20e', '13 rue Victor Dejeante - Mission Parking Gambetta/Saint-Fargeau', '~23h30', 2);

  -- === SAMEDI 18/04 - Repos & Stratégie ===
  insert into days (trip_id, name, date, position)
  values (v_trip_id, 'Samedi : Repos & Stratégie', '2025-04-18', 1)
  returning id into v_day_id;

  -- Zone: Matin
  insert into zones (day_id, name, icon, position)
  values (v_day_id, 'Matin', '🌅', 0)
  returning id into v_zone_id;

  insert into suggestions (zone_id, title, description, time_hint, position) values
    (v_zone_id, 'Grasse matinée', 'Aussi tard que les jumeaux le permettent', null, 0),
    (v_zone_id, 'Sortie Parc Floral', 'Aires de jeux géantes, gratuit et défoulant', '~11h00', 1);

  -- Zone: Midi
  insert into zones (day_id, name, icon, position)
  values (v_day_id, 'Midi', '🍽️', 1)
  returning id into v_zone_id;

  insert into suggestions (zone_id, title, description, time_hint, position) values
    (v_zone_id, 'Déjeuner tranquille', null, '~13h00', 0);

  -- Zone: Après-midi
  insert into zones (day_id, name, icon, position)
  values (v_day_id, 'Après-midi', '☀️', 2)
  returning id into v_zone_id;

  insert into suggestions (zone_id, title, description, time_hint, position) values
    (v_zone_id, 'SIESTE DE COMBAT', 'Non négociable, tout le monde se repose', '~16h00', 0),
    (v_zone_id, 'Préparation sacs Disney', null, '~18h00', 1),
    (v_zone_id, 'Dîner pâtes', 'Sucres lents', '~19h30', 2),
    (v_zone_id, 'Extinction des feux', null, '~20h30', 3);

  -- === DIMANCHE 19/04 - Disneyland (Mode Commando) ===
  insert into days (trip_id, name, date, position)
  values (v_trip_id, 'Dimanche : Disneyland (Mode Commando)', '2025-04-19', 2)
  returning id into v_day_id;

  -- Zone: Matin - L'Offensive
  insert into zones (day_id, name, icon, position)
  values (v_day_id, 'Matin - L''Offensive', '🌅', 0)
  returning id into v_zone_id;

  insert into suggestions (zone_id, title, description, time_hint, position) values
    (v_zone_id, 'Réveil', null, '~07h45', 0),
    (v_zone_id, 'Départ voiture', 'A4, ~35 min le dimanche', '~08h30', 1),
    (v_zone_id, 'Parking Disney', 'PHOTO de la place + Air tag', '~09h15', 2),
    (v_zone_id, 'Peter Pan''s Flight', 'PRIORITÉ ABSOLUE', null, 3),
    (v_zone_id, 'Le Carrousel de Lancelot', 'Juste à côté', null, 4),
    (v_zone_id, 'It''s a Small World', 'Le monde des poupées', null, 5),
    (v_zone_id, 'Le Pays des Contes de Fées', 'Bateau calme', null, 6);

  -- Zone: Midi - Ravitaillement
  insert into zones (day_id, name, icon, position)
  values (v_day_id, 'Midi - Ravitaillement', '🍽️', 1)
  returning id into v_zone_id;

  insert into suggestions (zone_id, title, description, time_hint, position) values
    (v_zone_id, 'Manger', 'Avant la foule - Spot: Au Chalet de la Marionnette ou bancs Discoveryland', '~11h30', 0);

  -- Zone: Après-midi - Diviser pour régner
  insert into zones (day_id, name, icon, position)
  values (v_day_id, 'Après-midi - Diviser pour régner', '☀️', 2)
  returning id into v_zone_id;

  insert into suggestions (zone_id, title, description, time_hint, position) values
    (v_zone_id, 'ÉQUIPE ALPHA (Papa + Grand)', 'Big Thunder Mountain, Star Tours (si aime Star Wars)', null, 0),
    (v_zone_id, 'ÉQUIPE BRAVO (Maman + Jumeaux)', 'Orbitron, Autopia, Les Mystères du Nautilus, Spectacle Disney Junior', null, 1),
    (v_zone_id, 'Goûter stratégique', 'Sucre pour tenir', '~17h00', 2),
    (v_zone_id, 'La Parade', 'Stars on Parade', '~17h30', 3),
    (v_zone_id, 'Départ', 'Avant fermeture pour éviter bouchons', '~18h30', 4);
end $$;
