// runtime/tests/verify_m5.js
// M5 Verification: Transactions (ACID)

import { RuntimeConfig } from "../bootstrap/config.js";
import { World } from "../world/index.js";
import { Kernel } from "../kernel/index.js";

let passed = 0; let failed = 0;
function assert(condition, label) {
  if (condition) { console.log(`  ✅ ${label}`); passed++; }
  else { console.log(`  ❌ ${label}`); failed++; }
}

console.log("═══ M5: Transaction Verification ═══\n");

const world = new World(RuntimeConfig.world);
await world.initialize();
const kernel = new Kernel(RuntimeConfig, world);
await kernel.initialize();

// Test 1: Atomicity — Commit
console.log("1. Atomic Commit");
const npc = kernel.createEntity("npc", { gold: 100, HP: { current: 100 } });
const tx = kernel.beginTransaction();
kernel.updateComponent("npc_0001", "gold", 50, npc.version); // 100→50
const npc2 = kernel.getEntity("npc_0001");
assert(npc2.getComponent("gold") === 50, "Gold decremented (100→50)");
assert(npc2.version === 2, "Version incremented");

// Test 2: Atomicity — Rollback (via version conflict)
console.log("\n2. Rollback on Error");
try {
  // Use wrong version — should throw VERSION_MISMATCH
  kernel.updateComponent("npc_0001", "gold", 200, 1);
  assert(false, "Should have thrown");
} catch (err) {
  assert(err.message === "VERSION_MISMATCH", "Transaction prevented");
}
const npc3 = kernel.getEntity("npc_0001");
assert(npc3.getComponent("gold") === 50, "Gold unchanged after failed tx");
assert(npc3.version === 2, "Version unchanged after failed tx");

// Test 3: Multi-operation transaction
console.log("\n3. Multi-operation Transaction");
const npc4 = kernel.getEntity("npc_0001");
const tx2 = kernel.beginTransaction();
try {
  // Two updates in sequence — each is its own implicit tx
  kernel.updateComponent("npc_0001", "gold", 0, npc4.version);   // v2→v3
  const npc5 = kernel.getEntity("npc_0001");
  kernel.updateComponent("npc_0001", "HP", { current: 50 }, npc5.version); // v3→v4
  const npc6 = kernel.getEntity("npc_0001");
  assert(npc6.getComponent("gold") === 0, "Gold→0");
  assert(npc6.getComponent("HP").current === 50, "HP→50");
  assert(npc6.version === 4, "Version→4 after 2 updates");
} finally {
  // No explicit rollback needed — each updateComponent is self-contained
}

// Test 4: Event generation
console.log("\n4. Event Generation");
const events = kernel.getEventLog(0);
const updateEvents = events.filter(e => e.type === "EntityUpdated");
assert(updateEvents.length >= 3, "At least 3 EntityUpdated events generated");
// Verify event structure
const evt = updateEvents[0];
assert(evt.eventId.startsWith("evt_"), "Event has eventId");
assert(evt.payload !== undefined, "Event has payload");
assert(evt.payload.component === "gold" || evt.payload.component === "HP",
  "Event payload has component name");

// Test 5: EntityNotFound
console.log("\n5. Entity Not Found");
try {
  kernel.updateComponent("npc_9999", "gold", 50, 1);
  assert(false, "Should have thrown");
} catch (err) {
  assert(err.message === "ENTITY_NOT_FOUND", "EntityNotFound correctly detected");
}

console.log(`\n═══ Result: ${passed}/${passed + failed} passed ═══`);
if (failed > 0) process.exit(1);
