

# Plan: 7 ameliorations majeures

## 1. Sauvegarde des positions par map + auto-deploy

**Probleme** : Quand on change de map, les positions des unites sont perdues.

**Solution** :
- `SaveManager.ts` : Ajouter `mapDeployments: Record<string, { slotIndex: number; instanceId: number }[]>` dans `SaveData`
- `GameEngine.ts` : Dans `setMap()` et `startEndless()`, sauvegarder les positions actuelles dans `saveData.mapDeployments[currentMapId]` avant de changer. Au chargement d'une map, restaurer les positions depuis `mapDeployments[newMapId]` si elles existent
- Ajouter une methode `autoDeploy()` qui place automatiquement les unites les plus fortes sur les slots disponibles (tri par DPS decroissant)
- Bouton "Auto Deploy" dans `UnitBar.tsx`

## 2. Conserver le x2 entre les ecrans

**Probleme** : Le composant `GameCanvas` est remonte quand on change d'ecran (talents, maps...), ce qui reinitialise le state local `gameSpeed`.

**Solution** :
- `GameEngine.ts` : Ajouter `gameSpeed: number` au state du moteur (pas au composant)
- `GameCanvas.tsx` : Lire `engine.state.gameSpeed` au lieu du state local. Le `toggleSpeed` modifie `engine.state.gameSpeed`
- Ajouter `gameSpeed` a `GameState` dans `types.ts`

## 3. Contraste quetes (noir sur bleu fonce)

**Probleme** : Dans `DailyQuestPanel.tsx`, les textes utilisent `text-xs font-mono` sans couleur explicite, ce qui donne du texte sombre sur fond sombre.

**Solution** :
- `DailyQuestPanel.tsx` : Ajouter `text-white` ou `text-gray-200` aux descriptions de quetes et aux labels de recompenses pour garantir la lisibilite

## 4. Chateau visible a la fin du parcours

**Probleme** : Le chateau (drawBase) est dessine au dernier waypoint, souvent a x=800 (bord droit), donc a moitie hors ecran.

**Solution** :
- `GameRenderer.ts` dans `drawBase()` : Decaler le chateau de 20-30px vers la gauche si le dernier waypoint est a x >= 780. Agrandir le chateau (x2 la taille actuelle) pour le rendre plus visible. Ajouter un label "🏰" plus grand
- Modifier les waypoints dans `allMaps.ts` pour que le dernier point soit a x=770 au lieu de x=800

## 5. Carte plein ecran + UI flottante

**Probleme** : La carte ne prend pas toute la fenetre, et le zoom affecte l'interface.

**Solution** :
- `GameCanvas.tsx` : Le canvas doit remplir tout l'espace disponible via CSS (`width: 100%; height: 100%; object-fit: cover`). Supprimer le `transform: scale()` du wrapper. A la place, calculer le scale pour que le canvas remplisse le conteneur et appliquer le scale uniquement sur l'element `<canvas>` via CSS
- `TowerDefenseGame.tsx` : Le conteneur principal du jeu utilise `relative w-full h-full`. La `UnitBar` et le `HUD` deviennent `fixed` ou `absolute` par-dessus le canvas
- Les boutons zoom (+/-/x2) et le DPS panel restent en `absolute` sur le canvas
- `UnitBar.tsx` : Ajouter un bouton pour replier/deplier le panneau de personnages pour ne pas encombrer la vue

## 6. Drag & drop bidirectionnel (retirer des unites)

**Probleme** : On ne peut pas retirer un personnage deploye par drag & drop (seulement via le bouton "Remove").

**Solution** :
- `GameCanvas.tsx` : Quand on drag un unite placee et qu'on la relache hors d'un slot (pas pres d'un slot vide), retirer l'unite du terrain et la remettre dans l'inventaire. Modifier `handleMouseUp` pour appeler `engine.removeUnit()` si `findNearestEmptySlot` retourne -1 et que la position de drop est hors de la zone de slots
- Aussi supporter le drop vers le bas (zone UnitBar) comme signal de retrait : si `curY > CANVAS_HEIGHT - 40`, retirer l'unite
- `UnitBar.tsx` : Ajouter une zone de drop visuelle "Drop ici pour retirer" quand un drag est en cours sur le canvas

## 7. Ajouter 50 champions LoL supplementaires

**Fichiers** :
- Generer 50 sprites PNG 64x64 dans `src/assets/sprites/`
- `lolSprites.ts` : 50 imports + entrees SPRITE_MAP
- `characterData.ts` : 50 nouvelles entrees dans ALL_CHARACTERS avec stats equilibrees
- `synergyData.ts` : Ajouter les elements pour les 50 nouveaux champions + nouvelles synergies de paire

Champions proposes (50) :
Draven, Fiora, Graves, Irelia, Jax, Jayce, Kha'Zix, LeBlanc, Lucian, Lulu, Master Yi, Nami, Nasus, Nautilus, Nidalee, Orianna, Pantheon, Renekton, Rengar, Sejuani, Shaco, Shen, Sivir, Soraka, Swain, Syndra, Talon, Tristana, Tryndamere, Udyr, Urgot, Varus, Veigar, Vi, Viktor, Vladimir, Warwick, Wukong, Xerath, Xin Zhao, Yorick, Ziggs, Zilean, Zyra, Diana, Ekko, Elise, Evelynn, Gangplank, Hecarim

Repartition :
- Common (10) : Sivir, Soraka, Warwick, Nasus, Xin Zhao, Tristana, Pantheon, Shen, Udyr, Yorick
- Uncommon (12) : Graves, Nami, Nautilus, Renekton, Sejuani, Varus, Wukong, Ziggs, Zyra, Diana, Gangplank, Hecarim
- Rare (12) : Draven, Irelia, Jayce, Lucian, Nidalee, Orianna, Talon, Vi, Xerath, Zilean, Ekko, Elise
- Epic (10) : Fiora, Jax, Kha'Zix, LeBlanc, Lulu, Rengar, Swain, Syndra, Viktor, Vladimir
- Legendary (6) : Master Yi, Shaco, Tryndamere, Veigar, Evelynn, Urgot

## Fichiers modifies/crees

| Fichier | Action |
|---|---|
| 50x `src/assets/sprites/*.png` | Nouveaux sprites |
| `src/game/rendering/lolSprites.ts` | 50 imports + SPRITE_MAP |
| `src/game/data/characterData.ts` | 50 champions |
| `src/game/data/synergyData.ts` | Elements + synergies pour 50 nouveaux |
| `src/game/managers/SaveManager.ts` | `mapDeployments` dans SaveData |
| `src/game/types.ts` | `gameSpeed` dans GameState |
| `src/game/GameEngine.ts` | Sauvegarde positions, autoDeploy, gameSpeed persistant |
| `src/components/game/GameCanvas.tsx` | Canvas plein ecran, drag-out pour retirer, gameSpeed depuis engine |
| `src/components/game/TowerDefenseGame.tsx` | Layout plein ecran, UI flottante |
| `src/components/game/UnitBar.tsx` | Bouton autoDeploy, zone drop retrait, repliable |
| `src/components/game/DailyQuestPanel.tsx` | Contraste texte |
| `src/components/game/GameRenderer.ts` | Chateau plus grand et visible |
| `src/game/data/allMaps.ts` | Dernier waypoint a x=770 |

