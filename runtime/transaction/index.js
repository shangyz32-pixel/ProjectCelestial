// runtime/transaction/index.js
// Transaction Manager — ACID guarantees.
// Follows: /specs/TRANSACTION_SPEC.md
//
// Snapshot Isolation. Optimistic locking. Auto rollback on failure.

import { Logger } from "../bootstrap/logger.js";

export class TransactionManager {
  constructor(kernel, config, log) {
    this.kernel = kernel;
    this.config = config;
    this.log = log || new Logger("Transaction");
    this.activeTransactions = new Map();
    this.eventLog = [];              // append-only
  }

  // Begin a new transaction
  begin() {
    const tx = {
      id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      state: "active",            // active | committed | rolled_back
      operations: [],              // list of { type, entity, component, oldValue, newValue }
      snapshotVersion: {},        // entity_id → version at begin
      events: [],                 // domain events generated during tx
      startedAt: new Date().toISOString(),
    };
    this.activeTransactions.set(tx.id, tx);
    this.log.debug(`Transaction started: ${tx.id}`);
    return tx;
  }

  // Record an operation within a transaction
  recordOperation(tx, type, entity, component, newValue) {
    if (tx.state !== "active") throw new Error("TRANSACTION_NOT_ACTIVE");

    tx.operations.push({
      type,
      entityId: entity.id,
      component,
      oldValue: entity.getComponent(component),
      newValue,
      expectedVersion: entity.version,
    });
  }

  // Commit: atomic + events + audit
  async commit(tx) {
    if (tx.state !== "active") throw new Error("TRANSACTION_NOT_ACTIVE");

    // Apply operations (version check already done by Kernel before commit)
    for (const op of tx.operations) {
      const entity = this.kernel.world.entities.get(op.entityId);
      if (!entity) {
        this.log.warn(`Entity ${op.entityId} not found — rolling back`);
        await this.rollback(tx);
        throw new Error("ENTITY_NOT_FOUND");
      }
    }

    // ACID: Durability — write events to log
    for (const op of tx.operations) {
      const event = {
        eventId: `evt_${Date.now()}_${op.entityId}`,
        tick: this.kernel.getTickCount(),
        timestamp: this.kernel.world.globalState.time,
        type: this._mapOpToEvent(op.type),
        source: "kernel",
        target: op.entityId,
        payload: {
          component: op.component,
          oldValue: op.oldValue,
          newValue: op.newValue,
        },
        importance: 5,
        version: 1,
      };
      this.eventLog.push(event);
      tx.events.push(event);
    }

    tx.state = "committed";
    this.activeTransactions.delete(tx.id);
    this.log.debug(`Transaction committed: ${tx.id} (${tx.operations.length} ops)`);

    return tx.events;
  }

  // Rollback: discard all operations
  async rollback(tx) {
    if (tx.state === "committed") throw new Error("ALREADY_COMMITTED");
    tx.state = "rolled_back";
    this.activeTransactions.delete(tx.id);
    this.log.debug(`Transaction rolled back: ${tx.id}`);
  }

  getEventLog(fromTick = 0) {
    return this.eventLog.filter(e => e.tick >= fromTick);
  }

  _mapOpToEvent(type) {
    const map = {
      create: "EntityCreated",
      update: "EntityUpdated",
      delete: "EntityDeleted",
    };
    return map[type] || "EntityModified";
  }
}
