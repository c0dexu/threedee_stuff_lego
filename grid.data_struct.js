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
      opacity: 0.45,
    });

    this.cellMesh = new THREE.Mesh(cellGeometry, cellMaterial);
    this.cellMesh.position.set(this.xcenter, this.ycenter, this.zcenter);
    this.scene.add(this.cellMesh);
  }

  insert(entity) {
    this.entities.push(entity);
  }
  remove(entity) {
    this.entities.pop(entity);
  }
  search(entity) {
    return this.entities.find((m) => m === entity);
  }
  update(dt = 0.1) {
    this.entities.forEach((entity) => {
      entity.update(dt);
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

  addCell(i, j, k) {
    const gridVectorPosition = new THREE.Vector3(
      this.gridX,
      this.gridY,
      this.gridZ
    );

    const cellRelativePosition = new THREE.Vector3(
      -this.cellSize * i + (this.width - this.cellSize) / 2,
      -this.cellSize * j + (this.width - this.cellSize) / 2,
      -this.cellSize * k + (this.width - this.cellSize) / 2
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
          const cell = this.addCell(i - 1, j - 1, k - 1);
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

          const cellMesh = new THREE.Mesh(cellGeometry, cellMaterial);
          cellMesh.position.set(cell.xcenter, cell.ycenter, cell.zcenter);
          this.scene.add(cellMesh);
        });
      });
    });
  }
}
