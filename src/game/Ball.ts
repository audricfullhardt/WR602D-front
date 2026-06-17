import * as THREE from "three";
import * as CANNON from "cannon-es";

export class Ball {
  mesh: THREE.Mesh;
  body: CANNON.Body;
  material: CANNON.Material;

  private startPosition = new THREE.Vector3(0, 1, 4);
  private enteringHole = false;
  private enterHoleStart = new THREE.Vector3();
  private enterHoleTarget = new THREE.Vector3();
  private enterHoleProgress = 0;
  private onHoleEntered: (() => void) | null = null;
  private readonly ENTER_HOLE_DURATION = 0.55;
  // Vitesse horizontale max : empêche la balle (accélérée par les bumpers à
  // restitution > 1) de dépasser une vitesse qui la ferait traverser les murs fins.
  private readonly MAX_SPEED = 16;

  constructor(scene: THREE.Scene, world: CANNON.World) {
    const radius = 0.2;

    const geometry = new THREE.SphereGeometry(radius, 32, 32);
    const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.castShadow = true;
    scene.add(this.mesh);

    const shape = new CANNON.Sphere(radius);

    this.material = new CANNON.Material("ball");
    this.material.friction = 0.4;
    this.material.restitution = 0.3;

    this.body = new CANNON.Body({
      mass: 1,
      shape,
      material: this.material,
      linearDamping: 0.4,
      angularDamping: 0.4,
    });

    // [TEMP DEBUG] confirme qu'une collision est bien détectée et avec quel corps.
    this.body.addEventListener("collide", (e: { body: CANNON.Body }) => {
      const speed = Math.hypot(this.body.velocity.x, this.body.velocity.z);
      console.log(
        `[ball collide] avec mass=${e.body.mass} | vitesse balle=${speed.toFixed(1)} m/s`
      );
    });

    this.body.position.copy(this.startPosition as unknown as CANNON.Vec3);
    world.addBody(this.body);
  }

  setStart(position: THREE.Vector3): void {
    this.startPosition.copy(position);
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

    this.clampSpeed();

    this.mesh.position.copy(this.body.position as unknown as THREE.Vector3);
    this.mesh.quaternion.copy(
      this.body.quaternion as unknown as THREE.Quaternion
    );
  }

  private clampSpeed(): void {
    const v = this.body.velocity;
    const horizontalSpeed = Math.hypot(v.x, v.z);
    if (horizontalSpeed > this.MAX_SPEED) {
      const scale = this.MAX_SPEED / horizontalSpeed;
      v.x *= scale;
      v.z *= scale;
    }
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
    // Borne la vitesse dès le tir (avant le 1er world.step), pas seulement à la
    // frame suivante : évite tout pic intra-step qui ferait tunneliser un mur.
    this.clampSpeed();
  }

  reset(): void {
    this.enteringHole = false;
    this.onHoleEntered = null;
    this.mesh.visible = true;
    this.mesh.scale.setScalar(1);
    this.body.wakeUp();
    this.body.position.set(
      this.startPosition.x,
      this.startPosition.y,
      this.startPosition.z
    );
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
