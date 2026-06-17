import * as CANNON from 'cannon-es'

interface PhysicsWorld {
  world: CANNON.World
  fixedTimeStep: number
  maxSubSteps: number
}

export function initPhysics(): PhysicsWorld {
  const world = new CANNON.World()

  world.gravity.set(0, -9.82, 0)

  // NaiveBroadphase (O(n²) mais quelques corps seulement par niveau) : fiable.
  // SAPBroadphase rate des paires de collision -> objets qui se traversent.
  world.broadphase = new CANNON.NaiveBroadphase()

  world.allowSleep = true

  // Pas de simulation plus fin + davantage de sous-étapes : à grande vitesse
  // (balle accélérée par les bumpers), un pas de 1/60 laisse la balle parcourir
  // plus que l'épaisseur d'un mur (0.2 m) sans détection de collision (tunneling).
  const fixedTimeStep = 1 / 120
  const maxSubSteps = 10

  return { world, fixedTimeStep, maxSubSteps }
}