import * as CANNON from 'cannon-es'

interface PhysicsWorld {
  world: CANNON.World
  fixedTimeStep: number
  maxSubSteps: number
}

export function initPhysics(): PhysicsWorld {
  const world = new CANNON.World()

  world.gravity.set(0, -9.82, 0)

  world.broadphase = new CANNON.SAPBroadphase(world)

  world.allowSleep = true

  const fixedTimeStep = 1 / 60
  const maxSubSteps = 3

  return { world, fixedTimeStep, maxSubSteps }
}