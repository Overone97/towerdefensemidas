

# Mega-Correction: 16 Bugs & Features a Implementer

Ce plan couvre tous les problemes rapportes apres test intensif du jeu.

---

## 1. Maps 2 et 3 : chemin visuel desaligne

**Probleme** : Les waypoints des maps Forest et Volcano ne correspondent pas au chemin dessine sur les images de fond.

**Solution** : Ajuster les coordonnees des waypoints ET des slots dans `src/game/data/allMaps.ts` pour les maps `forest` et `volcano` afin qu'ils suivent visuellement le chemin sur les images de fond. Egalement regenerer les images de fond pour que les chemins traces correspondent aux waypoints definis.

**Fichiers** : `src/game/data/allMaps.ts`, potentiellement `src/assets/maps/forest-bg.jpg`, `src/assets/maps/volcano-bg.jpg`

---

## 2. Range trop puissante : ne scaler que via equipement

**Probleme** : `getCharacterStats()` dans `characterData.ts` augmente la range de +10 par niveau (`range + (level - 1) * 10`), ce qui est beaucoup trop fort et rend certaines unites brisees.

**Solution** : Supprimer le scaling de range par niveau dans `getCharacterStats()`. La range ne progressera plus qu'avec les equipements et talents.

**Fichier** : `src/game/data/characterData.ts` - modifier `getCharacterStats` pour retourner `range: config.range` (sans bonus de niveau)

---

## 3. Singed : pas de gold quand le poison tue

**Probleme** : Quand le poison (DOT) tue un ennemi, ca passe par `EnemyManager.processStatusEffects()` (ligne 103-104) qui met `enemy.alive = false` directement. Ce kill ne passe PAS par le systeme de reward dans `GameEngine.update()` (qui ne recompense que les kills via `damages`).

**Solution** : Modifier `EnemyManager.update()` pour retourner aussi les ennemis tues par les effets de statut (poison/burn kills) avec leur reward. Dans `GameEngine.update()`, traiter ces kills avec gold + score + particules comme les kills normaux.

**Fichiers** : `src/game/managers/EnemyManager.ts` (retourner `poisonKills` dans update), `src/game/GameEngine.ts` (traiter les `poisonKills`)

---

## 4. Tableau de degats graphique (DPS panel)

**Probleme** : Aucun suivi des degats de l'equipe.

**Solution** : Creer un composant `DamageStatsPanel.tsx` qui affiche :
- DPS par unite placee (degats infliges / temps ecoule)
- Degats max de la vague en cours
- Total des degats de l'equipe
- Petit graphique en barres horizontales

Tracker les degats dans `GameEngine` via un `Map<unitId, { totalDamage, waveDamage }>`.

**Fichiers** : Nouveau `src/components/game/DamageStatsPanel.tsx`, modifications dans `src/game/GameEngine.ts` (tracking), `src/components/game/TowerDefenseGame.tsx` (affichage)

---

## 5. Barre d'equipe a gauche de la map

**Probleme** : On ne peut selectionner un perso que en cliquant dessus sur la map.

**Solution** : Creer un composant `TeamSidebar.tsx` affichant les miniatures des persos places dans une colonne a gauche du canvas. Chaque miniature est cliquable pour selectionner l'unite. Afficher : sprite, niveau, barre de cooldown d'ability.

**Fichiers** : Nouveau `src/components/game/TeamSidebar.tsx`, modifications dans `src/components/game/TowerDefenseGame.tsx` (layout)

---

## 6. Systeme de boss map 1 : un seul Baron au lieu de la variete

**Probleme** : `WaveManager.update()` ne spawn qu'UN boss (le dernier ennemi de la vague boss). Sur la map 1, seul le Baron apparait alors qu'on devrait avoir les dragons aussi.

**Solution** : 
- Ajouter des vagues de boss intermediaires sur TOUTES les maps (pas juste le boss final)
- `isBossWave` et `getBossTypeForWave` fonctionnent deja pour les vagues 10/20/30/40/50, mais le WaveManager ne spawn qu'un seul boss (le dernier ennemi). Changer pour qu'aux vagues boss, on spawn le boss + des ennemis normaux, pas seulement un boss a la fin.
- Eventuellement spawn 2-3 boss par vague boss pour plus de challenge.

