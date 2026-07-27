# GirondeEntraide — Plateforme d'aide incendie Gironde

Plateforme d'entraide d'urgence pour les incendies en Gironde (33). Carte interactive en temps réel permettant de proposer ou demander de l'aide : hébergement, transport, accueil d'animaux, matériel, nourriture, points de rassemblement de volontaires.

**En ligne** : [www.girondeentraide.fr](https://www.girondeentraide.fr/)

## Stack technique

- **React 18** + **Vite** + **TypeScript**
- **Tailwind CSS** pour le styling
- **Zustand** pour la gestion d'état
- **Leaflet** + **OpenStreetMap** pour la carte interactive
- **Supabase** (PostgreSQL) pour la base de données et le temps réel
- **PWA** — installable sur mobile, fonctionne hors-ligne

## Démarrage rapide

### Prérequis

- Node.js 18+
- npm

### Installation

```bash
git clone https://github.com/BaptGP/girondeentraide.git
cd girondeentraide
npm install
```

### Configuration

Copiez le fichier d'exemple et renseignez vos clés Supabase :

```bash
cp .env.example .env
```

Renseignez dans `.env` :

```
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-clé-anon
```

### Base de données

Exécutez le script `supabase_schema.sql` dans le SQL Editor de votre projet Supabase pour créer la table `posts` avec les contraintes nécessaires.

### Lancement

```bash
npm run dev
```

L'application est disponible sur `http://localhost:5173`.

### Build

```bash
npm run build
```

Les fichiers de production sont générés dans `dist/`.

## Structure du projet

```
src/
├── App.tsx                  # Composant principal, filtres, layout
├── main.tsx                 # Point d'entrée
├── store.ts                 # Store Zustand (état global)
├── types.ts                 # Types TypeScript et constantes
├── lib/
│   └── supabase.ts          # API Supabase (CRUD + realtime)
├── components/
│   ├── AddressSearch.tsx    # Recherche d'adresse (Nominatim)
│   ├── EmergencyNumbers.tsx # Bouton SOS + numéros d'urgence
│   ├── MapContainerView.tsx # Carte Leaflet avec markers
│   ├── NewPostModal.tsx     # Formulaire de création d'annonce
│   ├── PostCard.tsx         # Carte d'annonce (vue liste)
│   └── PostDetailSheet.tsx  # Détail d'une annonce
└── index.css                # Styles Tailwind + thème
```

## Fonctionnalités

- Carte interactive avec markers en temps réel
- Création d'annonces (offres, demandes, volontaires, points officiels)
- Catégories : hébergement, animaux, transport, matériel, nourriture, volontaires
- Niveau d'urgence pour les demandes critiques
- Filtrage par type, catégorie, tri par urgence
- Recherche d'adresse avec autocomplétion
- Géolocalisation de l'utilisateur
- Bouton SOS avec numéros d'urgence
- Signalement d'abus
- Synchronisation temps réel via Supabase
- PWA — installable et hors-ligne
- SEO optimisé (sitemap, robots.txt, JSON-LD, Open Graph)

## Déploiement

Le projet est déployé sur **Vercel**. La configuration est dans `vercel.json`.

## Auteur

**Eliaman** — contact@eliaman.com

## Licence

MIT — libre d'utilisation et de modification.
