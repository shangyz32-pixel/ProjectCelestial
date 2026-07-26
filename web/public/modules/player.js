// public/modules/player.js
// Player mesh, WASD movement, camera follow.

import * as THREE from 'three';

export function createPlayer(scene) {
  const player = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.5, 0.6), new THREE.MeshStandardMaterial({ color: 0x4488ff }));
  body.position.y = 0.8;
  player.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 6, 4), new THREE.MeshStandardMaterial({ color: 0x4488ff }));
  head.position.y = 1.8;
  player.add(head);
  const sword = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.2, 0.1), new THREE.MeshStandardMaterial({ color: 0xcccccc }));
  sword.position.set(0.5, 0.9, 0);
  sword.name = 'sword';
  player.add(sword);
  player.position.set(0, 0.5, 0);
  player.castShadow = true;
  scene.add(player);

  const position = { x: 0, z: 0 };

  return { mesh: player, position, sword };
}

export function handleInput(keys, pos) {
  if (keys['w'] || keys['ArrowUp']) pos.z -= 0.15;
  if (keys['s'] || keys['ArrowDown']) pos.z += 0.15;
  if (keys['a'] || keys['ArrowLeft']) pos.x -= 0.15;
  if (keys['d'] || keys['ArrowRight']) pos.x += 0.15;
  pos.x = Math.max(-45, Math.min(45, pos.x));
  pos.z = Math.max(-45, Math.min(45, pos.z));
}

export function followCamera(camera, pos) {
  camera.position.x += (pos.x - camera.position.x) * 0.05;
  camera.position.z += (pos.z + 20 - camera.position.z) * 0.05;
  camera.lookAt(pos.x, 0, pos.z);
}
