import * as THREE from "three";
import { generateUUID } from "three/src/math/MathUtils.js";

class Particle {
  id = generateUUID();
  x = 0;
  y = 0;
  z = 0;
  vx = 0;
  vy = 0;
  vz = 0;
  size = 3;
  camera = null;
  material = null;
  mesh = null;
  geometry = new THREE.PlaneGeometry(this.size, this.size);
  texture = null;

  constructor(camera, texture_path = "./textures/null_texture.png") {
    this.camera = camera;
    const textureLoader = new THREE.TextureLoader().load(
      texture_path,
      () => {},
      () => {},
      (err) => {
        console.log(err);
      },
    );
    this.texture = textureLoader;
    material = new THREE.MeshStandardMaterial({
      map: textureLoader,
      alphaHash: true,
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }
}

export class ParticleEmitter {
  particles = new Map();
  enableGravity = false;
  direction = [0, 1, 0];
  speed = 1;
  scene;
  g = 1.2;
  camera;
  group = new THREE.Group();
  TTL_CONST = 100;
  ttl = this.TTL_CONST;
  waitTime = 50;
  numberParticles = 10;
  k = 1;
  emitted = false;

  constructor(scene, camera, direction = [0, 1, 0], speed = 1) {
    this.scene = scene;
    this.direction = direction;
    this.speed = speed;
  }

  emit() {
    for (let i = 0; i < this.numberParticles; i++) {
      let particle = new Particle(camera);
      particle.vx = this.speed * this.direction[0];
      particle.vy = this.speed * this.direction[1];
      particle.vz = this.speed * this.direction[2];
      this.particles.set(particle.id, particle);
    }
    this.emitted = true;
  }

  update(dt = 0.1) {
    if (!this.emitted) {
      this.emit();
    }
    const parts = this.particles.values();
    for (let p of parts) {
      // this.group.children[0].quaternion.copy(this.camera.quaternion);
      p.mesh.quaternion.copy(this.camera.quaternion);
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.z += p.vz * dt;

      if (this.enableGravity) {
        this.vy -= this.g * dt;
      }

      if (this.k < 1) {
        p.vx *= this.k;
        p.vy *= this.k;
        p.vz *= this.k;
      }
    }
    this.ttl--;
    if (this.ttl < 0) {
      this.ttl = this.TTL_CONST;
      this.destroy();
      this.emitted = false;
    }
  }

  destroy() {
    const parts = [...this.particles.values()];
    for (let p of parts) {
      p.material.dispose();
      p.geometry.dispose();
      p.texture.dispose();
    }
    this.particles.clear();
  }
}
