// modules/chinese_town.js
// Chinese fantasy town — pagodas, bamboo, stone lanterns, red gates.
// Stylized low-poly art direction. No generic Western buildings.

import * as THREE from 'three';
import { addObstacle } from './collision.js';

export function createChineseTown(scene) {
  const meshes = [];

  // Courtyard — grey stone tiles
  const yard = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.MeshStandardMaterial({ color: 0x5a5a50, roughness: 0.7 }));
  yard.rotation.x = -Math.PI / 2; yard.position.y = 0.01; yard.receiveShadow = true;
  scene.add(yard); meshes.push(yard);

  // Central pavilion — 八角亭
  meshes.push(...buildPavilion(0, 0, scene));

  // Four houses — 厢房
  const positions = [
    { x: -5, z: 0, ry: Math.PI / 2 },
    { x: 5, z: 0, ry: -Math.PI / 2 },
    { x: 0, z: -5, ry: 0 },
    { x: 0, z: 5, ry: Math.PI },
  ];
  for (const p of positions) meshes.push(...buildSideHouse(p.x, p.z, p.ry, scene));

  // Stone lanterns — 石灯籠
  const lanternSpots = [
    [-3.5, 3.5], [3.5, 3.5], [-3.5, -3.5], [3.5, -3.5],
    [-7, 0], [7, 0], [0, 7], [0, -7],
  ];
  for (const [lx, lz] of lanternSpots) meshes.push(buildLantern(lx, lz, scene));

  // Bamboo grove ring
  for (let i = 0; i < 20; i++) {
    const angle = (i / 20) * Math.PI * 2;
    const r = 9 + Math.random() * 5;
    meshes.push(...buildBambooClump(Math.cos(angle) * r, Math.sin(angle) * r, scene));
  }

  // Gate — 牌坊 (south entrance)
  meshes.push(...buildPaifang(0, -7.5, 0, scene));

  // Stone path — southward
  for (let i = 1; i <= 5; i++) {
    const step = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.8), new THREE.MeshStandardMaterial({ color: 0x6a6a5a, roughness: 0.6 }));
    step.rotation.x = -Math.PI / 2;
    step.position.set(0, 0.02, -7.5 - i * 0.8);
    step.receiveShadow = true;
    scene.add(step);
    meshes.push(step);
  }

  // Register building collisions
  addObstacle(0, 0, 3);         // pavilion center
  addObstacle(-5, 0, 1.8); addObstacle(5, 0, 1.8);
  addObstacle(0, -5, 1.8); addObstacle(0, 5, 1.8);
  addObstacle(-1.8, -7.5, 0.5); addObstacle(1.8, -7.5, 0.5); // gate pillars
  addObstacle(-3.5, 3.5, 0.3); addObstacle(3.5, 3.5, 0.3);
  addObstacle(-3.5, -3.5, 0.3); addObstacle(3.5, -3.5, 0.3);

  return meshes;
}

// Octagonal pavilion — 八角亭
function buildPavilion(cx, cz, scene) {
  const m = [];
  const group = new THREE.Group();
  group.position.set(cx, 0, cz);

  // Floor
  const floor = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.8, 0.3, 8), new THREE.MeshStandardMaterial({ color: 0x8b7355, roughness: 0.6 }));
  floor.position.y = 0.3;
  floor.castShadow = true; floor.receiveShadow = true;
  group.add(floor); m.push(floor);

  // Red pillars
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 3.5, 6), new THREE.MeshStandardMaterial({ color: 0xcc2222, roughness: 0.3 }));
    pillar.position.set(Math.cos(angle) * 2.2, 2.2, Math.sin(angle) * 2.2);
    pillar.castShadow = true;
    group.add(pillar); m.push(pillar);
  }

  // Roof — 八角飞檐
  const roof = new THREE.Mesh(new THREE.ConeGeometry(3.2, 1.8, 8), new THREE.MeshStandardMaterial({ color: 0x334422, roughness: 0.4 }));
  roof.position.y = 4.3;
  roof.castShadow = true;
  group.add(roof); m.push(roof);

  // Roof tip — 宝顶
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.25, 6, 3), new THREE.MeshStandardMaterial({ color: 0xffaa00, roughness: 0.2, emissive: 0xffaa00, emissiveIntensity: 0.3 }));
  tip.position.y = 5.2;
  group.add(tip); m.push(tip);

  // Table inside
  const table = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.2, 1), new THREE.MeshStandardMaterial({ color: 0x553311 }));
  table.position.y = 0.6;
  group.add(table); m.push(table);

  scene.add(group);
  return m;
}

