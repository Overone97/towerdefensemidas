

# Plan : 10 champions + fix chemins + layout + bouton Auto + 100 vagues

## 1. Ajouter 10 nouveaux champions LoL

### Sprites (10 PNG 64x64 via imagegen)
Generer dans `src/assets/sprites/` : `ahri.png`, `leesin.png`, `vayne.png`, `morgana.png`, `blitzcrank.png`, `katarina.png`, `twistedfate.png`, `malphite.png`, `ezreal.png`, `missfortune.png`

### `src/game/rendering/lolSprites.ts`
- Ajouter 10 imports + 10 entrees dans `SPRITE_MAP`

### `src/game/data/characterData.ts`
Ajouter dans `ALL_CHARACTERS` :
- **Ahri** (rare) - chain x3, range 130, attack 16, speed 1.1
- **Lee Sin** (rare) - burst x2, range 80, attack 22, speed 0.9
- **Vayne** (epic) - single, range 150, attack 18, speed 2.4
- **Morgana** (epic) - slow + dot AoE, range 120, attack 14, speed 0.8
- **Blitzcrank** (uncommon) - chain x2, range 100, attack 12, speed 0.7
- **Katarina** (legendary) - burst x4 + AoE, range 90, attack 26, speed 1.1
- **Twisted Fate** (rare) - line, range 180, attack 15, speed 1.0
- **Malphite** (uncommon) - aoe_circle + slow, range 85, attack 10, speed 0.6
- **Ezreal** (rare) - line, range 160, attack 17, speed 1.3
- **Miss Fortune** (epic) - rapid, range 150, attack 16, speed 2.0

## 2. Fix chemins maps - ennemis suivent le meme chemin partout

**Cause racine** : `GameEngine.restart()` appelle `createInitialState()` qui cherche `(this.saveData as any).currentMapId`. Comme `setMap()` ne met jamais a jour `saveData.currentMapId`, le restart retombe toujours sur Plains (ALL_MAPS[0]).

### `src/game/GameEngine.ts`
- Dans `setMap()` (ligne 526) : ajouter `(this.saveData as any).currentMapId = mapId;` avant `restart()`
- Dans `startEndless()` (ligne 533) : meme chose
- Dans `restart()` : s'assurer que `this.state.currentMapId` est preserve avant `createInitialState()`

### `src/game/data/allMaps.ts`
- Redefinir les waypoints Forest et Volcano pour etre visuellement distincts et couvrir tout le canvas (entree gauche, sortie droite)
- Forest : trace en zigzag forestier avec virages serres
- Volcano : trace en V inversé montant puis descendant

## 3. Layout centre (plus colle a gauche)

### `src/components/game/TowerDefenseGame.tsx`
- Ligne 240 : changer `items-start` → `items-center justify-center`
- Retirer `sticky` du TeamSidebar wrapper

### `src/components/game/GameCanvas.tsx`
- Ajouter `transform-origin: center top` au lieu de `top left` sur le wrapper scale

## 4. Bouton Auto - texte invisible quand inactif

### `src/components/game/UnitBar.tsx`
- Ligne 63 : ajouter `text-white border-gray-500 hover:bg-gray-700` au cas inactif (apres le ternaire)

## 5. Passer a 100 vagues avec difficulte progressive

### `src/game/data/waveData.ts`
- `TOTAL_WAVES = 100`
- `getWaveConfig()` : courbe HP exponentielle plus aggressive, max 60 ennemis, vitesse croissante
- `getWaveEnemyPool()` : ajouter paliers 50-100 avec plus de tanks/armored, moins de normals
- `getBossTypeForWave()` : etendre switch pour vagues 55-100 (double dragons, multi-barons, Atakhan final a 100)

## Fichiers modifies/crees

| Fichier | Action |
|---|---|
| 10x `src/assets/sprites/*.png` | **Nouveaux** - sprites pixel art |
| `src/game/rendering/lolSprites.ts` | 10 imports + SPRITE_MAP |
| `src/game/data/characterData.ts` | 10 champions dans ALL_CHARACTERS |
| `src/game/GameEngine.ts` | Fix saveData.currentMapId |
| `src/game/data/allMaps.ts` | Nouveaux waypoints Forest & Volcano |
| `src/components/game/TowerDefenseGame.tsx` | Centrer layout |
| `src/components/game/GameCanvas.tsx` | transform-origin center |
| `src/components/game/UnitBar.tsx` | Couleur bouton Auto inactif |
| `src/game/data/waveData.ts` | 100 vagues + scaling |

