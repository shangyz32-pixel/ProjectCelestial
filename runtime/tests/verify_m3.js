// runtime/tests/verify_m3.js
// M3 Verification: Entity + Component + World State

import { Entity } from "../entity/index.js";

let passed = 0;
let failed = 0;

function assert(condition, label) {
  if (condition) {
    console.log(`  ✅ ${label}`);
    passed++;
  } else {
    console.log(`  ❌ ${label}`);
    failed++;
  }
}

console.log("═══ M3: World State Verification ═══\n");

// Test 1: Entity creation
console.log("1. Entity Creation");
const npc = new Entity("npc", "npc_001");
assert(npc.id === "npc_001", "ID is npc_001");
assert(npc.type === "npc", "Type is npc");
assert(npc.version === 1, "Version starts at 1");
assert(npc.state === "active", "State is active");
assert(npc.components.size === 0, "No components initially");

// Test 2: Components
console.log("\n2. Component Storage");
npc.components.set("Realm", { realm_id: 3, name: "Core Formation" });
npc.components.set("HP", { current: 100, max: 100 });
assert(npc.getComponent("Realm").realm_id === 3, "Realm component stored");
assert(npc.getComponent("HP").current === 100, "HP component stored");
assert(npc.hasComponent("Realm") === true, "hasComponent returns true");
assert(npc.hasComponent("Inventory") === false, "Missing component returns false");

// Test 3: Serialization
console.log("\n3. Serialization");
const json = npc.toJSON();
assert(json.id === "npc_001", "JSON: id preserved");
assert(json.version === 1, "JSON: version preserved");
assert(json.components.Realm.realm_id === 3, "JSON: components preserved");

// Test 4: Multiple entity types
console.log("\n4. Multiple Types");
const faction = new Entity("faction", "faction_qingyun");
const item = new Entity("item", "item_sword_01");
assert(faction.type === "faction", "Faction entity created");
assert(item.type === "item", "Item entity created");
assert(faction.id !== item.id, "IDs are unique");

// Summary
console.log(`\n═══ Result: ${passed}/${passed + failed} passed ═══`);
if (failed > 0) process.exit(1);
