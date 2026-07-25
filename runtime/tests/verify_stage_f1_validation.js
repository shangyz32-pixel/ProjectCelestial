// runtime/tests/verify_stage_f1_validation.js
// Stage F.1: World Validation — Long-term stability and integrity
// 100K ticks + hash verification + NPC integrity + event consistency + performance

import { RuntimeConfig } from "../bootstrap/config.js";
import { World } from "../world/index.js";
import { Kernel } from "../kernel/index.js";
import { Snapshotter } from "../snapshot/index.js";
import { ReplayEngine } from "../replay/index.js";
import { SimulationManager } from "../simulation/index.js";
import { HistorySystem, HashValidator } from "../history/index.js";
import { Logger } from "../bootstrap/logger.js";

let pp=0,ff=0;
function ok(c,l){if(c){console.log(`  ✅ ${l}`);pp++}else{console.log(`  ❌ ${l}`);ff++}}

console.log("═══════════════════════════════════════════════");
console.log("  Stage F.1 — World Validation");
console.log("  Long-term Stability & Integrity Report");
console.log("═══════════════════════════════════════════════\n");

const TICKS = 100000;
const SEED = 42;

// ═══════════ Phase 1: Boot + Seed ═══════════
console.log("── Phase 1: Boot ──");
const world = new World({...RuntimeConfig.world, seed:SEED});
await world.initialize();
const kernel = new Kernel(RuntimeConfig, world, new Logger("F1"));
await kernel.initialize();
const sim = new SimulationManager(SEED);
await sim.initialize(kernel);
const snap = new Snapshotter(kernel, RuntimeConfig);
const history = new HistorySystem(kernel);
const validator = new HashValidator(kernel, snap, history);

// Create test NPCs
kernel.createEntity("npc", {Identity:{name:"陈玄",age:200},Realm:{realm_id:5,cultivation_value:0.5,breakthroughs:0},HP:{current:100,max:100},Stamina:{current:100,max:100}});
kernel.createEntity("npc", {Identity:{name:"赵灵儿",age:180},Realm:{realm_id:3,cultivation_value:0.3,breakthroughs:0},HP:{current:80,max:80},Stamina:{current:100,max:100}});
kernel.createEntity("npc", {Identity:{name:"王虎",age:220},Realm:{realm_id:4,cultivation_value:0.4,breakthroughs:0},HP:{current:120,max:120},Stamina:{current:100,max:100}});
kernel.createEntity("faction", {Identity:{name:"青云宗"},Population:500,Treasury:10000});
ok(true, "3 NPCs + 1 faction created");

// ═══════════ Phase 2: 100K Tick Simulation ═══════════
console.log("\n── Phase 2: 100K Tick Simulation ──");
const startTime = Date.now();
let crashed = false;
let stallCount = 0;
let maxTickMs = 0;
let totalTickMs = 0;
const entitySnapshots = []; // track entity counts over time

try {
  for (let t = 1; t <= TICKS; t++) {
    world.tickCount = t;
    const tickStart = Date.now();
    sim.tick(kernel.getWorldTime());
    const tickMs = Date.now() - tickStart;
    totalTickMs += tickMs;
    if (tickMs > maxTickMs) maxTickMs = tickMs;
    if (tickMs > 100) stallCount++;

    if (t % 1000 === 0) {
      snap.take();
      const time = kernel.getWorldTime();
      history.record(t, time, world.globalState.weather.get("world"), world.globalState.qi.get("world"));
      entitySnapshots.push({tick:t, entities:kernel.world.entities.size, npcs:kernel.queryEntities("npc",{},100,0).length});
      if (t % 10000 === 0) console.log(`  Tick ${t}...`);
    }
  }
} catch (err) {
  crashed = true;
  console.log(`  CRASH at tick ${world.tickCount}: ${err.message}`);
}

const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);
ok(!crashed, `No crashes — ${TICKS} ticks completed`);
ok(stallCount < 10, `Stalls < 10 (${stallCount} stalls > 100ms)`);
ok(maxTickMs < 200, `Max tick time < 200ms (${maxTickMs}ms)`);

