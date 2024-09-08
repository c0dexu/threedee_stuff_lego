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

  initEntityOnGrid() {
    const cellList = this.world.cells.flat(Infinity);
    cellList.forEach((cell) => {
      const cellBbox = cell.bbox;
      const myBbox = new THREE.Box3().setFromObject(this.group);
      if (myBbox.intersectsBox(cellBbox)) {
        this.currentCell = cell;
        this.previousCell = cell;
        this.currentCell.cellMesh.material.color = new THREE.Color(0, 1, 0);
        cell.insert(this);
      }
    });
  }

  checkNeighboringCells() {
    this.previousCell = this.currentCell;
    const [ci, cj, ck] = this.world.getCellIndexByPosition(
      this.currentCell.xcenter,
      this.currentCell.ycenter,
      this.currentCell.zcenter
    );

    const n = this.world.noCells;
    const cells = this.world.cells;

    this.previousPosition = new THREE.Vector3(
      this.group.position.x,
      this.group.position.y,
      this.group.position.z
    );

    this.group.position.set(
      this.group.position.x + 0.1,
      this.group.position.y + 0.1,
      this.group.position.z + 0.1
    );
    this.deltaP = new THREE.Vector3(
      this.group.position.x,
      this.group.position.y,
      this.group.position.z
    ).sub(this.previousPosition);

    this.bbox = new THREE.Box3().setFromObject(this.group);
    // 2, 0

    try {
      const cell =
        cells[n - ci + 1 - Math.sign(this.deltaP.x)][
          n - cj + 1 - Math.sign(this.deltaP.y)
        ][n - ck + 1 - Math.sign(this.deltaP.z)];
      // const cellRight = cells[n - ci][n - cj + 1][n - ck + 1];
      // const cellUp = cells[n - ci + 1][n - cj + 2][n - ck + 1];
      // const cellDown = cells[n - ci + 1][n - cj][n - ck + 1];
      // const cellBack = cells[n - ci + 1][n - cj + 1][n - ck + 2];
      // const cellFront = cells[n - ci + 1][n - cj + 1][n - ck];

      if (this.bbox.intersectsBox(cell.bbox)) {
        this.previousCell.cellMesh.material.color = new THREE.Color(0, 0, 1);

        this.currentCell = cell;
        this.currentCell.cellMesh.material.color = new THREE.Color(0, 1, 0);
      }
    } catch (e) {}
  }

  constructTestCube() {
    const geometry = new THREE.BoxGeometry(4, 4, 4);
    const material = new THREE.MeshBasicMaterial({ color: "#ffffff" });
    const mesh = new THREE.Mesh(geometry, material);
    this.group.add(mesh);
    this.scene.add(this.group);
  }
}
