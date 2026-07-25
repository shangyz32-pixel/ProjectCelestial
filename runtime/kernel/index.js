// runtime/kernel/index.js
// World Kernel — owns all runtime resources.
// Only legal entry point to World State.
// Follows: /specs/KERNEL_API_SPEC.md, /specs/TRANSACTION_SPEC.md

import { Logger } from "../bootstrap/logger.js";
import { Entity } from "../entity/index.js";
import { TransactionManager } from "../transaction/index.js";

export class Kernel {
  constructor(config, world, log) {
    this.config = config;
    this.world = world;
    this.log = log || new Logger("Kernel");
    this.state = "uninitialized";

    // Per-kernel entity counter
    this._entityCounter = 0;

    // Services (lazy)
    this._txManager = null;
    this.services = new Map();
  }

  // Lazy accessor
  get txManager() {
    if (!this._txManager) {
      this._txManager = new TransactionManager(this, this.config, this.log.child("Transaction"));
    }
    return this._txManager;
  }

  async initialize() {
    this.state = "initializing";
    this.log.info("Kernel initializing...");
    this.state = "running";
    this.log.info("Kernel Initialized.");
    return this;
  }

  async shutdown() {
    this.state = "stopped";
    this.log.info("Kernel shutdown complete.");
  }

  // ═══════════════════════════════════════════
  // Kernel API — Read (KERNEL_API_SPEC §Read)
  // ═══════════════════════════════════════════

  getEntity(entityId) {
    return this.world.entities.get(entityId) || null;
  }

  queryEntities(type, filter = {}, limit = 100, offset = 0) {
    const results = [];
    for (const entity of this.world.entities.values()) {
      if (entity.type === type && entity.state === "active") {
        if (this._matchFilter(entity, filter)) {
          results.push(entity);
        }
      }
    }
    return results.slice(offset, offset + limit);
  }

  getWorldTime() {
    return { ...this.world.globalState.time };
  }

  getTickCount() {
    return this.world.tickCount;
  }

  // ═══════════════════════════════════════════
  // Kernel API — Write (KERNEL_API_SPEC §Write)
  // ═══════════════════════════════════════════

  createEntity(type, data = {}) {
    this._entityCounter++;
    const id = `${type}_${this._entityCounter.toString().padStart(4, "0")}`;
    const entity = new Entity(type, id);

    // Initialize components from data
    for (const [name, value] of Object.entries(data)) {
      entity.components.set(name, value);
    }

    this.world.entities.set(id, entity);

    // Audit: EntityCreated event
    this.txManager.eventLog.push({
      eventId: `evt_${Date.now()}_${id}`,
      tick: this.getTickCount(),
      type: "EntityCreated",
      source: "kernel",
      target: id,
      payload: { type, data },
      importance: 3,
      version: 1,
    });

    this.log.debug(`Entity created: ${id} (${type})`);
    return entity;
  }

  updateComponent(entityId, component, value, expectedVersion) {
    const entity = this.world.entities.get(entityId);
    if (!entity) throw new Error("ENTITY_NOT_FOUND");

    // Concurrency check BEFORE modifying
    if (entity.version !== expectedVersion) throw new Error("VERSION_MISMATCH");

    // Transactional write
    const tx = this.txManager.begin();
    this.txManager.recordOperation(tx, "update", entity, component, value);

    // Apply change
    entity.components.set(component, value);
    entity.version++;

    // Commit (creates events)
    this.txManager.commit(tx);

    return entity;
  }

  deleteEntity(entityId) {
    const entity = this.world.entities.get(entityId);
    if (!entity) throw new Error("ENTITY_NOT_FOUND");

    // Mark as deceased (never physically delete — ENTITY_SPEC)
    entity.state = "deceased";
    this.log.debug(`Entity marked deceased: ${entityId}`);
  }

  // ═══════════════════════════════════════════
  // Transaction (KERNEL_API_SPEC §Transaction)
  // ═══════════════════════════════════════════

  beginTransaction() {
    return this.txManager.begin();
  }

  commitTransaction(tx) {
    return this.txManager.commit(tx);
  }

  rollbackTransaction(tx) {
    return this.txManager.rollback(tx);
  }

  // ═══════════════════════════════════════════
  // Event Log (KERNEL_API_SPEC §Event)
  // ═══════════════════════════════════════════

  getEventLog(fromTick = 0) {
    return this.txManager.getEventLog(fromTick);
  }

  // ═══════════════════════════════════════════
  // Helpers
  // ═══════════════════════════════════════════

  _matchFilter(entity, filter) {
    for (const [key, value] of Object.entries(filter)) {
      if (entity.components.get(key) !== value) return false;
    }
    return true;
  }
}
