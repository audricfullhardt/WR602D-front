import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import { LevelConfig, ObstacleConfig } from './levels/LevelConfig'

interface Mover {
  mesh: THREE.Mesh
  body: CANNON.Body
  axis: 'x' | 'z'
  range: number
  speed: number
  baseX: number
  baseZ: number
  meshY: number
  t: number
}

const BUMPER_BODY_Y = 0.3

export class Track {
  private scene: THREE.Scene
  private world: CANNON.World
  private bumperMaterial: CANNON.Material

  private meshes: THREE.Mesh[] = []
  private bodies: CANNON.Body[] = []
  private movers: Mover[] = []

  private holePosition = new THREE.Vector3()
  private ballStart = new THREE.Vector3()

  constructor(scene: THREE.Scene, world: CANNON.World, ballMaterial: CANNON.Material) {
    this.scene = scene
    this.world = world

    this.bumperMaterial = new CANNON.Material('bumper')
    this.world.addContactMaterial(
      new CANNON.ContactMaterial(ballMaterial, this.bumperMaterial, {
        friction: 0.1,
        restitution: 1.4,
      })
    )
  }

  load(level: LevelConfig): void {
    this.clear()
    this.createFloor(level.floorSize)
    this.createWalls(level.walls)
    this.createHole(level.holePosition)
    this.createObstacles(level.obstacles ?? [])
    this.holePosition.set(...level.holePosition)
    this.ballStart.set(...level.ballStart)
  }

  update(delta: number): void {
    const step = Math.max(delta, 1e-4)
    for (const m of this.movers) {
      m.t += delta * m.speed
      const offset = Math.sin(m.t) * m.range
      const nx = m.axis === 'x' ? m.baseX + offset : m.baseX
      const nz = m.axis === 'z' ? m.baseZ + offset : m.baseZ

      m.body.velocity.set(
        (nx - m.body.position.x) / step,
        0,
        (nz - m.body.position.z) / step
      )
      m.body.position.set(nx, BUMPER_BODY_Y, nz)
      m.mesh.position.set(nx, m.meshY, nz)
    }
  }

  getHolePosition(): THREE.Vector3 {
    return this.holePosition.clone()
  }

  getBallStart(): THREE.Vector3 {
    return this.ballStart.clone()
  }

  private clear(): void {
    for (const mesh of this.meshes) {
      this.scene.remove(mesh)
      mesh.geometry.dispose()
    }
    for (const body of this.bodies) {
      this.world.removeBody(body)
    }
    this.meshes = []
    this.bodies = []
    this.movers = []
  }

  private createFloor(size: { width: number; depth: number }): void {
    const geometry = new THREE.BoxGeometry(size.width, 0.2, size.depth)
    const material = new THREE.MeshStandardMaterial({ color: 0x3d9e3d })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.receiveShadow = true
    this.scene.add(mesh)
    this.meshes.push(mesh)

    const body = new CANNON.Body({
      mass: 0,
      shape: new CANNON.Box(new CANNON.Vec3(size.width / 2, 0.1, size.depth / 2)),
    })
    this.world.addBody(body)
    this.bodies.push(body)
  }

  private createWalls(
    walls: { position: [number, number, number]; size: [number, number, number] }[]
  ): void {
    walls.forEach(({ position, size }, i) => {
      const geometry = new THREE.BoxGeometry(size[0], size[1], size[2])
      const material = new THREE.MeshStandardMaterial({ color: 0x8b4513 })
      const mesh = new THREE.Mesh(geometry, material)
      mesh.castShadow = true
      mesh.receiveShadow = true
      mesh.position.set(position[0], position[1], position[2])
      this.scene.add(mesh)
      this.meshes.push(mesh)

      const halfExtents = new CANNON.Vec3(size[0] / 2, size[1] / 2, size[2] / 2)
      const body = new CANNON.Body({
        mass: 0,
        shape: new CANNON.Box(halfExtents),
      })
      body.position.set(position[0], position[1], position[2])
      this.world.addBody(body)
      this.bodies.push(body)

      // [TEMP DEBUG] vérification alignement mesh <-> corps physique
      console.log(`[wall ${i}]`, {
        meshPos: [mesh.position.x, mesh.position.y, mesh.position.z],
        bodyPos: [body.position.x, body.position.y, body.position.z],
        meshSize: [size[0], size[1], size[2]],
        bodyHalfExtents: [halfExtents.x, halfExtents.y, halfExtents.z],
        mass: body.mass,
      })
    })
  }

  private createHole(position: [number, number, number]): void {
    const geometry = new THREE.CylinderGeometry(0.25, 0.25, 0.01, 32)
    const material = new THREE.MeshStandardMaterial({ color: 0x111111 })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(position[0], position[1], position[2])
    this.scene.add(mesh)
    this.meshes.push(mesh)
  }

  private createObstacles(obstacles: ObstacleConfig[]): void {
    obstacles.forEach((obs) => {
      if (obs.type !== 'bumper') return

      const radius = obs.radius ?? 0.45
      const height = obs.height ?? 0.6
      const [x, y, z] = obs.position

      const geometry = new THREE.CylinderGeometry(radius, radius, height, 24)
      const material = new THREE.MeshStandardMaterial({ color: 0xdd2222 })
      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.set(x, y, z)
      mesh.castShadow = true
      this.scene.add(mesh)
      this.meshes.push(mesh)

      const body = new CANNON.Body({
        mass: 0,
        type: obs.movement ? CANNON.Body.KINEMATIC : CANNON.Body.STATIC,
        shape: new CANNON.Sphere(radius),
        material: this.bumperMaterial,
      })
      body.position.set(x, BUMPER_BODY_Y, z)
      this.world.addBody(body)
      this.bodies.push(body)

      if (obs.movement) {
        this.movers.push({
          mesh,
          body,
          axis: obs.movement.axis,
          range: obs.movement.range,
          speed: obs.movement.speed,
          baseX: x,
          baseZ: z,
          meshY: y,
          t: 0,
        })
      }
    })
  }
}
