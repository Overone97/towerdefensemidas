

## Plan : Système de vagues/boss plus varié

### Problème actuel
- Seulement 9 types d'ennemis, tous avec le même comportement (marcher sur le chemin)
- Les boss n'ont aucune mécanique spéciale -- juste plus de HP/armor
- Les vagues sont toutes identiques dans leur structure (spawn aléatoire pondéré)
- Aucune variété de "thème" de vague

### Ce que je propose d'ajouter

#### A. Nouveaux types d'ennemis (3 ajouts)
- **Healer** (Soraka) : soigne les ennemis proches de 5% HP/s -- priorité de ciblage stratégique
- **Stealth** (Evelynn) : invisible jusqu'à 50% HP, ne peut être ciblé qu'après révélation
- **Splitter** (Voidling) : en mourant, se divise en 2 mini-ennemis plus rapides

#### B. Mécaniques de boss uniques
Au lieu d'un simple ennemi avec gros HP, les boss auront des capacités actives :
- **Baron** : invoque 3 sbires toutes les 5s pendant qu'il avance
- **Dragon Infernal** : laisse une traînée de feu qui inflige des dégâts aux tours proches
- **Dragon de Terre** : bouclier qui absorbe les 200 premiers dégâts, se régénère après 4s sans prendre de dégâts
- **Dragon de Glace** : ralentit les tours dans un rayon autour de lui (réduit leur vitesse d'attaque de 30%)
- **Dragon des Airs** : dash en avant de 3 waypoints quand il passe sous 50% HP

#### C. Vagues thématiques
Certaines vagues auront un "modificateur" spécial affiché dans le HUD :
- **Rush** (vagues 8, 22, 38...) : 2x plus d'ennemis mais 50% HP
- **Tank Parade** (vagues 18, 42...) : uniquement des tanks/armored
- **Speed Blitz** (vagues 12, 32...) : uniquement des fast avec +30% vitesse
- **Healing Wave** (vagues 25, 55...) : tous les ennemis régénèrent 1% HP/s
- **Dark Wave** (vagues 35, 65...) : ennemis stealth mélangés

### Changements techniques

**`src/game/types.ts`** :
- Ajouter `'healer' | 'stealth' | 'splitter'` au type `EnemyType`
- Ajouter champs optionnels sur `Enemy` : `stealthed`, `shieldHp`, `bossAbilityCooldown`
- Ajouter `WaveModifier` type et champ `modifier` sur `WaveConfig`

**`src/game/data/waveData.ts`** :
- Ajouter les 3 nouveaux `ENEMY_CONFIGS`
- Ajouter fonction `getWaveModifier(wave)` retournant le modificateur
- Mettre à jour le pool pour inclure healer/stealth/splitter aux bonnes vagues
- Modifier `getWaveConfig` pour appliquer les modificateurs (rush = 2x count, etc.)

**`src/game/managers/EnemyManager.ts`** :
- Logique stealth : ennemi non ciblable si `stealthed === true`
- Logique splitter : quand un splitter meurt, spawn 2 mini-ennemis
- Logique healer : soigne les ennemis dans un rayon de 60px

**`src/game/managers/WaveManager.ts`** :
- Stocker le `modifier` actif, l'exposer pour le HUD
- Boss abilities : timer dans `update()` pour les mécaniques actives (summon, dash, shield)

**`src/game/rendering/enemySprites.ts`** :
- Mapper les nouveaux types vers les sprites existants (Soraka, Evelynn, etc.)
- Effet visuel de stealth (opacité réduite)

**`src/components/game/HUD.tsx`** :
- Afficher le modificateur de vague actif avec icône et description

**`src/components/game/EnemyInfoPanel.tsx`** :
- Afficher les capacités spéciales des boss et ennemis spéciaux

