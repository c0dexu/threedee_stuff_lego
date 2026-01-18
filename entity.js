import * as THREE from "three";
import { generateUUID } from "three/src/math/MathUtils.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

class Entity {
  id = generateUUID();
  anchored = false;
  name = "entity";
  scene;
  world;
  currentCells = [];
  previousCells = [];
  mesh;
  vx = 0;
  vy = 0;
  vz = 0;
  px = 0;
  pz = 0;
  rpx = 0;
  rpz = 0;
  spd = 8;
  fx;
  fy;
  fz;
  dx = 0;
  dy = 0;
  dz = 0;
  theta;
  group;
  bbox;
  gforce = 9.8;
  deltaP = new THREE.Vector3();
  previousPosition = new THREE.Vector3();
  debuggingEnabled = false;
  vcollisions = 0;
  xcollisions = 0;
  zcollisions = 0;
  collisionGroup = [];
  jumpForce = 0;
  canJump = false;
  onPlatform = false;
  reactorX = 0;
  reactorZ = 0;
  reactorY = 0;
  pushable = false;

  constructor(scene, world, x0, y0, z0, vx = 0, vy = 0, vz = 0) {
    this.vx = vx;
    this.vy = vy;
    this.vz = vz;
    this.group = new THREE.Group();
    this.group.position.set(x0, y0, z0);
    this.bbox = new THREE.Box3().setFromObject(this.group);
    this.scene = scene;
  }

  update(entities, dt = 0.01) {
    this.hcollisions = 0;
    this.vcollisions = 0;
    this.xcollisions = 0;
    this.zcollisions = 0;
    const box = this.bbox.clone();
    const a = box.clone();
    a.min.y = box.min.y + this.vy * dt;
    a.max.y = box.max.y + this.vy * dt;

    const b = box.clone();
    b.min.x = box.min.x + this.vx;
    b.max.x = box.max.x + this.vx;
    b.max.y++;
    b.min.y++;

    const k = box.clone();
    k.min.z = box.min.z + this.vz;
    k.max.z = box.max.z + this.vz;
    k.max.y++;
    k.min.y++;

    entities.forEach((entity) => {
      if (this.id !== entity.id) {
        const c = entity.bbox;

        if (c.intersectsBox(a)) {
          this.vcollisions++;
        }

        if (c.intersectsBox(b)) {
          this.xcollisions++;
        }

        if (c.intersectsBox(k)) {
          this.zcollisions++;
        }
      }
    });

    if (this.vcollisions > 0) {
      this.reactorY = -this.gforce;
      this.vy = 0;
      this.canJump = true;
    } else {
      this.canJump = false;
      this.reactorY = 0;
    }

    if (this.xcollisions > 0) {
      this.rpx = -this.px;
    } else {
      this.rpx = 0;
    }

    if (this.zcollisions > 0) {
      this.rpz = -this.pz;
    } else {
      this.rpz = 0;
    }

    if (!this.anchored) {
      this.vy -= (this.gforce + this.reactorY + this.jumpForce) * dt;
    }

    if (!this.anchored) {
      // this.group.position.set(
      //   this.group.position.x + (this.vx + this.reactorX) * dt,
      //   this.group.position.y + this.vy * dt,
      //   this.group.position.z + (this.vz + this.reactorZ) * dt,
      // );
      this.group.position.setX(this.group.position.x + this.vx * dt);
      this.group.position.setY(this.group.position.y + this.vy * dt);
      this.group.position.setZ(this.group.position.z + this.vz * dt);
    }

    if (this.name === "Legoman") {
      console.log(this.vy);
    }
    this.bbox = new THREE.Box3().setFromObject(this.group);
  }

  addEntityToScene() {}

  initEntityOnGrid() {
    const cellList = this.world.cells.flat(Infinity);
    const myBbox = new THREE.Box3().setFromObject(this.group);
    cellList.forEach((cell) => {
      const cellBbox = cell.bbox;
      if (myBbox.intersectsBox(cellBbox)) {
        cell.insert(this);
        this.currentCells.push(cell);
        this.previousCells.push(cell);
      }
    });
  }

  checkNeighboringCells(dt = 0.1) {
    try {
      this.world.cells.forEach((line1) => {
        line1.forEach((line2) => {
          line2.forEach((cell) => {
            const p1 = new THREE.Vector3(
              this.group.position.x,
              this.group.position.y,
              this.group.position.z,
            );
            const p2 = new THREE.Vector3(
              cell.xcenter,
              cell.ycenter,
              cell.zcenter,
            );
            const dist = p1.sub(p2).length();
            if (dist < this.world.cellSize * 2) {
              const bbox = cell.bbox;
              const [i, j, k] = this.world.getCellIndexByPosition(
                cell.xcenter,
                cell.ycenter,
                cell.zcenter,
              );
              if (this.bbox.intersectsBox(bbox)) {
                cell.insert(this);
              }
            } else {
              cell.remove(this.id);
            }
          });
        });
      });

      this.bbox = new THREE.Box3().setFromObject(this.group);
    } catch (e) {
      console.log(e);
      return;
    }
  }

