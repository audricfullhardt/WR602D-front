import * as THREE from "three";
import * as CANNON from "cannon-es";

export class Ball {
  mesh: THREE.Mesh;
  body: CANNON.Body;

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

  update(): void {
    this.mesh.position.copy(this.body.position as unknown as THREE.Vector3);
    this.mesh.quaternion.copy(
      this.body.quaternion as unknown as THREE.Quaternion
    );
  }

  hit(force: THREE.Vector3): void {
    this.body.wakeUp();
    this.body.applyImpulse(new CANNON.Vec3(force.x, force.y, force.z));
  }

  getBallPosition(): THREE.Vector3 {
    return this.mesh.position.clone();
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
