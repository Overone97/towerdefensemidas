# TowerDefense Midas

Petit jeu **Tower Defense web** construit avec **React + TypeScript + Vite**, avec une interface arcade, un système de progression, et une intégration **Supabase** pour l'authentification et le leaderboard.

## Aperçu
Le projet propose une expérience tower defense jouable dans le navigateur, avec une présentation très orientée jeu :
- interface HUD complète
- draft de champions / unités
- mode **ARAM**
- système d'augmentations
- quêtes journalières
- équipements
- achievements
- leaderboard / auth via Supabase

## Stack technique
- **React 18**
- **TypeScript**
- **Vite**
- **Tailwind CSS**
- **shadcn/ui**
- **Supabase** (auth + backend)

## Lancer le projet en local
### 1) Installer les dépendances
```bash
npm install
```

### 2) Configurer les variables d'environnement
```bash
cp .env.example .env
```
Puis renseigner les variables Supabase dans `.env`.

### 3) Démarrer le serveur de dev
```bash
npm run dev
```

L'application sera disponible sur l'URL locale affichée par Vite.

## Scripts utiles
```bash
npm run dev
npm run build
npm run preview
npm run lint
npm run test
```

## Variables d'environnement
Le projet attend au minimum :
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

## Structure rapide du projet
```text
src/
├── components/game/   # UI et écrans de jeu
├── game/              # logique, data, managers, rendu
├── pages/             # pages React
└── integrations/      # clients et intégrations externes
```

## Fonctionnalités visibles dans le projet
- **Draft de champions** avec rareté et profils différents
- **Mode duo / ARAM**
- **Augmentations** entre certaines vagues
- **Système d'équipements** et crafting
- **Quêtes journalières**
- **Achievements**
- **Leaderboard / connexion utilisateur** avec Supabase
- **Rendu canvas** pour la partie gameplay

## Build de production
```bash
npm run build
```
Le build sort dans :
```bash
dist/
```

## Observabilité minimale
- Les logs structurés `[obs]` sont émis au boot et sur erreurs globales (`window_error`, `unhandled_rejection`).
- Runbook incident: `docs/incident-runbook.md`.

## Runbooks release
- Checklist release v1: `docs/release-v1-checklist.md`
- Notes de version v1: `docs/release-notes-v1.md`
- Plan de rollback: `docs/rollback-plan.md`

## Déploiement
Déploiement pensé pour **Cloudflare Pages** :
- Build command : `npm run build`
- Si interface classique : Output directory `dist`
- Si interface imposant Wrangler : `npx wrangler pages deploy dist`
- Fallback SPA : `public/_redirects` est fourni (`/* /index.html 200`)

## Idées d'amélioration pour la suite
- ajouter des **captures d'écran / GIF** dans le README
- documenter davantage les **modes de jeu**
- ajouter un mini schéma de l'architecture (`UI -> game managers -> rendering -> Supabase`)
- détailler le modèle de données Supabase

## Contribution
Si tu veux proposer une amélioration :
1. fork le repo
2. crée une branche
3. fais ton changement
4. ouvre une PR

