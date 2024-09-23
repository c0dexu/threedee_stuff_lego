import * as THREE from "three";
import { Grid } from "./grid.data_struct";
import { Baseplate, Legoman, SkyBox, Test } from "./entity";

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  1,
  1024
);

const scene = new THREE.Scene();

const grid = new Grid(scene, 256, 256);
grid.buildGrid();

camera.position.set(0, 20, 16);

const cube = new Baseplate(scene, grid, 128, -64, 128);
cube.constructBaseplate();
cube.initEntityOnGrid();

const legoman = new Legoman(scene, grid, 64, 256, 0);
legoman.constructLegoman();
cube.anchored = true;
legoman.debuggingEnabled = true;

const test = new Test(scene, grid, 64, 256 - 64 + 1, 0);
test.constructTest();
test.anchored = true;

const light = new THREE.HemisphereLight(0xcef0ff, 0xcfc6ff, 2);
scene.add(light);

const skybox = new SkyBox(scene);
skybox.initSkyBox();
let rot = 0;
let rotTarget = 0;
let sign = 0;
let cooldown = false;
let controllerTarget = legoman;
let directionAngle = Math.PI / 2;
let keyState = [];
let canMove = 0;

const keyLogger = (event) => {
  keyState[event.key] = event.type === "keydown";
};

document.addEventListener("keydown", (event) => {
  keyLogger(event);
});
document.addEventListener("keyup", (event) => {
  keyLogger(event);
});

function animate() {
  if (keyState["a"]) {
    sign = -1;
  }

  if (keyState["d"]) {
    sign = 1;
  }

  if (!keyState["a"] && !keyState["d"]) {
    sign = 0;
  }

  if (keyState[" "]) {
    controllerTarget.vy = 1;
  }

  if (keyState["ArrowUp"]) {
    directionAngle = Math.PI / 2;
    canMove = 1;
  }

  if (keyState["ArrowDown"]) {
    directionAngle = -Math.PI / 2;
    canMove = 1;
  }

  if (keyState["ArrowLeft"]) {
    directionAngle = Math.PI * 2;
    canMove = 1;
  }

  if (keyState["ArrowRight"]) {
    directionAngle = Math.PI;
    canMove = 1;
  }

  if (
    !keyState["ArrowUp"] &&
    !keyState["ArrowDown"] &&
    !keyState["ArrowLeft"] &&
    !keyState["ArrowRight"]
  ) {
    canMove = 0;
    controllerTarget.vx *= 0.75;
    controllerTarget.vz *= 0.75;
    if (
      Math.sqrt(
        controllerTarget.vx * controllerTarget.vx +
          controllerTarget.vy * controllerTarget.vy
      ) < 0.01
    ) {
      controllerTarget.vx = 0;
      controllerTarget.vz = 0;
    }
  }

  const steer = rotTarget - rot;
  rot += steer * 0.025;

  const steerTarget =
    directionAngle - controllerTarget.group.rotation.y - rot + Math.PI / 2;

  controllerTarget.group.rotation.set(
    0,
    controllerTarget.group.rotation.y + steerTarget * 0.03 * canMove,
    0
  );
  cooldown = Math.abs(steer) > 0.1;
  if (
    Math.sqrt(
      controllerTarget.vx * controllerTarget.vx +
        controllerTarget.vz * controllerTarget.vz
    ) < 2
  ) {
    controllerTarget.vx += -Math.sin(rot + directionAngle) * canMove * 0.1;
    controllerTarget.vz += Math.cos(rot + directionAngle) * canMove * 0.1;
  } else {
    controllerTarget.vx = -Math.sin(rot + directionAngle) * canMove * 2;
    controllerTarget.vz = Math.cos(rot + directionAngle) * canMove * 2;
  }
  renderer.render(scene, camera);
  cube.checkNeighboringCells();
  legoman.checkNeighboringCells();
  test.checkNeighboringCells();
  grid.updateCells();
  camera.lookAt(legoman.group.position);
  camera.position.set(
    legoman.group.position.x + 50 * Math.cos(rot),
    legoman.group.position.y + 32,
    legoman.group.position.z + 50 * Math.sin(rot)
  );
  if (!cooldown) {
    rotTarget += (sign * Math.PI) / 4;
  }
  skybox.mesh.position.set(
    camera.position.x,
    camera.position.y,
    camera.position.z
  );
}
renderer.setAnimationLoop(animate);
