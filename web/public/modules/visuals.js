// modules/visuals.js
// Atmosphere & decorative effects — Qi particles, fireflies, grass tufts, flowers.

import * as THREE from 'three';

export function createVisuals(scene) {
  const particles = [];

  // Floating Qi energy orbs — golden floating dots
  for (let i = 0; i < 40; i++) {
    const geo = new THREE.SphereGeometry(0.06, 4, 2);
    const mat = new THREE.MeshBasicMaterial({ color: 0xffdd88, transparent: true, opacity: 0.4, depthTest: false });
    const orb = new THREE.Mesh(geo, mat);
    orb.position.set((Math.random() - 0.5) * 40, 1 + Math.random() * 4, (Math.random() - 0.5) * 40);
    orb.userData = {
      baseY: orb.position.y,
      speed: 0.3 + Math.random() * 0.7,
      phase: Math.random() * Math.PI * 2,
      driftX: (Math.random() - 0.5) * 0.3,
      driftZ: (Math.random() - 0.5) * 0.3,
    };
    scene.add(orb);
    particles.push(orb);
  }

  // Fireflies — green-blue small dots (near ground)
  for (let i = 0; i < 25; i++) {
    const geo = new THREE.SphereGeometry(0.04, 3, 2);
    const mat = new THREE.MeshBasicMaterial({ color: 0x88ffaa, transparent: true, opacity: 0.5, depthTest: false });
    const fly = new THREE.Mesh(geo, mat);
    fly.position.set((Math.random() - 0.5) * 30, 0.3 + Math.random() * 1.5, (Math.random() - 0.5) * 30);
    fly.userData = { baseY: fly.position.y, speed: 0.5 + Math.random() * 1, phase: Math.random() * Math.PI * 2 };
    scene.add(fly);
    particles.push(fly);
  }

  function update(delta) {
    for (const p of particles) {
      const u = p.userData;
      if (!u) continue;
      // Float up and down
      p.position.y = u.baseY + Math.sin(Date.now() * 0.001 * u.speed + u.phase) * 0.4;
      if (u.driftX) {
        p.position.x += u.driftX * delta * 0.3;
        p.position.z += u.driftZ * delta * 0.3;
      }
      // Pulse opacity
      p.material.opacity = 0.2 + Math.sin(Date.now() * 0.002 + u.phase) * 0.2;
    }
  }

  function clearAll() {
    for (const p of particles) {
      scene.remove(p);
      if (p.geometry) p.geometry.dispose();
      if (p.material) p.material.dispose();
    }
    particles.length = 0;
  }

  return { update, clearAll };
}

// Scatter flowers and grass tufts around a position
export function addFlowers(scene, cx, cz, count = 8) {
  const meshes = [];
  for (let i = 0; i < count; i++) {
    const fx = cx + (Math.random() - 0.5) * 6;
    const fz = cz + (Math.random() - 0.5) * 6;
    const flower = new THREE.Mesh(
      new THREE.ConeGeometry(0.08, 0.3, 4),
      new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(Math.random() * 0.15 + 0.08, 0.8, 0.5 + Math.random() * 0.3) })
    );
    flower.position.set(fx, 0.15, fz);
    flower.castShadow = true;
    scene.add(flower);
    meshes.push(flower);
  }
  return meshes;
}

// Upgrade tree model —  different shapes
export function buildPineTree() {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.25, 3, 6), new THREE.MeshStandardMaterial({ color: 0x553311 })));
  for (let level = 0; level < 3; level++) {
    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(1.5 - level * 0.3, 2, 6),
      new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(0.25, 0.6, 0.25 + level * 0.05) })
    );
    cone.position.y = 1.5 + level * 1.5;
    g.add(cone);
  }
  g.children[0].position.y = 1.2;
  g.castShadow = true;
  return g;
}

export function buildCherryTree() {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 2.5, 6), new THREE.MeshStandardMaterial({ color: 0x664422 })));
  const crown = new THREE.Mesh(
    new THREE.SphereGeometry(1.5, 8, 6),
    new THREE.MeshStandardMaterial({ color: 0xff99aa, roughness: 0.6 })
  );
  crown.position.y = 2.5;
  g.add(crown);
  g.children[0].position.y = 1.2;
  g.castShadow = true;
  return g;
}
