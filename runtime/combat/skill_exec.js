// runtime/combat/skill_exec.js
// v2.2 Sprint 4 M6 — Skill Execution Framework
// Prepares combat context. NEVER calculates damage.
// Damage → Combat Resolution. Effects → Buff System. Elements → Element Service.

import { SKILLS } from "../skills/index.js";
import { CombatEvents } from "./index.js";

// ══════════════════════════════════════
// Skill Registry — data-driven, no hardcoded IDs
// ══════════════════════════════════════
export const SkillRegistry = {
  _skills: {},
  init() {
    for (const [id, skill] of Object.entries(SKILLS)) {
      this._skills[id] = {
        id, name:skill.name, category:skill.category, type:skill.type,
        damage:skill.damage||0, heal:skill.heal||0, qiCost:skill.qiCost||0,
        cooldown:skill.cooldown||0, realmReq:skill.realmReq||1,
        shield:skill.shield||0, root:skill.root||0, curse:skill.curse||0,
      };
    }
    return this;
  },
  get(id) { return this._skills[id] || null; },
  list() { return Object.values(this._skills).map(s=>({id:s.id,name:s.name,category:s.category,type:s.type})); },
  has(id) { return id in this._skills; },
};

// Initialize at module load
SkillRegistry.init();

// ══════════════════════════════════════
// Skill Request — immutable
// ══════════════════════════════════════
export function createSkillRequest(skillId, casterParticipant, targetParticipant, meta = {}) {
  return Object.freeze({
    skillId,
    casterId: casterParticipant.id,
    targetId: targetParticipant?.id || null,
    meta: { ...meta },
    timestamp: Date.now(),
  });
}

// ══════════════════════════════════════
// Skill Validation
// ══════════════════════════════════════
export function validateSkill(skillId, casterParticipant, targetParticipant) {
  // 1. Skill exists
  const skillDef = SkillRegistry.get(skillId);
  if (!skillDef) return { valid:false, error:"UNKNOWN_SKILL", code:"UNKNOWN_SKILL" };

  // 2. Caster alive
  if (!casterParticipant.isAlive()) return { valid:false, error:"CASTER_DEAD", code:"CASTER_DEAD" };

  // 3. Realm requirement
  const realm = casterParticipant.getRealm().id;
  if (realm < skillDef.realmReq) return { valid:false, error:`REALM_TOO_LOW (need ${skillDef.realmReq})`, code:"REALM_TOO_LOW" };

  // 4. Skill known
  const skills = casterParticipant.getSkills();
  if (!skills.known.includes(skillId)) return { valid:false, error:"SKILL_NOT_KNOWN", code:"SKILL_NOT_KNOWN" };

  // 5. Cooldown
  if ((skills.cooldowns[skillId]||0) > 0) return { valid:false, error:"SKILL_ON_COOLDOWN", code:"SKILL_ON_COOLDOWN" };

  // 6. Qi
  if (skillDef.qiCost > 0) {
    const qi = casterParticipant.getQi();
    if (qi.current < skillDef.qiCost) return { valid:false, error:`INSUFFICIENT_QI (need ${skillDef.qiCost})`, code:"INSUFFICIENT_QI" };
  }

  // 7. Target
  if (skillDef.type !== "heal" && skillDef.type !== "buff" && skillDef.type !== "passive") {
    if (!targetParticipant) return { valid:false, error:"MISSING_TARGET", code:"MISSING_TARGET" };
    if (!targetParticipant.isAlive()) return { valid:false, error:"TARGET_DEAD", code:"TARGET_DEAD" };
  }

  return { valid:true, skillDef };
}

// ══════════════════════════════════════
// Skill Context — read-only
// ══════════════════════════════════════
export function createSkillContext(skillId, casterParticipant, targetParticipant, session, worldTick = 0) {
  return {
    skillId,
    skillDef: SkillRegistry.get(skillId),
    caster: casterParticipant.serialize(),
    target: targetParticipant?.serialize() || null,
    session,
    tick: worldTick,
  };
}

// ══════════════════════════════════════
// Create Combat Intent → Resolution
// ══════════════════════════════════════
export function createSkillIntent(skillId, casterParticipant, targetParticipant, ctx) {
  const skillDef = SkillRegistry.get(skillId);
  return {
    type: "skill",
    skillId,
    skillName: skillDef?.name || skillId,
    category: skillDef?.category || "unknown",
    caster: casterParticipant.serialize(),
    target: targetParticipant?.serialize() || null,
    skillData: {
      damage: skillDef?.damage || 0,
      heal: skillDef?.heal || 0,
      shield: skillDef?.shield || 0,
      root: skillDef?.root || 0,
      curse: skillDef?.curse || 0,
    },
    tick: ctx.tick,
  };
}

// ══════════════════════════════════════
// Full Skill Execution Pipeline
// ══════════════════════════════════════
export function executeSkill(skillId, casterParticipant, targetParticipant, session, kernel) {
  const tick = kernel?.world?.tickCount || 0;

  // 1. Validate
  const validation = validateSkill(skillId, casterParticipant, targetParticipant);
  if (!validation.valid) {
    CombatEvents.emit("SkillRejected", { skillId, caster:casterParticipant.name, reason:validation.error, tick });
    return { result:"invalid", error:validation.error, code:validation.code };
  }

  CombatEvents.emit("SkillValidated", { skillId, caster:casterParticipant.name, tick });

  // 2. Context
  const ctx = createSkillContext(skillId, casterParticipant, targetParticipant, session, tick);

  // 3. Consume resources
  const skillDef = validation.skillDef;
  if (kernel && skillDef.qiCost > 0) {
    const e = kernel.getEntity(casterParticipant.id);
    if (e) {
      const qi = e.getComponent("Qi") || { current:50, max:50 };
      kernel.updateComponent(e.id, "Qi", { ...qi, current: Math.max(0, qi.current - skillDef.qiCost) }, e.version);
    }
  }

  // 4. Apply cooldown
  if (kernel && skillDef.cooldown > 0) {
    const e = kernel.getEntity(casterParticipant.id);
    if (e) {
      const skills = e.getComponent("Skills") || {};
      const cd = { ...(skills.cooldowns||{}), [skillId]: skillDef.cooldown };
      kernel.updateComponent(e.id, "Skills", { ...skills, cooldowns: cd }, e.version + 1);
    }
  }

  // 5. Create Combat Intent → delegates to Resolution
  const intent = createSkillIntent(skillId, casterParticipant, targetParticipant, ctx);

  CombatEvents.emit("SkillExecuted", { skillId, skillName:skillDef.name, caster:casterParticipant.name, target:targetParticipant?.name||"self", tick });

  return {
    result: "success",
    intent,
    skillDef,
    ctx,
  };
}
