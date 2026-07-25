// runtime/tests/verify_simulation.js
// Simulation Engine Verification: Determinism + World Evolution

import { RuntimeConfig } from "../bootstrap/config.js";
import { World } from "../world/index.js";
import { Kernel } from "../kernel/index.js";
import { Snapshotter } from "../snapshot/index.js";
import { ReplayEngine } from "../replay/index.js";
import { SimulationEngine } from "../simulation/index.js";
import { Logger } from "../bootstrap/logger.js";

let passed = 0; let failed = 0;
function assert(condition, label) {
  if (condition) { console.log(`  ✅ ${label}`); passed++; }
  else { console.log(`  ❌ ${label}`); failed++; }
}

console.log("═══ Simulation Engine Verification ═══\n");

async function createWorld(seed) {
  const world = new World({ ...RuntimeConfig.world, seed });
  await world.initialize();
  const kernel = new Kernel(RuntimeConfig, world, new Logger("Test"));
  await kernel.initialize();
  const sim = new SimulationEngine(seed);
  const snap = new Snapshotter(kernel, RuntimeConfig);
  return { world, kernel, sim, snap };
}

// Test 1: NPC lifecycle — create NPCs, run 10 ticks
console.log("1. NPC Lifecycle (10 Ticks)");
const w1 = await createWorld(42);
w1.kernel.createEntity("npc", {
  Identity: { name: "陈玄", age: 200 },
  Realm: { realm_id: 5, cultivation_value: 0.7 },
  HP: { current: 85, max: 100 },
});
w1.kernel.createEntity("npc", {
  Identity: { name: "赵灵儿", age: 180 },
  Realm: { realm_id: 6, cultivation_value: 0.3 },
  HP: { current: 60, max: 80 },
});

for (let t = 1; t <= 10; t++) {
  w1.world.tickCount = t;
  w1.sim.tick(w1.kernel, w1.kernel.getWorldTime());
  w1.snap.take();
}

const npc1 = w1.kernel.getEntity("npc_0001");
assert(npc1 !== null, "NPC1 exists after 10 ticks");
assert(npc1.getComponent("Identity").age === 210, "陈玄 aged 200→210");
assert(npc1.getComponent("Realm").cultivation_value > 0.7, "Cultivation progressed");

const npc2 = w1.kernel.getEntity("npc_0002");
assert(npc2.getComponent("Identity").age === 190, "赵灵儿 aged 180→190");

// Test 2: Weather cycles (separate world)
console.log("\n2. Weather Cycle");
const weathers = new Set();
const w2 = await createWorld(42);
for (let t = 0; t < 50; t++) {
  w2.world.tickCount += 1;
  w2.sim.tick(w2.kernel, w2.kernel.getWorldTime());
  weathers.add(w2.world.globalState.weather.get("world"));
}
assert(weathers.size >= 2, `Multiple weather states: ${[...weathers].join(",")}`);

// Test 3: Economy prices change
console.log("\n3. Economy Evolution");
const prices = w1.world.globalState.economy.priceTable;
assert(prices.spirit_stone !== 100, "Spirit stone price changed from baseline");
assert(Object.keys(prices).length >= 3, "Multiple items tracked");

// Test 4: Determinism — same seed → same result
console.log("\n4. Determinism (same seed → same world)");
const wA = await createWorld(42);
const wB = await createWorld(42);

wA.kernel.createEntity("npc", { Identity: { name: "Test", age: 25 }, Realm: { realm_id: 1, cultivation_value: 0.1 }, HP: { current: 100, max: 100 } });
wB.kernel.createEntity("npc", { Identity: { name: "Test", age: 25 }, Realm: { realm_id: 1, cultivation_value: 0.1 }, HP: { current: 100, max: 100 } });

for (let t = 1; t <= 5; t++) {
  wA.world.tickCount = t; wB.world.tickCount = t;
  wA.sim.tick(wA.kernel, wA.kernel.getWorldTime());
  wB.sim.tick(wB.kernel, wB.kernel.getWorldTime());
}

const npcA = wA.kernel.getEntity("npc_0001");
const npcB = wB.kernel.getEntity("npc_0001");

const ageA = npcA.getComponent("Identity").age;
const ageB = npcB.getComponent("Identity").age;
const cvA = npcA.getComponent("Realm").cultivation_value;
const cvB = npcB.getComponent("Realm").cultivation_value;

assert(ageA === ageB, `Age identical: ${ageA} === ${ageB}`);
assert(Math.abs(cvA - cvB) < 1e-10, `Cultivation identical: ${cvA.toFixed(6)} === ${cvB.toFixed(6)}`);

// Test 5: Different seed → different result
console.log("\n5. Different seed → different world");
const wC = await createWorld(999);
wC.kernel.createEntity("npc", { Identity: { name: "Test", age: 25 }, Realm: { realm_id: 1, cultivation_value: 0.1 }, HP: { current: 100, max: 100 } });
for (let t = 1; t <= 5; t++) {
  wC.world.tickCount = t;
  wC.sim.tick(wC.kernel, wC.kernel.getWorldTime());
}
const npcC = wC.kernel.getEntity("npc_0001");
const cvC = npcC.getComponent("Realm").cultivation_value;
assert(Math.abs(cvA - cvC) > 1e-6, "Different seeds produce different cultivation");

// Test 6: Snapshot + Restore → continue
console.log("\n6. Snapshot/Restore Continuity");
const snapId = w1.snap.list().slice(-1)[0];
const hpBefore = npc1.getComponent("HP").current;
w1.snap.restore(snapId);
const npcRestored = w1.kernel.getEntity("npc_0001");
assert(npcRestored.getComponent("HP").current === hpBefore, "HP preserved across restore");

// Test 7: Replay produces same state
console.log("\n7. Replay Determinism");
const replayEng = new ReplayEngine(w1.kernel, w1.snap);
const snapshots = w1.snap.list();
const r1 = replayEng.replay(snapshots[0], 10);
const cvAfterReplay = w1.kernel.getEntity("npc_0001").getComponent("Realm").cultivation_value;
assert(cvAfterReplay > 0.7, "Replay restores cultivation state");
assert(r1.events_replayed > 0, "Events were replayed");

// Summary
console.log(`\n═══ Result: ${passed}/${passed + failed} passed ═══`);
if (failed > 0) process.exit(1);