  getDistanceFromEntity(other) {
    const mPosition = this.group.position;
    const mEntityPosition = other.group.position;
    const subVector = mPosition.sub(mEntityPosition);
    return subVector.length();
  }

  getDistanceFromPoint(point) {
    const mPosition = this.group.position;
    const subVector = mPosition.sub(point);
    return subVector.length();
  }

  getRelativePositionFromPoint(point) {
    const mPosition = this.group.position;
    const subVector = mPosition.sub(point);
    return subVector;
  }
}

export class Legoman extends Entity {
  name = "Legoman";
  scale = 2;
  constructor(scene, world, x0 = 0, y0 = 0, z0 = 0) {
    super(scene, world, x0, y0, z0);
  }

  respawn() {
    this.vx = 0;
    this.vy = 0;
    this.vz = 0;
    this.group.position.set(64, 256 * 2, 0);
  }

  constructLegoman() {
    const torsoGeometry = new THREE.BoxGeometry(
      this.scale,
      2 * this.scale,
      2 * this.scale,
    );
    const torsoMaterial = new THREE.MeshStandardMaterial({ color: "#198238" });
    const torsoMesh = new THREE.Mesh(torsoGeometry, torsoMaterial);

    const tshirtGeometry = new THREE.PlaneGeometry(
      2 * this.scale,
      2 * this.scale,
    );

    this.texture = new THREE.TextureLoader().load(
      "./textures/legoman/default_tshirt.png",
      () => {},
      () => {},
      (err) => {
        console.log(err);
      },
    );
    const tshirtMaterial = new THREE.MeshStandardMaterial({
      map: this.texture,
    });
    const tshirtMesh = new THREE.Mesh(tshirtGeometry, tshirtMaterial);
    tshirtMesh.rotateY(Math.PI / 2);
    tshirtMesh.position.set(this.scale * 0.65, 0, 0);

    const leftArmGeometry = new THREE.BoxGeometry(
      this.scale,
      2 * this.scale,
      1 * this.scale,
    );
    const leftArmMaterial = new THREE.MeshStandardMaterial({
      color: "#E7E87A",
    });
    const leftArmMesh = new THREE.Mesh(leftArmGeometry, leftArmMaterial);
    leftArmMesh.position.set(0, 0, this.scale + 0.5 * this.scale);

    const rightArmGeometry = new THREE.BoxGeometry(
      this.scale,
      2 * this.scale,
      1 * this.scale,
    );
    const rightArmMaterial = new THREE.MeshStandardMaterial({
      color: "#E7E87A",
    });
    const rightArmMesh = new THREE.Mesh(rightArmGeometry, rightArmMaterial);
    rightArmMesh.position.set(0, 0, -this.scale - 0.5 * this.scale);

    const rightLegGeometry = new THREE.BoxGeometry(
      this.scale,
      2 * this.scale,
      1 * this.scale,
    );
    const rightLegMaterial = new THREE.MeshStandardMaterial({
      color: "#7092BE",
    });
    const rightLegMesh = new THREE.Mesh(rightLegGeometry, rightLegMaterial);
    rightLegMesh.position.set(0, -2 * this.scale, 0.5 * this.scale);

    const leftLegGeometry = new THREE.BoxGeometry(
      this.scale,
      2 * this.scale,
      1 * this.scale,
    );
    const leftLegMaterial = new THREE.MeshStandardMaterial({
      color: "#7092BE",
    });
    const leftLegMesh = new THREE.Mesh(leftLegGeometry, leftLegMaterial);
    leftLegMesh.position.set(0, -2 * this.scale, -0.5 * this.scale);

    const headGeometry = new THREE.CylinderGeometry(
      0.65 * this.scale,
      0.65 * this.scale,
      0.65 * this.scale,
    );
    const headMaterial = new THREE.MeshStandardMaterial({ color: "#E7E87A" });
    const headMesh = new THREE.Mesh(headGeometry, headMaterial);
    headMesh.position.set(0, 0.75 * this.scale + 0.75 * this.scale, 0);

    const textureFace = new THREE.TextureLoader().load(
      "./textures/legoman/face.png",
      () => {},
      () => {},
      (err) => {
        console.log(err);
      },
    );

    const faceGeometry = new THREE.PlaneGeometry(this.scale, this.scale);
    const faceMaterial = new THREE.MeshStandardMaterial({
      map: textureFace,
      alphaHash: true,
    });
    const faceMesh = new THREE.Mesh(faceGeometry, faceMaterial);
    faceMesh.rotateY(Math.PI / 2);
    faceMesh.position.set(
      this.scale * 0.65,
      this.scale * 0.75 + 0.75 * this.scale,
      0,
    );

    this.group.add(torsoMesh);
    this.group.add(leftArmMesh);
    this.group.add(rightArmMesh);
    this.group.add(rightLegMesh);
    this.group.add(leftLegMesh);
    this.group.add(headMesh);
    this.group.add(faceMesh);
    this.bbox = new THREE.Box3().setFromObject(this.group);
    this.group.add(tshirtMesh);
    this.scene.add(this.group);
  }
}

