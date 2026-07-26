// modules/orientation.js
// Unified Character Orientation System — single source of truth for ALL rotation.
// Every system (movement, combat, interaction, NPC, monster) uses this controller.
// No entity calculates its own rotation independently.

// Priority: COMBAT > INTERACT > HARVEST > DIALOGUE > CRAFT > RUNNING > WALKING > IDLE
const PRIORITY = {
  IDLE:       0,
  WALKING:    1,
  RUNNING:    2,
  CRAFT:      3,
  DIALOGUE:   4,
  HARVEST:    5,
  INTERACT:   6,
  COMBAT:     7,
  DEATH:      8,  // freezes
};

// Rotation modes
export const MODE = {
  IDLE:       'IDLE',       // keep last facing direction
  WALKING:    'WALKING',    // face movement direction
  RUNNING:    'RUNNING',    // face movement direction (faster lerp)
  COMBAT:     'COMBAT',     // face target position
  INTERACT:   'INTERACT',   // face interactable object
  HARVEST:    'HARVEST',    // face resource node
  DIALOGUE:   'DIALOGUE',   // face speaking NPC
  CRAFT:      'CRAFT',      // face furnace/table
  DEATH:      'DEATH',      // freeze in place
};

const DEFAULT_SPEED = 6.0;    // radians/sec for smooth lerp
const FAST_SPEED   = 12.0;   // for running/combat

export function createOrientationController() {
  const entities = new Map();  // id → { mode, targetAngle, speed, lastAngle, priority, cameraAngle }

  function register(entityId, mesh) {
    entities.set(entityId, {
      mesh,
      mode: MODE.IDLE,
      targetAngle: 0,
      currentAngle: mesh?.rotation?.y || 0,
      speed: DEFAULT_SPEED,
      priority: PRIORITY.IDLE,
      target: null,    // target world position {x,z} or entity
      locked: false,   // death freeze
    });
  }

  function unregister(entityId) {
    entities.delete(entityId);
  }

  // Request orientation change. Higher priority overrides lower.
  // Systems call this, never set mesh.rotation.y directly.
  function request(entityId, mode, opts = {}) {
    const e = entities.get(entityId);
    if (!e) return;
    if (e.locked) return; // death freeze

    const p = PRIORITY[mode] ?? 0;
    if (p < e.priority) return; // lower priority, ignore

    e.mode = mode;
    e.priority = p;
    e.target = opts.target || null;
    e.cameraAngle = opts.cameraAngle;

    // Determine speed by mode
    switch (mode) {
      case MODE.RUNNING:
      case MODE.COMBAT:
        e.speed = FAST_SPEED;
        break;
      case MODE.IDLE:
      case MODE.DEATH:
        e.speed = 999; // instant
        break;
      default:
        e.speed = opts.speed || DEFAULT_SPEED;
    }

    // Resolve target angle from options
    if (opts.angle !== undefined) {
      e.targetAngle = opts.angle;
    } else if (opts.direction) {
      // direction: {x, z} vector
      e.targetAngle = Math.atan2(opts.direction.x, opts.direction.z);
    } else if (opts.targetPos) {
      // targetPos: world {x, z}
      const mx = e.mesh?.position?.x || 0;
      const mz = e.mesh?.position?.z || 0;
      e.targetAngle = Math.atan2(opts.targetPos.x - mx, opts.targetPos.z - mz);
    } else if (opts.cameraAngle !== undefined) {
      // Camera orbit → character faces away from camera
      e.targetAngle = opts.cameraAngle + Math.PI;
    }
  }

  // Release a mode — fall back to next priority
  function release(entityId, mode) {
    const e = entities.get(entityId);
    if (!e) return;
    if (e.mode !== mode) return;
    // Fall back to IDLE with camera angle
    if (e.cameraAngle !== undefined) {
      e.mode = MODE.IDLE;
      e.priority = PRIORITY.IDLE;
      e.targetAngle = e.cameraAngle + Math.PI;
    }
  }

  // Update all entities' rotation toward their target angle
  function update(delta) {
    for (const [, e] of entities) {
      if (!e.mesh) continue;
      if (e.mode === MODE.DEATH) continue;
      if (e.mode === MODE.IDLE && e.currentAngle === e.targetAngle) continue;

      const diff = angleDelta(e.currentAngle, e.targetAngle);
      if (Math.abs(diff) < 0.001) {
        e.currentAngle = e.targetAngle;
        e.mesh.rotation.y = e.currentAngle;
        continue;
      }

      const step = Math.sign(diff) * Math.min(Math.abs(diff), e.speed * delta);
      e.currentAngle += step;
      // Wrap to [-PI, PI]
      if (e.currentAngle > Math.PI) e.currentAngle -= Math.PI * 2;
      if (e.currentAngle < -Math.PI) e.currentAngle += Math.PI * 2;
      e.mesh.rotation.y = e.currentAngle;
    }
  }

  // Lock entity in death pose
  function lock(entityId) {
    const e = entities.get(entityId);
    if (e) { e.locked = true; e.mode = MODE.DEATH; e.priority = PRIORITY.DEATH; }
  }

  return { register, unregister, request, release, update, lock, MODE, PRIORITY };
}

// Shortest angle delta [-PI, PI]
function angleDelta(a, b) {
  let d = b - a;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}
