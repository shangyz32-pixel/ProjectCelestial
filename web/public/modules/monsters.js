// public/modules/monsters.js
// Monster rendering — synced from WebSocket state.

import * as THREE from 'three';
import { createMonsterModel } from './monster_models.js';

const monsterMeshes = new Map();
const MONSTER_COLORS = {
  wild_beast: 0x884422, spirit_wolf: 0x666688, thunder_eagle: 0xccaa44,
  demon_serpent: 0x225522, ancient_guard: 0x666644, boss_wyrm: 0x993322,
};

export function syncMonsters(scene, monsters) {
  const aliveIds = new Set();

  for (const m of monsters) {
    aliveIds.add(m.id);
    let mesh = monsterMeshes.get(m.id);
    if (!mesh) {
      mesh = createMonsterMesh(m);
      scene.add(mesh);
      monsterMeshes.set(m.id, mesh);
    } else {
      // Update HP from server
      mesh.userData.hp = m.hp || mesh.userData.hp || 50;
      mesh.userData.hpMax = m.hpMax || mesh.userData.hpMax || 50;
      if (mesh.userData.hpBar) {
        mesh.userData.hpBar.scale.x = Math.max(0, mesh.userData.hp / mesh.userData.hpMax);
      }
    }
    // Position from area (simplified: random offset per area)
    const areaOffsets = { area_bamboo_grove: [0, 0], area_misty_peak: [15, 10], area_thunder_valley: [30, 0], area_dragon_vein: [45, -10] };
    const [ox, oz] = areaOffsets[m.area] || [0, 0];
    mesh.position.set(ox + (Math.sin(m.id.charCodeAt(0) * 2) * 8), 0.5, oz + (Math.cos(m.id.charCodeAt(1) * 2) * 8));
  }

  // Remove dead
  for (const [id, mesh] of monsterMeshes) {
    if (!aliveIds.has(id)) {
      scene.remove(mesh);
      mesh.traverse(c => { if (c.geometry) c.geometry.dispose(); if (c.material) c.material.dispose(); });
      monsterMeshes.delete(id);
    }
  }
}

function createMonsterMesh(m) {
  const group = createMonsterModel(m.type);
  // HP bar
  const hbar = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.1), new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide }));
  hbar.position.y = 2.5;
  group.add(hbar);
  group.userData = { id: m.id, type: m.type, hpBar: hbar, hp: m.hp || 50, hpMax: m.hpMax || 50 };
  return group;
}

export { monsterMeshes };
