# TowerDefense Midas

Jeu Tower Defense web (React + TypeScript + Vite) avec leaderboard Supabase.

## Stack
- React 18
- TypeScript
- Vite
- Tailwind CSS / shadcn-ui
- Supabase (auth + base de données)

## Installation
```bash
npm install
cp .env.example .env
# puis renseigner les variables Supabase
npm run dev
```

## Scripts utiles
```bash
npm run dev
npm run build
npm run test
npm run lint
```

## Variables d’environnement
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

## Déploiement
- Cible: Cloudflare Pages
- Build command: `npm run build`
- Output directory: `dist`
- Important: configurer un fallback SPA (routes frontend).
