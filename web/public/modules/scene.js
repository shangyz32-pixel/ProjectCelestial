// public/modules/scene.js
// Three.js setup — scene, camera, renderer, lighting.
// One responsibility: initialize and return render objects.

import * as THREE from 'three';

export function createScene(canvas) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x112233);
  scene.fog = new THREE.Fog(0x112233, 30, 120);

  const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 1, 200);
  camera.position.set(15, 22, 25);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(innerWidth, innerHeight);
  renderer.shadowMap.enabled = true;

  // Lighting
  scene.add(new THREE.AmbientLight(0x334455, 1.5));
  const sun = new THREE.DirectionalLight(0xffeedd, 2);
  sun.position.set(20, 30, 10);
  sun.castShadow = true;
  scene.add(sun);

  window.addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });

  return { scene, camera, renderer };
}
