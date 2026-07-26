// runtime/combat/buffs.js
// v2.2 Sprint 4 M7 — Buff Registry & Manager
// Formalizes existing BUFFS. Never calculates damage. Duration/Tick/Stack/Remove.

import { BUFFS } from "./index.js";
import { CombatEvents } from "./index.js";

// ══════════════════════════════════════
// Buff Registry — data-driven, extend without Combat Engine changes
// ══════════════════════════════════════
export const BuffRegistry = {
  _buffs: {},
  init() {
    for (const [id, def] of Object.entries(BUFFS)) {
      this._buffs[id] = { id, ...def, registeredAt: Date.now() };
    }
    return this;
  },
  register(id, def) { this._buffs[id] = { id, ...def }; return this._buffs[id]; },
  get(id) { return this._buffs[id] || null; },
  list() { return Object.values(this._buffs).map(b => ({ id:b.id, name:b.name, type:b.type, stat:b.stat })); },
  has(id) { return id in this._buffs; },
}; BuffRegistry.init();

// ══════════════════════════════════════
// Buff Application
// ══════════════════════════════════════
export function applyBuff(buffId, target, sourceOrDuration, kernel) {
  const def = BuffRegistry.get(buffId);
  if (!def) return { ok:false, error:"UNKNOWN_BUFF" };

  const duration = typeof sourceOrDuration === "number" ? sourceOrDuration : (def.duration||3);
  const source = typeof sourceOrDuration === "object" ? (sourceOrDuration.name||sourceOrDuration.id||"unknown") : "combat";

  const entity = kernel ? kernel.getEntity(target.id) : (target.entity || target);
  if (!entity) return { ok:false, error:"ENTITY_GONE" };

  const buffs = entity.getComponent("Buffs") || { active:[] };
  const existing = buffs.active.find(b => b.id === buffId);

  let updated;
  if (existing && def.stackable) {
    existing.stacks = (existing.stacks||1) + 1;
    existing.duration = Math.max(existing.duration, duration);
    updated = [...buffs.active];
    CombatEvents.emit("BuffStackChanged", { buffId, target:target.name, stacks:existing.stacks });
  } else if (existing) {
    existing.duration = duration;
    updated = [...buffs.active];
  } else {
    updated = [...buffs.active, { id:buffId, type:def.type, stat:def.stat, value:def.value, duration, stacks:1, source }];
    CombatEvents.emit("BuffApplied", { buffId, buffName:def.name, target:target.name, duration, tick:kernel?.world?.tickCount||0 });
  }

  kernel.updateComponent(entity.id, "Buffs", { active:updated }, entity.version);
  return { ok:true, buffId, name:def.name };
}

// ══════════════════════════════════════
// Buff Tick — process duration, remove expired
// ══════════════════════════════════════
export function tickBuffs(participant, kernel) {
  const entity = kernel ? kernel.getEntity(participant.id) : participant.entity;
  if (!entity) return { removed: 0 };

  const buffs = entity.getComponent("Buffs") || { active:[] };
  const updated = [];
  let removed = 0;

  for (const b of buffs.active || []) {
    b.duration--;
    if (b.duration > 0) updated.push(b);
    else {
      removed++;
      CombatEvents.emit("BuffExpired", { buffId:b.id, target:participant.name });
    }
  }

  kernel.updateComponent(entity.id, "Buffs", { active:updated }, entity.version);
  return { removed, remaining: updated.length };
}

// ══════════════════════════════════════
// Buff Removal
// ══════════════════════════════════════
export function removeBuff(buffId, participant, kernel) {
  const entity = kernel ? kernel.getEntity(participant.id) : participant.entity;
  if (!entity) return { ok:false };

  const buffs = entity.getComponent("Buffs") || { active:[] };
  const updated = buffs.active.filter(b => b.id !== buffId);
  kernel.updateComponent(entity.id, "Buffs", { active:updated }, entity.version);
  CombatEvents.emit("BuffRemoved", { buffId, target:participant.name });
  return { ok:true, removed: buffs.active.length - updated.length > 0 };
}
