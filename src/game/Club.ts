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

  // Animation de swing : on lerp rotation.x du swingPivot vers une cible.
  private readonly LERP_FACTOR = 0.15
  private readonly BACKSWING_ANGLE = -Math.PI / 3 // backswing max (pleine puissance)
  private readonly FORWARD_ANGLE = Math.PI / 2 // swing vers l'avant
  private readonly FORWARD_DURATION = 0.2 // 200ms
  private readonly RETURN_DURATION = 0.3 // 300ms

  private state: 'idle' | 'aiming' | 'forward' | 'return' = 'idle'
  private targetAngle = 0
  private phaseTime = 0

  constructor(scene: THREE.Scene) {
    this.aimPivot = new THREE.Group()
    this.swingPivot = new THREE.Group()
    this.aimPivot.add(this.swingPivot)
    scene.add(this.aimPivot)

    const loader = new GLTFLoader()
    loader.load(clubUrl, (gltf) => {
      const model = gltf.scene

      // Le nœud racine du GLB porte une matrice non standard : on repart d'une
      // base propre, puis on redresse le club à la verticale (debout) avec
      // rotation.x = -90° -> manche vers le haut, tête vers le bas.
      model.rotation.set(0, 0, 0)
      model.rotation.x = -Math.PI / 2
      model.scale.set(2, 2, 2)
      model.updateMatrixWorld(true)

      // Ancrage par bounding box : on pose le point le plus bas (la tête) au sol.
      const box = new THREE.Box3().setFromObject(model)
      const center = box.getCenter(new THREE.Vector3())
      model.position.set(-center.x, -box.min.y, -center.z)

      // Décalage : le club se place à côté de la balle.
      model.position.x += -(this.BALL_RADIUS + this.BACK_OFFSET)

      model.traverse((child) => {
        child.castShadow = true
      })

      this.model = model
      this.swingPivot.add(model)
      this.aimPivot.visible = this.visible
    })
  }

  /**
   * Appelé en temps réel pendant le drag (visée).
   * @param angle orientation du tir dans le plan XZ (rotation Y du pivot)
   * @param power puissance normalisée [0,1] -> amplitude du backswing
   */
  aim(angle: number, power: number): void {
    if (this.state === 'forward' || this.state === 'return') return
    this.state = 'aiming'
    this.aimPivot.rotation.y = angle
    this.targetAngle = this.BACKSWING_ANGLE * power
  }

  /** Appelé au relâchement (tir) : déclenche le swing vers l'avant. */
  release(): void {
    this.state = 'forward'
    this.phaseTime = 0
    this.targetAngle = this.FORWARD_ANGLE
  }

  update(ballPosition: THREE.Vector3, isMoving: boolean, delta = 0): void {
    if (!this.model) return

    // Le club ne suit pas la balle pendant qu'elle roule : il reste immobile.
    // Quand la balle s'arrête, il se repositionne à côté d'elle.
    if (!isMoving) {
      this.aimPivot.position.copy(ballPosition)
      this.aimPivot.position.y = 0
    }

    // Machine d'états temporelle du swing.
    if (this.state === 'forward') {
      this.phaseTime += delta
      if (this.phaseTime >= this.FORWARD_DURATION) {
        this.state = 'return'
        this.phaseTime = 0
        this.targetAngle = 0
      }
    } else if (this.state === 'return') {
      this.phaseTime += delta
      if (this.phaseTime >= this.RETURN_DURATION) {
        this.state = 'idle'
        this.targetAngle = 0
      }
    }

    // Lissage : on rapproche l'angle courant de la cible à chaque frame.
    this.swingPivot.rotation.x = THREE.MathUtils.lerp(
      this.swingPivot.rotation.x,
      this.targetAngle,
      this.LERP_FACTOR
    )
  }

  setVisible(visible: boolean): void {
    this.visible = visible
    this.aimPivot.visible = visible
  }
}
