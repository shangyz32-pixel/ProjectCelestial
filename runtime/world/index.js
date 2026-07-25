// runtime/world/index.js
// World module — manages World State lifecycle.
// Follows: /specs/WORLD_STATE_SPEC.md

import { Logger } from "../bootstrap/logger.js";

export class World {
  constructor(config, log) {
    this.id = config.world_id;
    this.canonVersion = config.canon_version;
    this.engineVersion = config.engine_version;
    this.seed = config.seed;
    this.log = log || new Logger("World");

    // World State (WORLD_STATE_SPEC)
    this.tickCount = 0;
    this.createdAt = null;
    this.entities = new Map();        // entity_id -> Entity
    this.globalState = {
      time: null,
      weather: new Map(),
      qi: new Map(),
      economy: { priceTable: {}, resourcePool: {} },
      wars: [],
    };
    this.knowledgeGraph = {
      nodes: new Map(),
      edges: new Map(),
    };
    this.eventLog = [];
    this.meta = {};
  }

  async initialize() {
    this.createdAt = new Date().toISOString();

    // Initialize time (TIME_SPEC: 天历纪元)
    this.globalState.time = {
      tick: 0,
      year: 847,
      month: 7,
      day: 23,
      hour: 6,
      day_phase: "dawn",     // 卯时
      day_of_year: 204,
      season: "夏",
      era: "天历纪元",
    };

    this.log.info(`World initialized: ${this.id}`);
    this.log.info(`  Canon: ${this.canonVersion}`);
    this.log.info(`  Time:  天历 ${this.globalState.time.year}年 ${this.globalState.time.month}月 ${this.globalState.time.day}日`);
    return this;
  }

  // ── Invariants (WORLD_STATE_SPEC §Invariants) ──

  checkInvariants() {
    const errors = [];
    // I-01: Entity ID unique
    // I-06: Time monotonic (enforced by Scheduler)
    // Full check implemented in M5 (Kernel API + Validator)
    return errors;
  }
}
