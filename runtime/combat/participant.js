// runtime/combat/participant.js
// v2.2 Sprint 4 M2 — Unified Combat Participant Interface
// No entity-type branching. Player/NPC/Monster/Boss → same interface.
// ECS adapter: reads components, never owns data.

// ══════════════════════════════════════
// Combat State Machine
// ══════════════════════════════════════
export const COMBAT_STATES = {
  IDLE:       "idle",
  PREPARING:  "preparing",
  WAITING:    "waiting",
  ACTING:     "acting",
  CASTING:    "casting",
  GUARDING:   "guarding",
  STUNNED:    "stunned",
  FROZEN:     "frozen",
  DEAD:       "dead",
  REMOVED:    "removed",
};

// ══════════════════════════════════════
// Faction Enum
// ══════════════════════════════════════
export const FACTIONS = {
  PLAYER:   "player",
  FRIENDLY: "friendly",
  NEUTRAL:  "neutral",
  HOSTILE:  "hostile",
  SECT:     "sect",
  MONSTER:  "monster",
  BOSS:     "boss",
};

// ══════════════════════════════════════
// Structured Errors
// ══════════════════════════════════════
class ParticipantError extends Error {
  constructor(code, detail) { super(`[${code}] ${detail}`); this.code = code; this.detail = detail; }
}

// ══════════════════════════════════════
// Participant wrapper — safe defaults, no entity-type branching
// ══════════════════════════════════════
export function createParticipant(entity, slot = "auto") {
  if (!entity || !entity.id) throw new ParticipantError("INVALID_ENTITY", "entity null or no id");
  const id = entity.id;

  return {
    // Identity
    id,
    entity,
    slot,
    get name() { return (entity.getComponent("Identity")||{}).name || entity.id; },
    get type() { return entity.type || "unknown"; },

    // Realm (read-only in combat)
    getRealm() { const r = entity.getComponent("Realm")||{}; return { id:r.realm_id||1, progress:r.cultivation_value||0 }; },

    // ── Health + Shield ──
    getHP() { const hp = entity.getComponent("HP")||{}; return { current:hp.current||100, max:hp.max||100 }; },
    getShield() { const s = entity.getComponent("Shield")||{}; return { current:s.current||0, max:s.max||0 }; },
    isAlive() { return this.getHP().current > 0 && entity.state !== "dead"; },

    // ── Qi ──
    getQi() { const qi = entity.getComponent("Qi")||{}; return { current:qi.current||50, max:qi.max||50, recovery:(entity.getComponent("Cultivation")||{}).qi_recovery||2 }; },

    // ── Attributes ──
    getAttributes() {
      const c = entity.getComponent("Combat") || {};
      return {
        attack:c.attack||5, defense:c.defense||2, speed:c.speed||3,
        critical:c.critical||0.05, critDamage:c.critDamage||1.5,
        accuracy:c.accuracy||0.95, dodge:c.dodge||0.05,
        penetration:c.penetration||0, resistance:c.resistance||0,
      };
    },

    // ── Equipment (read-only) ──
    getEquipment() {
      const eq = entity.getComponent("Equipment") || { slots:{}, totalAtk:0, totalDef:0 };
      return { atkBonus:eq.totalAtk||0, defBonus:eq.totalDef||0, hpBonus:eq.totalHp||0, slots:eq.slots||{} };
    },

    // ── Element affinity ──
    getElement() {
      const root = entity.getComponent("SpiritualRoot") || {};
      return { element:root.element||"none", rarity:root.rarity||"common", speedMultiplier:root.speedMultiplier||1.0 };
    },

    // ── Skills ──
    getSkills() {
      const skills = entity.getComponent("Skills") || {};
      const cd = skills.cooldowns || {};
      const mastery = skills.masteries || {};
      const known = Object.keys(mastery);
      // Enrich with skill database info
      const detailed = known.map(sid => {
        const def = null; // SKILLS[sid] if imported — leave generic
        return { id:sid, mastery:mastery[sid]||1, cooldown:cd[sid]||0 };
      });
      return { known, detailed, mastery, cooldowns:cd };
    },

    // ── Buffs / Debuffs ──
    getBuffs() {
      const all = (entity.getComponent("Buffs")||{}).active || [];
      return { buffs:all.filter(b => b.type === "buff"), debuffs:all.filter(b => b.type === "debuff"), all };
    },

    // ── Combat State ──
    getCombatState() {
      if (entity.state === "dead" || this.getHP().current <= 0) return COMBAT_STATES.DEAD;
      const beh = entity.getComponent("Behavior") || {};
      const buffs = this.getBuffs();
      if (buffs.debuffs.some(d => d.stat === "skip" && d.duration > 0)) return COMBAT_STATES.FROZEN;
      if (beh.state === "rest") return COMBAT_STATES.IDLE;
      return COMBAT_STATES.IDLE;
    },

    // ── Faction ──
    getFaction() {
      if (entity.type === "player") return FACTIONS.PLAYER;
      if (entity.type === "monster") {
        return (entity.getComponent("Boss")) ? FACTIONS.BOSS : FACTIONS.MONSTER;
      }
      if (entity.type === "npc") {
        const sect = entity.getComponent("SectMembership") || {};
        if (sect.sect_name) return FACTIONS.SECT;
        const beh = entity.getComponent("Behavior") || {};
        if (beh.personality === "guardian") return FACTIONS.FRIENDLY;
        return FACTIONS.NEUTRAL;
      }
      return FACTIONS.NEUTRAL;
    },

    // ── Position ──
    getPosition() {
      const loc = entity.getComponent("Location") || {};
      return { area:loc.area||"unknown", x:loc.x||0, y:loc.y||0 };
    },

    // ── Metadata ──
    getMetadata() {
      const identity = entity.getComponent("Identity") || {};
      const boss = entity.getComponent("Boss");
      const rep = entity.getComponent("Reputation") || {};
      return {
        title: rep.title || identity.name || "",
        isBoss: !!boss,
        bossRank: boss?.bossType || "",
        isElite: (identity.type||"").includes("elite"),
        questTarget: (entity.getComponent("QuestMark")||{}).questId || null,
      };
    },

    // ── Snapshot / Replay serialization ──
    serialize() {
      return {
        id, type: entity.type, state: entity.state,
        hp: this.getHP(), qi: this.getQi(), shield: this.getShield(),
        realm: this.getRealm(), element: this.getElement(),
        faction: this.getFaction(), position: this.getPosition(),
        combatState: this.getCombatState(),
        metadata: this.getMetadata(),
      };
    },
  };
}

