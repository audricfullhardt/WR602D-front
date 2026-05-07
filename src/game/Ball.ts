import * as THREE from "three";
import * as CANNON from "cannon-es";

export class Ball {
  mesh: THREE.Mesh;
  body: CANNON.Body;

  private enteringHole = false;
  private enterHoleStart = new THREE.Vector3();
  private enterHoleTarget = new THREE.Vector3();
  private enterHoleProgress = 0;
  private onHoleEntered: (() => void) | null = null;
  private readonly ENTER_HOLE_DURATION = 0.55;

  constructor(scene: THREE.Scene, world: CANNON.World) {
    const radius = 0.2;

    const geometry = new THREE.SphereGeometry(radius, 32, 32);
    const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.castShadow = true;
    scene.add(this.mesh);

    const shape = new CANNON.Sphere(radius);

    const physicsMaterial = new CANNON.Material("ball");
    physicsMaterial.friction = 0.4;
    physicsMaterial.restitution = 0.3;

    this.body = new CANNON.Body({
      mass: 1,
      shape,
      material: physicsMaterial,
      linearDamping: 0.4,
      angularDamping: 0.4,
    });

    this.body.position.set(0, 1, 4);
    world.addBody(this.body);
  }

  update(delta = 0): void {
    if (this.enteringHole) {
      this.enterHoleProgress += delta / this.ENTER_HOLE_DURATION;
      const t = Math.min(this.enterHoleProgress, 1);
      // Ease in-out cubic
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      const sinkTarget = new THREE.Vector3(
        this.enterHoleTarget.x,
        this.enterHoleTarget.y - 0.25,
        this.enterHoleTarget.z
      );
      this.mesh.position.lerpVectors(this.enterHoleStart, sinkTarget, ease);
      this.mesh.scale.setScalar(1 - ease);

      if (t >= 1) {
        this.enteringHole = false;
        this.mesh.visible = false;
        this.onHoleEntered?.();
        this.onHoleEntered = null;
      }
      return;
    }

    this.mesh.position.copy(this.body.position as unknown as THREE.Vector3);
    this.mesh.quaternion.copy(
      this.body.quaternion as unknown as THREE.Quaternion
    );
  }

  enterHole(holePosition: THREE.Vector3, onComplete: () => void): void {
    this.enteringHole = true;
    this.enterHoleStart.copy(this.mesh.position);
    this.enterHoleTarget.copy(holePosition);
    this.enterHoleProgress = 0;
    this.onHoleEntered = onComplete;
    this.body.velocity.set(0, 0, 0);
    this.body.angularVelocity.set(0, 0, 0);
    this.body.sleep();
  }

  hit(force: THREE.Vector3): void {
    this.body.wakeUp();
    this.body.applyImpulse(new CANNON.Vec3(force.x, force.y, force.z));
  }

  reset(): void {
    this.enteringHole = false;
    this.onHoleEntered = null;
    this.mesh.visible = true;
    this.mesh.scale.setScalar(1);
    this.body.wakeUp();
    this.body.position.set(0, 1, 4);
    this.body.velocity.set(0, 0, 0);
    this.body.angularVelocity.set(0, 0, 0);
  }

  getBallPosition(): THREE.Vector3 {
    return this.mesh.position.clone();
  }

  isInHole(holePosition: THREE.Vector3, holeRadius: number): boolean {
    const ballPos = this.getBallPosition();
    const distance = ballPos.distanceTo(holePosition);
    return distance < holeRadius;
  }

  isCloseToHole(holePosition: THREE.Vector3, threshold: number): boolean {
    const ballPos = this.getBallPosition();
    const distance = ballPos.distanceTo(holePosition);
    return distance < threshold;
  }

  isMoving(): boolean {
    const velocity = this.body.velocity;
    const threshold = 0.1;
    return (
      Math.abs(velocity.x) > threshold ||
      Math.abs(velocity.y) > threshold ||
      Math.abs(velocity.z) > threshold
    );
  }
}
