

# 🏰 Auto Tactical Tower Defense — Plan d'implémentation

## Phase 1 : Moteur de jeu & Map
- **Canvas 2D** intégré dans un composant React, avec une game loop (update/render à 60fps)
- **Map** avec un chemin prédéfini (path composé de waypoints) dessiné sur le canvas
- **Slots de placement** visibles sur la map (cercles bleus cliquables le long du chemin)
- Architecture modulaire : `GameEngine`, `GameState`, `EnemyManager`, `TowerManager`, `WaveManager`
- **Dark theme** avec formes géométriques : ennemis (cercles rouges), unités (carrés bleus), projectiles (points jaunes)

## Phase 2 : Système d'ennemis & Vagues
- **Ennemis** avec HP, vitesse, qui suivent le chemin waypoint par waypoint
- **Barres de vie** au-dessus des ennemis
- **Système de vagues** numérotées avec spawn à intervalle régulier
- Scaling progressif (HP et nombre d'ennemis augmentent par vague)
- Dégâts à la base quand un ennemi atteint la fin du chemin
- **Bouton "Start Next Wave"** avec pause entre les vagues

## Phase 3 : Système d'unités & Combat automatique
- **Unités placeholders** (Unit A, B, C, D) avec stats : HP, Attack, Attack Speed, Range
- Placement en cliquant sur un slot vide → sélection d'une unité depuis la barre inférieure
- **Ciblage automatique** : l'unité cible l'ennemi le plus proche dans sa portée
- **Projectiles** animés ou attaque instantanée selon le type d'unité
- **Feedback visuel** : trait/projectile quand l'unité tire, effet d'impact sur l'ennemi
- Retrait/remplacement d'unité entre les vagues

## Phase 4 : Économie & Amélioration
- **Or** gagné en tuant des ennemis, affiché dans la barre supérieure
- **Coût de placement** pour chaque unité
- **Système d'amélioration** (upgrade) : cliquer sur une unité placée pour améliorer ses stats (dégâts, vitesse, portée)
- Coût d'amélioration croissant par niveau

## Phase 5 : Interface utilisateur
- **Barre supérieure** : Or | Vague actuelle | HP de la base
- **Zone centrale** : Canvas avec la map, le chemin, les slots, les unités et ennemis
- **Barre inférieure** : Sélection des unités disponibles (avec coût affiché) + Bouton Start Wave
- **Panneau d'info** au clic sur une unité placée (stats + bouton upgrade)
- Écrans de victoire/défaite

## Phase 6 : IA & Polish
- **Priorité de ciblage configurable** par unité : plus proche, plus faible HP, plus avancé sur le chemin
- **Animations fluides** : mouvement des ennemis interpolé, projectiles animés
- Game over quand la base tombe à 0 HP
- Préparation de la structure pour les futures extensions (rareté, compétences, synergies, rogue-like)

## Architecture technique
Tout le code sera modulaire et organisé :
- `src/game/` — moteur : `GameEngine.ts`, `GameState.ts`, `GameLoop.ts`
- `src/game/entities/` — `Unit.ts`, `Enemy.ts`, `Projectile.ts`, `Slot.ts`
- `src/game/managers/` — `EnemyManager.ts`, `TowerManager.ts`, `WaveManager.ts`
- `src/game/data/` — configs des unités, vagues, maps
- `src/components/game/` — composants React (Canvas, UI overlay, panels)
- Données de jeu en JSON/objets configurables pour faciliter l'ajout futur de contenu

