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
  dx = 0;
  dy = 0;
  dz = 0;
  theta;
  group;
  bbox;
  gforce = 0.01;
  deltaP = new THREE.Vector3();
  previousPosition = new THREE.Vector3();

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

  initEntityOnGrid() {
    const cellList = this.world.cells.flat(Infinity);
    const myBbox = new THREE.Box3().setFromObject(this.group);
    cellList.forEach((cell) => {
      const cellBbox = cell.bbox;
      if (myBbox.intersectsBox(cellBbox)) {
        this.currentCell = cell;
        this.previousCell = cell;
        cell.insert(this);
      }
    });
  }

  checkNeighboringCells() {
    try {
      const n = this.world.noCells;
      const cells = this.world.cells;

      const [ci, cj, ck] = this.world.getCellIndexByPosition(
        this.currentCell.xcenter,
        this.currentCell.ycenter,
        this.currentCell.zcenter
      );
      const mCell = cells[ci][cj][ck];
      const cellList = cells.flat(Infinity);
      const neighboringCells = cellList.filter((cell) => {
        const p1 = new THREE.Vector3(
          mCell.xcenter,
          mCell.ycenter,
          mCell.zcenter
        );
        const p2 = new THREE.Vector3(cell.xcenter, cell.ycenter, cell.zcenter);
        const dist = p1.sub(p2).length();
        return dist < this.world.cellSize * 2 && dist > 0;
      });

      neighboringCells.forEach((cell) => {
        const bbox = cell.bbox;
        if (this.bbox.intersectsBox(bbox)) {
          this.currentCell = cell;
          this.currentCell.cellMesh.material.color = new THREE.Color(0, 1, 0);
        }
      });

      this.group.position.set(
        this.group.position.x - 0.1,
        this.group.position.y + 0.4,
        this.group.position.z
      );

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

export class TestCube extends Entity {
  previousPosition = new THREE.Vector3();
  deltaPosition = new THREE.Vector3(0, 0, 0);
  constructor(scene, world, x0 = 0, y0 = 0, z0 = 0) {
    super(scene, world, x0, y0, z0);
    this.previousPosition = new THREE.Vector3(x0, y0, z0);
  }

  constructTestCube() {
    const geometry = new THREE.BoxGeometry(4, 4, 4);
    const material = new THREE.MeshBasicMaterial({ color: "#ffffff" });
    const mesh = new THREE.Mesh(geometry, material);
    this.group.add(mesh);
    this.scene.add(this.group);
  }
}
