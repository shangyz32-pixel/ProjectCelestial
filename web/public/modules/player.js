// public/modules/player.js
// Player mesh, WASD movement, camera orbit, orientation.

import * as THREE from 'three';
import { createOrientationController, MODE } from './orientation.js';

const ORIENT = createOrientationController();

export function createPlayer(scene) {
  const player = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.5, 0.6), new THREE.MeshStandardMaterial({ color: 0x4488ff }));
  body.position.y = 0.8;
  player.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 6, 4), new THREE.MeshStandardMaterial({ color: 0x4488ff }));
  head.position.y = 1.8;
  player.add(head);

  // Sword group — allows independent rotation for swing animation
  const swordGroup = new THREE.Group();
  const blade = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.4, 0.06), new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.2 }));
  blade.position.y = 0.7;
  swordGroup.add(blade);
  const guard = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 0.15), new THREE.MeshStandardMaterial({ color: 0xffaa00, roughness: 0.3 }));
  guard.position.y = 0.1;
  swordGroup.add(guard);
  const hilt = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.4, 6), new THREE.MeshStandardMaterial({ color: 0x553311, roughness: 0.5 }));
  hilt.position.y = -0.1;
  swordGroup.add(hilt);
  swordGroup.position.set(0.5, 0.9, 0);
  swordGroup.name = 'sword';
  player.add(swordGroup);

  player.position.set(0, 0.5, 0);
  player.castShadow = true;
  scene.add(player);

  const position = { x: 0, z: 0 };
  const entityId = 'player';
  ORIENT.register(entityId, player);

  return { mesh: player, position, swordGroup, entityId };
}

// Sword swing animation — rotates sword group forward
let swingTimer = 0;
export function swingSword(playerObj) {
  if (swingTimer > 0) return; // still swinging
  swingTimer = 0.4;
}
export function updateSword(delta) {
  if (swingTimer > 0) {
    swingTimer -= delta;
    const progress = 1 - (swingTimer / 0.4); // 0→1
    const angle = Math.sin(progress * Math.PI) * 2.5; // swing arc
    // Find sword group on any player object
    // (accessed via the closure — we set it globally)
  }
}

// Apply sword rotation if timer active
export function applySwordAnim(playerObj, delta) {
  if (!playerObj.swordGroup) return;
  if (swingTimer > 0) {
    swingTimer -= delta;
    const angle = -Math.sin((1 - swingTimer / 0.4) * Math.PI) * 2.2;
    playerObj.swordGroup.rotation.x = angle;
  } else {
    playerObj.swordGroup.rotation.x += (0 - playerObj.swordGroup.rotation.x) * 0.2;
  }
}

export function handleInput(keys, pos) {
  let moved = false;
  if (keys['w'] || keys['ArrowUp']) { pos.z -= 0.15; moved = true; }
  if (keys['s'] || keys['ArrowDown']) { pos.z += 0.15; moved = true; }
  if (keys['a'] || keys['ArrowLeft']) { pos.x -= 0.15; moved = true; }
  if (keys['d'] || keys['ArrowRight']) { pos.x += 0.15; moved = true; }
  pos.x = Math.max(-45, Math.min(45, pos.x));
  pos.z = Math.max(-45, Math.min(45, pos.z));
  return moved;
}

export function followCamera(camera, pos, orbit) {
  const { angle, distance, height } = orbit;
  const tx = pos.x + Math.cos(angle) * distance;
  const tz = pos.z + Math.sin(angle) * distance;
  camera.position.x += (tx - camera.position.x) * 0.08;
  camera.position.y += (height - camera.position.y) * 0.08;
  camera.position.z += (tz - camera.position.z) * 0.08;
  camera.lookAt(pos.x, 1, pos.z);
}

export function createOrbit() {
  const orbit = { angle: -0.8, distance: 22, height: 18 };
  let dragging = false, lastX = 0;
  window.addEventListener('mousedown', e => {
    if (e.button === 2) { dragging = true; lastX = e.clientX; e.preventDefault(); }
  });
  window.addEventListener('mouseup', () => { dragging = false; });
  window.addEventListener('mousemove', e => {
    if (dragging) { orbit.angle += (e.clientX - lastX) * 0.005; lastX = e.clientX; }
  });
  window.addEventListener('wheel', e => {
    orbit.distance = Math.max(8, Math.min(50, orbit.distance + e.deltaY * 0.03));
    orbit.height = Math.max(8, Math.min(40, orbit.height + e.deltaY * 0.02));
  });
  window.addEventListener('contextmenu', e => e.preventDefault());
  return orbit;
}

// Update orientation based on movement + camera
export function updateOrientation(entityId, moved, orbit, dx, dz) {
  if (moved) {
    ORIENT.request(entityId, MODE.WALKING, { direction: { x: dx || 0, z: dz || 0 } });
  } else {
    ORIENT.request(entityId, MODE.IDLE, { cameraAngle: orbit.angle });
  }
}

// Run orientation update each frame
export function stepOrientation(delta) {
  ORIENT.update(delta);
}

export { ORIENT, MODE };
