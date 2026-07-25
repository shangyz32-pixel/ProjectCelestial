// runtime/scheduler/index.js
// Tick Scheduler — deterministic world heartbeat.
// Follows: /specs/TIME_SPEC.md, /canon/simulation_engine_runtime.yaml
//
// Fixed order: Time → Weather → Qi → Ecology → NPC → Economy → Faction → War → Events → Snapshot
// For Sprint 0 M2: Time + placeholder systems only.

import { Logger } from "../bootstrap/logger.js";
import { TimeService } from "../time/index.js";

export class Scheduler {
  // @source: simulation_engine_runtime.yaml — 10-step fixed order
  static SYSTEM_ORDER = [
    "time",
    "weather",
    "qi",
    "ecology",
    "npc",
    "economy",
    "faction",
    "war",
    "events",
    "snapshot",
  ];

  constructor(config, kernel, log) {
    this.config = config;
    this.kernel = kernel;
    this.log = log || new Logger("Scheduler");

    this.timeService = new TimeService(config, log.child("Time"));
    this.systems = new Map();       // name → system object
    this.state = "stopped";         // stopped | running | paused
    this.interval = config.time.tick_ms;
    this._timer = null;
  }

  // Register a system. Systems execute in Scheduler.SYSTEM_ORDER.
  registerSystem(name, system) {
    if (!Scheduler.SYSTEM_ORDER.includes(name)) {
      this.log.warn(`System "${name}" not in standard order — registered as custom`);
    }
    this.systems.set(name, system);
    this.log.debug(`System registered: ${name}`);
  }

  // Start the tick loop
  async start() {
    this.state = "running";
    this.log.info(`Tick Scheduler Started. (interval: ${this.interval}ms)`);
    this._tick();  // first tick immediately, then setInterval
    this._timer = setInterval(() => this._tick(), this.interval);
  }

  // Execute one complete Tick — 10 steps, fixed order, never skip.
  async _tick() {
    if (this.state !== "running") return;

    const tickNumber = this.kernel.getTickCount() + 1;
    this.log.info(`─── Tick ${tickNumber} ───`);

    // Step 01: Time (always first)
    this.timeService.advance();
    this.kernel.world.tickCount = this.timeService.getTick();

    // Steps 02-10: Execute systems in fixed order
    for (const name of Scheduler.SYSTEM_ORDER) {
      if (name === "time") continue; // already done
      const system = this.systems.get(name);
      if (system && system.tick) {
        try {
          await system.tick(this.kernel, this.timeService.getTime());
        } catch (err) {
          this.log.error(`System "${name}" tick failed: ${err.message}`);
          // @source: No silent failure — propagate error
        }
      }
    }

    this.log.debug(`Tick ${tickNumber} complete.`);
  }

  // Pause simulation
  pause() {
    this.state = "paused";
    if (this._timer) clearInterval(this._timer);
    this.log.info("Tick Scheduler Paused.");
  }

  // Resume simulation
  resume() {
    if (this.state === "paused") {
      this.state = "running";
      this._timer = setInterval(() => this._tick(), this.interval);
      this.log.info("Tick Scheduler Resumed.");
    }
  }

  // Stop and cleanup
  stop() {
    this.state = "stopped";
    if (this._timer) clearInterval(this._timer);
    this.log.info("Tick Scheduler Stopped.");
  }
}
