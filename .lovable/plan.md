

## Plans d'amelioration proposes

Voici 5 axes d'amelioration classes par impact et faisabilite :

---

### Plan A — Systeme de fusion/evolution (Merge 3★)

Fusionner 3 copies du meme champion pour creer une version etoilee avec des stats multipliees (comme TFT).

- **OwnedCharacter** a deja un champ `stars` dans les types et le save
- Ajouter un bouton "Merge" dans l'inventaire quand 3 copies de meme `configId` et meme `stars` existent
- Stats : x1.5 a 2★, x2.5 a 3★
- Effet visuel : bordure doree/arc lumineux sur le sprite des unites 2★/3★
- Fichiers : `GameEngine.ts` (logique merge), `TeamSidebar.tsx` ou `EquipmentPanel.tsx` (UI bouton), `GameRenderer.ts` (effet visuel), `CharacterSprite.tsx`

---

### Plan B — Systeme de prestige / New Game+

Apres la vague 100, debloquer un reset avec bonus permanents multiplicatifs.

- Le champ `prestige` existe deja dans `SaveData`
- Ecran de prestige apres victoire : reset inventaire/or, conserver talents + etoiles + equipements
- Bonus par prestige : x1.1 ATK, +5 or de base, +1 HP base
- Multiplicateur de difficulte : ennemis +20% HP par prestige
- Fichiers : `GameEngine.ts`, `SaveManager.ts`, nouvel ecran `PrestigeScreen.tsx`, `talentData.ts`

---

### Plan C — Capacites actives de champions (Ultimates)

Chaque champion a un ultimate activable manuellement ou automatiquement toutes les X secondes.

- Ajouter `ultimateAbility` dans `CharacterConfig` : nom, cooldown, effet
- Exemples : Garen = spin AoE, Lux = laser traverse la map, Jinx = rocket AoE longue portee, Thresh = pull un ennemi en arriere
- Barre de cooldown visible sur le sprite
- Bouton d'activation dans `UnitInfoPanel`
- Fichiers : `characterData.ts`, `types.ts`, `TowerManager.ts`, `GameRenderer.ts`, `UnitInfoPanel.tsx`

---

### Plan D — Mode Challenge / Donjons hebdomadaires

Des niveaux speciaux avec des regles modifiees et des recompenses uniques.

- 3 donjons rotatifs par semaine avec contraintes : "Seulement champions Common/Uncommon", "Pas d'equipement", "Vagues infinies avec timer"
- Recompenses : equipements exclusifs, etoiles bonus, champions garantis
- Selection depuis le menu de carte avec icone speciale
- Fichiers : nouveau `DungeonData.ts`, `MapSelect.tsx`, `GameEngine.ts` (regles speciales)

---

### Plan E — Amelioration des effets visuels et du feedback

Rendre le jeu plus satisfaisant visuellement.

- Particules ameliorees : explosion de mort, flash critique, trainee de projectile
- Aura visuelle pour les synergies actives sur les champions
- Effet de "level up" quand on upgrade un champion
- Animation de vague entrante (texte "Wave 15 — RUSH!" avec effet)
- Screen shake sur les kills de boss
- Fichiers : `ParticleManager.ts`, `GameRenderer.ts`, `FloatingTextManager.ts`, `HUD.tsx`

---

### Recommandation

**Plan A (Merge 3★)** et **Plan E (Effets visuels)** sont les plus impactants. Le merge ajoute une couche strategique majeure au gacha, et les effets visuels rendent chaque action plus satisfaisante. Le Plan C (Ultimates) serait le suivant en priorite car il donne une identite unique a chaque champion.

Quel(s) plan(s) veux-tu que j'implemente ?

