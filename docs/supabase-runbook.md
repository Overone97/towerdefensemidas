# Runbook Supabase — TowerDefense Midas

## Projet actif
- Project ref: `bzateqbygxvvbaqcwhsk`
- Région: `eu-central-1`
- Dashboard: `https://supabase.com/dashboard/project/bzateqbygxvvbaqcwhsk`

## Variables frontend (Cloudflare Pages)
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

## Workflow migrations
1. Créer une migration locale:
   ```bash
   supabase migration new <nom_migration>
   ```
2. Éditer le SQL dans `supabase/migrations/*.sql`.
3. Tester localement si besoin (`supabase start`).
4. Lier le repo au projet distant:
   ```bash
   supabase link --project-ref bzateqbygxvvbaqcwhsk
   ```
5. Pousser les migrations:
   ```bash
   supabase db push
   ```

## RLS actuel (leaderboard)
- `SELECT`: public (lecture ouverte)
- `INSERT`: public (soumission ouverte)

## Risques anti-abus
- Spam de scores possibles (table publique)
- Valeurs extrêmes possibles sans validation serveur

## Recommandations prochain lot
- Ajouter validation côté DB (bornes score/wave)
- Ajouter rate limiting (Edge Function / proxy)
- Option: passer insert via endpoint serveur signé

## Commandes utiles
```bash
supabase projects list
supabase projects api-keys --project-ref bzateqbygxvvbaqcwhsk
supabase db push
supabase migration list
```
