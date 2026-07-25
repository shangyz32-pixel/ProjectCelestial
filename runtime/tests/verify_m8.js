// runtime/tests/verify_m8.js
// M8 Verification: Replay Engine

import { RuntimeConfig } from "../bootstrap/config.js";
import { World } from "../world/index.js";
import { Kernel } from "../kernel/index.js";
import { Snapshotter } from "../snapshot/index.js";
import { ReplayEngine } from "../replay/index.js";

let passed = 0; let failed = 0;
function assert(condition, label) {
  if (condition) { console.log(`  ✅ ${label}`); passed++; }
  else { console.log(`  ❌ ${label}`); failed++; }
}

console.log("═══ M8: Replay Verification ═══\n");

const world = new World(RuntimeConfig.world);
await world.initialize();
const kernel = new Kernel(RuntimeConfig, world);
await kernel.initialize();
const snap = new Snapshotter(kernel, RuntimeConfig);
const replay = new ReplayEngine(kernel, snap);

// Test 1: Create entities BEFORE snapshot
console.log("1. Pre-Snapshot Setup");
kernel.createEntity("npc", { name: "陈玄", HP: { current: 100 } });
world.tickCount = 1;
const s1 = snap.take("Tick 1 baseline");
assert(s1.tick === 1, "Baseline snapshot at Tick 1");

// Test 2: Modify AFTER snapshot (generates events in event log)
console.log("\n2. Post-Snapshot Modifications");
kernel.updateComponent("npc_0001", "HP", { current: 80 }, 1);
world.tickCount = 2;
kernel.updateComponent("npc_0001", "HP", { current: 50 }, 2);
world.tickCount = 3;

const events = kernel.getEventLog(0);
const updateEvents = events.filter(e => e.type === "EntityUpdated");
assert(updateEvents.length >= 2, "2+ update events generated after baseline");

// Test 3: Replay from baseline — should apply events
console.log("\n3. Replay from Baseline");
const result = replay.replay("snap_000001", 3);
assert(result.start_tick === 1, "Replay starts at Tick 1");
assert(result.events_replayed >= 1, "Events replayed (only post-snapshot events)");

// Test 4: Entity state after replay
console.log("\n4. Post-Replay State");
const npc = kernel.getEntity("npc_0001");
assert(npc !== null, "Entity exists after replay");
assert(npc.getComponent("HP").current === 50, "HP = 50 (both updates replayed)");
assert(npc.getComponent("name") === "陈玄", "Name preserved");

// Summary
console.log(`\n═══ Result: ${passed}/${passed + failed} passed ═══`);
if (failed > 0) process.exit(1);
