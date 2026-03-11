

## Plan : Skins cosmétiques + Équilibrage Blitz Infernal

### 1. Équilibrage du donjon "Blitz Infernal"

Le donjon a 20 vagues en 3 minutes (180s), ce qui est trop serré. Corrections :

- **Réduire les vagues de 20 → 12** pour que ce soit faisable
- **Augmenter le timer de 180s → 300s** (5 minutes)
- **Augmenter le startGold de 350 → 450** pour pouvoir déployer plus vite
- **Réduire le enemySpeedMult de 1.4 → 1.25** légèrement

Fichier : `src/game/data/dungeonData.ts` — modifier l'entrée `dungeon_blitz`.

---

### 2. Système de Skins cosmétiques (Plan 4)

#### Concept
Les champions peuvent avoir des skins alternatifs qui changent leur apparence visuelle (couleurs du sprite). Skins débloqués via achievements, prestige ou complétion de donjons.

#### Données
Nouveau fichier `src/game/data/skinData.ts` :
- Interface `SkinDef` : `id`, `championId`, `name`, `bodyColor`, `detailColor`, `weaponColor`, `unlockCondition` (type + valeur)
- ~15 skins pour les champions populaires (Garen, Jinx, Yasuo, Lux, Zed, etc.)
- Conditions de déblocage : prestige level, dungeon completé, achievement, vague endless atteinte

#### Sauvegarde
- Ajouter `unlockedSkins: string[]` et `equippedSkins: Record<string, string>` (championId → skinId) dans `SaveData`
- Mise à jour de `SaveManager.ts`

#### Logique
- `GameEngine.ts` : méthodes `unlockSkin()`, `equipSkin()`, `getUnlockedSkins()`
- Vérification auto des conditions de déblocage (après prestige, après donjon, etc.)
- Quand un champion est rendu, utiliser les couleurs du skin équipé au lieu des couleurs par défaut

#### Rendu
- `GameRenderer.ts` : lors du dessin d'une unité, vérifier si un skin est équipé et utiliser ses couleurs
- Effet subtil (particules ou bordure) sur les unités avec skin

#### UI
- Nouveau composant `SkinSelector.tsx` accessible depuis `UnitInfoPanel` ou un nouvel écran
- Grille de skins avec preview des couleurs, état verrouillé/déverrouillé, condition affichée
- Bouton "Équiper" / "Retirer"
- Intégration dans le flow principal via `TowerDefenseGame.tsx` (nouvel écran ou modal)

#### Fichiers modifiés
- Créer : `src/game/data/skinData.ts`, `src/components/game/SkinSelector.tsx`
- Modifier : `src/game/types.ts` (SaveData), `src/game/managers/SaveManager.ts`, `src/game/GameEngine.ts`, `src/components/game/GameRenderer.ts`, `src/components/game/UnitInfoPanel.tsx`, `src/components/game/TowerDefenseGame.tsx`

