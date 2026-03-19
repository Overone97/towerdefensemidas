# Incident Runbook — TowerDefense Midas

## Objectif
Réagir vite quand la prod casse et relier les erreurs à une version déployée.

## Pré-requis
- Dashboard Cloudflare Pages accessible
- Dashboard Supabase accessible
- Logs navigateur (console) disponibles

## Checklist incident (rapide)
1. Confirmer l'URL impactée (prod / preview).
2. Vérifier le dernier déploiement Cloudflare (statut + commit).
3. Ouvrir la console du navigateur et filtrer les logs `[obs]`.
4. Identifier:
   - `event` (ex: `window_error`, `unhandled_rejection`)
   - timestamp
   - version (`VITE_APP_VERSION` si défini)
5. Vérifier Supabase (latence/erreur auth/erreur insert leaderboard).
6. Si incident confirmé:
   - rollback vers build précédent
   - ouvrir une issue postmortem

## Postmortem minimal
- Impact utilisateur
- Fenêtre temporelle
- Cause racine
- Correctif appliqué
- Action préventive
