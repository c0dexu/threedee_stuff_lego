import * as THREE from "three";
import { generateUUID } from "three/src/math/MathUtils.js";

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
  collisionGroup = [];

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
    this.collisionGroup = [];
    if (!this.anchored) {
      this.vy += -this.gforce;
    }
    this.group.position.set(
      this.group.position.x,
      this.group.position.y + this.vy * dt,
      this.group.position.z
    );
    const collisionBox = this.bbox.clone();

    entities.forEach((entity) => {
      if (this.id !== entity.id) {
        if (collisionBox.intersectsBox(entity.bbox)) {
          console.log(`${this.name} intersects ${entity.name}`);
        }
      }
    });
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
      this.previousCells = [...this.currentCells];
      this.currentCells = [];

      this.previousCells.forEach((cell) => {
        if (this.debuggingEnabled) {
          cell.cellMesh.material.color = new THREE.Color(0, 0, 1);
        }
        cell.remove(this.id);
      });
      const cells = this.world.cells;

      const cellList = cells.flat(Infinity);
      const neighboringCells = cellList.filter((cell) => {
        const p1 = new THREE.Vector3(
          this.group.position.x,
          this.group.position.y,
          this.group.position.z
        );
        const p2 = new THREE.Vector3(cell.xcenter, cell.ycenter, cell.zcenter);
        const dist = p1.sub(p2).length();
        return dist < this.world.cellSize * 2;
      });

      neighboringCells.forEach((cell) => {
        const bbox = cell.bbox;
        const [i, j, k] = this.world.getCellIndexByPosition(
          cell.xcenter,
          cell.ycenter,
          cell.zcenter
        );

        if (this.bbox.intersectsBox(bbox)) {
          this.currentCells.push(cells[i][j][k]);
        }
      });

      this.currentCells.forEach((cell) => {
        if (this.debuggingEnabled) {
          cell.cellMesh.material.color = new THREE.Color(0, 1, 0);
        }
        cell.insert(this);
      });

      this.bbox = new THREE.Box3().setFromObject(this.group);
    } catch (e) {
      console.log(e);
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
    const torsoMaterial = new THREE.MeshBasicMaterial({ color: "#288ACC" });
    const torsoMesh = new THREE.Mesh(torsoGeometry, torsoMaterial);

    const leftArmGeometry = new THREE.BoxGeometry(
      this.scale,
      2 * this.scale,
      1 * this.scale
    );
    const leftArmMaterial = new THREE.MeshBasicMaterial({ color: "#E7E87A" });
    const leftArmMesh = new THREE.Mesh(leftArmGeometry, leftArmMaterial);
    leftArmMesh.position.set(0, 0, this.scale + 0.5 * this.scale);

    const rightArmGeometry = new THREE.BoxGeometry(
      this.scale,
      2 * this.scale,
      1 * this.scale
    );
    const rightArmMaterial = new THREE.MeshBasicMaterial({ color: "#E7E87A" });
    const rightArmMesh = new THREE.Mesh(rightArmGeometry, rightArmMaterial);
    rightArmMesh.position.set(0, 0, -this.scale - 0.5 * this.scale);

    const rightLegGeometry = new THREE.BoxGeometry(
      this.scale,
      2 * this.scale,
      1 * this.scale
    );
    const rightLegMaterial = new THREE.MeshBasicMaterial({ color: "#7092BE" });
    const rightLegMesh = new THREE.Mesh(rightLegGeometry, rightLegMaterial);
    rightLegMesh.position.set(0, -2 * this.scale, 0.5 * this.scale);

    const leftLegGeometry = new THREE.BoxGeometry(
      this.scale,
      2 * this.scale,
      1 * this.scale
    );
    const leftLegMaterial = new THREE.MeshBasicMaterial({ color: "#7092BE" });
    const leftLegMesh = new THREE.Mesh(leftLegGeometry, leftLegMaterial);
    leftLegMesh.position.set(0, -2 * this.scale, -0.5 * this.scale);

    const headGeometry = new THREE.CylinderGeometry(
      0.65 * this.scale,
      0.65 * this.scale,
      0.65 * this.scale
    );
    const headMaterial = new THREE.MeshBasicMaterial({ color: "#E7E87A" });
    const headMesh = new THREE.Mesh(headGeometry, headMaterial);
    headMesh.position.set(0, this.scale + 0.75 * this.scale, 0);

    const textureFace = new THREE.TextureLoader().load(
      "./textures/legoman/face.png",
      () => {},
      () => {},
      (err) => {
        console.log(err);
      }
    );

    const faceGeometry = new THREE.PlaneGeometry(this.scale, this.scale);
    const faceMaterial = new THREE.MeshBasicMaterial({
      map: textureFace,
      alphaHash: true,
    });
    const faceMesh = new THREE.Mesh(faceGeometry, faceMaterial);
    faceMesh.rotateY(Math.PI / 2);
    faceMesh.position.set(this.scale * 0.65, this.scale + 0.75 * this.scale, 0);

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
    this.texture.repeat = new THREE.Vector2(this.width / 16, this.height / 16);
    const geometry = new THREE.BoxGeometry(this.width, this.depth, this.height);
    const material = new THREE.MeshBasicMaterial({
      color: "#165C1A",
      map: this.texture,
    });
    const mesh = new THREE.Mesh(geometry, material);
    this.group.add(mesh);
    this.scene.add(this.group);
  }
}
