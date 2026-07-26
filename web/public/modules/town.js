// public/modules/town.js
// Spawn town — houses, walls, roofs. Pure visual, no game logic.

import * as THREE from 'three';

export function createTown(scene) {
  const meshes = [];

  // Center stone courtyard
  const courtyard = new THREE.Mesh(
    new THREE.PlaneGeometry(8, 8),
    new THREE.MeshStandardMaterial({ color: 0x555544, roughness: 0.8 })
  );
  courtyard.rotation.x = -Math.PI / 2;
  courtyard.position.set(0, 0.01, 0);
  courtyard.receiveShadow = true;
  scene.add(courtyard);
  meshes.push(courtyard);

  // 8 houses in a circle around spawn
  const housePositions = [
    { x: -6, z: -6, angle: 0 },
    { x: 0, z: -7, angle: 0 },
    { x: 6, z: -6, angle: 0 },
    { x: -7, z: 0, angle: Math.PI / 2 },
    { x: 7, z: 0, angle: -Math.PI / 2 },
    { x: -6, z: 6, angle: 0 },
    { x: 0, z: 7, angle: 0 },
    { x: 6, z: 6, angle: 0 },
  ];

  const roofColors = [0x883322, 0x774422, 0x995533, 0x663322, 0x884433, 0x773322, 0x885533, 0x664422];

  for (let i = 0; i < housePositions.length; i++) {
    const hp = housePositions[i];
    const house = buildHouse(roofColors[i]);
    house.position.set(hp.x, 0, hp.z);
    if (hp.angle) house.rotation.y = hp.angle;
    scene.add(house);
    meshes.push(house);
  }

  // Town gate — entrance marker
  const gate = buildGate();
  gate.position.set(0, 0, -5);
  scene.add(gate);
  meshes.push(gate);

  return meshes;
}

function buildHouse(roofColor) {
  const group = new THREE.Group();

  // Walls — tan/beige
  const walls = new THREE.Mesh(
    new THREE.BoxGeometry(2.5, 2, 2.0),
    new THREE.MeshStandardMaterial({ color: 0xeeddcc, roughness: 0.7 })
  );
  walls.position.y = 1.2;
  walls.castShadow = true;
  walls.receiveShadow = true;
  group.add(walls);

  // Roof — triangle/cone
  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(2.2, 1.5, 4),
    new THREE.MeshStandardMaterial({ color: roofColor, roughness: 0.5 })
  );
  roof.position.y = 2.5;
  roof.rotation.y = Math.PI / 4;
  roof.castShadow = true;
  group.add(roof);

  // Door
  const door = new THREE.Mesh(
    new THREE.PlaneGeometry(0.5, 1),
    new THREE.MeshStandardMaterial({ color: 0x553311, side: THREE.DoubleSide })
  );
  door.position.set(0, 0.5, 1.01);
  group.add(door);

  // Window
  const windowMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(0.4, 0.4),
    new THREE.MeshStandardMaterial({ color: 0x88ccff, side: THREE.DoubleSide, emissive: 0xffaa22, emissiveIntensity: 0.3 })
  );
  windowMesh.position.set(0.7, 1.5, 1.01);
  group.add(windowMesh);

  return group;
}

function buildGate() {
  const group = new THREE.Group();

  // Two pillars
  const pillarMat = new THREE.MeshStandardMaterial({ color: 0x999977, roughness: 0.4 });
  const left = new THREE.Mesh(new THREE.BoxGeometry(0.4, 3, 0.4), pillarMat);
  left.position.set(-1.5, 1.5, 0);
  left.castShadow = true;
  group.add(left);

  const right = new THREE.Mesh(new THREE.BoxGeometry(0.4, 3, 0.4), pillarMat);
  right.position.set(1.5, 1.5, 0);
  right.castShadow = true;
  group.add(right);

  // Top beam
  const beam = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.3, 0.4), pillarMat);
  beam.position.set(0, 3.1, 0);
  group.add(beam);

  // Sign
  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 0.5),
    new THREE.MeshStandardMaterial({ color: 0xddccaa, side: THREE.DoubleSide })
  );
  sign.position.set(0, 2.6, 0.3);
  group.add(sign);

  return group;
}
