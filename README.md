# Mini Golf 3D

Jeu de mini-golf en 3D jouable dans le navigateur, construit avec **Three.js**.
Le joueur vise et frappe la balle à la souris (drag = direction + puissance) pour
la faire entrer dans le trou en un minimum de coups, à travers 5 niveaux de
difficulté croissante. Le jeu intègre un système de vies, un score de type golf
(Birdie, Eagle, Bogey…), des bruitages et une musique de fond générés
procéduralement.

Ce dépôt contient **le front-end uniquement**. Le jeu communique avec un
back-end (comptes joueurs, scores) et un service mailer (voir
[Dépendances externes](#dépendances-externes)).

## Stack technique

- **[Three.js](https://threejs.org/)** — rendu 3D WebGL (scène, caméra, lumières, ombres, modèles GLTF)
- **[Cannon-es](https://pmndrs.github.io/cannon-es/)** — moteur physique (collisions balle / murs / bumpers)
- **[TypeScript](https://www.typescriptlang.org/)** — typage statique
- **[Vite](https://vitejs.dev/)** — serveur de dev et bundler
- **[Web Audio API](https://developer.mozilla.org/docs/Web/API/Web_Audio_API)** — sons et musique procéduraux (aucun fichier audio)
- **[ESLint](https://eslint.org/) + [Prettier](https://prettier.io/)** — qualité et formatage du code
- **[Playwright](https://playwright.dev/)** — tests end-to-end
- **GitHub Actions** — intégration continue (lint + build)

## Prérequis

- [Node.js](https://nodejs.org/) **20 ou supérieur**
- **npm** (fourni avec Node.js)

Vérifier les versions installées :

```bash
node --version   # doit afficher v20.x ou plus
npm --version
```

## Installation

1. Cloner le dépôt et installer les dépendances :

   ```bash
   git clone https://github.com/audricfullhardt/WR602D-front.git
   cd WR602D-front
   npm install
   ```

2. Créer le fichier `.env` à partir de l'exemple fourni :

   ```bash
   cp .env.example .env
   ```

3. Renseigner l'URL du back-end dans `.env` :

   ```bash
   VITE_API_URL=http://localhost:8000
   ```

## Démarrage

```bash
npm run dev
```

Le serveur de développement démarre sur **http://localhost:5173**. Ouvrir cette
adresse dans le navigateur pour jouer.

## Dépendances externes

Le front a besoin de deux services qui doivent tourner **avant** de jouer
(création de compte, connexion, envoi des scores) :

| Service | URL attendue            | Rôle                                   | Dépôt |
| ------- | ----------------------- | -------------------------------------- | ----- |
| Back-end | `http://localhost:8000` | API : comptes joueurs, scores          | [WR602D-back](https://github.com/audricfullhardt/WR602D-back) |
| Mailer  | `http://localhost:8001` | Envoi des e-mails (inscription, etc.)  | [WR602D-mailer](https://github.com/audricfullhardt/WR602D-mailer) |

Suivre les README de ces dépôts pour les lancer. L'URL du back doit
correspondre à la valeur de `VITE_API_URL` dans `.env`.

> Le jeu se lance même si le back est hors ligne, mais l'authentification et
> l'enregistrement des scores échoueront.

## Commandes disponibles

| Commande           | Description                                          |
| ------------------ | ---------------------------------------------------- |
| `npm run dev`      | Lance le serveur de développement (Vite, HMR)        |
| `npm run build`    | Construit le bundle de production dans `dist/`       |
| `npm run preview`  | Sert localement le build de production               |
| `npm run lint`     | Analyse le code avec ESLint                          |
| `npm run format`   | Formate le code `src/` avec Prettier                 |
| `npm run test:e2e` | Lance les tests end-to-end Playwright                |

## Tests E2E

Les tests end-to-end utilisent [Playwright](https://playwright.dev/).

1. Installer le navigateur Chromium (une seule fois) :

   ```bash
   npx playwright install chromium
   ```

2. Lancer les tests :

   ```bash
   npm run test:e2e
   ```

Playwright démarre automatiquement le serveur de dev sur le port 5173 pendant
les tests.

## Structure du projet

```
src/
├── main.ts                 # Point d'entrée : boucle de jeu et orchestration
├── style.css               # Styles du HUD et des overlays
├── vite-env.d.ts           # Types des variables d'environnement Vite
├── api/
│   ├── client.ts           # Wrapper fetch (base URL, token, erreurs)
│   ├── auth.ts             # Connexion, inscription, session locale
│   └── scores.ts           # Envoi et récupération des scores
├── assets/                 # Images et modèles 3D (GLTF)
├── core/
│   ├── scene.ts            # Scène Three.js : caméra, lumières, renderer
│   └── physics.ts          # Monde physique Cannon-es
├── game/
│   ├── Ball.ts             # Balle (mesh + corps physique, tir, entrée trou)
│   ├── Club.ts             # Club de golf (modèle GLTF, pivots de visée/swing)
│   ├── Flag.ts             # Drapeau (modèle GLTF, animation)
│   ├── Track.ts            # Construction dynamique du terrain depuis un niveau
│   ├── GameState.ts        # État : phase, coups, vies, progression, scores
│   ├── InputController.ts  # Visée à la souris (direction + puissance)
│   ├── Values.ts           # Labels de score (Birdie, Eagle, Bogey…)
│   ├── types.ts            # Types partagés (GamePhase, HoleResult)
│   └── levels/
│       ├── LevelConfig.ts  # Interface de configuration d'un niveau
│       └── levels.ts       # Définition des 5 niveaux
├── audio/
│   └── AudioManager.ts     # Sons et musique procéduraux (Web Audio API)
└── ui/
    ├── HUD.ts              # Orchestration de l'interface selon la phase
    ├── Score.ts            # Affichage coups / par
    ├── Lives.ts            # Affichage des vies (♥)
    ├── Start.ts            # Écran de démarrage
    ├── Reset.ts            # Écran entre deux trous
    ├── GameOver.ts         # Écran de fin (victoire ou défaite)
    └── UIComponent.ts      # Classe de base des composants UI

tests/e2e/                  # Tests Playwright
.github/workflows/ci.yml    # Pipeline d'intégration continue
```

## Gameplay

### Contrôles

- **Viser et frapper** : maintenir le clic gauche sur la balle, glisser pour
  tirer un « élastique ». La **direction** du glissement donne l'orientation du
  tir, sa **longueur** la puissance. Relâcher pour frapper.
- Attendre que la balle s'immobilise avant le coup suivant.

### Règles

- Faire entrer la balle dans le trou en un minimum de coups.
- Le jeu enchaîne **5 niveaux** de difficulté croissante.
- On **gagne** en terminant les 5 niveaux, on **perd** en épuisant ses vies.

### Système de vies

- Le joueur démarre avec **3 vies** (affichées en ♥ dans le HUD).
- Chaque trou est plafonné à **6 coups**. Dépasser ce plafond fait **perdre une
  vie** et réinitialise le trou en cours.
- À **0 vie**, la partie est terminée (écran de défaite).

### Système de score (golf)

Le score d'un trou se calcule par rapport au _par_ (`coups − par`) :

| Résultat            | Label             |
| ------------------- | ----------------- |
| 1 coup              | Hole in one !     |
| par − 2 ou moins    | Eagle             |
| par − 1             | Birdie            |
| par                 | Par               |
| par + 1             | Bogey             |
| par + 2             | Double bogey      |
| par + 3             | Triple bogey      |
| par + 4             | Quadruple bogey   |

À la fin de la partie, un récapitulatif affiche le score de chaque trou et le
total par rapport au par cumulé.

## Variables d'environnement

Les variables sont gérées par Vite et doivent être préfixées par `VITE_` pour
être exposées au client. Elles se déclarent dans le fichier `.env` (voir
[Installation](#installation)).

| Variable       | Description               | Valeur par défaut       |
| -------------- | ------------------------- | ----------------------- |
| `VITE_API_URL` | URL de base de l'API back | `http://localhost:8000` |

> Cette variable est consommée par la couche API (`src/api/`) pour
> l'authentification et l'envoi des scores.

## Note d'intention

Les choix de game design et techniques (système de vies, économie de score,
séparation rendu / physique, audio procédural, architecture modulaire,
description des 5 niveaux) sont détaillés dans **[GAME_DESIGN.md](GAME_DESIGN.md)**.
