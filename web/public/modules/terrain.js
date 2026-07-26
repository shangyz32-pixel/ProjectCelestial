// public/modules/terrain.js
// Ground, trees, rocks. Pure visual — no game logic.

import * as THREE from 'three';

export function createTerrain(scene) {
  const meshes = [];
  // Ground
  const gnd = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100),
    new THREE.MeshStandardMaterial({ color: 0x224422, roughness: 0.9 })
  );
  gnd.rotation.x = -Math.PI / 2;
  gnd.receiveShadow = true;
  scene.add(gnd);
  meshes.push(gnd);

  // Trees — avoid town center
  for (let i = 0; i < 30; i++) {
    let tx, tz;
    do {
      tx = (Math.random() - 0.5) * 80;
      tz = (Math.random() - 0.5) * 80;
    } while (Math.abs(tx) < 10 && Math.abs(tz) < 10); // skip town area
    const g = new THREE.Group();
    g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 2.5), new THREE.MeshStandardMaterial({ color: 0x553311 })));
    g.add(new THREE.Mesh(new THREE.ConeGeometry(1, 3, 6), new THREE.MeshStandardMaterial({ color: 0x229933 })));
    g.children[0].position.y = 1.2;
    g.children[1].position.y = 3;
    g.position.set(tx, 0, tz);
    g.castShadow = true;
    scene.add(g);
    meshes.push(g);
  }
  return meshes;
}
