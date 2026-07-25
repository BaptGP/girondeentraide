# GirondeEntraide 🚨

PWA d'entraide d'urgence pour les incendies en Gironde (33).

## Démarrage rapide

```bash
npm install
npm run dev
```

L'application tourne immédiatement avec des données mockées (LocalStorage). Aucune configuration backend nécessaire.

## Stack

- **React + Vite + TypeScript**
- **Tailwind CSS** — UI sombre, contraste élevé, lisible en crise
- **Leaflet + react-leaflet** — Cartographie OpenStreetMap gratuite
- **Zustand** — Gestion d'état légère
- **Lucide-react** — Icônes claires
- **vite-plugin-pwa** — Offline-ready

## Fonctionnalités

- 🗺️ Carte interactive centrée sur la Gironde
- 🟢 Offres d'entraide / 🔴 Demandes d'urgence / 🔵 Points officiels
- 📍 Géolocalisation automatique
- 📱 PWA installable, fonctionne hors-ligne
- 🔐 Code secret à 4 chiffres pour gérer ses annonces (sans compte)

## Brancher Supabase (optionnel)

1. Créer un projet sur [supabase.com](https://supabase.com)
2. Copier `.env.example` en `.env` et remplir les clés
3. Le helper `src/lib/supabase.ts` détecte automatiquement les variables et bascule du mock vers Supabase

## Schéma SQL Supabase

```sql
create table posts (
  id uuid default gen_random_uuid() primary key,
  type text not null check (type in ('offer', 'request', 'official')),
  category text not null,
  title text not null,
  description text,
  capacity int default 0,
  lat float8 not null,
  lng float8 not null,
  location_name text,
  contact text,
  secret_code text not null,
  status text default 'active',
  created_at timestamptz default now()
);
```
