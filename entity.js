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
  vx;
  vy;
  vz;
  fx;
  fy;
  fz;
  dx = 0;
  dy = 0;
  dz = 0;
  theta;
  group;
  bbox;
  gforce = 0.01;
  deltaP = new THREE.Vector3();
  previousPosition = new THREE.Vector3();
  debuggingEnabled = false;
  collisionCount = 0;
  collisionGroupVertical = [];

  constructor(scene, world, x0, y0, z0, vx = 0, vy = 0, vz = 0) {
    this.vx = vx;
    this.vy = vy;
    this.vz = vz;
    this.group = new THREE.Group();
    this.group.position.set(x0, y0, z0);
    this.bbox = new THREE.Box3().setFromObject(this.group);
    this.scene = scene;
    this.world = world;
  }

  update(entities, dt = 0.1) {
    if (!this.anchored) {
      this.group.position.set(
        this.group.position.x + this.vx * dt,
        this.group.position.y + this.vy * dt,
        this.group.position.z + this.vz * dt
      );
    }

    const collisionBoxVertical = this.bbox.clone();
    entities.forEach((entity) => {
      if (this.id !== entity.id) {
        if (collisionBoxVertical.intersectsBox(entity.bbox)) {
          if (!this.anchored) {
            this.collisionGroupVertical.push(entity);
          }
        }
      }
    });
    if (this.collisionGroupVertical.length > 0) {
      this.collisionGroupVertical.forEach((entity) => {
        const bbox = entity.bbox;
        const mBbox = this.bbox;
        const intersection = mBbox.intersect(bbox);
        const minY = intersection.min.y;
        const maxY = intersection.max.y;
        const dy = maxY - minY;
        this.group.position.setY(this.group.position.y + dy);
      });
      this.vy = 0;
      this.collisionGroupVertical = [];
    } else if (!this.anchored) {
      this.vy += -this.gforce;
    }
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

  checkNeighboringCells() {
    try {
      this.world.cells.forEach((line1) => {
        line1.forEach((line2) => {
          line2.forEach((cell) => {
            const p1 = new THREE.Vector3(
              this.group.position.x,
              this.group.position.y,
              this.group.position.z
            );
            const p2 = new THREE.Vector3(
              cell.xcenter,
              cell.ycenter,
              cell.zcenter
            );
            const dist = p1.sub(p2).length();
            if (dist < this.world.cellSize * 2) {
              const bbox = cell.bbox;
              const [i, j, k] = this.world.getCellIndexByPosition(
                cell.xcenter,
                cell.ycenter,
                cell.zcenter
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

  constructLegoman() {
    const torsoGeometry = new THREE.BoxGeometry(
      this.scale,
      2 * this.scale,
      2 * this.scale
    );
    const torsoMaterial = new THREE.MeshStandardMaterial({ color: "#288ACC" });
    const torsoMesh = new THREE.Mesh(torsoGeometry, torsoMaterial);

    const leftArmGeometry = new THREE.BoxGeometry(
      this.scale,
      2 * this.scale,
      1 * this.scale
    );
    const leftArmMaterial = new THREE.MeshStandardMaterial({
      color: "#E7E87A",
    });
    const leftArmMesh = new THREE.Mesh(leftArmGeometry, leftArmMaterial);
    leftArmMesh.position.set(0, 0, this.scale + 0.5 * this.scale);

    const rightArmGeometry = new THREE.BoxGeometry(
      this.scale,
      2 * this.scale,
      1 * this.scale
    );
    const rightArmMaterial = new THREE.MeshStandardMaterial({
      color: "#E7E87A",
    });
    const rightArmMesh = new THREE.Mesh(rightArmGeometry, rightArmMaterial);
    rightArmMesh.position.set(0, 0, -this.scale - 0.5 * this.scale);

    const rightLegGeometry = new THREE.BoxGeometry(
      this.scale,
      2 * this.scale,
      1 * this.scale
    );
    const rightLegMaterial = new THREE.MeshStandardMaterial({
      color: "#7092BE",
    });
    const rightLegMesh = new THREE.Mesh(rightLegGeometry, rightLegMaterial);
    rightLegMesh.position.set(0, -2 * this.scale, 0.5 * this.scale);

    const leftLegGeometry = new THREE.BoxGeometry(
      this.scale,
      2 * this.scale,
      1 * this.scale
    );
    const leftLegMaterial = new THREE.MeshStandardMaterial({
      color: "#7092BE",
    });
    const leftLegMesh = new THREE.Mesh(leftLegGeometry, leftLegMaterial);
    leftLegMesh.position.set(0, -2 * this.scale, -0.5 * this.scale);

    const headGeometry = new THREE.CylinderGeometry(
      0.65 * this.scale,
      0.65 * this.scale,
      0.65 * this.scale
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
      }
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
      0
    );

    this.group.add(torsoMesh);
    this.group.add(leftArmMesh);
    this.group.add(rightArmMesh);
    this.group.add(rightLegMesh);
    this.group.add(leftLegMesh);
    this.group.add(headMesh);
    this.group.add(faceMesh);
    this.bbox = new THREE.Box3().setFromObject(this.group);
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
      }
    );
    const geo = new THREE.BoxGeometry(1024, 1024, 1024);
    const material = new THREE.MeshBasicMaterial({
      map: this.texture,
    });
    material.side = THREE.BackSide;
    this.mesh = new THREE.Mesh(geo, material);
    console.log(this.mesh);
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
  depth = 8;
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
      }
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
