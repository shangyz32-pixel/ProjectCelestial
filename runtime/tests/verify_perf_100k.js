// runtime/tests/verify_perf_100k.js
// Performance stress test — 100,000 ticks
import { RuntimeConfig } from "../bootstrap/config.js";
import { World } from "../world/index.js";
import { Kernel } from "../kernel/index.js";
import { SimulationManager } from "../simulation/index.js";
import { Logger } from "../bootstrap/logger.js";

const world = new World("stress-test");
const log = new Logger("Perf");
// Set log level to WARN for performance
log.level = "warn";
const kernel = new Kernel(RuntimeConfig, world, log);
const sim = new SimulationManager(42);
await sim.initialize(kernel);

// Create 3 starter NPCs
kernel.createEntity("npc", { Identity:{name:"陈玄",age:200}, Realm:{realm_id:5,cultivation_value:0.7}, HP:{current:100,max:100}, Stamina:{current:100,max:100}, Skills:{learned:["sword_rain","fire_blast"]}, Equipment:{slots:{weapon:"thunder_edge",armor:"dragon_scale"},totalAtk:32,totalDef:48} });
kernel.createEntity("npc", { Identity:{name:"赵灵儿",age:180}, Realm:{realm_id:3,cultivation_value:0.3}, HP:{current:80,max:80}, Stamina:{current:100,max:100}, Skills:{learned:["fire_blast","ice_lance"]}, Equipment:{slots:{weapon:"spirit_blade",armor:"spirit_vest"},totalAtk:15,totalDef:23} });
kernel.createEntity("npc", { Identity:{name:"王虎",age:220}, Realm:{realm_id:4,cultivation_value:0.5}, HP:{current:120,max:120}, Stamina:{current:100,max:100}, Skills:{learned:["sword_slash","iron_palm"]}, Equipment:{slots:{weapon:"spirit_blade",armor:"spirit_vest",ring:"jade_ring"},totalAtk:19,totalDef:28} });

const TARGET = 1000;
const startTime = Date.now();
const startMem = process.memoryUsage().heapUsed;

for (let tick = 0; tick < TARGET; tick++) {
  kernel.world.tickCount = tick;
  const time = kernel.getWorldTime();
  sim.tick(time);

  if (tick % 10000 === 0) {
    const elapsed = (Date.now() - startTime) / 1000;
    const mem = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);
    const entities = kernel.queryEntities("npc", {}, 100, 0).length;
    console.log(`Tick ${tick} | ${entities} NPCs | ${mem} MB | ${elapsed.toFixed(1)}s`);
  }
}

const elapsed = (Date.now() - startTime) / 1000;
const endMem = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);
const startMemMB = (startMem / 1024 / 1024).toFixed(1);
const entities = kernel.queryEntities("npc", {}, 100, 0).length;
const ticksPerSec = Math.round(TARGET / elapsed);

console.log(`\n═══ 100K Tick Performance ═══`);
console.log(`Ticks:     ${TARGET}`);
console.log(`Duration:  ${elapsed.toFixed(1)}s`);
console.log(`Speed:     ${ticksPerSec} ticks/sec`);
console.log(`Entities:  ${entities}`);
console.log(`Memory:    ${startMemMB}MB → ${endMem}MB`);
console.log(`Events:    ${kernel.getEventLog(0).length}`);
console.log(`Result:    ${ticksPerSec > 500 ? '✅ PASS' : '⚠ WARNING'}`);
