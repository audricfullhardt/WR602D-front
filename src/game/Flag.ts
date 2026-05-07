import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import flagUrl from '../assets/models/golf_flag.glb?url'

export class Flag {
  private model: THREE.Group | null = null
  private raising = false
  private raiseProgress = 0
  private readonly RAISE_DURATION = 0.3
  private readonly RAISE_AMOUNT = 0.5
  private baseY: number

  constructor(scene: THREE.Scene, holePosition: THREE.Vector3) {
    this.baseY = holePosition.y + 1.5

    const loader = new GLTFLoader()
    loader.load(flagUrl, (gltf) => {
      this.model = gltf.scene
      this.model.scale.set(0.1, 0.1, 0.1)
      this.model.position.set(holePosition.x, this.baseY, holePosition.z)
      this.model.traverse((child) => {
        child.castShadow = true
      })
      scene.add(this.model)
    })
  }

  raise(): void {
    if (this.raising) return
    this.raising = true
    this.raiseProgress = 0
  }

  down(): void {
    if (!this.raising) return
    this.raising = false
    this.raiseProgress = 0
    if (this.model) this.model.position.y = this.baseY
  } 

  update(delta: number): void {
    if (!this.model || !this.raising) return

    this.raiseProgress += delta / this.RAISE_DURATION
    const t = Math.min(this.raiseProgress, 1)
    const ease = 1 - Math.pow(1 - t, 3)

    this.model.position.y = this.baseY + this.RAISE_AMOUNT * ease

    if (t >= 1) this.raising = false
  }

  reset(): void {
    if (this.model) this.model.position.y = this.baseY
    this.raising = false
    this.raiseProgress = 0
  }
}
