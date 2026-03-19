# Release Checklist — v1

## 1) Pré-flight (technique)
- [ ] `npm ci` passe sans erreur
- [ ] `npm run test` passe
- [ ] `npm run build` passe
- [ ] Variables d'environnement Supabase configurées en production
- [ ] Build Cloudflare Pages verte

## 2) QA gameplay (manuel)
- [ ] Lancement d'une partie standard
- [ ] Sélection / placement d'unités fonctionnels
- [ ] Progression des vagues sans blocage
- [ ] Écran de fin de partie affiché correctement
- [ ] Rejouer une partie sans rechargement page

## 3) QA systèmes
- [ ] Auth utilisateur (login/logout) fonctionne
- [ ] Soumission score leaderboard fonctionne
- [ ] Lecture leaderboard fonctionne
- [ ] Quêtes journalières / achievements non régressés

## 4) Perf & stabilité
- [ ] Vérification desktop (Chrome/Edge)
- [ ] Vérification mobile (viewport + interactions)
- [ ] Pas d'erreurs bloquantes en console
- [ ] Relevé perf rapide (FPS ressenti stable)

## 5) Go-live
- [ ] Notes de version finalisées (`docs/release-notes-v1.md`)
- [ ] Plan de rollback validé (`docs/rollback-plan.md`)
- [ ] Tag Git créé (`v1.0.0`)
- [ ] Release GitHub publiée
