// runtime/combat/participant.js
// v2.2 Sprint 4 M2 — Unified Combat Participant Interface
// Wraps any entity (Player/NPC/Monster/Boss) as uniform participant.
// Combat Engine never checks entity type — only reads components through this interface.

// ══════════════════════════════════════
// Participant wrapper — safe defaults, no entity-type branching
// ══════════════════════════════════════
export function createParticipant(entity, slot = "auto") {
  if (!entity || !entity.id) throw new Error("Invalid entity for participant");
  const id = entity.id;

  return {
    // Identity
    id,
    entity,
    slot,
    get name() { return (entity.getComponent("Identity")||{}).name || entity.id },
    get type() { return entity.type || "unknown" },

    // Realm
    getRealm() { return (entity.getComponent("Realm")||{}).realm_id || 1 },

    // Health
    getHP() { const hp = entity.getComponent("HP")||{}; return { current:hp.current||100, max:hp.max||100 }; },
    isAlive() { return (entity.getComponent("HP")||{}).current > 0 && entity.state !== "dead"; },

    // Qi
    getQi() { const qi = entity.getComponent("Qi")||{}; return { current:qi.current||50, max:qi.max||50 }; },

    // Attributes
    getAttributes() {
      const c = entity.getComponent("Combat") || {};
      return { attack:c.attack||5, defense:c.defense||2, speed:c.speed||3, critical:c.critical||0.05, accuracy:c.accuracy||0.95, dodge:c.dodge||0.05 };
    },

    // Equipment (delegate to equipment module)
    getEquipment() {
      const eq = entity.getComponent("Equipment") || { slots:{}, totalAtk:0, totalDef:0 };
      return { atkBonus:eq.totalAtk||0, defBonus:eq.totalDef||0, slots:eq.slots||{} };
    },

    // Element affinity
    getElement() {
      const root = entity.getComponent("SpiritualRoot") || {};
      return { element:root.element||"none", rarity:root.rarity||"common" };
    },

    // Skills available
    getSkills() {
      const skills = entity.getComponent("Skills") || {};
      const cd = skills.cooldowns || {};
      const mastery = skills.masteries || {};
      return { known:Object.keys(mastery), mastery, cooldowns:cd };
    },

    // Buffs/Debuffs
    getBuffs() {
      return (entity.getComponent("Buffs")||{}).active || [];
    },

    // Faction
    getFaction() {
      if (entity.type === "player") return "player";
      if (entity.type === "monster") {
        const boss = entity.getComponent("Boss");
        return boss ? "boss" : "monster";
      }
      return (entity.getComponent("Behavior")||{}).personality === "guardian" ? "friendly" : "hostile";
    },

    // Position
    getPosition() {
      const loc = entity.getComponent("Location") || {};
      return { area:loc.area||"unknown", x:loc.x||0, y:loc.y||0 };
    },

    // State
    getState() {
      if (entity.state === "dead") return "dead";
      const beh = entity.getComponent("Behavior") || {};
      if (beh.state === "hunt") return "hostile";
      if (beh.state === "rest") return "idle";
      return "idle";
    },

    // Snapshot/Replay compatible
    serialize() {
      return {
        id, type: entity.type, state: entity.state,
        hp: this.getHP(), qi: this.getQi(),
        realm: this.getRealm(), element: this.getElement(),
        faction: this.getFaction(), position: this.getPosition(),
      };
    },
  };
}

// ══════════════════════════════════════
// Validator — reject entities not ready for combat
// ══════════════════════════════════════
export function validateParticipant(participant, kernel) {
  const errors = [];
  const e = kernel?.getEntity(participant.id);
  if (!e) errors.push("entity_gone");
  if (!participant.isAlive()) errors.push("entity_dead");
  const hp = participant.getHP();
  if (hp.current <= 0) errors.push("hp_zero");
  if (participant.getState() === "dead") errors.push("state_dead");
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
