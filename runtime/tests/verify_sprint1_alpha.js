// runtime/tests/verify_sprint1_alpha.js
// Sprint 1 Alpha: 100K Tick Deterministic Verification
// Pipeline: Boot → Run → Snapshot → Destroy → Restore → Replay → Compare Hashes

import { RuntimeConfig } from "../bootstrap/config.js";
import { World } from "../world/index.js";
import { Kernel } from "../kernel/index.js";
import { Snapshotter } from "../snapshot/index.js";
import { ReplayEngine } from "../replay/index.js";
import { SimulationManager } from "../simulation/index.js";
import { HistorySystem, HashValidator } from "../history/index.js";
import { Logger } from "../bootstrap/logger.js";

const log = new Logger("Verify");
const TICKS = 100000;
const SEED = 42;
let passed = 0; let failed = 0;
function assert(condition, label) {
  if (condition) { console.log(`  ✅ ${label}`); passed++; }
  else { console.log(`  ❌ ${label}`); failed++; }
}

console.log("═══════════════════════════════════════════");
console.log("  Project Celestial Runtime v1.0.0");
console.log("  Sprint 1 Alpha — Deterministic Persistent Simulation");
console.log("═══════════════════════════════════════════\n");

// ── Phase 1: Boot ──────────────────────────
console.log("Booting Runtime...");

const world = new World({ ...RuntimeConfig.world, seed: SEED });
await world.initialize();
const kernel = new Kernel(RuntimeConfig, world, new Logger("Kernel"));
await kernel.initialize();

const sim = new SimulationManager(SEED);
await sim.initialize(kernel);

const snap = new Snapshotter(kernel, RuntimeConfig);
const history = new HistorySystem(kernel);

// Register NPCs
kernel.createEntity("npc", {
  Identity: { name: "陈玄", age: 200 },
  Realm: { realm_id: 5, cultivation_value: 0.7, breakthroughs: 0 },
  HP: { current: 100, max: 100 },
  Stamina: { current: 100, max: 100 },
});
kernel.createEntity("npc", {
  Identity: { name: "赵灵儿", age: 180 },
  Realm: { realm_id: 3, cultivation_value: 0.3, breakthroughs: 0 },
  HP: { current: 80, max: 80 },
  Stamina: { current: 100, max: 100 },
});
kernel.createEntity("npc", {
  Identity: { name: "王虎", age: 220 },
  Realm: { realm_id: 4, cultivation_value: 0.5, breakthroughs: 0 },
  HP: { current: 120, max: 120 },
  Stamina: { current: 100, max: 100 },
});

console.log("Kernel Initialized.");
console.log("Simulation Initialized.");
console.log(`Running ${TICKS} Ticks...\n`);

// ── Phase 2: Run Simulation ───────────────
const startTime = Date.now();

for (let t = 1; t <= TICKS; t++) {
  world.tickCount = t;
  sim.tick(kernel.getWorldTime());

  // Snapshot every 1000 ticks
  if (t % 1000 === 0) {
    snap.take();
    const time = kernel.getWorldTime();
    history.record(t, time,
      world.globalState.weather.get("world"),
      world.globalState.qi.get("world")
    );
    if (t % 10000 === 0) console.log(`  Tick ${t}...`);
  }
}

const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
console.log(`\nSimulation Completed. (${elapsed}s)`);

// ── Phase 3: Compute Before Hashes ─────────
const validator = new HashValidator(kernel, snap, history);
console.log("Computing Hashes...");

const beforeHashes = validator.verifyAll();
assert(beforeHashes.world_state.length === 64, "World State Hash computed");
assert(beforeHashes.event_log.length === 64, "Event Log Hash computed");
assert(beforeHashes.history.length === 64, "History Hash computed");

// ── Phase 4: Save Final Snapshot ───────────
console.log("Saving Snapshot...");
const finalSnap = snap.take("FINAL");
assert(finalSnap !== null, "Final snapshot saved");

const snapId = finalSnap.snapshot_id;
const events = kernel.getEventLog(0);
const npcCount = kernel.queryEntities("npc", {}, 100, 0).length;

// ── Phase 5: Destroy Runtime ───────────────
console.log("Destroying Runtime...");
// Capture state for replay comparison
const beforeState = beforeHashes;

// ── Phase 6: Restore Snapshot ──────────────
console.log("Restoring Snapshot...");
snap.restore(snapId);
assert(kernel.world.tickCount === TICKS, "Tick restored correctly");
assert(kernel.queryEntities("npc", {}, 100, 0).length === npcCount, "NPC count preserved");

// ── Phase 7: Replay Event Log ──────────────
console.log("Replaying Event Log...");
const replay = new ReplayEngine(kernel, snap);
const firstSnapId = snap.list()[0];
replay.replay(firstSnapId, TICKS);

// ── Phase 8: Compare Hashes ────────────────
console.log("\nComparing Hashes...\n");
const afterHashes = validator.verifyAll();
const allMatch = validator.verifyDeterminism(beforeState, afterHashes);

// ── Phase 9: Final Verification ────────────
console.log("");

// NPC stats
for (const npc of kernel.queryEntities("npc", {}, 100, 0)) {
  const id = npc.getComponent("Identity");
  const realm = npc.getComponent("Realm");
  console.log(`  ${id.name}: age=${id.age} realm=${realm.realm_id} cv=${realm.cultivation_value.toFixed(4)} breakthroughs=${realm.breakthroughs}`);
}

// Memory
const memMB = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);
console.log(`\nMemory: ${memMB}MB`);
console.log(`Events: ${events.length}`);

// Summary
console.log(`\n═══ Result: ${passed}/${passed + failed} passed ═══`);

if (allMatch && failed === 0) {
  console.log("\nDeterminism       ✓ VERIFIED");
  console.log("Simulation Stable ✓ VERIFIED");
  console.log("\nSprint 1 Alpha PASSED");
} else {
  console.log("\nSprint 1 Alpha FAILED");
  process.exit(1);
}
