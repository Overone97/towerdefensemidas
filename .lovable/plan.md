

# Corrections: 4 bugs a resoudre

## Bug 1 - Maps 2 et 3 : ennemis hors du chemin visuel

Les waypoints dans `allMaps.ts` ne correspondent pas aux chemins dessines sur les images de fond. Il faut recalculer les coordonnees pour Forest et Volcano pour qu'elles suivent le trace visible sur les images `forest-bg.jpg` et `volcano-bg.jpg`.

**Fichier** : `src/game/data/allMaps.ts`
- Redefinir tous les waypoints et slots de `forest` et `volcano`
- S'assurer que le rendu du chemin dans `GameRenderer.ts` est assez transparent (deja a 0.35) pour que le chemin logique se fonde dans le visuel

Pour determiner les bonnes coordonnees, je vais observer les images de fond via le navigateur pour tracer les chemins corrects, puis ajuster les waypoints en consequence. Si les images ne correspondent a aucun trace logique, on peut aussi augmenter l'opacite du chemin a 0 (invisible) et laisser uniquement l'image de fond servir de visuel.

## Bug 2 - Bouton Auto : texte noir sur fond noir

Dans `UnitBar.tsx`, le bouton Auto utilise `variant="destructive"` quand actif. La variante `destructive` de shadcn a un texte `destructive-foreground` qui est probablement noir ou tres sombre dans le theme actuel.

**Fichier** : `src/components/game/UnitBar.tsx`
- Changer le bouton Auto actif pour utiliser des classes explicites garantissant la lisibilite : `bg-red-600 text-white` au lieu de `variant="destructive"`

## Bug 3 - TeamSidebar cachee derriere le canvas scale

Le `GameCanvas` applique `transform: scale(X)` sur son wrapper, ce qui agrandit visuellement le canvas et peut recouvrir le `TeamSidebar` place a cote. Le probleme est que `scale` ne change pas le layout flow mais agrandit visuellement.

**Fichiers** : `src/components/game/TowerDefenseGame.tsx`, `src/components/game/GameCanvas.tsx`
- Sortir le TeamSidebar du flux relatif au canvas
- Fixer le TeamSidebar a gauche de l'ecran avec `fixed left-0` ou `absolute left-0` dans le conteneur parent
- Ou bien appliquer le scale sur le canvas seul, pas sur le wrapper qui contient aussi le DPS panel

## Bug 4 - DPS panel : pas de tracking pour les DOT (Singed, Teemo)

Le probleme est double :
1. `StatusEffect` dans `types.ts` n'a pas de champ `sourceUnitId` - on ne sait pas quel personnage a applique le poison/burn
2. Donc quand un ennemi meurt par DOT (dans `dotKills`), on ne peut pas attribuer les degats au bon personnage dans `trackDamage()`

**Fichiers** :
- `src/game/types.ts` : Ajouter `sourceUnitId?: number` a l'interface `StatusEffect`
- `src/game/managers/TowerManager.ts` : Quand un effet de statut est cree (poison, burn), y attacher le `unitId` de la tour source
- `src/game/managers/EnemyManager.ts` : Dans `processStatusEffects`, tracker les degats DOT tick par tick en retournant les infos de source. Modifier `dotKills` pour inclure le `sourceUnitId`
- `src/game/GameEngine.ts` : Dans le traitement des `dotKills`, appeler `trackDamage(sourceUnitId, totalDotDamage)`. Aussi tracker les degats DOT incrementaux (pas seulement les kills)

### Detail technique

Dans `EnemyManager.update()`, en plus de `dotKills`, retourner `dotDamages: { unitId: number, damage: number }[]` pour chaque tick de poison/burn. Dans `GameEngine.update()`, iterer sur `dotDamages` et appeler `trackDamage()` pour chaque.

## Fichiers modifies

| Fichier | Changement |
|---|---|
| `src/game/data/allMaps.ts` | Nouveaux waypoints/slots Forest & Volcano |
| `src/components/game/UnitBar.tsx` | Couleur texte bouton Auto |
| `src/components/game/TowerDefenseGame.tsx` | Layout TeamSidebar fixe a gauche |
| `src/components/game/GameCanvas.tsx` | Ajuster le scale pour ne pas cacher la sidebar |
| `src/game/types.ts` | `sourceUnitId` dans StatusEffect |
| `src/game/managers/TowerManager.ts` | Attacher sourceUnitId aux effets |
| `src/game/managers/EnemyManager.ts` | Retourner dotDamages avec sourceUnitId |
| `src/game/GameEngine.ts` | Tracker les DOT damages |