**Fichiers** : `src/game/managers/WaveManager.ts`, `src/game/data/waveData.ts`

---

## 7. Refonte des sprites ennemis style LoL

**Probleme** : Les sprites actuels ne respectent pas le style pixel art du jeu ni l'univers LoL.

**Solution** : Retravailler les 9 fonctions de dessin dans `enemySprites.ts` pour :
- Plus de details pixel art
- Animations plus fluides
- Meilleure coherence avec le style du jeu (sprites des champions sont en 64x64 PNG de qualite)
- Silhouettes plus reconnaissables pour chaque monstre

**Fichier** : `src/game/rendering/enemySprites.ts`

---

## 8. Retirer le systeme de rarete, normaliser les persos

**Probleme** : Le systeme de rarete cree un desequilibre et empeche les joueurs de tester les combos.

**Solution** :
- Retirer le concept de rarete des personnages : tous ont la meme rarete ou aucune rarete
- `characterData.ts` : mettre tous les persos en rarete identique ou supprimer le systeme
- `gachaData.ts` : supprimer `RARITY_RATES`, chaque invocation donne un perso aleatoire parmi ceux non possedes
- UI : supprimer les bordures/couleurs de rarete, afficher tous les persos de maniere egale
- Reequilibrer les stats pour que chaque perso ait un role unique mais equilibre

**Fichiers** : `src/game/data/characterData.ts`, `src/game/data/gachaData.ts`, `src/game/GameEngine.ts`, `src/components/game/UnitBar.tsx`, `src/components/game/UnitInfoPanel.tsx`, `src/components/game/GachaReveal.tsx`

---

## 9. Invocations beaucoup plus cheres

**Probleme** : Le cout d'invocation est trop bas (base 50g, +15g par invocation).

**Solution** : Augmenter significativement les couts dans `gachaData.ts` :
- `GACHA_BASE_COST` : 50 -> 150
- `GACHA_COST_INCREMENT` : 15 -> 40

**Fichier** : `src/game/data/gachaData.ts`

---

## 10. Image du mob dans l'oeuf eclos (GachaReveal)

**Probleme** : La phase reveal du gacha montre un rectangle colore au lieu du vrai sprite du personnage.

**Solution** : Dans `GachaReveal.tsx`, phase `reveal` : utiliser `drawCharacterSprite` ou charger l'image PNG du champion (via le systeme `getOrLoadImage` existant) au lieu de dessiner un simple rectangle colore.

**Fichier** : `src/components/game/GachaReveal.tsx`

---

## 11. Remplacer la barre de rarete par un pourcentage d'eclosion

**Probleme** : La barre laterale monte dans les raretes, ce qui n'a plus de sens sans systeme de rarete.

**Solution** : Remplacer la barre de rarete par une barre de progression "Eclosion" qui monte de 0% a 100%. Quand elle atteint 100%, l'oeuf eclot et le perso apparait.

**Fichier** : `src/components/game/GachaReveal.tsx`

---

## 12. Barre de competences accessible

**Probleme** : Les abilities sont cachees dans le panneau d'info unite, pas facilement accessibles.

**Solution** : Integrer les boutons d'abilities dans le `TeamSidebar` (point 5) ou creer une mini-barre d'abilities en bas de l'ecran pour l'unite selectionnee, style barre de sort LoL (QWER).

**Fichiers** : Integration dans `TeamSidebar.tsx` ou nouveau composant, `src/components/game/TowerDefenseGame.tsx`

---

## 13. Sauvegarde : maps qui disparaissent

**Probleme** : La sauvegarde peut perdre des donnees de maps (mapsCompleted, currentMapId).

**Solution** : Renforcer `SaveManager.ts` :
- Ajouter `currentMapId` dans la SaveData
- Valider a chaque chargement que les maps sauvegardees existent toujours dans ALL_MAPS
- Ajouter un fallback si une map est introuvable

**Fichier** : `src/game/managers/SaveManager.ts`

---

## 14. Drag & Drop des persos

**Probleme** : On ne peut pas deplacer les persos de case en case ni les drag depuis l'inventaire.

**Solution** : 
- Ajouter le support drag & drop sur le canvas (mousedown/mousemove/mouseup)
- Depuis l'inventaire : drag d'un perso vers un slot libre sur la map
- Sur la map : drag d'un perso place vers un autre slot libre
- Utiliser les evenements natifs HTML5 Drag API ou des handlers canvas custom

