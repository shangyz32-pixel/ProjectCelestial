// runtime/replay/index.js
// Replay Engine — reconstruct world from Snapshot + Event Log.
// Follows: /specs/TRANSACTION_SPEC.md (Event Ordering)

import { Logger } from "../bootstrap/logger.js";

export class ReplayEngine {
  constructor(kernel, snapshotter, log) {
    this.kernel = kernel;
    this.snapshotter = snapshotter;
    this.log = log || new Logger("Replay");
  }

  // Replay: load snapshot → apply events → reconstruct
  replay(snapshotId, targetTick = null) {
    // Step 1: Load snapshot anchor
    const snap = this.snapshotter.load(snapshotId);
    if (!snap) throw new Error("SNAPSHOT_NOT_FOUND");

    this.log.info(`Replay: anchor=${snap.snapshot_id} (Tick ${snap.tick})`);

    // Step 2: Restore world from snapshot
    this.snapshotter.restore(snapshotId);

    // Step 3: Get events after the snapshot
    const events = this.kernel.getEventLog(snap.tick + 1);
    const endTick = targetTick || Infinity;

    // Step 4: Replay events in strict order
    let replayed = 0;
    for (const event of events) {
      if (event.tick > endTick) break;

      const entity = this.kernel.world.entities.get(event.target);
      if (!entity) continue; // entity was deleted/marked deceased

      switch (event.type) {
        case "EntityCreated":
          // Already in snapshot or created during replay
          if (!this.kernel.world.entities.has(event.target)) {
            this.kernel.createEntity(event.payload.type, event.payload.data);
          }
          break;

        case "EntityUpdated":
          if (entity && event.payload.component) {
            entity.components.set(event.payload.component, event.payload.newValue);
            entity.version++;
          }
          break;

        case "EntityDeleted":
          if (entity) {
            entity.state = "deceased";
          }
          break;
      }
      replayed++;
    }

    this.log.info(`Replay complete: ${replayed} events applied`);
    return {
      snapshot_anchor: snap.snapshot_id,
      start_tick: snap.tick,
      end_tick: this.kernel.world.tickCount,
      events_replayed: replayed,
    };
  }
}
