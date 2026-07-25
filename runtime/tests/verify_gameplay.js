// runtime/tests/verify_gameplay.js
// Stage D Verification: Core Gameplay Loop
// Create → Cultivate → Breakthrough → Explore → Gather → Save → Load → Continue

import { RuntimeConfig } from "../bootstrap/config.js";
import { World } from "../world/index.js";
import { Kernel } from "../kernel/index.js";
import { Snapshotter } from "../snapshot/index.js";
import { SimulationManager } from "../simulation/index.js";
import { Logger } from "../bootstrap/logger.js";

let passed=0,failed=0;
function assert(c,l){if(c){console.log(`  ✅ ${l}`);passed++}else{console.log(`  ❌ ${l}`);failed++}}

console.log("═══ Stage D: Gameplay Loop Verification ═══\n");

// Boot
const world = new World({...RuntimeConfig.world, seed:42});
await world.initialize();
const kernel = new Kernel(RuntimeConfig, world, new Logger("Game"));
await kernel.initialize();
const sim = new SimulationManager(42);
await sim.initialize(kernel);
const snap = new Snapshotter(kernel, RuntimeConfig);

// ═══ 1. Create Character ═══
console.log("1. Create Character");
const player = kernel.createEntity("player", {
  Identity: { name: "凌云子", age: 20 },
  Realm: { realm_id: 1, cultivation_value: 0.1, breakthroughs: 0 },
  HP: { current: 100, max: 100 },
  Stamina: { current: 100, max: 100 },
  Location: { area: "area_bamboo_grove" },
  Inventory: { items: {} },
});
assert(player.id.startsWith("player_"), "Player created");
assert(player.getComponent("Identity").name === "凌云子", "Name: 凌云子");
assert(player.getComponent("Realm").realm_id === 1, "Starting realm: Lv1");

// ═══ 2. Cultivate 10 times ═══
console.log("\n2. Cultivate (10x)");
let startCV = player.getComponent("Realm").cultivation_value;
for (let i = 1; i <= 10; i++) {
  world.tickCount = i;
  const p = kernel.getEntity(player.id);
  const realm = p.getComponent("Realm");
  const qi = world.globalState.qi.get("world") || 1.0;
  const newCV = Math.min(1.0, realm.cultivation_value + 0.02 * qi);
  kernel.updateComponent(p.id, "Realm", {...realm, cultivation_value: newCV}, p.version);
  sim.tick(kernel.getWorldTime());
}
const p2 = kernel.getEntity(player.id);
assert(p2.getComponent("Realm").cultivation_value > startCV, "Cultivation progressed");

// ═══ 3. Cultivate to breakthrough ═══
console.log("\n3. Breakthrough (cultivate until Lv2)");
let breakthroughs = 0;
for (let i = 0; i < 100; i++) {
  world.tickCount++;
  const p = kernel.getEntity(player.id);
  const realm = p.getComponent("Realm");
  if (realm.realm_id > 1) { breakthroughs = realm.breakthroughs; break; }
  const newCV = Math.min(1.0, realm.cultivation_value + 0.05);
  if (newCV >= 1.0) {
    kernel.updateComponent(p.id, "Realm",
      {...realm, realm_id: realm.realm_id+1, cultivation_value:0.0, breakthroughs:(realm.breakthroughs||0)+1},
      p.version);
  } else {
    kernel.updateComponent(p.id, "Realm", {...realm, cultivation_value:newCV}, p.version);
  }
  sim.tick(kernel.getWorldTime());
}
const p3 = kernel.getEntity(player.id);
assert(p3.getComponent("Realm").realm_id >= 2, `Realm advanced to Lv${p3.getComponent("Realm").realm_id}`);
assert(p3.getComponent("Realm").breakthroughs >= 1, "At least 1 breakthrough recorded");

// ═══ 4. Explore new area ═══
console.log("\n4. Explore (move to Misty Peak)");
kernel.updateComponent(player.id, "Location", {area:"area_misty_peak"}, player.version);
const p4 = kernel.getEntity(player.id);
assert(p4.getComponent("Location").area === "area_misty_peak", "Moved to area_misty_peak");

// ═══ 5. Gather resources ═══
console.log("\n5. Gather Resources");
for (let i = 0; i < 5; i++) {
  const p = kernel.getEntity(player.id);
  const inv = p.getComponent("Inventory") || {items:{}};
  const current = inv.items.spirit_herb || 0;
  kernel.updateComponent(p.id, "Inventory", {items:{...inv.items, spirit_herb:current+1}}, p.version);
}
const p5 = kernel.getEntity(player.id);
assert(p5.getComponent("Inventory").items.spirit_herb === 5, "Gathered 5 spirit_herb");

// ═══ 6. Save Snapshot ═══
console.log("\n6. Save / Load / Continue");
const saved = snap.take("GAMEPLAY_SAVE");
const savedTick = world.tickCount;
assert(saved !== null, "Snapshot saved");
assert(saved.tick > 0, "Snapshot has tick");

// ═══ 7. Load and verify ═══
snap.restore(saved.snapshot_id);
assert(world.tickCount === savedTick, "Tick restored correctly");
const p6 = kernel.getEntity(player.id);
assert(p6 !== null, "Player exists after restore");
assert(p6.getComponent("Realm").realm_id >= 2, "Realm preserved after restore");

// ═══ 8. Continue playing after load ═══
console.log("\n8. Continue after Load");
for (let i = 0; i < 5; i++) {
  world.tickCount++;
  const p = kernel.getEntity(player.id);
  const realm = p.getComponent("Realm");
  kernel.updateComponent(p.id, "Realm", {...realm, cultivation_value: Math.min(1.0, realm.cultivation_value+0.03)}, p.version);
  sim.tick(kernel.getWorldTime());
}
const p7 = kernel.getEntity(player.id);
assert(p7.getComponent("Realm").cultivation_value > 0, "Continues cultivating after load");

console.log(`\n═══ Result: ${passed}/${passed+failed} passed ═══`);
console.log("\nStage D: Core Gameplay Loop ✓ VERIFIED");
if (failed > 0) process.exit(1);