**Fichiers** : `src/components/game/GameCanvas.tsx` (handlers drag), `src/components/game/UnitBar.tsx` (drag source), `src/game/GameEngine.ts` (moveUnit)

---

## 15. Refaire les skins de map

**Probleme** : Les fonds de map ne sont pas assez vivants et fideles a LoL.

**Solution** : Regenerer les 3 images de fond avec plus de details, couleurs plus vivantes, et meilleure fidelite au style Summoner's Rift. Ameliorer aussi le rendu du chemin pour qu'il se fonde dans le decor.

**Fichiers** : `src/assets/maps/plains-bg.jpg`, `src/assets/maps/forest-bg.jpg`, `src/assets/maps/volcano-bg.jpg`, `src/components/game/GameRenderer.ts`

---

## 16. Taille de map modifiable (grands ecrans)

**Probleme** : La map est fixe a 800x500, pas adaptable aux grands ecrans.

**Solution** : 
- Rendre `CANVAS_WIDTH` et `CANVAS_HEIGHT` configurables ou responsives
- Ajouter des boutons +/- ou un slider pour redimensionner le canvas
- Adapter le scaling CSS du canvas en fonction de la taille de l'ecran
- Option la plus simple : garder le canvas a 800x500 mais permettre un zoom CSS (transform: scale)

**Fichiers** : `src/game/data/mapData.ts`, `src/components/game/GameCanvas.tsx`, `src/components/game/TowerDefenseGame.tsx`

---

## 17. Verifier que les talents fonctionnent

**Probleme** : Le joueur n'est pas sur que les talents s'appliquent correctement.

**Solution** : Verifier que `getTalentBonus()` est bien applique dans `TowerManager.getEffectiveStats()` (c'est le cas, lignes 97-99). Verifier aussi que les talents sont bien sauvegardes et charges. Ajouter un affichage visuel des bonus actifs dans le talent tree pour confirmer.

**Fichiers** : `src/components/game/TalentTree.tsx` (affichage bonus actifs), verification du code existant

---

## Ordre d'implementation recommande

Vu l'ampleur des changements, je recommande de proceder par priorite :

**Priorite 1 - Bugs critiques** :
1. Bug gold Singed (point 3)
2. Range scaling (point 2)  
3. Boss system (point 6)
4. Sauvegarde (point 13)

**Priorite 2 - Systeme de jeu** :
5. Retirer rarete (point 8)
6. Cout invocation (point 9)
7. Gacha reveal image (points 10 et 11)

**Priorite 3 - UI/UX** :
8. Team sidebar (point 5)
9. Barre de competences (point 12)
10. Tableau de degats (point 4)
11. Drag & drop (point 14)

**Priorite 4 - Visuel** :
12. Maps waypoints (point 1)
13. Sprites ennemis (point 7)
14. Skins de map (point 15)
15. Taille modifiable (point 16)
16. Verification talents (point 17)

---

## Details techniques cles

### Bug Gold Singed (le plus critique)
Dans `EnemyManager.ts`, `processStatusEffects` tue l'ennemi directement a la ligne 103 sans passer par `damageEnemy()`. La solution est de :
1. Au lieu de mettre `enemy.alive = false` dans `processStatusEffects`, collecter les ennemis tues par DOT
2. Retourner ces kills dans `update()` : `{ reachedEnd, dotKills }`
3. Dans `GameEngine.update()`, iterer sur `dotKills` et accorder gold + score comme pour les kills normaux

### Suppression de la rarete
- Modifier `CharacterConfig` : garder le champ `rarity` pour la retrocompatibilite mais ignorer visuellement
- Ou creer un systeme de "role" a la place (Tank, DPS, Support, Controle)
- `rollRarity()` n'est plus utilise : on pioche directement un perso aleatoire dans le pool

### Drag & Drop
- Option la plus propre : utiliser les evenements canvas `mousedown/mousemove/mouseup`
- Detecter si le clic est sur un perso place -> mode drag
- Afficher un ghost du perso sous la souris
- Au relachement sur un slot libre : deplacer l'unite
- Depuis l'inventaire : utiliser HTML5 drag avec `draggable` sur les cartes de perso

