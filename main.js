import * as THREE from "three";
import { Grid } from "./grid.data_struct";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Baseplate, Legoman } from "./entity";

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

const grid = new Grid(scene, 256, 256);
grid.buildGrid();

camera.position.set(0, 20, 16);
controls.target = new THREE.Vector3(
  grid.cellSize / 2,
  grid.cellSize / 2,
  grid.cellSize / 2
);

const cube = new Baseplate(scene, grid, 128, -64, 128);
cube.constructBaseplate();
cube.initEntityOnGrid();
controls.update();

const legoman = new Legoman(scene, grid, 64, 25, 0);
legoman.constructLegoman();
cube.anchored = true;
legoman.debuggingEnabled = true;
function animate() {
  renderer.render(scene, camera);
  controls.update();
  cube.checkNeighboringCells();
  legoman.checkNeighboringCells();
  grid.updateCells();
}
renderer.setAnimationLoop(animate);
