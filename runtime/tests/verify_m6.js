// runtime/tests/verify_m6.js
// M6+M7 Verification: Snapshot Save + Restore

import { RuntimeConfig } from "../bootstrap/config.js";
import { World } from "../world/index.js";
import { Kernel } from "../kernel/index.js";
import { Snapshotter } from "../snapshot/index.js";

let passed = 0; let failed = 0;
function assert(condition, label) {
  if (condition) { console.log(`  ✅ ${label}`); passed++; }
  else { console.log(`  ❌ ${label}`); failed++; }
}

console.log("═══ M6+M7: Snapshot Verification ═══\n");

const world = new World(RuntimeConfig.world);
await world.initialize();
const kernel = new Kernel(RuntimeConfig, world);
await kernel.initialize();
const snap = new Snapshotter(kernel, RuntimeConfig);

// Test 1: Take snapshot on empty world
console.log("1. Take Snapshot");
const s1 = snap.take("Initial");
assert(s1.snapshot_id === "snap_000001", "First snapshot ID");
assert(s1.tick === 0, "Tick 0 snapshot");
assert(s1.world_state.entities.length === 0, "Empty world — 0 entities");
assert(s1.canon_version === "1.0.0", "Canon version recorded");

// Test 2: Add entities and take another snapshot
console.log("\n2. Snapshot with Entities");
kernel.createEntity("npc", { name: "陈玄", Realm: { realm_id: 5 } });
kernel.createEntity("npc", { name: "王虎", Realm: { realm_id: 3 } });
kernel.createEntity("faction", { name: "青云宗" });

// Simulate Tick (world.tickCount increment)
world.tickCount = 5;

const s2 = snap.take("After NPC creation");
assert(s2.tick === 5, "Tick 5 snapshot");
assert(s2.world_state.entities.length === 3, "3 entities in snapshot");
assert(s2.parent_snapshot === "snap_000001", "Parent snapshot linked");

// Test 3: Load snapshot from disk
console.log("\n3. Load Snapshot");
const loaded = snap.load("snap_000002");
assert(loaded !== null, "Snapshot loaded from disk");
assert(loaded.tick === 5, "Loaded tick is 5");
assert(loaded.world_state.entities.length === 3, "Loaded has 3 entities");
assert(loaded.world_state.entities[0].components.name === "陈玄", "Entity data preserved");

// Test 4: List snapshots
console.log("\n4. List Snapshots");
const list = snap.list();
assert(list.length === 2, "2 snapshots on disk");
assert(list[0] === "snap_000001", "First in list");
assert(list[1] === "snap_000002", "Second in list");

// Test 5: Restore from snapshot
console.log("\n5. Restore");
kernel.createEntity("npc", { name: "临时NPC" }); // should be lost on restore
world.tickCount = 10;
assert(kernel.world.entities.size === 4, "4 entities before restore");

snap.restore("snap_000002");
assert(world.tickCount === 5, "Tick restored to 5");
assert(kernel.world.entities.size === 3, "3 entities after restore (临时NPC gone)");

const names = [...kernel.world.entities.values()].map(e => e.components.get("name"));
assert(names.includes("陈玄"), "陈玄 present after restore");
assert(names.includes("王虎"), "王虎 present after restore");
assert(!names.includes("临时NPC"), "临时NPC gone after restore");

// Test 6: Load latest
console.log("\n6. Load Latest");
const latest = snap.load();
assert(latest !== null, "Latest snapshot exists");
assert(latest.snapshot_id === "snap_000002", "Latest is snap_000002");

console.log(`\n═══ Result: ${passed}/${passed + failed} passed ═══`);
if (failed > 0) process.exit(1);
