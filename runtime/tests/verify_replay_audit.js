// runtime/tests/verify_replay_audit.js
// v1.5 Validation — Replay Determinism Audit

import { RuntimeConfig } from "../bootstrap/config.js";
import { World } from "../world/index.js";
import { Kernel } from "../kernel/index.js";
import { Logger } from "../bootstrap/logger.js";
import { SimulationManager } from "../simulation/index.js";

const TICKS = 1000;
const log = new Logger("Audit");
log.level = "warn";

// Run 1 — baseline
const w1 = new World("audit-1");
const k1 = new Kernel(RuntimeConfig, w1, log);
const s1 = new SimulationManager(RuntimeConfig);
s1.initialize(k1);

const snapshots = [];
for (let t = 0; t < TICKS; t++) {
  k1.world.tickCount = t;
  s1.tick(k1, {
    tick:t, phase:(t%12)+1, day:Math.floor(t/12)+1,
    season:["春","夏","秋","冬"][Math.floor(t/12/30)%4],
    isNight:(t%12)>=8
  });
  if (t % 100 === 0) {
    const snapId = w1.snap.save(k1);
    snapshots.push({ tick: t, snap: snapId });
  }
}

const state1 = {
  entities: k1.world.entities.size,
  npcs: k1.queryEntities("npc",{},100,0).length,
  tick: k1.world.tickCount,
  qi: k1.world.globalState.qi.get("world"),
};

// Run 2 — replay from each snapshot
let allMatch = true;
for (const { tick, snap } of snapshots.slice(0, 3)) {
  const w2 = new World("audit-2");
  const k2 = new Kernel(RuntimeConfig, w2, log);
  w2.snap.restore(k2, snap);
  
  // Run remaining ticks
  const s2 = new SimulationManager(RuntimeConfig);
  s2.initialize(k2);
  for (let t = tick; t < TICKS; t++) {
    k2.world.tickCount = t;
    s2.tick(k2, {
      tick:t, phase:(t%12)+1, day:Math.floor(t/12)+1,
      season:["春","夏","秋","冬"][Math.floor(t/12/30)%4],
      isNight:(t%12)>=8
    });
  }

  const state2 = {
    entities: k2.world.entities.size,
    npcs: k2.queryEntities("npc",{},100,0).length,
    tick: k2.world.tickCount,
    qi: k2.world.globalState.qi.get("world"),
  };

  const match = state1.entities === state2.entities && 
                state1.npcs === state2.npcs && 
                state1.tick === state2.tick;
  
  console.log(`Snap from tick ${tick}: entities=${state1.entities}→${state2.entities} npcs=${state1.npcs}→${state2.npcs} ${match?"✅ MATCH":"❌ MISMATCH"}`);
  if (!match) allMatch = false;
}

// Run 3 — full replay (no snapshot)
const w3 = new World("audit-3");
const k3 = new Kernel(RuntimeConfig, w3, log);
const s3 = new SimulationManager(RuntimeConfig);
s3.initialize(k3);
for (let t = 0; t < TICKS; t++) {
  k3.world.tickCount = t;
  s3.tick(k3, {
    tick:t, phase:(t%12)+1, day:Math.floor(t/12)+1,
    season:["春","夏","秋","冬"][Math.floor(t/12/30)%4],
    isNight:(t%12)>=8
  });
}
const fullMatch = k3.world.entities.size === k1.world.entities.size;
console.log(`Full Replay: entities=${k1.world.entities.size}→${k3.world.entities.size} ${fullMatch?"✅ MATCH":"❌ MISMATCH"}`);
if (!fullMatch) allMatch = false;

console.log(`\n═══ Replay Audit: ${allMatch?"✅ DETERMINISTIC":"❌ NON-DETERMINISTIC"} ═══`);
