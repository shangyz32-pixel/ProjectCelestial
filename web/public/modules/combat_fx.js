// modules/combat_fx.js
// Combat visual effects — damage numbers, death particles, attack trails.
// Zero game logic. Pure visual feedback layer.

import * as THREE from 'three';

export function createCombatFX(scene) {
  const damageNumbers = [];
  const particles = [];

  // Show floating damage number above a world position
  function showDamage(pos, amount, color = '#ff4444') {
    const canvas = document.createElement('canvas');
    canvas.width = 128; canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.font = 'bold 32px monospace';
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.fillText(String(Math.abs(amount)), 64, 38);

    const tex = new THREE.CanvasTexture(canvas);
    tex.minFilter = THREE.LinearFilter;
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
    sprite.position.copy(pos);
    sprite.position.y += 2;
    sprite.scale.set(3, 1.5, 1);
    scene.add(sprite);
    damageNumbers.push({ sprite, life: 2.0, speed: 0.03 });
  }

  // Death particle burst
  function showDeathBurst(pos, color = '#ff8800') {
    for (let i = 0; i < 12; i++) {
      const geo = new THREE.SphereGeometry(0.08, 4, 2);
      const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(color), transparent: true, opacity: 1 });
      const particle = new THREE.Mesh(geo, mat);
      particle.position.copy(pos);
      particle.position.y += 1;
      const angle = (i / 12) * Math.PI * 2;
      particle.userData = { vx: Math.cos(angle) * 0.06, vy: 0.04 + Math.random() * 0.06, vz: Math.sin(angle) * 0.06, life: 1.5 };
      scene.add(particle);
      particles.push(particle);
    }
  }

  // Sword slash arc — temporary afterimage
  function showSlash(pos, angle, color = '#ffffff') {
    const arc = new THREE.Mesh(
      new THREE.TorusGeometry(1.5, 0.05, 4, 4, Math.PI),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(color), transparent: true, opacity: 0.8, depthTest: false })
    );
    arc.position.copy(pos);
    arc.position.y += 1;
    arc.rotation.y = angle;
    arc.rotation.x = Math.PI / 2;
    scene.add(arc);
    particles.push(arc);
    arc.userData = { life: 0.3, vx: 0, vy: 0, vz: 0 };
  }

  // Update all effects each frame
  function update() {
    // Damage numbers — float up and fade
    for (let i = damageNumbers.length - 1; i >= 0; i--) {
      const dn = damageNumbers[i];
      dn.life -= 0.016;
      dn.sprite.position.y += dn.speed;
      dn.sprite.material.opacity = Math.max(0, dn.life / 2);
      if (dn.life <= 0) {
        scene.remove(dn.sprite);
        dn.sprite.material.map.dispose();
        dn.sprite.material.dispose();
        damageNumbers.splice(i, 1);
      }
    }
    // Particles — gravity + fade
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      if (!p.userData) continue;
      p.userData.life -= 0.016;
      p.userData.vy -= 0.002; // gravity
      p.position.x += p.userData.vx || 0;
      p.position.y += p.userData.vy || 0;
      p.position.z += p.userData.vz || 0;
      if (p.material.opacity !== undefined) {
        p.material.opacity = Math.max(0, p.userData.life / (p.userData.life + 0.3));
      }
      if (p.userData.life <= 0) {
        scene.remove(p);
        if (p.geometry) p.geometry.dispose();
        if (p.material) p.material.dispose();
        particles.splice(i, 1);
      }
    }
  }

  return { showDamage, showDeathBurst, showSlash, update };
}
