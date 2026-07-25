// runtime/history/index.js
// History System — deterministic hashable world history.
// Generated from Event Log. Survives Save/Load/Replay.

import crypto from "node:crypto";

export class HistorySystem {
  constructor(kernel) {
    this.kernel = kernel;
    this.records = []; // chronological history entries
  }

  // Record a history entry for this tick
  record(tick, time, weather, qi) {
    this.records.push({
      tick,
      time: `${time.year}-${time.month}-${time.day} ${time.day_phase}`,
      weather,
      qi: Math.round(qi * 1000) / 1000,
    });
    // Keep only last 1000 entries in memory
    if (this.records.length > 1000) this.records.shift();
  }

  getEntries() {
    return [...this.records];
  }

  // Deterministic hash of all history records
  computeHash() {
    const data = JSON.stringify(this.records);
    return crypto.createHash("sha256").update(data).digest("hex");
  }
}

// ══════════════════════════════════════
// Hash Validator — verify determinism
// ══════════════════════════════════════
export class HashValidator {
  constructor(kernel, snapshotter, historySystem) {
    this.kernel = kernel;
    this.snapshotter = snapshotter;
    this.history = historySystem;
  }

  computeWorldStateHash() {
    const entities = [...this.kernel.world.entities.entries()]
      .map(([id, e]) => ({ id, type: e.type, version: e.version, state: e.state, comps: Object.fromEntries(e.components) }))
      .sort((a, b) => a.id.localeCompare(b.id));
    return crypto.createHash("sha256").update(JSON.stringify(entities)).digest("hex");
  }

  computeEventLogHash() {
    const events = this.kernel.getEventLog(0);
    return crypto.createHash("sha256").update(JSON.stringify(events)).digest("hex");
  }

  computeHistoryHash() {
    return this.history.computeHash();
  }

  verifyAll() {
    return {
      world_state: this.computeWorldStateHash(),
      event_log:   this.computeEventLogHash(),
      history:     this.computeHistoryHash(),
    };
  }

  compare(a, b, label) {
    const match = a === b;
    console.log(`  ${label.padEnd(20)} ${match ? "✓ MATCH" : "✗ MISMATCH"}`);
    return match;
  }

  verifyDeterminism(before, after) {
    let ok = true;
    ok &= this.compare(before.world_state, after.world_state, "World State Hash");
    ok &= this.compare(before.event_log,   after.event_log,   "Event Log Hash");
    ok &= this.compare(before.history,     after.history,     "History Hash");
    return ok;
  }
}
