import * as THREE from "three";

class Entity {
  scene;
  world;
  currentCell; // current cell in which the entity lives
  previousCell;
  geometry;
  material;
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
    this.scene.add(this.group);
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

  update(dt = 0.01) {
    const gridCenter = new THREE.Vector3(world.xgrid, world.ygrid, world.zgrid);
    const relativePosition = this.getRelativePositionFromPoint(gridCenter);
    const cellX = Math.floor(relativePosition.x) % this.world.width;
    const cellY = Math.floor(relativePosition.y) % this.world.width;
    const cellZ = Math.floor(relativePosition.z) % this.world.width;
    this.previousCell = this.currentCell;
    this.currentCell = this.world.cells[cellX][cellY][cellZ];

    if (this.currentCell) {
      this.previousCell.cellMesh.material.color.set("#B01769");
    }

    if (this.previousCell) {
      this.previousCell.cellMesh.material.color.set("#18AD95");
    }
  }
}

class TestCube extends Entity {
  constructor(x0, y0, z0) {
    super(this.scene, this.world, 0, 0, 0);
  }
}
