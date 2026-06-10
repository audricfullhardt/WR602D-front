# Note d'intention — Mini Golf 3D

## But du jeu et concept

Mini Golf 3D est un jeu d'arcade en vue 3D où le joueur doit faire entrer une
balle dans le trou de chaque parcours en un minimum de coups. La visée se fait
entièrement à la souris : on tire un « élastique » depuis la balle (clic
maintenu), la **direction** du glissement donne l'orientation du tir et sa
**longueur** la puissance. Au relâchement, la balle est frappée.

Le concept marie deux registres :

- la **fidélité au golf** (notion de _par_, vocabulaire Birdie / Eagle / Bogey,
  recherche du meilleur score),
- une **tension arcade** apportée par un système de vies qui sanctionne les
  parcours ratés et impose de terminer les 5 trous sans épuiser ses essais.

Le joueur gagne en terminant les 5 niveaux, et perd s'il épuise ses 3 vies.

## Choix de game design

### Système de vies

Le joueur démarre avec **3 vies** (`MAX_LIVES`). Une vie est perdue lorsqu'il
dépasse le nombre de coups maximum autorisé sur un trou. À la perte d'une vie,
le trou en cours est réinitialisé et le joueur le rejoue depuis le départ. À
**0 vie**, la partie est perdue (écran de défaite « Plus de vies — Partie
terminée »).

Ce système transforme un mini-golf « sans enjeu » en une véritable épreuve : il
crée un risque réel d'échec et récompense la régularité plutôt qu'un seul bon
coup. Les vies sont affichées en permanence dans le HUD (♥ pleins / ♡ vides).

### MAX_STROKES

Chaque trou est plafonné à **6 coups** (`MAX_STROKES`). Atteindre ce plafond
déclenche la perte d'une vie. Cette limite remplit deux rôles :

- **rythme** : elle empêche un joueur bloqué de s'acharner indéfiniment et
  relance une nouvelle tentative,
- **équilibrage** : avec des _pars_ allant de 2 à 4, le plafond de 6 laisse une
  marge d'erreur (jusqu'à un double/triple bogey) tout en restant punitif.

### Progression des niveaux

Les **5 niveaux** s'enchaînent linéairement, à difficulté croissante. Après
chaque trou réussi, un écran intermédiaire affiche le score obtenu et propose de
passer au trou suivant. La géométrie de chaque parcours est entièrement décrite
par une configuration (`LevelConfig`) : sol, murs, position du trou, point de
départ de la balle et obstacles. Cette approche data-driven permet d'ajouter ou
de modifier un niveau sans toucher au moteur de jeu.

### Économie de score (golf)

Le score suit les conventions du golf : il est calculé par rapport au _par_ du
trou (`coups − par`) et traduit en label parlant. C'est l'économie principale du
jeu — l'objectif n'est pas seulement de finir, mais de **bien** finir.

| Résultat                | Label             |
| ----------------------- | ----------------- |
| 1 coup                  | Hole in one !     |
| par − 2 ou moins        | Eagle             |
| par − 1                 | Birdie            |
| par                     | Par               |
| par + 1                 | Bogey             |
| par + 2                 | Double bogey      |
| par + 3                 | Triple bogey      |
| par + 4                 | Quadruple bogey   |

À la fin de la partie, un tableau récapitule chaque trou (par, coups, score) et
le total par rapport au par cumulé, encourageant le _replay_ pour améliorer son
score.

## Choix techniques

### Three.js + Cannon-es

Le rendu (Three.js) et la physique (Cannon-es) sont **séparés**. Three.js gère
l'affichage (meshes, lumières, ombres, modèles GLTF du club et du drapeau),
tandis que Cannon-es simule le mouvement de la balle, les rebonds sur les murs
et les collisions avec les bumpers. Chaque frame, la position du corps physique
est recopiée sur le mesh visuel. Ce découplage donne un comportement de balle
crédible (inertie, amortissement, rebond) sans réécrire un moteur physique, tout
en gardant la liberté visuelle de Three.js.

### Web Audio API procédurale

Tous les sons sont **générés à la volée** via la Web Audio API, sans aucun
fichier `.mp3` / `.ogg` :

- `playHit()` — frappe : oscillateur descendant à decay rapide,
- `playHoleIn()` — trou rentré : quatre notes ascendantes,
- `playGameOver()` — défaite : quatre notes descendantes,
- `playBgMusic()` — boucle musicale procédurale séquencée.

Ce choix supprime tout asset binaire (poids du dépôt, droits d'auteur,
préchargement) et illustre une maîtrise bas niveau de l'audio. Le contexte audio
est démarré au premier clic du joueur, conformément aux politiques d'autoplay
des navigateurs.

### Architecture modulaire

Le code est organisé par responsabilité :

- `core/` — initialisation scène et physique,
- `game/` — entités (Ball, Club, Flag, Track) et état (GameState),
- `game/levels/` — données des niveaux,
- `audio/` — gestion du son,
- `ui/` — composants d'interface, chacun dérivant d'une classe `UIComponent`.

Le `GameState` centralise la logique (phase, coups, vies, progression, scores)
et reste indépendant du rendu. Le HUD réagit à la phase courante. Cette
séparation rend chaque brique testable et facilite l'ajout de fonctionnalités
(niveaux, obstacles, futur back-end).

## Les 5 niveaux

| #   | Nom            | Par | Difficulté | Description                                                                 |
| --- | -------------- | --- | ---------- | --------------------------------------------------------------------------- |
| 1   | Couloir droit  | 2   | ★          | Couloir rectiligne d'introduction : prise en main de la visée.              |
| 2   | Virage         | 3   | ★★         | Parcours en L, virage à 90° : il faut doser un rebond ou viser l'angle.     |
| 3   | Couloir en S   | 3   | ★★★        | Double chicane en S avec un **bumper fixe** central à contourner.           |
| 4   | Large fairway  | 4   | ★★★        | Aire ouverte avec **deux bumpers** : la trajectoire directe est piégée.     |
| 5   | Virage étroit  | 4   | ★★★★       | Couloir resserré en virage avec un **bumper mobile** : le timing devient clé. |

La difficulté progresse selon trois leviers : la **complexité du tracé**
(rectiligne → virage → chicane), la **présence d'obstacles** (aucun → fixe →
multiples → mobile) et l'**étroitesse du couloir**, qui réduit la marge d'erreur
au tir.
