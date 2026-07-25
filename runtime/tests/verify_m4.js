// runtime/tests/verify_m4.js
// M4 Verification: Kernel API (Create/Read/Update/Delete)

import { RuntimeConfig } from "../bootstrap/config.js";
import { World } from "../world/index.js";
import { Kernel } from "../kernel/index.js";
import { Logger } from "../bootstrap/logger.js";

let passed = 0;
let failed = 0;
function assert(condition, label) {
  if (condition) { console.log(`  ✅ ${label}`); passed++; }
  else { console.log(`  ❌ ${label}`); failed++; }
}

console.log("═══ M4: Kernel API Verification ═══\n");

const log = new Logger("Test");
const world = new World(RuntimeConfig.world, log);
await world.initialize();
const kernel = new Kernel(RuntimeConfig, world, log);
await kernel.initialize();

// Test 1: CreateEntity
console.log("1. CreateEntity");
const npc = kernel.createEntity("npc", {
  name: "陈玄",
  Realm: { realm_id: 5 },
  HP: { current: 100, max: 100 },
});
assert(npc.id === "npc_0001", "First NPC has sequential ID");
assert(npc.type === "npc", "Type is npc");
assert(npc.getComponent("name") === "陈玄", "Name component stored");

const npc2 = kernel.createEntity("npc", { name: "王虎" });
assert(npc2.id === "npc_0002", "Second NPC has sequential ID");

// Test 2: GetEntity
console.log("\n2. GetEntity");
const found = kernel.getEntity("npc_0001");
assert(found !== null, "Entity found by ID");
assert(found.getComponent("name") === "陈玄", "Returned entity has correct data");
assert(kernel.getEntity("nonexistent") === null, "Missing entity returns null");

// Test 3: UpdateComponent
console.log("\n3. UpdateComponent");
kernel.updateComponent("npc_0001", "HP", { current: 80, max: 100 }, 1);
const updated = kernel.getEntity("npc_0001");
assert(updated.getComponent("HP").current === 80, "HP updated to 80");
assert(updated.version === 2, "Version incremented to 2");

// Test 4: Version conflict detection
console.log("\n4. Version Conflict");
try {
  kernel.updateComponent("npc_0001", "HP", { current: 60, max: 100 }, 1); // wrong version
  assert(false, "Should have thrown VERSION_MISMATCH");
} catch (err) {
  assert(err.message === "VERSION_MISMATCH", "Version mismatch correctly detected");
}

// Test 5: DeleteEntity (mark deceased)
console.log("\n5. DeleteEntity");
kernel.deleteEntity("npc_0002");
const deceased = kernel.getEntity("npc_0002");
assert(deceased !== null, "Entity still exists (not physically deleted)");
assert(deceased.state === "deceased", "Entity marked deceased");

// Test 6: QueryEntities
console.log("\n6. QueryEntities");
const faction = kernel.createEntity("faction", { name: "青云宗", type: "sect" });
kernel.createEntity("faction", { name: "赤炎宗", type: "sect" });
const sects = kernel.queryEntities("faction", {}, 10, 0);
assert(sects.length === 2, "Query returns 2 factions");
assert(sects[0].getComponent("name") === "青云宗", "First faction is 青云宗");

// Test 7: Event Log
console.log("\n7. Event Log");
const events = kernel.getEventLog(0);
const creates = events.filter(e => e.type === "EntityCreated");
assert(creates.length === 4, "Event log has 4 EntityCreated events (2 npc + 2 faction)");

// Summary
console.log(`\n═══ Result: ${passed}/${passed + failed} passed ═══`);
if (failed > 0) process.exit(1);
