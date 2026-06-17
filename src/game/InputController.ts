import * as THREE from 'three'
import { Ball } from './Ball'

export class InputController {
  private ball: Ball
  private camera: THREE.Camera
  private isAiming: boolean = false
  private startPoint: THREE.Vector2 = new THREE.Vector2()
  private maxForce: number = 15
  private maxDragDistance: number = 200

  private aimDots: THREE.Group
  private readonly DOT_COUNT = 8
  private scene: THREE.Scene
  private onShot: () => void
  private onAim: ((angle: number, power: number) => void) | undefined

  constructor(
    ball: Ball,
    camera: THREE.Camera,
    scene: THREE.Scene,
    onShot: () => void,
    onAim?: (angle: number, power: number) => void
  ) {
    this.ball = ball
    this.camera = camera
    this.scene = scene
    this.onShot = onShot
    this.onAim = onAim

    this.aimDots = this.createAimDots()
    this.scene.add(this.aimDots)

    this.bindEvents()
  }

  private createAimDots(): THREE.Group {
    const group = new THREE.Group()
    const geometry = new THREE.SphereGeometry(0.04, 8, 8)

    for (let i = 0; i < this.DOT_COUNT; i++) {
      const material = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        depthTest: false,
        transparent: true,
        opacity: 0.9,
      })
      const dot = new THREE.Mesh(geometry, material)
      dot.renderOrder = 999
      group.add(dot)
    }

    group.visible = false
    return group
  }

  private bindEvents(): void {
    window.addEventListener('mousedown', this.onMouseDown.bind(this))
    window.addEventListener('mousemove', this.onMouseMove.bind(this))
    window.addEventListener('mouseup', this.onMouseUp.bind(this))
  }

  private onMouseDown(e: MouseEvent): void {
    if (this.ball.isMoving()) return

    this.isAiming = true
    this.startPoint.set(e.clientX, e.clientY)
  }

  private onMouseMove(e: MouseEvent): void {
    if (!this.isAiming) return

    const drag = new THREE.Vector2(
      e.clientX - this.startPoint.x,
      e.clientY - this.startPoint.y
    )

    const ballPos = this.ball.mesh.position
    const direction = this.getDragDirection(drag)
    const power = Math.min(drag.length() / this.maxDragDistance, 1)

    // Angle du tir dans le plan XZ -> rotation Y du club.
    const angle = Math.atan2(direction.x, direction.z)
    this.onAim?.(angle, power)

    this.updateAimDots(ballPos, direction, power)
  }

  private onMouseUp(e: MouseEvent): void {
    if (!this.isAiming) return
    this.isAiming = false
    this.hideAimDots()

    const drag = new THREE.Vector2(
      e.clientX - this.startPoint.x,
      e.clientY - this.startPoint.y
    )

    if (drag.length() < 5) return

    const direction = this.getDragDirection(drag)
    const power = Math.min(drag.length() / this.maxDragDistance, 1)
    const force = direction.multiplyScalar(power * this.maxForce)

    this.ball.hit(force)
    this.onShot()
  }

  private getDragDirection(drag: THREE.Vector2): THREE.Vector3 {
    const direction = new THREE.Vector3(-drag.x, 0, -drag.y)
    direction.normalize()

    direction.applyQuaternion(this.camera.quaternion)
    direction.y = 0
    direction.normalize()

    return direction
  }

  private updateAimDots(
    from: THREE.Vector3,
    direction: THREE.Vector3,
    power: number
  ): void {
    // Longueur de la trajectoire affichée, proportionnelle à la puissance.
    const length = 1 + power * 3
    const step = length / this.DOT_COUNT

    for (let i = 0; i < this.DOT_COUNT; i++) {
      const dot = this.aimDots.children[i]
      const distance = step * (i + 1)
      dot.position.set(
        from.x + direction.x * distance,
        from.y + 0.1,
        from.z + direction.z * distance
      )
    }

    this.aimDots.visible = true
  }

  private hideAimDots(): void {
    this.aimDots.visible = false
  }

  dispose(): void {
    window.removeEventListener('mousedown', this.onMouseDown.bind(this))
    window.removeEventListener('mousemove', this.onMouseMove.bind(this))
    window.removeEventListener('mouseup', this.onMouseUp.bind(this))
    this.scene.remove(this.aimDots)
  }
}
