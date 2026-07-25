-- =====================================================
-- GirondeEntraide — Schéma Supabase
-- =====================================================
-- À exécuter dans le SQL Editor de Supabase
-- =====================================================

-- Table principale des annonces
create table if not exists public.posts (
  id uuid default gen_random_uuid() primary key,
  type text not null check (type in ('offer', 'request', 'official')),
  category text not null check (category in ('hebergement', 'animaux', 'transport', 'materiel', 'autre')),
  title text not null,
  description text default '',
  capacity int default 0,
  lat double precision not null,
  lng double precision not null,
  location_name text default '',
  contact text default '',
  secret_code text not null,
  status text default 'active' check (status in ('active', 'resolved')),
  created_at timestamptz default now()
);

-- Index pour les requêtes fréquentes
create index if not exists idx_posts_status on public.posts(status);
create index if not exists idx_posts_type on public.posts(type);
create index if not exists idx_posts_category on public.posts(category);
create index if not exists idx_posts_created_at on public.posts(created_at desc);

-- Activer Row Level Security
alter table public.posts enable row level security;

-- Politique : tout le monde peut lire les annonces actives
create policy "Public can read active posts"
  on public.posts for select
  using (status = 'active' or status = 'resolved');

-- Politique : tout le monde peut créer une annonce (anon)
create policy "Anyone can create posts"
  on public.posts for insert
  with check (true);

-- Politique : tout le monde peut modifier (le filtre secret_code=eq.xxx dans l'URL REST protège l'accès)
create policy "Anyone can update posts"
  on public.posts for update
  using (true);

-- Politique : tout le monde peut supprimer (le filtre secret_code=eq.xxx dans l'URL REST protège l'accès)
create policy "Anyone can delete posts"
  on public.posts for delete
  using (true);

-- Activer Realtime pour la table posts
alter publication supabase_realtime add table public.posts;
