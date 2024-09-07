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

  initEntityOnGrid() {
    const cellList = this.world.cells.flat(Infinity);
    cellList.forEach((cell) => {
      const cellBbox = cell.bbox;
      const myBbox = new THREE.Box3().setFromObject(this.group);
      if (myBbox.intersectsBox(cellBbox)) {
        this.currentCell = cell;
        this.previousCell = cell;
        // this.currentCell.cellMesh.material.color = new THREE.Color(1, 0, 0);
        cell.insert(this);
      }
    });
  }

  checkNeighboringCells() {
    const n = this.world.noCells;
    const cells = this.world.cells;
    const ci = this.currentCell.indices[0] + 1;
    const cj = this.currentCell.indices[1] + 1;
    const ck = this.currentCell.indices[2] + 1;
    console.log(ci, cj, ck);
    this.previousCell = this.currentCell;

    if (this.previousCell) {
      this.previousCell.cellMesh.material.color = new THREE.Color(
        24 / 255,
        173 / 255,
        149 / 255
      );
    }

    if (ck - 1 >= 0 && ck - 1 < n) {
      const cell = cells[ci][cj][ck - 1];
      if (this.bbox.intersectsBox(cell.bbox)) {
        this.currentCell = cell;
      }
      // cells[ci][cj][ck - 1].cellMesh.material.color = new THREE.Color(1, 0, 0);
    }

    if (ck + 1 < n) {
      const cell = cells[ci][cj][ck + 1];
      if (this.bbox.intersectsBox(cell.bbox)) {
        this.currentCell = cell;
      }
      // cells[ci][cj][ck + 1].cellMesh.material.color = new THREE.Color(1, 0, 0);
    }

    if (ci - 1 >= 0 && ci - 1 < n) {
      const cell = cells[ci - 1][cj][ck];
      if (this.bbox.intersectsBox(cell.bbox)) {
        this.currentCell = cell;
      }
      // cells[ci - 1][cj][ck].cellMesh.material.color = new THREE.Color(1, 0, 0);
    }

    if (ci + 1 < n) {
      const cell = cells[ci + 1][cj][ck];
      if (this.bbox.intersectsBox(cell.bbox)) {
        this.currentCell = cell;
      }
      // cells[ci + 1][cj][ck].cellMesh.material.color = new THREE.Color(1, 0, 0);
    }

    if (cj + 1 < n) {
      const cell = cells[ci][cj + 1][ck];
      if (this.bbox.intersectsBox(cell.bbox)) {
        this.currentCell = cell;
      }
      // cells[ci][cj + 1][ck].cellMesh.material.color = new THREE.Color(1, 0, 0);
    }

    if (cj - 1 >= 0 && cj - 1 < n) {
      const cell = cells[ci][cj - 1][ck];
      if (this.bbox.intersectsBox(cell.bbox)) {
        this.currentCell = cell;
      }
      // cells[ci][cj - 1][ck].cellMesh.material.color = new THREE.Color(1, 0, 0);
    }

    this.currentCell.cellMesh.material.color = new THREE.Color(1, 0, 0);
    this.group.position.set(
      0,
      this.group.position.y + 0.1,
      this.group.position.z + 0.1
    );
    this.bbox = new THREE.Box3().setFromObject(this.group);
  }

  constructTestCube() {
    const geometry = new THREE.BoxGeometry(4, 4, 4);
    const material = new THREE.MeshBasicMaterial({ color: "#ffffff" });
    const mesh = new THREE.Mesh(geometry, material);
    this.group.add(mesh);
    this.scene.add(this.group);
  }
}
