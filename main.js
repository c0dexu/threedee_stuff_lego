import * as THREE from "three";
import { Grid } from "./grid.data_struct";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

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

const grid = new Grid(scene, 64, 32);
grid.buildGrid();
grid.initRenderGrid();

controls.target = grid.gridMesh.position;
camera.position.set(0, 20, 256);
controls.update();

function animate() {
  renderer.render(scene, camera);
  controls.update();
}
renderer.setAnimationLoop(animate);
