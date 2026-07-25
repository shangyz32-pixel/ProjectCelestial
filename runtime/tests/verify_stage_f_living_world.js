// runtime/tests/verify_stage_f_living_world.js
// Stage F: Living World Verification
// Boot → Login → Logout → World continues → Rejoin → Verify changes

import { RuntimeConfig } from "../bootstrap/config.js";
import { World } from "../world/index.js";
import { Kernel } from "../kernel/index.js";
import { Snapshotter } from "../snapshot/index.js";
import { SimulationManager } from "../simulation/index.js";
import { HistorySystem } from "../history/index.js";
import { Logger } from "../bootstrap/logger.js";

let p=0,f=0;
function ok(c,l){if(c){console.log(`  ✅ ${l}`);p++}else{console.log(`  ❌ ${l}`);f++}}

console.log("═══ Stage F: Living World Verification ═══\n");

// ═══ Boot World ═══
console.log("1. Boot World");
const world = new World({...RuntimeConfig.world, seed:42});
await world.initialize();
const kernel = new Kernel(RuntimeConfig, world, new Logger("F"));
await kernel.initialize();
const sim = new SimulationManager(42);
await sim.initialize(kernel);
const snap = new Snapshotter(kernel, RuntimeConfig);
const history = new HistorySystem(kernel);

// Create NPCs — the world's inhabitants
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
ok(world.tickCount === 0, "World booted at Tick 0");

// ═══ Player Login ═══
console.log("\n2. Player Login");
const player = kernel.createEntity("player", {
  Identity: { name: "凌风", age: 20 },
  Realm: { realm_id: 1, cultivation_value: 0.1, breakthroughs: 0 },
  HP: { current: 100, max: 100 },
  Stamina: { current: 100, max: 100 },
  Location: { area: "area_bamboo_grove", last_active_tick: 0 },
  Inventory: { items: {} },
});
ok(player !== null, "Player joined the world");

// Record initial state
const npcNamesInitial = kernel.queryEntities("npc", {}, 100, 0)
  .map(n => n.getComponent("Identity").name);
const chenxuanAgeInitial = kernel.getEntity("npc_0001").getComponent("Identity").age;
ok(chenxuanAgeInitial === 200, "陈玄 initial age: 200");

// ═══ Player Logout — World Continues ═══
console.log("\n3. Player Logout — World Continues Running");

// Record logout tick
const logoutTick = world.tickCount;
const npcAgesBefore = {};
for (const n of kernel.queryEntities("npc", {}, 100, 0)) {
  npcAgesBefore[n.id] = n.getComponent("Identity").age;
}

// Simulate 500 ticks WITHOUT player
console.log(`   Running 500 ticks without player...`);
for (let t = 1; t <= 500; t++) {
  world.tickCount++;
  sim.tick(kernel.getWorldTime());
  if (t % 100 === 0) {
    const time = kernel.getWorldTime();
    history.record(world.tickCount, time,
      world.globalState.weather.get("world"),
      world.globalState.qi.get("world")
    );
    snap.take();
  }
}
const rejoinTick = world.tickCount;
const elapsed = rejoinTick - logoutTick;
ok(elapsed === 500, `500 ticks elapsed while player was away`);

// ═══ World Changed ═══
console.log("\n4. Verify World Changed While Player Was Away");

// NPCs aged
for (const n of kernel.queryEntities("npc", {}, 100, 0)) {
  const ageBefore = npcAgesBefore[n.id] || 0;
  const ageNow = n.getComponent("Identity").age;
  ok(ageNow > ageBefore, `${n.getComponent("Identity").name}: aged (${ageBefore} → ${ageNow})`);
}

// Events were generated
const eventsAfterLogout = kernel.getEventLog(logoutTick);
ok(eventsAfterLogout.length > 100, `${eventsAfterLogout.length} events generated after logout`);

// Weather changed
ok(kernel.world.globalState.weather.get("world") !== undefined, "Weather system continued");

// Economy changed
const prices = world.globalState.economy.priceTable;
ok(Object.keys(prices).length > 0, "Economy continued evolving");

// ═══ Player Rejoin ═══
console.log("\n5. Player Rejoin — Receive World Change Summary");

// Simulate the rejoin API
const loc = player.getComponent("Location") || {};
const lastTick = loc.last_active_tick || 0;
const elapsedTicks = rejoinTick - lastTick;
kernel.updateComponent(player.id, "Location", { ...loc, last_active_tick: rejoinTick }, player.version);

ok(elapsedTicks >= 500, `Time elapsed: ${elapsedTicks} 天`);
ok(rejoinTick > logoutTick, "World tick advanced: the world did not wait");

// ═══ Save, Restore, Replay ═══
console.log("\n6. Snapshot + Restore + Replay");

const finalSnap = snap.take("STAGE_F_FINAL");
const beforeHash = JSON.stringify([...world.entities.values()].map(e => e.id).sort());
snap.restore(finalSnap.snapshot_id);
const afterHash = JSON.stringify([...world.entities.values()].map(e => e.id).sort());
ok(beforeHash === afterHash, "Snapshot restore consistent");
ok(world.tickCount === rejoinTick, "Tick preserved after restore");

// ═══ Summary ═══
console.log("\n═══ Living World Summary ═══");
const finalNpcs = kernel.queryEntities("npc", {}, 100, 0);
for (const n of finalNpcs) {
  const id = n.getComponent("Identity");
  const realm = n.getComponent("Realm");
  console.log(`  ${id.name}: age=${id.age} realm=Lv${realm.realm_id} breakthroughs=${realm.breakthroughs}`);
}
console.log(`  Player: 离开了 ${elapsed} 天`);
console.log(`  Events: ${eventsAfterLogout.length} 新事件`);
console.log(`  Weather: ${kernel.world.globalState.weather.get("world")}`);
console.log(`  Qi: ${kernel.world.globalState.qi.get("world")?.toFixed(3)}`);

console.log(`\n═══ Result: ${p}/${p+f} passed ═══`);
if (f > 0) process.exit(1);
console.log("\nStage F: Living World ✓ VERIFIED");
console.log("The world continued living while the player was gone.");