// ══════════════════════════════════════
// Validator — structured error codes
// ══════════════════════════════════════
export function validateParticipant(participant, kernel) {
  const errors = [];
  if (!participant) return { valid:false, errors:["NULL_PARTICIPANT"] };
  const e = kernel?.getEntity(participant.id);
  if (!e) errors.push("ENTITY_GONE");
  if (participant.getCombatState() === COMBAT_STATES.DEAD) errors.push("ENTITY_DEAD");
  if (participant.getHP().current <= 0) errors.push("HP_ZERO");
  if (!e?.state || e.state === "inactive") errors.push("STATE_INACTIVE");
  // Check concurrent session
  if (kernel?._combatSessions) {
    const active = Object.values(kernel._combatSessions).some(s => s.attacker === participant.id || s.defender === participant.id);
    if (active) errors.push("ALREADY_IN_COMBAT");
  }
  return { valid: errors.length === 0, errors };
}

// ══════════════════════════════════════
// Convenience: create two participants from kernel entity IDs
// ══════════════════════════════════════
export function createDuel(attackerId, defenderId, kernel) {
  const att = kernel.getEntity(attackerId);
  const def = kernel.getEntity(defenderId);
  if (!att || !def) return null;
  return {
    attacker: createParticipant(att, "attacker"),
    defender: createParticipant(def, "defender"),
  };
}
