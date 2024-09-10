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

const grid = new Grid(scene, 256, 256);
grid.buildGrid();

camera.position.set(0, 20, 456);

const cube = new TestCube(scene, grid, 128, 0, 128);
cube.constructTestCube();
cube.initEntityOnGrid();
controls.target = cube.group.position;
controls.update();

function animate() {
  renderer.render(scene, camera);
  controls.update();
  cube.checkNeighboringCells();
}
renderer.setAnimationLoop(animate);
