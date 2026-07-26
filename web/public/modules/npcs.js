// modules/npcs.js
// Town NPCs — cultivators walking around, merchants at stalls.
// Synced from WebSocket state, rendered in the world.

import * as THREE from 'three';
import { addObstacle } from './collision.js';

const npcMeshes = new Map();
const NPC_COLORS = [0xdd8844, 0x8844dd, 0x44dd88, 0xdd4488, 0x88dd44];

export function syncNPCs(scene, npcs) {
  const aliveIds = new Set();

  for (let i = 0; i < npcs.length; i++) {
    const n = npcs[i];
    aliveIds.add(n.id);

    let mesh = npcMeshes.get(n.id);
    if (!mesh) {
      mesh = createNPCMesh(n, i);
      scene.add(mesh);
      npcMeshes.set(n.id, mesh);
    }

    // Walk in a small patrol circle
    const time = Date.now() * 0.001;
    const ox = Math.sin(time * 0.5 + i * 1.5) * 3;
    const oz = Math.cos(time * 0.7 + i * 1.5) * 3;
    mesh.position.set(ox, 0.5, oz);
    // Face movement direction
    mesh.rotation.y = Math.atan2(Math.cos(time * 0.7 + i * 1.5), Math.sin(time * 0.5 + i * 1.5));
  }

  // Remove dead NPCs
  for (const [id, mesh] of npcMeshes) {
    if (!aliveIds.has(id)) {
      scene.remove(mesh);
      mesh.traverse(c => { if (c.geometry) c.geometry.dispose(); if (c.material) c.material.dispose(); });
      npcMeshes.delete(id);
    }
  }
}

function createNPCMesh(npc, index) {
  const color = NPC_COLORS[index % NPC_COLORS.length];
  const g = new THREE.Group();

  // Robe
  const robe = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25, 0.35, 1.2, 6),
    new THREE.MeshStandardMaterial({ color, roughness: 0.4 })
  );
  robe.position.y = 0.7;
  g.add(robe);

  // Head
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 6, 4),
    new THREE.MeshStandardMaterial({ color: 0xffddaa, roughness: 0.6 })
  );
  head.position.y = 1.5;
  g.add(head);

  // Hair
  const hair = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.22, 0.2, 6),
    new THREE.MeshStandardMaterial({ color: 0x221111, roughness: 0.3 })
  );
  hair.position.y = 1.75;
  g.add(hair);

  // Name tag
  const name = npc.name || 'NPC';
  g.userData = { id: npc.id, name, hp: npc.hp || 50 };
  g.castShadow = true;

  return g;
}

export { npcMeshes };
