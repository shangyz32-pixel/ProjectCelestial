// runtime/tests/verify_perf_100k.js
// v2.0 Performance stress test — 100,000 ticks with all 26 systems

import { RuntimeConfig } from "../bootstrap/config.js";
import { World } from "../world/index.js";
import { Kernel } from "../kernel/index.js";
import { Logger } from "../bootstrap/logger.js";
import { SimulationManager } from "../simulation/index.js";

const TARGET = 100000;
const world = new World("perf-test");
const log = new Logger("Perf");
log.level = "warn";

const kernel = new Kernel(RuntimeConfig, world, log);
const sim = new SimulationManager(RuntimeConfig);
sim.initialize(kernel);
log.info("Starting 100K tick performance test...");
log.info("Systems:", sim.systems.map(s => s.name).join(", "));

const start = Date.now();
const startMem = process.memoryUsage().rss / 1024 / 1024;

let lastReport = 0;
for (let tick = 0; tick < TARGET; tick++) {
  kernel.world.tickCount = tick;
  const time = {
    tick, phase: (tick % 12) + 1,
    day: Math.floor(tick / 12) + 1,
    season: ["春","夏","秋","冬"][Math.floor(tick / 12 / 30) % 4],
    isNight: (tick % 12) >= 8,
  };
  sim.tick(kernel, time);

  if (tick > 0 && tick % 10000 === 0) {
    const elapsed = (Date.now() - start) / 1000;
    const mem = process.memoryUsage().rss / 1024 / 1024;
    const entities = kernel.queryEntities("npc", {}, 100, 0).length;
    const plants = kernel.queryEntities("plant", {}, 100, 0).length;
    const animals = kernel.queryEntities("animal", {}, 100, 0).length;
    const beasts = kernel.queryEntities("spirit_beast", {}, 100, 0).length;
    const settlements = kernel.queryEntities("settlement", {}, 10, 0).length;
    console.log(`Tick ${tick} | ${elapsed.toFixed(1)}s | ${mem.toFixed(0)}MB | NPC:${entities} P:${plants} A:${animals} B:${beasts} S:${settlements}`);
    lastReport = tick;
  }
}

const elapsed = (Date.now() - start) / 1000;
const mem = process.memoryUsage().rss / 1024 / 1024;
const ticksPerSec = Math.round(TARGET / elapsed);
const allEntities = [
  kernel.queryEntities("npc", {}, 100, 0).length,
  kernel.queryEntities("plant", {}, 100, 0).length,
  kernel.queryEntities("animal", {}, 100, 0).length,
  kernel.queryEntities("spirit_beast", {}, 100, 0).length,
  kernel.queryEntities("monster", {}, 100, 0).length,
  kernel.queryEntities("settlement", {}, 10, 0).length,
].reduce((s, v) => s + v, 0);

const events = kernel.getEventLog(0)?.length || 0;
const chronicle = (kernel.world.globalState.chronicle || []).length;
const rumors = (kernel.world.globalState.rumors || []).length;

console.log(`
═══ 100K Tick Performance v2.0 ═══
Ticks:     ${TARGET}
Duration:  ${elapsed.toFixed(1)}s
Speed:     ${ticksPerSec} ticks/sec
Memory:    ${startMem.toFixed(0)}MB → ${mem.toFixed(0)}MB
Entities:  ${allEntities} total
Events:    ${events}
Chronicle: ${chronicle} entries
Rumors:    ${rumors} active
Result:    ${ticksPerSec > 200 ? "✅ PASS" : "❌ FAIL"}
`);
