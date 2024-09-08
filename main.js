import * as THREE from "three";
import { Grid } from "./grid.data_struct";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { TestCube } from "./entity";

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  1,
  1024
);

const controls = new OrbitControls(camera, renderer.domElement);

const scene = new THREE.Scene();

const grid = new Grid(scene, 128, 32);
grid.buildGrid();

controls.target = new THREE.Vector3(
  grid.gridX + grid.cellSize,
  grid.gridY + grid.cellSize,
  grid.gridZ + grid.cellSize
);
camera.position.set(0, 20, 256);
controls.update();

const cube = new TestCube(scene, grid, 64, 32, 32);
cube.constructTestCube();
cube.initEntityOnGrid();

function animate() {
  renderer.render(scene, camera);
  controls.update();
  cube.checkNeighboringCells();
}
renderer.setAnimationLoop(animate);
