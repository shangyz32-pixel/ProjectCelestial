// runtime/tests/verify_sprint1.js
// Sprint 1 Verification: 100 Ticks + 10,000 Ticks

import { RuntimeConfig } from "../bootstrap/config.js";
import { World } from "../world/index.js";
import { Kernel } from "../kernel/index.js";
import { Snapshotter } from "../snapshot/index.js";
import { SimulationManager } from "../simulation/index.js";
import { Logger } from "../bootstrap/logger.js";

let passed = 0; let failed = 0;
function assert(condition, label) {
  if (condition) { console.log(`  ✅ ${label}`); passed++; }
  else { console.log(`  ❌ ${label}`); failed++; }
}

async function createWorld(seed) {
  const world = new World({ ...RuntimeConfig.world, seed });
  await world.initialize();
  const kernel = new Kernel(RuntimeConfig, world, new Logger("Test"));
  await kernel.initialize();
  const sim = new SimulationManager(seed);
  await sim.initialize(kernel);
  const snap = new Snapshotter(kernel, RuntimeConfig);
  return { world, kernel, sim, snap };
}

console.log("═══ Sprint 1: 100 Tick Integration ═══\n");
console.log("Booting Runtime...");

const w = await createWorld(42);

// Create NPCs
w.kernel.createEntity("npc", {
  Identity: { name: "陈玄", age: 200 },
  Realm: { realm_id: 5, cultivation_value: 0.7, breakthroughs: 0 },
  HP: { current: 85, max: 100 },
  Stamina: { current: 100, max: 100 },
});
w.kernel.createEntity("npc", {
  Identity: { name: "赵灵儿", age: 180 },
  Realm: { realm_id: 3, cultivation_value: 0.3, breakthroughs: 0 },
  HP: { current: 60, max: 80 },
  Stamina: { current: 100, max: 100 },
});

console.log("Kernel Initialized.");
console.log("Simulation Initialized.");

// Run 100 ticks
let breakthroughs = 0;
const history = [];

for (let t = 1; t <= 100; t++) {
  w.world.tickCount = t;
  w.sim.tick(w.kernel.getWorldTime());
  w.snap.take();

  // Check for breakthroughs
  for (const npc of w.kernel.queryEntities("npc", {}, 100, 0)) {
    const realm = npc.getComponent("Realm");
    if (realm && realm.breakthroughs > 0) {
      breakthroughs = realm.breakthroughs;
    }
  }

  // Record history every 10 ticks
  if (t % 10 === 0 || t === 100) {
    const time = w.kernel.getWorldTime();
    history.push({
      tick: t,
      time: `天历${time.year}-${time.month}-${time.day} ${time.day_phase}`,
      weather: w.world.globalState.weather.get("world"),
      qi: w.world.globalState.qi.get("world"),
      npcs: w.kernel.queryEntities("npc", {}, 100, 0)
        .map(n => ({
          name: n.getComponent("Identity").name,
          age: n.getComponent("Identity").age,
          realm: n.getComponent("Realm").realm_id,
          cv: n.getComponent("Realm").cultivation_value.toFixed(4),
          breakthrough_count: n.getComponent("Realm").breakthroughs,
          stamina: n.getComponent("Stamina").current,
          hp: `${n.getComponent("HP").current}/${n.getComponent("HP").max}`,
        })),
    });
  }
}

console.log("\n═══ 100 Tick Results ═══\n");

// Verification
const npc1 = w.kernel.getEntity("npc_0001");
const npc2 = w.kernel.getEntity("npc_0002");

assert(npc1.getComponent("Identity").age === 300, "陈玄 aged 200→300 (100 ticks)");
assert(npc2.getComponent("Identity").age === 280, "赵灵儿 aged 180→280");
assert(npc1.getComponent("Realm").cultivation_value > 0, "Cultivation system active");

// History
console.log("\nHistory (every 10 ticks):");
for (const h of history.filter((_, i) => i % 3 === 0 || i === history.length - 1)) {
  console.log(`  Tick ${h.tick}: ${h.time} | ${h.weather} | Qi:${h.qi.toFixed(3)}`);
}

assert(history.length >= 10, "10+ history entries recorded");

// Snapshots
const snaps = w.snap.list();
assert(snaps.length >= 100, "100+ snapshots saved");

// Event Log
const events = w.kernel.getEventLog(0);
assert(events.length > 200, "200+ events logged");

// Summary
console.log(`\nBreakthroughs: ${breakthroughs}`);
console.log(`Snapshots: ${snaps.length}`);
console.log(`Events: ${events.length}`);

console.log("\n═══ Sprint 1: 10,000 Tick Stability ═══\n");

const w2 = await createWorld(42);
w2.kernel.createEntity("npc", {
  Identity: { name: "StabilityTest", age: 25 },
  Realm: { realm_id: 1, cultivation_value: 0.1, breakthroughs: 0 },
  HP: { current: 100, max: 100 },
  Stamina: { current: 100, max: 100 },
});

const memStart = process.memoryUsage().heapUsed;
let lastTickTime = Date.now();

for (let t = 1; t <= 10000; t++) {
  w2.world.tickCount = t;
  w2.sim.tick(w2.kernel.getWorldTime());
  if (t % 1000 === 0) w2.snap.take();
}

const memEnd = process.memoryUsage().heapUsed;
const memGrowth = (memEnd - memStart) / 1024 / 1024;

assert(w2.world.tickCount === 10000, "10,000 ticks completed");
assert(memGrowth < 50, `Memory growth < 50MB (actual: ${memGrowth.toFixed(1)}MB)`);

const npc = w2.kernel.getEntity("npc_0001");
assert(npc.getComponent("Identity").age === 10025, "Age advanced correctly");
assert(npc.getComponent("Realm").cultivation_value > 0, "Cultivation survived 10k ticks");

console.log(`Memory growth: ${memGrowth.toFixed(1)}MB`);
console.log(`NPC age: ${npc.getComponent("Identity").age}`);
console.log(`NPC realm: ${npc.getComponent("Realm").realm_id}`);
console.log(`NPC breakthroughs: ${npc.getComponent("Realm").breakthroughs}`);

console.log(`\n═══ Result: ${passed}/${passed + failed} passed ═══`);
console.log("Sprint 1 Complete.");
if (failed > 0) process.exit(1);
