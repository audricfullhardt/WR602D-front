# Mini Golf 3D

Jeu de mini-golf en 3D jouable dans le navigateur. Le joueur vise et frappe la
balle à la souris (drag = direction + puissance) pour la faire entrer dans le
trou en un minimum de coups, à travers 5 niveaux de difficulté croissante. Le
jeu intègre un système de vies, un score de type golf (Birdie, Eagle, Bogey…),
des bruitages et une musique de fond générés procéduralement.

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

- [Node.js](https://nodejs.org/) 20 ou supérieur
- npm

## Installation

```bash
npm install
npm run dev
```

Le serveur de développement démarre sur http://localhost:5173.

## Commandes disponibles

| Commande           | Description                                          |
| ------------------ | ---------------------------------------------------- |
| `npm run dev`      | Lance le serveur de développement (Vite, HMR)        |
| `npm run build`    | Construit le bundle de production dans `dist/`       |
| `npm run preview`  | Sert localement le build de production               |
| `npm run lint`     | Analyse le code avec ESLint                          |
| `npm run format`   | Formate le code `src/` avec Prettier                 |
| `npm run test:e2e` | Lance les tests end-to-end Playwright                |

## Structure du projet

```
src/
├── main.ts                 # Point d'entrée : boucle de jeu et orchestration
├── style.css               # Styles du HUD et des overlays
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

## Variables d'environnement

Les variables d'environnement sont gérées par Vite et doivent être préfixées par
`VITE_` pour être exposées au client. Créer un fichier `.env` à la racine :

```bash
# URL de l'API back-end
VITE_API_URL=https://localhost:8000
```

| Variable       | Description                | Valeur par défaut        |
| -------------- | -------------------------- | ------------------------ |
| `VITE_API_URL` | URL de base de l'API back  | `https://localhost:8000` |

> Cette variable est consommée par la couche API (`src/api/`) pour
> l'authentification et l'envoi des scores.
