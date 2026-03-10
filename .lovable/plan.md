

# Suggestions d'ameliorations pour le Tower Defense

Voici les axes d'amelioration les plus impactants pour le jeu, classes par priorite :

---

## 1. Systeme de fusion / evolution de champions (Merge)
Fusionner 3 copies du meme champion pour creer une version etoilee (1★ → 2★ → 3★) avec des stats multipliees. C'est le systeme classique des auto-battlers (TFT, Auto Chess).

- Ajouter un champ `stars` (1-3) a `OwnedCharacter`
- Bouton "Merge" dans l'inventaire quand 3 copies existent
- Stats x1.5 a 2★, x2.5 a 3★, sprite avec effet lumineux

## 2. Equipements LoL iconiques (items composites)
Permettre de combiner 2 equipements de base pour creer un item legendaire (comme dans TFT : BF Sword + Recurve Bow = Guinsoo).

- Ajouter une table de recettes dans `equipmentData.ts`
- UI de craft dans `EquipmentPanel`
- ~15 items composites avec effets speciaux (Infinity Edge: +crit, Warmog: regen HP base, etc.)

## 3. Mode multijoueur PvP asynchrone
Les joueurs envoient des vagues personnalisees aux autres. Classement ELO.

- Table backend `pvp_challenges` avec la composition d'equipe
- Systeme de "fantome" : jouer contre la compo d'un autre joueur
- Leaderboard ELO

## 4. Evenements saisonniers / boss raids
Boss temporaires avec des recompenses exclusives (skins, equipements uniques).

- Systeme d'evenements avec dates dans la base de donnees
- Boss raid avec barre de vie partagee entre tous les joueurs
- Recompenses exclusives limitees dans le temps

## 5. Amelioration visuelle - effets de particules et animations
Ajouter des effets visuels pour les attaques, les critiques, les sorts, et les synergies actives.

- Particules de feu/glace/poison plus elaborees
- Animation de critique (flash + nombre plus gros)
- Aura visuelle pour les synergies actives sur les champions

## 6. Systeme de prestige / New Game+
Apres avoir termine les 100 vagues, debloquer un mode "Prestige" qui reset la progression mais donne des bonus permanents multiplicatifs.

- Compteur de prestiges dans SaveData
- Bonus permanents (x1.1 ATK par prestige, etc.)
- Nouveaux talents debloques au prestige

## 7. Tutoriel interactif pour les nouveaux joueurs
Guide pas-a-pas qui explique le summon, le placement, les vagues, les synergies.

- Overlay transparent avec fleches pointant les elements
- Progression en 5-6 etapes
- Se declenche automatiquement au premier lancement

---

**Recommandation** : Les ameliorations 1 (Merge/Evolution) et 5 (Effets visuels) auraient le plus grand impact sur l'engagement joueur avec un effort raisonnable. Le systeme de fusion ajoute une couche strategique majeure, et les effets visuels rendent le jeu beaucoup plus satisfaisant.

