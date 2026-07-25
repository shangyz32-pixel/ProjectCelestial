// runtime/bootstrap/index.js
// Project Celestial Runtime — Entry Point
// Sprint 0, Milestone 1+2: World Boot + Tick Scheduler
//
// $ node runtime

import { RuntimeConfig } from "./config.js";
import { World } from "../world/index.js";
import { Kernel } from "../kernel/index.js";
import { Scheduler } from "../scheduler/index.js";
import { Logger } from "./logger.js";

async function boot() {
  const log = new Logger("Bootstrap");

  log.info("═══════════════════════════════════════");
  log.info("  Project Celestial Runtime v1.0.0");
  log.info("  Persistent Universe Runtime");
  log.info("═══════════════════════════════════════");
  log.info(`  Mode:  ${RuntimeConfig.runtime.mode}`);

  // Phase 1: World
  log.info("[1/4] Loading World...");
  const world = new World(RuntimeConfig.world, log.child("World"));
  await world.initialize();

  // Phase 2: Kernel
  log.info("[2/4] Initializing Kernel...");
  const kernel = new Kernel(RuntimeConfig, world, log.child("Kernel"));
  await kernel.initialize();

  // Phase 3: Scheduler
  log.info("[3/4] Starting Tick Scheduler...");
  const scheduler = new Scheduler(RuntimeConfig, kernel, log.child("Scheduler"));

  // Register placeholder systems (M3+: real implementations)
  scheduler.registerSystem("weather", { tick: async () => {} });
  scheduler.registerSystem("qi",      { tick: async () => {} });
  scheduler.registerSystem("ecology", { tick: async () => {} });
  scheduler.registerSystem("npc",     { tick: async () => {} });
  scheduler.registerSystem("economy", { tick: async () => {} });
  scheduler.registerSystem("faction", { tick: async () => {} });
  scheduler.registerSystem("war",     { tick: async () => {} });
  scheduler.registerSystem("events",  { tick: async () => {} });
  scheduler.registerSystem("snapshot",{ tick: async () => {} });

  // Phase 4: Run
  log.info("[4/4] Runtime Ready. World is running...");
  log.info("═══════════════════════════════════════");

  await scheduler.start();

  // Graceful shutdown
  const shutdown = async () => {
    log.info("Shutting down...");
    scheduler.stop();
    await kernel.shutdown();
    log.info("Runtime stopped.");
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

boot().catch((err) => {
  console.error("FATAL:", err);
  process.exit(1);
});
