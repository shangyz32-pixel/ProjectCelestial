// public/modules/player.js
// Player mesh, WASD movement, mouse-facing direction, camera follow.

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
  const mouseWorld = new THREE.Vector3();
  const raycaster = new THREE.Raycaster();
  const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

  return { mesh: player, position, sword, raycaster, groundPlane, mouseWorld };
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

// Face the player toward the mouse position on the ground plane
export function faceMouse(playerObj, camera) {
  const { raycaster, groundPlane, mouseWorld, mesh } = playerObj;
  if (!playerObj._mouse || !camera) return;

  raycaster.setFromCamera(playerObj._mouse, camera);
  raycaster.ray.intersectPlane(groundPlane, mouseWorld);

  if (mouseWorld) {
    const angle = Math.atan2(
      mouseWorld.x - mesh.position.x,
      mouseWorld.z - mesh.position.z
    );
    mesh.rotation.y = angle;
  }
}

// Track mouse position (normalized -1..1)
export function trackMouse(playerObj, event) {
  playerObj._mouse = new THREE.Vector2(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1
  );
}
