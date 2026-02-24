
# Suite de l'implementation - Phase 2

Les corrections critiques (bugs gold Singed, range, boss, rarete, gacha) sont faites. Voici les prochaines fonctionnalites a implementer.

---

## 1. Drag & Drop des personnages

Permettre de deplacer les unites par glisser-deposer, a la fois depuis l'inventaire vers un slot et d'un slot a un autre.

### Canvas (slot-to-slot)
- `GameCanvas.tsx` : ajouter `onMouseDown`, `onMouseMove`, `onMouseUp` pour detecter le drag d'une unite placee
- Afficher un "ghost" semi-transparent du personnage sous le curseur pendant le drag
- Au relachement sur un slot vide, appeler `engine.moveUnit(unitId, newSlotIndex)`
- `GameEngine.ts` : ajouter une methode `moveUnit(unitId, newSlotIndex)` qui libere l'ancien slot et place l'unite dans le nouveau

### Inventaire vers canvas (HTML5 drag)
- `UnitBar.tsx` : ajouter `draggable` sur les cartes de personnages, avec `onDragStart` qui stocke l'`instanceId`
- `GameCanvas.tsx` : ajouter `onDragOver` et `onDrop` pour recevoir le personnage et le placer sur le slot le plus proche

**Fichiers** : `GameCanvas.tsx`, `UnitBar.tsx`, `GameEngine.ts`

---

## 2. Panel de statistiques de degats (DPS)

Un panneau compact affichant les degats de chaque unite placee.

### Tracking dans le moteur
- `GameEngine.ts` : ajouter `damageTracker: Map<number, { totalDamage: number, waveDamage: number }>` 
- Incrementer a chaque `damages` et `dotKills` dans `update()`
- Remettre `waveDamage` a 0 au debut de chaque vague

### Composant UI
- Nouveau `DamageStatsPanel.tsx` : panneau togglable (petit bouton) affichant :
  - Barres horizontales par unite (couleur = weaponColor du perso)
  - DPS = waveDamage / tempsEcoule
  - Total damage de la wave
- Positionne a droite du canvas, sous le SynergyPanel

**Fichiers** : Nouveau `DamageStatsPanel.tsx`, `GameEngine.ts`, `TowerDefenseGame.tsx`

---

## 3. Taille de map responsive (grands ecrans)

Garder le canvas interne a 800x500 mais permettre un zoom CSS pour les grands ecrans.

- `GameCanvas.tsx` : ajouter un state `scale` et des boutons +/- (ou utiliser la taille de l'ecran pour calculer automatiquement)
- Appliquer `style={{ transform: scale(X) }}` sur le wrapper du canvas
- Detecter la taille de la fenetre avec `useEffect` + `resize` listener pour auto-scale
- Ajouter un bouton de toggle plein ecran optionnel

**Fichiers** : `GameCanvas.tsx`, `TowerDefenseGame.tsx`

---

## 4. Alignement des chemins Maps 2 et 3

Les waypoints des maps Forest et Volcano ne correspondent pas visuellement aux images de fond.

- `allMaps.ts` : ajuster les waypoints et slots des maps `forest` et `volcano`
- Pour Forest : le chemin doit suivre un trace en S plus compact aligne avec l'image
- Pour Volcano : le chemin central en U doit mieux suivre la riviere de lave visible sur le fond
- Eventuellement ajuster le `GameRenderer.ts` pour rendre le chemin plus transparent sur les maps avec image de fond (opacity 0.3 au lieu d'opaque)

**Fichiers** : `allMaps.ts`, `GameRenderer.ts`

---

## 5. Verification des talents

- Verifier que `TowerManager.getEffectiveStats()` applique bien `talentBonus.attackMult`, `speedMult`, `rangeMult`
- Ajouter dans `TalentTree.tsx` un affichage des bonus totaux actifs en bas de l'ecran ("Bonus actifs: +20% ATK, +10% SPD")
- S'assurer que les talents sont bien sauvegardes et recharges correctement

**Fichiers** : `TalentTree.tsx`, verification de `TowerManager.ts`

---

## Ordre d'implementation

1. **Drag & Drop** (point 1) - amelioration UX majeure
2. **DPS Panel** (point 2) - feedback visuel important pour le joueur
3. **Map responsive** (point 3) - amelioration pour grands ecrans
4. **Chemins maps** (point 4) - correction visuelle
5. **Talents** (point 5) - verification + amelioration UI

## Fichiers modifies/crees

| Fichier | Action |
|---|---|
| `src/components/game/GameCanvas.tsx` | Drag & drop handlers + responsive scale |
| `src/components/game/UnitBar.tsx` | Drag source pour les personnages |
| `src/game/GameEngine.ts` | `moveUnit()` + `damageTracker` |
| `src/components/game/DamageStatsPanel.tsx` | **Nouveau** - Panel de stats DPS |
| `src/components/game/TowerDefenseGame.tsx` | Integration DPS panel + layout |
| `src/game/data/allMaps.ts` | Correction waypoints Forest & Volcano |
| `src/components/game/GameRenderer.ts` | Chemin semi-transparent sur maps avec bg |
| `src/components/game/TalentTree.tsx` | Affichage bonus actifs |
