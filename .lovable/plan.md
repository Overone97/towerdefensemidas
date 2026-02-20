

# Monstres de la Faille de l'Invocateur + Plus de vagues

## Vue d'ensemble

Remplacement des 5 types d'ennemis actuels par des monstres iconiques de League of Legends, ajout de 4 nouveaux types (dragons elementaires + Atakhan), et augmentation du nombre de vagues a 50 avec une courbe de difficulte progressive et addictive.

## Nouveaux types d'ennemis (9 au total)

| Type code | Monstre LoL | Role | Stats cles |
|---|---|---|---|
| `normal` | **Melee Minion** | Sbire de base, nombreux | HP faible, vitesse moyenne |
| `fast` | **Scuttle Crab** | Rapide, fragile | Tres rapide, HP tres faible |
| `tank` | **Red Brambleback** | Gros, lent, resistant | HP eleve, lent, armure |
| `armored` | **Super Minion** | Blinde, resist aux effets | Armure elevee, resist poison/slow |
| `dragon_fire` | **Dragon Infernal** | Boss elementaire feu | HP eleve, brule le sol, taille 14 |
| `dragon_ice` | **Dragon de Glace** | Boss elementaire glace | HP eleve, ralentit les tours proches, taille 14 |
| `dragon_earth` | **Dragon de Terre** | Boss elementaire terre | HP tres eleve, armure massive, taille 14 |
| `dragon_air` | **Dragon des Airs** | Boss elementaire air | HP moyen, tres rapide, esquive, taille 14 |
| `boss` | **Baron Nashor / Atakhan** | Boss ultime | Baron vagues 10-40, Atakhan vague 50 |

## Systeme de vagues (50 vagues)

- **Vagues 1-4** : Minions uniquement (apprentissage)
- **Vagues 5-9** : Scuttle Crabs introduits
- **Vague 10** : Premier Dragon (Infernal) comme boss
- **Vagues 11-19** : Red Bramblebacks et Super Minions introduits progressivement
- **Vague 20** : Dragon de Glace comme boss
- **Vagues 21-29** : Mix de tous les types, densite croissante
- **Vague 30** : Dragon de Terre comme boss
- **Vagues 31-39** : Difficulte elevee, spawn rapide
- **Vague 40** : Dragon des Airs comme boss + Baron Nashor
- **Vagues 41-49** : Mode hardcore, tous les types, multiplicateurs eleves
- **Vague 50** : **Atakhan** (boss final) - sprite unique, aura devastatrice

### Courbe de difficulte

La progression sera non-lineaire pour rester addictive :
- HP des ennemis : multiplication exponentielle douce (`1 + (wave-1) * 0.25 + (wave/10)^1.5`)
- Nombre d'ennemis par vague : de 5 a ~40
- Vitesse de spawn : accelere progressivement
- Recompenses : augmentent aussi pour permettre l'amelioration des unites

## Sprites pixel-art detailles

Chaque monstre aura un sprite unique dessine en canvas :

- **Melee Minion** : petit corps violet arrondi, baton, yeux jaunes lumineux, pattes animees
- **Scuttle Crab** : carapace ovale cyan/turquoise, 6 pattes animees, trainee d'eau
- **Red Brambleback** : corps massif rouge, flammes/braises sur le dos, griffes, yeux rouges
- **Super Minion** : corps large violet fonce, epaulettes et casque dores, lueur magique
- **Dragon Infernal** : silhouette de dragon rouge/orange, ailes deployees, souffle de feu anime
- **Dragon de Glace** : dragon bleu/cyan, cristaux de glace, aura glacee
- **Dragon de Terre** : dragon brun/vert, ecailles rocheuses, particules de terre
- **Dragon des Airs** : dragon blanc/gris, ailes larges, trainee de vent, semi-transparent
- **Baron Nashor** : serpent geant violet, oeil central lumineux, tentacules animees
- **Atakhan** : creature titanesque rouge/noire, multiples bras, aura de destruction, taille 20+

## Fichiers modifies

### 1. `src/game/types.ts`
- Etendre le type `EnemyType` avec les 4 nouveaux types de dragon : `'dragon_fire' | 'dragon_ice' | 'dragon_earth' | 'dragon_air'`

### 2. `src/game/data/waveData.ts`
- `TOTAL_WAVES` passe de 20 a 50
- Ajout des 4 configs de dragon dans `ENEMY_CONFIGS`
- Refonte de `getWaveEnemyPool()` pour la progression sur 50 vagues
- Refonte de `isBossWave()` pour gerer les dragons aux vagues 10/20/30/40 et Atakhan a la vague 50
- Ajustement de `getWaveConfig()` avec courbe de difficulte exponentielle douce
- Ajout d'une fonction `getBossTypeForWave()` pour determiner quel boss spawn

### 3. `src/game/rendering/enemySprites.ts`
- Refonte complete des 5 sprites existants (Minion, Scuttle, Brambleback, Super Minion, Baron/Atakhan)
- Ajout de 4 nouvelles fonctions de dessin pour les dragons elementaires
- Chaque dragon aura des effets visuels specifiques (flammes, glace, roches, vent)

### 4. `src/game/managers/WaveManager.ts`
- Mise a jour de la logique de boss pour supporter les differents types de dragons selon la vague
- Ajout de la logique Atakhan pour la vague 50

### 5. `src/components/game/WikiScreen.tsx`
- Ajout eventuel d'une section "Bestiaire" avec les noms et descriptions des monstres

### 6. `src/components/game/HUD.tsx`
- Mise a jour de l'affichage du compteur de vagues (X/50 au lieu de X/20)

