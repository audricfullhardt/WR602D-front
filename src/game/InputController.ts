import * as THREE from 'three'
import { Ball } from './Ball'

export class InputController {
  private ball: Ball
  private camera: THREE.Camera
  private isAiming: boolean = false
  private startPoint: THREE.Vector2 = new THREE.Vector2()
  private maxForce: number = 15
  private maxDragDistance: number = 200

  private aimLine: THREE.Line
  private scene: THREE.Scene
  private onShot: () => void

  constructor(ball: Ball, camera: THREE.Camera, scene: THREE.Scene, onShot: () => void) {
    this.ball = ball
    this.camera = camera
    this.scene = scene
    this.onShot = onShot

    this.aimLine = this.createAimLine()
    this.scene.add(this.aimLine)

    this.bindEvents()
  }

  private createAimLine(): THREE.Line {
    const points = [new THREE.Vector3(), new THREE.Vector3()]
    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    const material = new THREE.LineBasicMaterial({
      color: 0xff0000,
      depthTest: false,
    })
    return new THREE.Line(geometry, material)
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

    const endPoint = ballPos.clone().add(direction.multiplyScalar(power * 3))
    this.updateAimLine(ballPos, endPoint)
  }

  private onMouseUp(e: MouseEvent): void {
    if (!this.isAiming) return
    this.isAiming = false
    this.hideAimLine()

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

  private updateAimLine(from: THREE.Vector3, to: THREE.Vector3): void {
    const positions = this.aimLine.geometry.attributes.position
    positions.setXYZ(0, from.x, from.y + 0.1, from.z)
    positions.setXYZ(1, to.x, to.y + 0.1, to.z)
    positions.needsUpdate = true
    this.aimLine.visible = true
  }

  private hideAimLine(): void {
    this.aimLine.visible = false
  }

  dispose(): void {
    window.removeEventListener('mousedown', this.onMouseDown.bind(this))
    window.removeEventListener('mousemove', this.onMouseMove.bind(this))
    window.removeEventListener('mouseup', this.onMouseUp.bind(this))
    this.scene.remove(this.aimLine)
  }
}