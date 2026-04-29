import * as THREE from 'three'
import * as CANNON from 'cannon-es'

export class Track {
  private scene: THREE.Scene
  private world: CANNON.World

  constructor(scene: THREE.Scene, world: CANNON.World) {
    this.scene = scene
    this.world = world

    this.createFloor()
    this.createWalls()
    this.createHole()
  }

  private createFloor(): void {
    const geometry = new THREE.BoxGeometry(4, 0.2, 12)
    const material = new THREE.MeshStandardMaterial({ color: 0x3d9e3d })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.receiveShadow = true
    mesh.position.set(0, 0, 0)
    this.scene.add(mesh)

    const body = new CANNON.Body({
      mass: 0,
      shape: new CANNON.Box(new CANNON.Vec3(2, 0.1, 6)),
    })
    body.position.set(0, 0, 0)
    this.world.addBody(body)
  }

  private createWalls(): void {
    const wallConfigs = [
      { pos: [-2.1, 0.4, 0], size: [0.2, 0.5, 12] },
      { pos: [2.1, 0.4, 0],  size: [0.2, 0.5, 12] },
      { pos: [0, 0.4, -6.1], size: [4.4, 0.5, 0.2] },
      { pos: [0, 0.4, 6.1],  size: [4.4, 0.5, 0.2] },
    ]

    wallConfigs.forEach(({ pos, size }) => {
      const geometry = new THREE.BoxGeometry(size[0], size[1], size[2])
      const material = new THREE.MeshStandardMaterial({ color: 0x8b4513 })
      const mesh = new THREE.Mesh(geometry, material)
      mesh.castShadow = true
      mesh.receiveShadow = true
      mesh.position.set(pos[0], pos[1], pos[2])
      this.scene.add(mesh)

      const body = new CANNON.Body({
        mass: 0,
        shape: new CANNON.Box(
          new CANNON.Vec3(size[0] / 2, size[1] / 2, size[2] / 2)
        ),
      })
      body.position.set(pos[0], pos[1], pos[2])
      this.world.addBody(body)
    })
  }

  private createHole(): void {
    const geometry = new THREE.CylinderGeometry(0.25, 0.25, 0.01, 32)
    const material = new THREE.MeshStandardMaterial({ color: 0x111111 })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(0, 0.11, -4)
    this.scene.add(mesh)
  }

  getHolePosition(): THREE.Vector3 {
    return new THREE.Vector3(0, 0.11, -4)
  }
}