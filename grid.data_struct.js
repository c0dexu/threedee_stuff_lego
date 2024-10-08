import * as THREE from "three";

export class Cell {
  entities;
  xcenter = 0;
  ycenter = 0;
  zcenter = 0;
  length = 0;
  bbox;
  scene;
  cellMesh;
  indices = [];

  constructor(scene, xcenter, ycenter, zcenter, length) {
    this.scene = scene;
    this.entities = [];

    this.xcenter = xcenter;
    this.ycenter = ycenter;
    this.zcenter = zcenter;
    this.length = length;
    const minVector = new THREE.Vector3(
      this.xcenter - this.length / 2,
      this.ycenter - this.length / 2,
      this.zcenter - this.length / 2
    );
    const maxVector = new THREE.Vector3(
      this.xcenter + this.length / 2,
      this.ycenter + this.length / 2,
      this.zcenter + this.length / 2
    );
    this.bbox = new THREE.Box3(minVector, maxVector);

    const cellGeometry = new THREE.BoxGeometry(
      this.length - 4,
      this.length - 4,
      this.length - 4
    );

    const cellMaterial = new THREE.MeshBasicMaterial({
      color: "#18AD95",
      transparent: true,
      opacity: 0.25,
    });

    this.cellMesh = new THREE.Mesh(cellGeometry, cellMaterial);
    this.cellMesh.position.set(this.xcenter, this.ycenter, this.zcenter);
    this.scene.add(this.cellMesh);
  }

  insert(entity) {
    const foundEntity = this.search(entity.id);
    if (!foundEntity) {
      this.entities.push(entity);
    }
  }
  remove(entityId) {
    const idx = this.entities.findIndex((e) => e.id === entityId);
    this.entities = this.entities.splice(idx, idx);
  }
  search(entityId) {
    return this.entities.find((m) => m.id === entityId);
  }
  update(dt = 0.1) {
    this.entities.forEach((entity) => {
      entity.update(this.entities);
    });
  }
}

export class Grid {
  width = 0;
  noCells = 0;
  cells = [];
  startCell;
  endCell;
  cellSize;
  scene;
  gridX = 0;
  gridY = 0;
  gridZ = 0;
  gridMesh;

  constructor(scene, width, cellSize) {
    this.cellSize = cellSize;
    this.scene = scene;
    this.noCells = Math.floor(width / cellSize);
    this.width = width + cellSize;
  }

  getCellIndexByPosition(x, y, z) {
    const gridVectorPosition = new THREE.Vector3(
      this.gridX,
      this.gridY,
      this.gridZ
    );

    const n = this.noCells;

    const x0 = gridVectorPosition.x;
    const y0 = gridVectorPosition.y;
    const z0 = gridVectorPosition.z;

    const i = (x - x0) / this.cellSize;
    const j = (y - y0) / this.cellSize;
    const k = (z - z0) / this.cellSize;

    return [i, j, k].map((x) => Math.floor(x));
  }

  addCell(i, j, k) {
    const gridVectorPosition = new THREE.Vector3(
      this.gridX,
      this.gridY,
      this.gridZ
    );

    const cellRelativePosition = new THREE.Vector3(
      this.cellSize * i,
      this.cellSize * j,
      this.cellSize * k
    );

    let cellPosition = gridVectorPosition.add(cellRelativePosition);
    const cell = new Cell(
      this.scene,
      cellPosition.x,
      cellPosition.y,
      cellPosition.z,
      this.cellSize
    );

    cell.length = this.cellSize;
    cell.scene = this.scene;
    return cell;
  }

  buildGrid() {
    const n = this.noCells;
    const temp = [];
    for (let i = 0; i <= n; i++) {
      const line1 = [];
      for (let j = 0; j <= n; j++) {
        const line2 = [];
        for (let k = 0; k <= n; k++) {
          const cell = this.addCell(i, j, k);
          line2.push(cell);
        }
        line1.push(line2);
      }
      temp.push(line1);
    }
    this.cells = [...temp];
  }

  initRenderGrid() {
    this.cells.forEach((array1) => {
      array1.forEach((array2) => {
        array2.forEach((cell) => {
          const cellGeometry = new THREE.BoxGeometry(
            this.cellSize,
            this.cellSize,
            this.cellSize
          );

          const cellMaterial = new THREE.MeshBasicMaterial({
            color: "#18AD95",
            transparent: true,
            opacity: 0.25,
          });
        });
      });
    });
  }

  updateCells() {
    this.cells.flat(Infinity).forEach((cell) => {
      cell.update(0.01);
    });
  }
}
