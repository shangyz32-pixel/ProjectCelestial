// web/start.js
// World Observer — Boot Runtime + Web Server
// $ node web/start.js

import { RuntimeConfig } from "../runtime/bootstrap/config.js";
import { World } from "../runtime/world/index.js";
import { Kernel } from "../runtime/kernel/index.js";
import { Snapshotter } from "../runtime/snapshot/index.js";
import { SimulationManager } from "../runtime/simulation/index.js";
import { HistorySystem } from "../runtime/history/index.js";
import { Logger } from "../runtime/bootstrap/logger.js";
import { createObserverServer } from "./server.js";

const log = new Logger("Observer");
const PORT = 3000;

log.info("═══════════════════════════════════════");
log.info("  Project Celestial — World Observer");
log.info("═══════════════════════════════════════");

// Boot Runtime
const world = new World(RuntimeConfig.world, log.child("World"));
await world.initialize();

const kernel = new Kernel(RuntimeConfig, world, log.child("Kernel"));
await kernel.initialize();

const sim = new SimulationManager(RuntimeConfig.world.seed);
await sim.initialize(kernel);

const snap = new Snapshotter(kernel, RuntimeConfig, log.child("Snapshot"));
const history = new HistorySystem(kernel);

// Create some starter NPCs if world is empty
if (kernel.queryEntities("npc", {}, 100, 0).length === 0) {
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
  log.info("Created 3 starter NPCs");
}

// Auto-advance simulation every 2 seconds
let autoTimer = null;

function startAuto() {
  if (autoTimer) return;
  autoTimer = setInterval(() => {
    if (sim.state === "running") {
      kernel.world.tickCount++;
      sim.tick(kernel.getWorldTime());
      if (kernel.world.tickCount % 10 === 0) {
        const t = kernel.getWorldTime();
        history.record(kernel.world.tickCount, t,
          world.globalState.weather.get("world"),
          world.globalState.qi.get("world")
        );
        snap.take();
      }
    }
  }, 2000);
}

startAuto();

// Start web server
const server = createObserverServer(kernel, sim, snap, history, RuntimeConfig);
server.listen(PORT, () => {
  log.info(`Observer ready at http://localhost:${PORT}`);
  log.info(`Dev Console at http://localhost:${PORT}/console.html`);
  log.info("Runtime is running. Browser is the window.");
});