export class Test extends Entity {
  width = 32;
  height = 32;
  depth = 32;
  constructor(scene, world, x0 = 0, y0 = 0, z0 = 0) {
    super(scene, world, x0, y0, z0, 0, 0, 0);
    this.previousPosition = new THREE.Vector3(x0, y0, z0);
  }
  constructTest() {
    this.anchored = true;
    this.name = "TestCube";
    this.texture = new THREE.TextureLoader().load(
      "./textures/legoman/stud_top.jpg",
      () => {},
      () => {},
      (err) => {
        console.log(err);
      },
    );
    this.texture.wrapS = THREE.RepeatWrapping;
    this.texture.wrapT = THREE.RepeatWrapping;
    this.texture.repeat = new THREE.Vector2(this.width / 4, this.height / 4);
    const geometry = new THREE.BoxGeometry(this.width, this.height, this.depth);
    const material = new THREE.MeshStandardMaterial({
      color: "#cfdeea",
      map: this.texture,
    });
    const mesh = new THREE.Mesh(geometry, material);
    this.group.add(mesh);
    this.scene.add(this.group);
  }
}

export class SkyBox {
  mesh;
  texturePath = "./textures/skybox.jpg"; // default
  scene;
  target;

  constructor(scene) {
    this.scene = scene;
  }

  initSkyBox() {
    this.texture = new THREE.TextureLoader().load(
      this.texturePath,
      () => {},
      () => {},
      (err) => {
        console.log(err);
      },
    );
    const geo = new THREE.BoxGeometry(1024, 1024, 1024);
    const material = new THREE.MeshBasicMaterial({
      map: this.texture,
    });
    material.side = THREE.BackSide;
    this.mesh = new THREE.Mesh(geo, material);
    this.scene.add(this.mesh);
  }

  update() {
    this.mesh.position.set(this.target.x, this.target.y, this.target.z);
  }
}

export class Baseplate extends Entity {
  previousPosition = new THREE.Vector3();
  deltaPosition = new THREE.Vector3(0, 0, 0);
  width = 512;
  height = 512;
  depth = 512;
  constructor(scene, world, x0 = 0, y0 = 0, z0 = 0) {
    super(scene, world, x0, y0, z0);
    this.previousPosition = new THREE.Vector3(x0, y0, z0);
  }

  constructBaseplate() {
    this.name = "Baseplate";
    this.texture = new THREE.TextureLoader().load(
      "./textures/legoman/stud_top.jpg",
      () => {},
      () => {},
      (err) => {
        console.log(err);
      },
    );
    this.texture.wrapS = THREE.RepeatWrapping;
    this.texture.wrapT = THREE.RepeatWrapping;
    this.texture.repeat = new THREE.Vector2(this.width / 4, this.height / 4);
    const geometry = new THREE.BoxGeometry(this.width, this.depth, this.height);
    const material = new THREE.MeshStandardMaterial({
      color: "#165C1A",
      map: this.texture,
    });
    const mesh = new THREE.Mesh(geometry, material);
    this.group.add(mesh);
    this.scene.add(this.group);
  }
}

export class BobOmb extends Entity {
  camera;
  constructor(scene, camera, world, x0, y0, z0) {
    super(scene, world, x0, y0, z0);
    this.camera = camera;
  }

  update(entities, dt = 0.01) {
    this.group.children[0].quaternion.copy(this.camera.quaternion);
    super.update(entities, dt);
  }

  constructBobOmb() {
    this.texture = new THREE.TextureLoader().load(
      "./textures/bob-omb/bobomb_body.png",
      () => {},
      () => {},
      (err) => {
        console.log(err);
      },
    );
    const bodyGeometry = new THREE.PlaneGeometry(8, 8, 8);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      map: this.texture,
      alphaHash: true,
    });

    const hatGeometry = new THREE.CylinderGeometry(1, 1, 0.5, 10);
    const hatMaterial = new THREE.MeshStandardMaterial({
      color: "rgb(255, 255, 0)",
    });
    const hatMesh = new THREE.Mesh(hatGeometry, hatMaterial);
    hatMesh.position.set(0, 3.5, 0);

    const textureFace = new THREE.TextureLoader().load(
      "./textures/bob-omb/bobomb_eyes.png",
      () => {},
      () => {},
      (err) => {
        console.log(err);
      },
    );
    const faceGeometry = new THREE.PlaneGeometry(5, 5);
    const faceMaterial = new THREE.MeshStandardMaterial({
      map: textureFace,
      alphaHash: true,
    });
    const faceMesh = new THREE.Mesh(faceGeometry, faceMaterial);
    faceMesh.position.set(0, 5, 0);
    // faceMesh.rotateY(Math.PI / 2);

    this.group.add(new THREE.Mesh(bodyGeometry, bodyMaterial));
    this.group.add(hatMesh);
    this.scene.add(this.group);
    this.scene.add(faceMesh);
  }
}
