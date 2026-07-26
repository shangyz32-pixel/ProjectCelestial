// modules/player_model.js
// Cultivator character model — robe, sleeves, hair bun, belt.
// Replaces the simple blue box player.

import * as THREE from 'three';

export function createCultivatorModel() {
  const group = new THREE.Group();

  // Robe — wide flowing body
  const robeBody = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35, 0.45, 1.5, 6),
    new THREE.MeshStandardMaterial({ color: 0x334488, roughness: 0.4 })
  );
  robeBody.position.y = 0.85;
  group.add(robeBody);

  // Robe bottom flare
  const robeBottom = new THREE.Mesh(
    new THREE.CylinderGeometry(0.45, 0.55, 0.4, 6),
    new THREE.MeshStandardMaterial({ color: 0x334488, roughness: 0.4 })
  );
  robeBottom.position.y = 0.2;
  group.add(robeBottom);

  // Belt — gold sash
  const belt = new THREE.Mesh(
    new THREE.TorusGeometry(0.35, 0.06, 4, 6),
    new THREE.MeshStandardMaterial({ color: 0xffaa00, roughness: 0.2, emissive: 0x332200, emissiveIntensity: 0.3 })
  );
  belt.position.y = 0.9;
  belt.rotation.x = Math.PI / 2;
  group.add(belt);

  // Left sleeve
  const lSleeve = new THREE.Mesh(
    new THREE.BoxGeometry(0.25, 0.8, 0.18),
    new THREE.MeshStandardMaterial({ color: 0x4466aa, roughness: 0.4 })
  );
  lSleeve.position.set(-0.45, 1.2, 0);
  group.add(lSleeve);

  // Right sleeve
  const rSleeve = new THREE.Mesh(
    new THREE.BoxGeometry(0.25, 0.8, 0.18),
    new THREE.MeshStandardMaterial({ color: 0x4466aa, roughness: 0.4 })
  );
  rSleeve.position.set(0.45, 1.2, 0);
  group.add(rSleeve);

  // Neck
  const neck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.14, 0.3, 6),
    new THREE.MeshStandardMaterial({ color: 0xffddaa, roughness: 0.6 })
  );
  neck.position.y = 1.8;
  group.add(neck);

  // Head
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.28, 8, 6),
    new THREE.MeshStandardMaterial({ color: 0xffddaa, roughness: 0.6 })
  );
  head.position.y = 2.1;
  group.add(head);

  // Hair bun — top knot
  const bun = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 6, 4),
    new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.3 })
  );
  bun.position.y = 2.38;
  group.add(bun);

  // Hair pin — vertical stick
  const pin = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.03, 0.6, 4),
    new THREE.MeshStandardMaterial({ color: 0xccaa66, roughness: 0.3, emissive: 0x332200, emissiveIntensity: 0.2 })
  );
  pin.position.y = 2.5;
  group.add(pin);

  // Eyes
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
  const lEye = new THREE.Mesh(new THREE.SphereGeometry(0.04, 4, 2), eyeMat);
  lEye.position.set(-0.1, 2.15, 0.25);
  group.add(lEye);
  const rEye = new THREE.Mesh(new THREE.SphereGeometry(0.04, 4, 2), eyeMat);
  rEye.position.set(0.1, 2.15, 0.25);
  group.add(rEye);

  group.castShadow = true;
  return group;
}
