import * as THREE from "three";

class Entity {
  scene;
  world;
  currentCell; // current cell in which the entity lives
  previousCell;
  mesh;
  vx;
  vy;
  vz;
  fx;
  fy;
  fz;
  theta;
  group;
  bbox;
  gforce = 0.01;

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

  addEntityToScene() {}

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

export class TestCube extends Entity {
  constructor(scene, world, x0 = 0, y0 = 0, z0 = 0) {
    super(scene, world, x0, y0, z0);
  }

  checkCurrentCell() {
    const n = this.world.noCells;
    console.log(n);

    const gridPosition = new THREE.Vector3(
      this.world.gridx,
      this.world.gridy,
      this.world.gridz
    );
    const relativePosition = this.getRelativePositionFromPoint(gridPosition);
    const x = relativePosition.x;
    const y = relativePosition.y;
    const z = relativePosition.z;

    const i = Math.floor(x / this.world.cellSize) % (n + 1);
    const j = Math.floor(y / this.world.cellSize) % (n + 1);
    const k = Math.floor(z / this.world.cellSize) % (n + 1);
    console.log(i, j, k);

    const cell = this.world.cells[n - i][n - j][n - k];
    this.previousCell = this.currentCell;
    if (this.previousCell) {
      this.previousCell.cellMesh.material.color = new THREE.Color(
        24 / 255,
        173 / 255,
        149 / 255
      );
    }
    this.currentCell = cell;
    cell.cellMesh.material.color = new THREE.Color(1, 0, 0);

    this.group.position.set(this.group.position.x + 0.1, 0, 0);
  }

  constructTestCube() {
    const geometry = new THREE.BoxGeometry(4, 4, 4);
    const material = new THREE.MeshBasicMaterial({ color: "#ffffff" });
    const mesh = new THREE.Mesh(geometry, material);
    this.group.add(mesh);
    this.scene.add(this.group);
  }
}
