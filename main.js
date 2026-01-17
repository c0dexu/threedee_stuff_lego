import * as THREE from "three";
import { Grid } from "./grid.data_struct";
import { Baseplate, BobOmb, Legoman, SkyBox, Test } from "./entity";

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  1,
  1024,
);

const scene = new THREE.Scene();

const grid = new Grid(scene, 256, 256);
grid.buildGrid();

camera.position.set(0, 20, 16);

const cube = new Baseplate(scene, grid, 128, -128, 128);
cube.constructBaseplate();
cube.initEntityOnGrid();

const legoman = new Legoman(scene, grid, 64, 256 + 64, 0);
legoman.constructLegoman();
cube.anchored = true;
legoman.debuggingEnabled = true;

const test1 = new Test(scene, grid, 64, 256 - 64 + 32, 0);
test1.constructTest();

const test2 = new Test(scene, grid, 64 + 16, 256 - 64 + 64.25, 0);
test2.constructTest();

const test3 = new Test(scene, grid, 64 + 32, 256 - 64 + 32.15, 0);
test3.constructTest();

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
let cameraOffset = 50;

const keyLogger = (event) => {
  keyState[event.key] = event.type === "keydown";
};

document.addEventListener("keydown", (event) => {
  keyLogger(event);
});
document.addEventListener("keyup", (event) => {
  keyLogger(event);
});

const bobomb = new BobOmb(scene, camera, grid, 256, 256, 0);
bobomb.constructBobOmb();

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

  if (keyState["x"] && controllerTarget.onPlatform) {
    controllerTarget.vy = 1.5;
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

  if (keyState["q"]) {
    cameraOffset -= 1 / 2;
  }

  if (keyState["e"]) {
    cameraOffset += 1 / 2;
  }

  if (keyState["r"]) {
    controllerTarget.respawn();
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
          controllerTarget.vy * controllerTarget.vy,
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
    0,
  );
  cooldown = Math.abs(steer) > 0.1;
  const xx = -Math.sin(rot + directionAngle) * canMove;
  const zz = Math.cos(rot + directionAngle) * canMove;
  controllerTarget.px = xx * controllerTarget.spd;
  controllerTarget.pz = zz * controllerTarget.spd;
  controllerTarget.vx = controllerTarget.px + controllerTarget.rpx;
  controllerTarget.vz = controllerTarget.pz + controllerTarget.rpz;

  renderer.render(scene, camera);
  bobomb.checkNeighboringCells();

  cube.checkNeighboringCells();
  legoman.checkNeighboringCells();
  test1.checkNeighboringCells();
  test2.checkNeighboringCells();
  test3.checkNeighboringCells();
  grid.updateCells();
  camera.lookAt(controllerTarget.group.position);
  camera.position.set(
    controllerTarget.group.position.x + cameraOffset * Math.cos(rot),
    controllerTarget.group.position.y + cameraOffset / 2,
    controllerTarget.group.position.z + cameraOffset * Math.sin(rot),
  );
  if (!cooldown) {
    rotTarget += (sign * Math.PI) / 4;
  }
  skybox.mesh.position.set(
    camera.position.x,
    camera.position.y,
    camera.position.z,
  );
}
renderer.setAnimationLoop(animate);
