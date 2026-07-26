// public/modules/regions.js
// Region-driven scene — each area has its own terrain, sky, fog.

import * as THREE from 'three';

const regionDefs = {
  town: {
    ground: 0x444433, sky: 0x334455, fogColor: 0x334455, fogNear: 40, fogFar: 100,
    ambient: 0x556677, sunColor: 0xffeedd, name: '新手村',
    trees: 5, treeColor: 0x338833, rocks: 3,
  },
  bamboo: {
    ground: 0x224422, sky: 0x112233, fogColor: 0x112233, fogNear: 30, fogFar: 90,
    ambient: 0x334455, sunColor: 0xeeffee, name: '翠竹林',
    trees: 25, treeColor: 0x33aa33, rocks: 5,
  },
  misty: {
    ground: 0x333344, sky: 0x667788, fogColor: 0x8899aa, fogNear: 15, fogFar: 60,
    ambient: 0x445566, sunColor: 0xccccdd, name: '云雾峰',
    trees: 8, treeColor: 0x446644, rocks: 12,
  },
  thunder: {
    ground: 0x332244, sky: 0x221133, fogColor: 0x332244, fogNear: 20, fogFar: 70,
    ambient: 0x223344, sunColor: 0x9966cc, name: '雷音谷',
    trees: 4, treeColor: 0x553355, rocks: 15,
  },
  dragon: {
    ground: 0x443322, sky: 0x332211, fogColor: 0x554433, fogNear: 25, fogFar: 80,
    ambient: 0x554433, sunColor: 0xffaa44, name: '龙脉秘境',
    trees: 6, treeColor: 0x885533, rocks: 8,
  },
};

export function createRegionManager(scene) {
  const meshes = { terrain: [], decorations: [] };
  let currentRegion = null;

  // Sun (reusable, just change color)
  const sun = scene.children.find(c => c.isDirectionalLight) ||
    (() => { const s = new THREE.DirectionalLight(0xffeedd, 2); s.position.set(20, 30, 10); scene.add(s); return s; })();

  function switchTo(regionId) {
    if (regionId === currentRegion) return;
    currentRegion = regionId;
    const r = regionDefs[regionId] || regionDefs.bamboo;

    // Sky + Fog
    scene.background = new THREE.Color(r.sky);
    scene.fog = new THREE.Fog(r.fogColor, r.fogNear, r.fogFar);

    // Ambient light
    const amb = scene.children.find(c => c.isAmbientLight);
    if (amb) amb.color.set(r.ambient);

    // Sun
    sun.color.set(r.sunColor);

    // Clear old terrain
    for (const m of meshes.terrain) { scene.remove(m); if (m.geometry) m.geometry.dispose(); }
    for (const m of meshes.decorations) { scene.remove(m); }
    meshes.terrain = [];
    meshes.decorations = [];

    // Ground plane
    const gnd = new THREE.Mesh(
      new THREE.PlaneGeometry(80, 80),
      new THREE.MeshStandardMaterial({ color: r.ground, roughness: 0.9 })
    );
    gnd.rotation.x = -Math.PI / 2;
    gnd.receiveShadow = true;
    scene.add(gnd);
    meshes.terrain.push(gnd);

    // Trees
    for (let i = 0; i < r.trees; i++) {
      const tx = (Math.random() - 0.5) * 60;
      const tz = (Math.random() - 0.5) * 60;
      const g = new THREE.Group();
      g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 2.5), new THREE.MeshStandardMaterial({ color: 0x553311 })));
      g.add(new THREE.Mesh(new THREE.ConeGeometry(1, 3, 6), new THREE.MeshStandardMaterial({ color: r.treeColor })));
      g.children[0].position.y = 1.2; g.children[1].position.y = 3;
      g.position.set(tx, 0, tz);
      g.castShadow = true;
      scene.add(g);
      meshes.decorations.push(g);
    }

    // Rocks
    for (let i = 0; i < r.rocks; i++) {
      const rock = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.3 + Math.random() * 0.4, 0),
        new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(0.08, 0.1, 0.3 + Math.random() * 0.3), roughness: 0.8 })
      );
      rock.position.set((Math.random() - 0.5) * 50, 0.1, (Math.random() - 0.5) * 50);
      scene.add(rock);
      meshes.decorations.push(rock);
    }

    return r.name;
  }

  return { switchTo, get current() { return currentRegion; }, regionDefs };
}
