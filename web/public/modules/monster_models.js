// modules/monster_models.js
// Distinct monster shapes — slime, wolf, bat, skeleton, boss.

import * as THREE from 'three';

export function createMonsterModel(type) {
  const g = new THREE.Group();

  switch (type) {
    case 'spirit_wolf':
      // Wolf — elongated body, pointed snout
      g.add(new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.8, 0.6), new THREE.MeshStandardMaterial({ color: 0x666688, roughness: 0.5 })));
      g.add(new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.6, 4), new THREE.MeshStandardMaterial({ color: 0x777799 })));
      g.children[1].position.set(0.9, 0, 0); g.children[1].rotation.z = -Math.PI / 2;
      g.children[0].position.y = 0.6; g.children[0].castShadow = true;
      break;

    case 'wild_beast':
      // Boar — stocky body
      g.add(new THREE.Mesh(new THREE.BoxGeometry(1.2, 1, 1), new THREE.MeshStandardMaterial({ color: 0x884422, roughness: 0.6 })));
      g.children[0].position.y = 0.8; g.children[0].castShadow = true;
      break;

    case 'thunder_eagle':
      // Eagle — wings spread
      g.add(new THREE.Mesh(new THREE.BoxGeometry(2, 0.4, 0.5), new THREE.MeshStandardMaterial({ color: 0xccaa44 })));
      g.add(new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.4), new THREE.MeshStandardMaterial({ color: 0xddbb55 })));
      g.children[0].position.y = 1; g.children[0].castShadow = true;
      g.children[1].position.y = 1.2;
      break;

    case 'demon_serpent':
      // Serpent — long cylinders
      for (let i = 0; i < 3; i++) {
        g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 1, 6), new THREE.MeshStandardMaterial({ color: 0x225522, roughness: 0.5 })));
        g.children[i].position.set(i * 0.6 - 0.6, i * 0.3, 0);
        g.children[i].rotation.z = i * 0.4;
      }
      break;

    case 'ancient_guard':
      // Guardian — tall armored
      g.add(new THREE.Mesh(new THREE.BoxGeometry(1.2, 2, 0.8), new THREE.MeshStandardMaterial({ color: 0x666655, roughness: 0.3 })));
      g.add(new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.8, 0.6), new THREE.MeshStandardMaterial({ color: 0x444433 })));
      g.children[0].position.y = 1.2; g.children[0].castShadow = true;
      g.children[1].position.y = 2; // helmet
      break;

    case 'boss_wyrm':
      // Wyrm — large, three segments, wings
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.8, 3, 6), new THREE.MeshStandardMaterial({ color: 0x993322, roughness: 0.4 }));
      body.position.y = 1.2; g.add(body);
      const head = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1, 6), new THREE.MeshStandardMaterial({ color: 0xaa3322 }));
      head.position.y = 3; g.add(head);
      const wingL = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.1, 0.5), new THREE.MeshStandardMaterial({ color: 0x772211 }));
      wingL.position.set(-0.8, 1.5, 0); wingL.rotation.z = 0.4; g.add(wingL);
      const wingR = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.1, 0.5), new THREE.MeshStandardMaterial({ color: 0x772211 }));
      wingR.position.set(0.8, 1.5, 0); wingR.rotation.z = -0.4; g.add(wingR);
      break;

    default:
      // Default slime — round blob
      g.add(new THREE.Mesh(new THREE.SphereGeometry(0.7, 6, 4), new THREE.MeshStandardMaterial({ color: 0x88dd44, roughness: 0.3 })));
      g.children[0].position.y = 0.6;
      break;
  }

  return g;
}
