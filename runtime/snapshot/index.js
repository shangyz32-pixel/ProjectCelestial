// runtime/snapshot/index.js
// Snapshot System — save/restore world state.
// runtime/snapshot/index.js

import fs from "node:fs";
import path from "node:path";
import { Logger } from "../bootstrap/logger.js";
import { Entity } from "../entity/index.js";

export class Snapshotter {
  constructor(kernel, config, log) {
    this.kernel = kernel;
    this.config = config;
    this.log = log || new Logger("Snapshot");
    this.snapDir = config.snapshot.directory;
    this.checkpointInterval = config.snapshot.checkpoint_interval;
    this.snapshotCounter = 0;

    if (!fs.existsSync(this.snapDir)) {
      fs.mkdirSync(this.snapDir, { recursive: true });
    }
  }

  // Take a full snapshot (SNAPSHOT_SPEC: each Tick)
  take(label = "") {
    this.snapshotCounter++;
    const snap = {
      snapshot_id: `snap_${this.snapshotCounter.toString().padStart(6, "0")}`,
      tick: this.kernel.getTickCount(),
      timestamp: this.kernel.getWorldTime(),
      canon_version: this.config.world.canon_version,
      engine_version: this.config.world.engine_version,
      seed: this.config.world.seed,
      label: label || `Tick_${this.kernel.getTickCount()}`,
      parent_snapshot: this.snapshotCounter > 1
        ? `snap_${(this.snapshotCounter - 1).toString().padStart(6, "0")}`
        : null,

      world_state: {
        global: { ...this.kernel.world.globalState },
        entities: this._serializeEntities(),
        meta: {
          created_at: this.kernel.world.createdAt,
          snapshot_id: this.snapshotCounter,
        },
      },

      event_log_length: this.kernel.getEventLog().length,
    };

    // Save to disk
    const filepath = path.join(this.snapDir, `${snap.snapshot_id}.json`);
    fs.writeFileSync(filepath, JSON.stringify(snap, null, 2));
    this.log.debug(`Snapshot saved: ${snap.snapshot_id} (Tick ${snap.tick})`);

    return snap;
  }

  // Load a snapshot from disk
  load(snapshotId = null) {
    // Default: load latest
    if (!snapshotId) {
      const files = fs.readdirSync(this.snapDir)
        .filter(f => f.startsWith("snap_") && f.endsWith(".json"))
        .sort();
      if (files.length === 0) return null;
      snapshotId = files[files.length - 1].replace(".json", "");
    }

    const filepath = path.join(this.snapDir, `${snapshotId}.json`);
    if (!fs.existsSync(filepath)) return null;

    const data = JSON.parse(fs.readFileSync(filepath, "utf-8"));
    this.log.info(`Snapshot loaded: ${snapshotId} (Tick ${data.tick})`);
    return data;
  }

  // Restore world from snapshot
  restore(snapshotId = null) {
    const snap = this.load(snapshotId);
    if (!snap) throw new Error("SNAPSHOT_NOT_FOUND");

    const world = this.kernel.world;

    // Restore global state
    world.globalState = snap.world_state.global;

    // Restore entities — reconstruct proper Entity instances
    world.entities.clear();
    for (const ent of snap.world_state.entities) {
      const entity = new Entity(ent.type, ent.id);
      entity.version = ent.version;
      entity.state = ent.state;
      entity.createdAt = ent.createdAt;
      for (const [name, value] of Object.entries(ent.components)) {
        entity.components.set(name, value);
      }
      world.entities.set(ent.id, entity);
    }

    world.tickCount = snap.tick;
    this.log.info(`World restored to Tick ${snap.tick}`);
    return snap;
  }

  // List all snapshots
  list() {
    return fs.readdirSync(this.snapDir)
      .filter(f => f.startsWith("snap_") && f.endsWith(".json"))
      .sort()
      .map(f => f.replace(".json", ""));
  }

  _serializeEntities() {
    const entities = [];
    for (const entity of this.kernel.world.entities.values()) {
      entities.push({
        id: entity.id,
        type: entity.type,
        version: entity.version,
        state: entity.state,
        components: Object.fromEntries(entity.components),
        createdAt: entity.createdAt,
      });
    }
    return entities;
  }
}