// Side house — 厢房
function buildSideHouse(x, z, ry, scene) {
  const m = [];
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = ry;

  // Walls
  const walls = new THREE.Mesh(new THREE.BoxGeometry(3, 2.5, 2.5), new THREE.MeshStandardMaterial({ color: 0xeeddcc, roughness: 0.5 }));
  walls.position.y = 1.5; walls.castShadow = true; walls.receiveShadow = true;
  g.add(walls); m.push(walls);

  // Roof — 坡顶
  const roof = new THREE.Mesh(new THREE.ConeGeometry(2.8, 1.5, 4), new THREE.MeshStandardMaterial({ color: 0x553322, roughness: 0.4 }));
  roof.position.y = 3.2; roof.rotation.y = Math.PI / 4;
  roof.castShadow = true;
  g.add(roof); m.push(roof);

  // Door
  const door = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 1.2), new THREE.MeshStandardMaterial({ color: 0x442211, side: THREE.DoubleSide }));
  door.position.set(0, 0.8, 1.26);
  g.add(door); m.push(door);

  // Window
  const win = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.5), new THREE.MeshStandardMaterial({ color: 0xffcc88, side: THREE.DoubleSide, emissive: 0xff8822, emissiveIntensity: 0.4 }));
  win.position.set(0.8, 1.8, 1.26);
  g.add(win); m.push(win);

  scene.add(g);
  return m;
}

// Stone lantern — 石灯籠
function buildLantern(x, z, scene) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);

  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 0.5, 6), new THREE.MeshStandardMaterial({ color: 0x888877, roughness: 0.7 }));
  base.position.y = 0.25; g.add(base);
  const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.15, 1.5, 6), new THREE.MeshStandardMaterial({ color: 0x777766, roughness: 0.7 }));
  pillar.position.y = 1.2; g.add(pillar);
  const light = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.6, 0.4), new THREE.MeshStandardMaterial({ color: 0xffaa44, emissive: 0xff8822, emissiveIntensity: 0.6 }));
  light.position.y = 2.1; g.add(light);
  const cap = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.3, 4), new THREE.MeshStandardMaterial({ color: 0x666655, roughness: 0.7 }));
  cap.position.y = 2.55; g.add(cap);

  g.castShadow = true;
  scene.add(g);
  return g;
}

// Chinese gate — 牌坊
function buildPaifang(x, z, ry, scene) {
  const m = [];
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = ry;

  const redMat = new THREE.MeshStandardMaterial({ color: 0xbb1111, roughness: 0.3 });
  // Left pillar
  const lp = new THREE.Mesh(new THREE.BoxGeometry(0.4, 5, 0.4), redMat);
  lp.position.set(-1.8, 2.5, 0); lp.castShadow = true; g.add(lp); m.push(lp);
  // Right pillar
  const rp = new THREE.Mesh(new THREE.BoxGeometry(0.4, 5, 0.4), redMat);
  rp.position.set(1.8, 2.5, 0); rp.castShadow = true; g.add(rp); m.push(rp);
  // Top beam
  const beam = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.4, 0.5), redMat);
  beam.position.set(0, 5.2, 0); g.add(beam); m.push(beam);
  // Roof
  const roof = new THREE.Mesh(new THREE.BoxGeometry(5, 0.3, 2), new THREE.MeshStandardMaterial({ color: 0x334422 }));
  roof.position.set(0, 5.6, 0); g.add(roof); m.push(roof);
  // Gold characters (simple gold bar)
  const plaque = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.4), new THREE.MeshStandardMaterial({ color: 0xffcc00, side: THREE.DoubleSide, emissive: 0x886600, emissiveIntensity: 0.5 }));
  plaque.position.set(0, 4.8, 0.3); g.add(plaque); m.push(plaque);

  scene.add(g);
  return m;
}

// Bamboo clump
function buildBambooClump(x, z, scene) {
  const m = [];
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  for (let i = 0; i < 3; i++) {
    const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 4 + Math.random() * 2, 6), new THREE.MeshStandardMaterial({ color: 0x44aa44, roughness: 0.4 }));
    stalk.position.set((Math.random() - 0.5) * 1.5, 2.5, (Math.random() - 0.5) * 1.5);
    stalk.castShadow = true;
    g.add(stalk); m.push(stalk);
    // Leaves
    const leaves = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.5, 5), new THREE.MeshStandardMaterial({ color: 0x33aa33, roughness: 0.3 }));
    leaves.position.copy(stalk.position);
    leaves.position.y += 2.5;
    g.add(leaves); m.push(leaves);
  }
  scene.add(g);
  return m;
}
