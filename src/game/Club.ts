import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import clubUrl from '../assets/models/golf_club_iron.glb?url'

export class Club {
  private model: THREE.Group | null = null

  constructor(scene: THREE.Scene) {
    const loader = new GLTFLoader()
    loader.load(clubUrl, (gltf) => {
      this.model = gltf.scene
      this.model.scale.set(2, 2, 2)
      this.model.position.set(0, 0, 0)
      this.model.traverse((child) => {
        child.castShadow = true
      })
      scene.add(this.model)
    })
  }

  update(ballPosition: THREE.Vector3, aimDirection: THREE.Vector3 | null, power: number): void {
    if (!this.model) return

    this.model.position.copy(ballPosition)

    if (aimDirection) {
      this.model.rotation.y = Math.atan2(aimDirection.x, aimDirection.z)
      this.model.rotation.x = -power * 0.5
    } else {
      this.model.rotation.x = 0
    }
  }

  setVisible(visible: boolean): void {
    if (this.model) this.model.visible = visible
  }
}
