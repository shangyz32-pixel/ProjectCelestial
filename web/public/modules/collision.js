// modules/collision.js
// Simple collision system — prevents player from walking through objects.
// Uses circle collision (radius) for performance.

// Obstacle registry: array of {x, z, radius}
const obstacles = [];

// Register an obstacle with world position and radius
export function addObstacle(x, z, radius = 1.0) {
  obstacles.push({ x, z, radius });
}

// Register a THREE object — uses its position and a default radius
export function addMeshObstacle(mesh, radius = 1.0) {
  if (!mesh || !mesh.position) return;
  obstacles.push({ x: mesh.position.x, z: mesh.position.z, radius, mesh });
}

// Remove all obstacles (called on region switch)
export function clearObstacles() {
  obstacles.length = 0;
}

// Check if a position collides with any obstacle
// Returns { blocked: true/false, pushX, pushZ } — push vector to resolve
export function checkCollision(px, pz, playerRadius = 0.5) {
  let blocked = false;
  let pushX = 0, pushZ = 0;

  for (const obs of obstacles) {
    const dx = px - obs.x;
    const dz = pz - obs.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    const minDist = playerRadius + obs.radius;

    if (dist < minDist && dist > 0.001) {
      blocked = true;
      // Push away from obstacle
      const overlap = minDist - dist;
      const nx = dx / dist;
      const nz = dz / dist;
      pushX += nx * overlap;
      pushZ += nz * overlap;
    }
  }
  return { blocked, pushX, pushZ };
}

// Try to move player — returns the actual position after collision resolution
export function moveWithCollision(curX, curZ, newX, newZ, playerRadius = 0.5) {
  // Try full move
  const result = checkCollision(newX, newZ, playerRadius);
  if (!result.blocked) return { x: newX, z: newZ, blocked: false };

  // Try X-only
  const xResult = checkCollision(newX, curZ, playerRadius);
  // Try Z-only
  const zResult = checkCollision(curX, newZ, playerRadius);

  // Slide along whichever axis has less resistance
  if (!xResult.blocked && !zResult.blocked) {
    return { x: newX, z: newZ, blocked: false }; // gap between obstacles
  }
  if (!xResult.blocked) {
    return { x: newX, z: curZ + zResult.pushZ, blocked: true };
  }
  if (!zResult.blocked) {
    return { x: curX + xResult.pushX, z: newZ, blocked: true };
  }

  // Both blocked — push as far as possible
  return {
    x: curX + xResult.pushX,
    z: curZ + zResult.pushZ,
    blocked: true,
  };
}

// Register collision for common meshes in a group
export function addGroupCollision(group, count, spacing = 2, radius = 0.8) {
  if (!group || !group.position) return;
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    addObstacle(
      group.position.x + Math.cos(angle) * spacing,
      group.position.z + Math.sin(angle) * spacing,
      radius
    );
  }
}