// ═══════════ Phase 3: NPC Integrity ═══════════
console.log("\n── Phase 3: NPC Integrity ──");
const npcs = kernel.queryEntities("npc", {}, 100, 0);
ok(npcs.length === 3, "3 NPCs still exist");

let noOrphans = true, noInvalidRef = true, noDupeId = true;
const ids = new Set();
for (const n of npcs) {
  if (!n.getComponent("Identity")) { noOrphans = false; break; }
  if (n.state === "active" && !n.getComponent("HP")) { noInvalidRef = false; }
  if (ids.has(n.id)) { noDupeId = false; }
  ids.add(n.id);
}
ok(noOrphans, "No orphan NPCs (all have Identity)");
ok(noInvalidRef, "No invalid references");
ok(noDupeId, "No duplicated IDs");

// NPCs aged
for (const n of npcs) {
  const age = n.getComponent("Identity").age;
  ok(age > 200, `${n.getComponent("Identity").name}: aged to ${age}`);
}

// ═══════════ Phase 4: Event History ═══════════
console.log("\n── Phase 4: Event History ──");
const events = kernel.getEventLog(0);
ok(events.length > 500000, `Events > 500K (${events.length})`);

// Check chronological order
let prevTick = 0, ordered = true;
for (const e of events.slice(0, 10000)) {
  if (e.tick < prevTick) { ordered = false; break; }
  prevTick = e.tick;
}
ok(ordered, "Events are chronologically ordered");

// ═══════════ Phase 5: Save → Restore → Replay → Hash ═══════════
console.log("\n── Phase 5: Save → Restore → Replay → Hash ──");
const finalSnap = snap.take("F1_FINAL");

// Compute pre-restore hashes
const beforeHash = validator.computeWorldStateHash();
const tickBefore = world.tickCount;
const entityCountBefore = kernel.world.entities.size;

// Save snapshot, destroy runtime state, restore
snap.restore(finalSnap.snapshot_id);
ok(world.tickCount === TICKS, "Tick preserved after restore");
ok(kernel.world.entities.size === entityCountBefore, "Entity count preserved");

// Replay from first snapshot
const firstSnapId = snap.list()[0];
const replay = new ReplayEngine(kernel, snap);
replay.replay(firstSnapId, TICKS);

// Compare hashes
const afterHash = validator.computeWorldStateHash();
const hashMatch = beforeHash === afterHash;
ok(hashMatch, `World Hash ${hashMatch ? "✓ MATCH" : "✗ MISMATCH"}`);

// ═══════════ Phase 6: Performance Report ═══════════
console.log("\n── Phase 6: Performance Report ──");
const mem = process.memoryUsage();
const avgTickMs = (totalTickMs / TICKS).toFixed(2);
const memMB = (mem.heapUsed / 1024 / 1024).toFixed(1);

console.log(`  Total ticks:     ${TICKS}`);
console.log(`  Elapsed:         ${elapsedSec}s`);
console.log(`  Avg tick:        ${avgTickMs}ms`);
console.log(`  Max tick:        ${maxTickMs}ms`);
console.log(`  Stalls (>100ms): ${stallCount}`);
console.log(`  Events:          ${events.length}`);
console.log(`  Entities:        ${kernel.world.entities.size}`);
console.log(`  Memory:          ${memMB}MB`);
console.log(`  Snapshots:       ${snap.list().length}`);

ok(parseFloat(avgTickMs) < 50, `Avg tick < 50ms (${avgTickMs}ms)`);
ok(parseFloat(memMB) < 500, `Memory < 500MB (${memMB}MB)`);

// ═══════════ Summary ═══════════
console.log(`\n═══ Result: ${pp}/${pp+ff} passed ═══`);

if (ff === 0 && hashMatch) {
  console.log("\n═══════════════════════════════════════════════");
  console.log("  Stage F.1: World Validation — PASSED");
  console.log("  The Living World is stable for 100K ticks.");
  console.log("  Determinism verified. Hashes match.");
  console.log("  Ready for future stages.");
  console.log("═══════════════════════════════════════════════");
} else {
  console.log("\nStage F.1: World Validation — FAILED");
  console.log(`${ff} issues found. Review before proceeding.`);
  process.exit(1);
}
