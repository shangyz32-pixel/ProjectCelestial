// runtime/bootstrap/config.js
// Runtime configuration. Single source of truth for all runtime settings.
// Follows: /specs/TIME_SPEC.md, /specs/WORLD_STATE_SPEC.md

export const RuntimeConfig = {
  // Time (TIME_SPEC)
  time: {
    tick_ms: 1000,           // 1 Tick = 1 秒 (production: 1x)
    ticks_per_day: 1,        // 1 Tick = 1 世界日
    start_year: 847,
    start_month: 7,
    start_day: 23,
  },

  // World (WORLD_STATE_SPEC)
  world: {
    world_id: "celestial-001",
    canon_version: "1.0.0",
    engine_version: "1.0.0",
    seed: 42,
  },

  // Snapshot (SNAPSHOT_SPEC)
  snapshot: {
    directory: "./data/snapshots",
    full_retention: 100,
    incremental_retention: 1000,
    checkpoint_interval: 1000,
  },

  // Transaction (TRANSACTION_SPEC)
  transaction: {
    max_retries: 3,
    isolation_level: "snapshot",
  },

  // Runtime
  runtime: {
    mode: "production",       // production | shadow | test
    auto_save: true,
    log_level: "INFO",        // DEBUG | INFO | WARN | ERROR
  },
};

// Freeze: do not modify config at runtime.
Object.freeze(RuntimeConfig);
Object.freeze(RuntimeConfig.time);
Object.freeze(RuntimeConfig.world);
Object.freeze(RuntimeConfig.snapshot);
Object.freeze(RuntimeConfig.transaction);
Object.freeze(RuntimeConfig.runtime);
