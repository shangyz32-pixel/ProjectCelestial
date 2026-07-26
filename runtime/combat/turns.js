// runtime/combat/turns.js
// v2.2 Sprint 4 M4 — Turn Scheduler & Initiative
// Determines WHEN. Never damage/skills/buffs. Deterministic.

import { createParticipant } from "./participant.js";

export const TURN_PHASE = {
  START:    "start",
  VALIDATE: "validate",
  WAITING:  "waiting",
  ACTING:   "acting",
  END:      "end",
  SKIPPED:  "skipped",
};

export function calculateInitiative(participant) {
  const a = participant.getAttributes();
  const base = a.speed * 3;
  const realm = participant.getRealm().id * 2;
  const eq = participant.getEquipment();
  const buffs = participant.getBuffs();
  const speedBuff = buffs.all.reduce((sum,b) => sum + (b.stat==="dodge"&&b.type==="buff"?b.value||0:0), 0);
  const debuffMod = buffs.debuffs.some(d => d.stat==="skip") ? 0 : 1;
  return Math.max(0, Math.round((base + realm + eq.atkBonus * 0.2 + speedBuff) * debuffMod));
}

export function buildQueue(participants) {
  const queue = participants
    .filter(p => p && p.isAlive() && p.getCombatState() !== "dead")
    .map(p => ({ id:p.id, name:p.name, initiative:calculateInitiative(p), faction:p.getFaction() }));
  // Stable sort: highest initiative first, tie-break by id (deterministic)
  queue.sort((a,b) => b.initiative - a.initiative || a.id.localeCompare(b.id));
  return queue;
}

export function createTurnScheduler(sessionId, participants) {
  const queue = buildQueue(participants);
  return {
    sessionId,
    round: 1,
    queue,
    currentIndex: 0,
    currentTurn: queue[0] || null,
    phase: TURN_PHASE.START,
    timeout: 30,
    history: [],

    getCurrent() { return this.queue[this.currentIndex] || null; },

    advance() {
      this.history.push({ round:this.round, index:this.currentIndex, id:this.currentTurn?.id||"none" });
      this.currentIndex++;
      if (this.currentIndex >= this.queue.length) {
        // New round
        this.round++;
        this.currentIndex = 0;
        // Remove dead, skip frozen
        this.queue = buildQueue(participants.filter(p => p.isAlive()));
        return { newRound: true, round: this.round };
      }
      this.currentTurn = this.queue[this.currentIndex];
      return { newTurn: true, current: this.currentTurn };
    },

    skipCurrent(reason) {
      const entry = this.getCurrent();
      if (entry) this.history.push({ round:this.round, index:this.currentIndex, id:entry.id, skipped:reason });
      return this.advance();
    },

    recalculateQueue(participants) {
      this.queue = buildQueue(participants);
      if (this.currentIndex >= this.queue.length) this.currentIndex = 0;
      this.currentTurn = this.queue[this.currentIndex] || null;
    },

    serialize() {
      return { sessionId:this.sessionId, round:this.round, currentIndex:this.currentIndex, queue:this.queue, phase:this.phase };
    },

    static fromJSON(json, participants) {
      const s = createTurnScheduler(json.sessionId, participants);
      s.round = json.round;
      s.currentIndex = json.currentIndex;
      s.queue = json.queue;
      s.currentTurn = s.queue[s.currentIndex] || null;
      return s;
    },
  };
}
