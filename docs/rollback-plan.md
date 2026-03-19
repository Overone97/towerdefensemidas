# Rollback Plan — v1

## Objectif
Revenir rapidement à une version stable en cas d'incident post-déploiement.

## Déclencheurs
- Erreur critique empêchant de jouer
- Erreur auth généralisée
- Erreur leaderboard massive

## Procédure
1. Identifier le dernier commit/tag stable sur `main`.
2. Relancer un déploiement Cloudflare sur ce commit stable.
3. Vérifier login + lancement partie + leaderboard.
4. Communiquer le rollback (issue + note interne).

## Vérification post-rollback
- Site accessible
- Partie jouable
- Plus d'erreurs critiques console

## Suivi
- Ouvrir un postmortem avec cause racine + correctif prévu
