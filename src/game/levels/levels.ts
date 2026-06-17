import { LevelConfig } from "./LevelConfig";

// Convention : murs d'épaisseur 0.2, hauteur 0.5, y = 0.4.
// Les jonctions entre murs adjacents se chevauchent volontairement (~0.2) pour
// garantir des terrains hermétiques, sans aucun trou aux angles ni aux virages.

export const LEVELS: LevelConfig[] = [
  {
    id: 0,
    name: "Couloir droit",
    par: 2,
    floorSize: { width: 4, depth: 12 },
    walls: [
      { position: [-2.1, 0.4, 0], size: [0.2, 0.5, 12.4] },
      { position: [2.1, 0.4, 0], size: [0.2, 0.5, 12.4] },
      { position: [0, 0.4, 6.1], size: [4.4, 0.5, 0.2] },
      { position: [0, 0.4, -6.1], size: [4.4, 0.5, 0.2] },
    ],
    ballStart: [0, 1, 4],
    holePosition: [0, 0.11, -4],
  },
  {
    id: 1,
    name: "Virage en L",
    par: 3,
    floorSize: { width: 8, depth: 8 },
    // L : couloir vertical (gauche) -> virage 90° -> couloir horizontal (bas).
    walls: [
      // Bord extérieur gauche (toute la hauteur).
      { position: [-4.1, 0.4, 0], size: [0.2, 0.5, 8.4] },
      // Bord extérieur bas (toute la largeur).
      { position: [0, 0.4, -4.1], size: [8.4, 0.5, 0.2] },
      // Haut du couloir vertical (chevauche le bord gauche et le mur intérieur).
      { position: [-2.85, 0.4, 4.1], size: [2.9, 0.5, 0.2] },
      // Extrémité droite du couloir horizontal.
      { position: [4.1, 0.4, -2.85], size: [0.2, 0.5, 2.9] },
      // Coin intérieur, face verticale (sépare le couloir vertical du bloc).
      { position: [-1.4, 0.4, 1.35], size: [0.2, 0.5, 5.9] },
      // Coin intérieur, face horizontale (sépare le couloir horizontal du bloc).
      { position: [1.35, 0.4, -1.4], size: [5.9, 0.5, 0.2] },
    ],
    ballStart: [-2.75, 1, 3],
    holePosition: [3, 0.11, -2.75],
  },
  {
    id: 2,
    name: "Couloir en S",
    par: 3,
    floorSize: { width: 6, depth: 14 },
    walls: [
      // Murs latéraux épaissis (0.4), face intérieure conservée à x = ±3.0.
      { position: [-3.2, 0.4, 0], size: [0.4, 0.5, 14.4] },
      { position: [3.2, 0.4, 0], size: [0.4, 0.5, 14.4] },
      { position: [0, 0.4, 7.1], size: [6.4, 0.5, 0.2] },
      { position: [0, 0.4, -7.1], size: [6.4, 0.5, 0.2] },
      // Chicane haute : épaisseur 0.4, pénètre de 0.3 dans le mur gauche
      // (extrémité à x = -3.3), laisse un passage à droite (x ∈ [1.0, 3.0]).
      { position: [-1.15, 0.4, 3], size: [4.3, 0.5, 0.4] },
      // Chicane basse : épaisseur 0.4, pénètre de 0.3 dans le mur droit
      // (extrémité à x = 3.3), laisse un passage à gauche (x ∈ [-3.0, -1.0]).
      { position: [1.15, 0.4, -3], size: [4.3, 0.5, 0.4] },
    ],
    ballStart: [0, 1, 6],
    holePosition: [0, 0.11, -6],
    obstacles: [{ type: "bumper", position: [0, 0.4, 0], radius: 0.45 }],
  },
  {
    id: 3,
    name: "Large fairway",
    par: 4,
    floorSize: { width: 10, depth: 14 },
    walls: [
      { position: [-5.1, 0.4, 0], size: [0.2, 0.5, 14.4] },
      { position: [5.1, 0.4, 0], size: [0.2, 0.5, 14.4] },
      { position: [0, 0.4, 7.1], size: [10.4, 0.5, 0.2] },
      { position: [0, 0.4, -7.1], size: [10.4, 0.5, 0.2] },
    ],
    ballStart: [0, 1, 6],
    holePosition: [0, 0.11, -6],
    obstacles: [
      { type: "bumper", position: [-2, 0.4, 1.5], radius: 0.5 },
      { type: "bumper", position: [2, 0.4, -2], radius: 0.5 },
    ],
  },
  {
    id: 4,
    name: "Virage étroit",
    par: 4,
    floorSize: { width: 6, depth: 8 },
    // L étroit : couloir vertical (largeur 2) -> virage -> couloir horizontal.
    walls: [
      { position: [-3.1, 0.4, 0], size: [0.2, 0.5, 8.4] },
      { position: [0, 0.4, -4.1], size: [6.4, 0.5, 0.2] },
      // Haut du couloir vertical.
      { position: [-2.0, 0.4, 4.1], size: [2.4, 0.5, 0.2] },
      // Extrémité droite du couloir horizontal.
      { position: [3.1, 0.4, -3.0], size: [0.2, 0.5, 2.4] },
      // Coin intérieur, face verticale (inner face à x = -1.0).
      { position: [-0.9, 0.4, 1.1], size: [0.2, 0.5, 6.2] },
      // Coin intérieur, face horizontale (inner face à z = -2.0).
      { position: [1.1, 0.4, -1.9], size: [4.2, 0.5, 0.2] },
    ],
    ballStart: [-2.0, 1, 3],
    holePosition: [2.3, 0.11, -3.0],
    obstacles: [
      {
        type: "bumper",
        position: [1, 0.4, -3],
        radius: 0.4,
        movement: { axis: "z", range: 0.4, speed: 2 },
      },
    ],
  },
];
