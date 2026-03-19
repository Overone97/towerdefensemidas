# Audit initial — extraction Lovable

Date: 2026-03-19

## Résumé
Le projet était un export Lovable fonctionnel côté gameplay, mais avec plusieurs couches et conventions à retirer pour une exploitation GitHub/Cloudflare/Supabase propre.

## Constat initial (avant nettoyage)
- Couche Lovable présente:
  - dossier `.lovable/`
  - dépendance `@lovable.dev/cloud-auth-js`
  - plugin Vite `lovable-tagger`
  - intégration `src/integrations/lovable/index.ts`
  - README template Lovable
- Auth frontend couplée à Lovable (`AuthButton.tsx`)
- `.env` versionné dans Git (risque hygiène secrets)
- Lockfiles mixtes (`package-lock.json` + `bun.lock` + `bun.lockb`)

## Actions réalisées
- Auth migrée de Lovable vers Supabase natif
- Suppression de la couche Lovable (code + dépendances + dossier)
- Durcissement `.gitignore` pour `.env*` (sauf `.env.example`)
- Retrait de `.env` du versioning
- Ajout de `.env.example`
- README réécrit en mode projet standard
- Suppression des artefacts Bun pour standardiser npm

## Risques résiduels
- Dette lint importante héritée (règles strictes TypeScript/ESLint)
- Vulnérabilités npm à traiter progressivement (pas bloquant immédiat gameplay)
- Supabase CLI localement non lié (erreur `Forbidden resource`) donc opérations DB distantes bloquées tant que le token/projet n'est pas corrigé

## Plan de rollback (court)
- Toutes les suppressions sont versionnées dans Git (`main`)
- En cas de régression auth/build:
  1. revert du commit de migration
  2. validation locale (`npm run test`, `npm run build`)
  3. re-déploiement Cloudflare

## Estimation effort (lots)
- Lot A (fait): extraction Lovable + hygiène secrets — **S**
- Lot B: stabilisation CI bloquante avec lint complet — **M/L** (dette de code)
- Lot C: stabilisation Supabase prod-ready (RLS/migrations/runbook) — **M**
- Lot D: déploiement Cloudflare Pages + checks prod — **S/M**
