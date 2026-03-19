# Release Notes — v1.0.0

## Highlights
- Migration hors Lovable finalisée
- Intégration Supabase stabilisée
- CI GitHub en place (test + build)
- Observabilité minimale ajoutée

## Changements clés
- Suppression de la couche Lovable (auth/plugins/scripts)
- Nettoyage du projet et standardisation npm-only
- Durcissement leaderboard (validation front + contraintes DB)
- Documentation infra/runbooks enrichie

## Known Issues
- Lint strict encore en transition (suivi: issue #16)
- Déploiement Cloudflare à finaliser selon setup Pages/Workers

## Post-release
- Surveiller logs `[obs]` en prod les 24 premières heures
- Vérifier volume/santé des écritures leaderboard
