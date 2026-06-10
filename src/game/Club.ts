import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import clubUrl from '../assets/models/golf_club_iron.glb?url'

export class Club {
  private aimPivot: THREE.Group
  private swingPivot: THREE.Group
  private model: THREE.Group | null = null
  private visible: boolean = true

  private readonly BALL_RADIUS = 0.2
  private readonly BACK_OFFSET = 0.18
  private readonly MAX_BACKSWING = Math.PI / 2.2

  constructor(scene: THREE.Scene) {
    this.aimPivot = new THREE.Group()
    this.swingPivot = new THREE.Group()
    this.aimPivot.add(this.swingPivot)
    scene.add(this.aimPivot)
    console.log(this.aimPivot)

    const loader = new GLTFLoader()
    loader.load(clubUrl, (gltf) => {
      const model = gltf.scene
      model.scale.set(2, 2, 2)

      const box = new THREE.Box3().setFromObject(model)
      const center = box.getCenter(new THREE.Vector3())

      model.position.set(-center.x, -box.min.y, -center.z)
      model.rotation.y = 2*Math.PI

      model.position.x += -(this.BALL_RADIUS + this.BACK_OFFSET)

      model.traverse((child) => {
        child.castShadow = true
      })

      this.model = model
      this.swingPivot.add(model)
      this.aimPivot.visible = this.visible
    })
  }

  update(ballPosition: THREE.Vector3, aimDirection: THREE.Vector3 | null, power: number): void {
    if (!this.model) return

    this.aimPivot.position.copy(ballPosition)
    this.aimPivot.position.y = 0

    if (aimDirection) {
      this.aimPivot.rotation.y = Math.atan2(aimDirection.x, aimDirection.z)
      this.swingPivot.rotation.x = power * this.MAX_BACKSWING
    } else {
      this.swingPivot.rotation.x = 0
    }
  }

  setVisible(visible: boolean): void {
    this.visible = visible
    this.aimPivot.visible = visible
  }
}
