// runtime/combat/index.js
// v2.0 Sprint 2 — Unified Combat Framework
// Element affinity, buff/debuff, AI personality. Deterministic.

import { WorldRandom } from "../random/index.js";
import { SKILLS, getSkillDamage, practiceSkill, applyCooldown } from "../skills/index.js";
import { getEquipmentModifiers } from "../equipment/index.js";

// ══════════════════════════════════════
// Element System (v2.0)
// ══════════════════════════════════════
const ELEMENT_MATRIX = {
  metal:  { strong:["wood"],  weak:["fire"] },
  wood:   { strong:["earth"], weak:["metal"] },
  water:  { strong:["fire"],  weak:["earth"] },
  fire:   { strong:["metal"], weak:["water"] },
  earth:  { strong:["water"], weak:["wood"] },
  wind:   { strong:["lightning"], weak:["ice"] },
  lightning:{ strong:["water"], weak:["earth"] },
  ice:    { strong:["wind"],  weak:["fire"] },
  light:  { strong:["dark"],  weak:[] },
  dark:   { strong:["light"], weak:[] },
  heaven: { strong:["dark","light"], weak:[] },
  chaos:  { strong:[], weak:[] },
};

function getElementMultiplier(attRoot, defRoot) {
  if (!attRoot || !defRoot) return 1.0;
  const defElement = defRoot.element || "none";
  const attElement = attRoot.element || "none";
  const matrix = ELEMENT_MATRIX[attElement];
  if (!matrix) return 1.0;
  if (matrix.strong.includes(defElement)) return 1.3; // 克制
  if (matrix.weak.includes(defElement)) return 0.7;   // 被克
  return 1.0;
}

// ══════════════════════════════════════
// Buff/Debuff System (v2.0)
// ══════════════════════════════════════
export const BUFFS = {
  attack_up:   { name:"攻击强化", type:"buff",   stat:"damage",    value:1.3, duration:3, stackable:true },
  defense_up:  { name:"防御强化", type:"buff",   stat:"incoming",  value:0.7, duration:3, stackable:true },
  speed_up:    { name:"速度强化", type:"buff",   stat:"dodge",     value:1.2, duration:3, stackable:false },
  regen:       { name:"恢复",     type:"buff",   stat:"regen",     value:5,   duration:4, stackable:true },
  barrier:     { name:"屏障",     type:"buff",   stat:"shield",    value:20,  duration:2, stackable:false },

  poison:      { name:"中毒",     type:"debuff", stat:"dot",       value:8,   duration:3, stackable:true },
  burn:        { name:"灼烧",     type:"debuff", stat:"dot",       value:10,  duration:2, stackable:true },
  freeze:      { name:"冰冻",     type:"debuff", stat:"skip",     value:1,   duration:1, stackable:false },
  weakness:    { name:"虚弱",     type:"debuff", stat:"damage",    value:0.7, duration:2, stackable:false },
  silence:     { name:"沉默",     type:"debuff", stat:"noskill",  value:1,   duration:2, stackable:false },
};

function applyBuffs(entity, kernel, random) {
  const buffs = entity.getComponent("Buffs") || { active:[] };
  const updated = [];
  for (const b of buffs.active || []) {
    b.duration--;
    if (b.duration > 0) updated.push(b);
  }
  kernel.updateComponent(entity.id, "Buffs", { active: updated }, entity.version);
  return updated;
}

// ══════════════════════════════════════
// Combo System (v2.1) — data-driven chains
// ══════════════════════════════════════
export const COMBOS = {
  "fire_blast:thunder_strike": { name:"烈焰雷霆", bonus:0.3, fx:"电光与火焰交织" },
  "sword_slash:sword_rain":     { name:"剑雨连斩", bonus:0.25, fx:"剑影漫天" },
  "ice_lance:fire_blast":       { name:"冰火两重天", bonus:0.4, fx:"冰火交加" },
  "iron_palm:thunder_fist":     { name:"铁雷双击", bonus:0.2, fx:"拳拳到肉" },
  "heal_pulse:qi_shield":       { name:"金蝉护体", bonus:0.1, fx:"治愈中架起护盾" },
};
let _lastSkill = null;
function checkCombo(skillId) {
  if (!_lastSkill) { _lastSkill = skillId; return null; }
  const key = `${_lastSkill}:${skillId}`;
  const combo = COMBOS[key];
  _lastSkill = skillId;
  return combo;
}

// ══════════════════════════════════════
// Boss Phases (v2.1)
// ══════════════════════════════════════
export const BOSS_PHASES = {
  normal:    { name:"正常",      hpThreshold:1.0, atkMult:1.0, defMult:1.0, newSkills:[], aiPersonality:"balanced" },
  enraged:   { name:"狂怒",      hpThreshold:0.5, atkMult:1.5, defMult:0.8, newSkills:["thunder_strike"], aiPersonality:"aggressive" },
  desperate: { name:"濒死",      hpThreshold:0.2, atkMult:2.0, defMult:0.5, newSkills:["sword_intent"], aiPersonality:"fanatic" },
  revived:   { name:"复苏",      hpThreshold:0.0, atkMult:1.3, defMult:1.3, newSkills:["heal_pulse"], aiPersonality:"strategist" },
};

function getBossPhase(entity, boss) {
  if (!boss) return null;
  const hp = entity.getComponent("HP") || { current:100, max:100 };
  const ratio = hp.current / hp.max;
  if (boss.phases.includes("revived") && ratio <= 0) return BOSS_PHASES.revived;
  if (ratio <= 0.2 && boss.phases.includes("desperate")) return BOSS_PHASES.desperate;
  if (ratio <= 0.5 && boss.phases.includes("enraged")) return BOSS_PHASES.enraged;
  return BOSS_PHASES.normal;
}

function applyBossPhase(entity, boss, phase, random) {
  if (!boss || !phase || boss.currentPhase === phase.name) return;
  boss.currentPhase = phase.name;
  // Add boss-specific skills
  if (phase.newSkills) {
    const skills = entity.getComponent("Skills")?.learned || [];
    for (const sid of phase.newSkills) {
      if (!skills.includes(sid)) skills.push(sid);
    }
  }
  // Update AI personality
  if (phase.aiPersonality) {
    boss.aiPersonality = phase.aiPersonality;
  }
  boss.atkMultiplier = phase.atkMult;
  boss.defMultiplier = phase.defMult;
}

function getBuffMultiplier(entity, statType) {
  const buffs = entity.getComponent("Buffs")?.active || [];
  let multiplier = 1.0;
  for (const b of buffs) {
    const def = BUFFS[b.id];
    if (def && def.stat === statType) {
      if (def.type === "buff") multiplier *= def.value;
      else multiplier *= def.value;
    }
  }
  return multiplier;
}

// ══════════════════════════════════════
// Damage Formula (enhanced v2.0)
// ══════════════════════════════════════
function calcDamage(attacker, defender, action, random) {
  const aRealm = attacker.getComponent("Realm")?.realm_id || 1;
  const dRealm = defender.getComponent("Realm")?.realm_id || 1;
  const realmDiff = aRealm - dRealm;
  const eqA = getEquipmentModifiers(attacker);
  const eqD = getEquipmentModifiers(defender);

  // Element multiplier
  const attRoot = attacker.getComponent("SpiritualRoot");
  const defRoot = defender.getComponent("SpiritualRoot");
  const elemMult = getElementMultiplier(attRoot, defRoot);

  // Buff multipliers
  const atkBuff = getBuffMultiplier(attacker, "damage");
  const defBuff = getBuffMultiplier(defender, "incoming");

  const base = (aRealm * 8 + realmDiff * 5 + eqA.atkBonus) * atkBuff;
  let damage = Math.max(1, base * (1 + realmDiff * 0.15) * elemMult * defBuff - eqD.defBonus * 0.5);

  const critChance = 0.15 + Math.max(0, realmDiff) * 0.02;
  let critical = false;
  if (random.chance(critChance)) { damage = Math.floor(damage * 1.8); critical = true; }

  if (action === "defend") damage = Math.floor(damage * 0.6);
  return { damage: Math.max(1, Math.floor(damage)), critical, elementMultiplier: elemMult };
}

function checkDodge(attacker, defender, random) {
  const aRealm = attacker.getComponent("Realm")?.realm_id || 1;
  const dRealm = defender.getComponent("Realm")?.realm_id || 1;
  const dodgeBuff = getBuffMultiplier(defender, "dodge");
  const base = 0.08 + Math.max(0, dRealm - aRealm) * 0.03;
  return random.chance(base * dodgeBuff);
}

function checkFlee(attacker, defender, random) {
  const aRealm = attacker.getComponent("Realm")?.realm_id || 1;
  const dRealm = defender.getComponent("Realm")?.realm_id || 1;
  return random.chance(0.4 + Math.max(0, aRealm - dRealm) * 0.1);
}

// ══════════════════════════════════════
// Combat AI (v2.0)
// ══════════════════════════════════════
const AI_PERSONALITIES = {
  aggressive:{ preferAttack:0.8, fleeThreshold:0.2, skillUse:0.5 },
  defensive: { preferAttack:0.4, fleeThreshold:0.5, skillUse:0.3 },
  balanced:  { preferAttack:0.5, fleeThreshold:0.35, skillUse:0.4 },
  coward:    { preferAttack:0.2, fleeThreshold:0.7, skillUse:0.2 },
  strategist:{ preferAttack:0.4, fleeThreshold:0.3, skillUse:0.7 },
  fanatic:   { preferAttack:0.9, fleeThreshold:0.1, skillUse:0.6 },
  guardian:  { preferAttack:0.5, fleeThreshold:0.2, skillUse:0.3 },
};

function npcDecideAction(npc, opponent, random) {
  const personality = npc.getComponent("Behavior")?.personality || "balanced";
  const ai = AI_PERSONALITIES[personality] || AI_PERSONALITIES.balanced;
  const hp = npc.getComponent("HP") || { current: 100, max: 100 };
  const hpRatio = hp.current / hp.max;
  const oppHp = opponent.getComponent("HP") || { current: 100, max: 100 };
  const oppHpRatio = oppHp.current / oppHp.max;
  const buffs = npc.getComponent("Buffs")?.active || [];

  // Flee if low HP
  if (hpRatio < ai.fleeThreshold && oppHpRatio > 0.3) return "flee";
  // Use skill if available
  const skills = npc.getComponent("Skills")?.learned || [];
  const notSilenced = !buffs.some(b => BUFFS[b.id]?.stat === "noskill");
  if (skills.length > 0 && notSilenced && random.chance(ai.skillUse)) return "skill";
  // Attack
  if (random.chance(ai.preferAttack)) return "attack";
  return "defend";
}

// ══════════════════════════════════════
// Combat Engine
// ══════════════════════════════════════
export class CombatEngine {
  constructor(seed) {
    this.random = new WorldRandom(seed);
    this.activeBattles = new Map();
  }

  startBattle(entity1, entity2, kernel) {
    const battleId = `battle_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const r1 = entity1.getComponent("Realm")?.realm_id || 1;
    const r2 = entity2.getComponent("Realm")?.realm_id || 1;
    const order = r1 >= r2 ? [entity1.id, entity2.id] : [entity2.id, entity1.id];

    const battle = {
      battleId, participants: [entity1.id, entity2.id],
      order, currentTurn: 0, round: 1,
      defender: order[1], attacker: order[0],
      log: [], status: "active", startedAt: Date.now(),
    };
    this.activeBattles.set(battleId, battle);
    return battle;
  }

  processAction(battleId, action, kernel, npcAction) {
    const battle = this.activeBattles.get(battleId);
    if (!battle || battle.status !== "active") return null;

    const attEntity = kernel.getEntity(battle.attacker);
    const defEntity = kernel.getEntity(battle.defender);
    if (!attEntity || !defEntity) { battle.status = "ended"; return { ...battle, result: "entity_gone" }; }

    const attName = (attEntity.getComponent("Identity") || {}).name || battle.attacker;
    const defName = (defEntity.getComponent("Identity") || {}).name || battle.defender;

    // AI decides if not a player action
    if (npcAction) action = npcDecideAction(attEntity, defEntity, this.random);

    let entry = { round: battle.round, attacker: attName, defender: defName, action };

    switch (action) {
      case "attack": {
        if (checkDodge(attEntity, defEntity, this.random)) {
          entry.result = "dodged"; entry.message = `${defName} 闪避了攻击！`; battle.log.push(entry); break;
        }
        const { damage, critical, elementMultiplier } = calcDamage(attEntity, defEntity, "attack", this.random);
        // Apply shield
        const shield = getBuffMultiplier(defEntity, "shield") > 1 ? getBuffMultiplier(defEntity, "shield") * 20 : 0;
        const effectiveDmg = Math.max(0, damage - shield);
        const hp = defEntity.getComponent("HP") || { current: 100, max: 100 };
        const newHP = Math.max(0, hp.current - effectiveDmg);
        kernel.updateComponent(defEntity.id, "HP", { ...hp, current: newHP }, defEntity.version);

        entry.damage = effectiveDmg; entry.critical = critical; entry.elementMultiplier = elementMultiplier;
        entry.remainingHP = newHP;
        entry.message = `${attName} ${critical ? "暴击！" : ""}造成 ${effectiveDmg} 点伤害 ${elementMultiplier !== 1 ? (elementMultiplier > 1 ? "⚔克制" : "🛡抵抗") : ""} (${defName} 剩余 ${newHP}/${hp.max})`;
        if (newHP <= 0) { battle.status = "ended"; battle.victor = attEntity.id; entry.result = "kill"; entry.message += " — 击杀！"; }
        battle.log.push(entry); break;
      }

      case "skill": {
        const skillId = entry.skillId || "sword_slash";
        const skill = SKILLS[skillId];
        if (!skill) { entry.message = "未知技能"; battle.log.push(entry); break; }
        if (checkDodge(attEntity, defEntity, this.random)) {
          entry.result = "dodged"; entry.message = `${defName} 闪避了 ${skill.name}！`; battle.log.push(entry); break;
        }
        const { damage: rawDmg, critical, elementMultiplier } = calcDamage(attEntity, defEntity, "attack", this.random);
        const mastery = attEntity.getComponent("Skills")?.masteries?.[skillId] || 1;
        const damage = getSkillDamage(skillId, rawDmg, mastery);
        const hp = defEntity.getComponent("HP") || { current: 100, max: 100 };
        const newHP = Math.max(0, hp.current - damage);
        kernel.updateComponent(defEntity.id, "HP", { ...hp, current: newHP }, defEntity.version);
        entry.damage = damage; entry.critical = critical; entry.skillName = skill.name; entry.elementMultiplier = elementMultiplier;
        entry.remainingHP = newHP;
        entry.message = `${attName} 施展 ${skill.name}！${critical?"暴击！":""}造成 ${damage} 点伤害 ${elementMultiplier!==1?(elementMultiplier>1?"⚔克制":"🛡抵抗"):""} (${defName} 剩余 ${newHP}/${hp.max})`;
        // Combo check
        const combo = checkCombo(skillId);
        if (combo) { entry.message += ` 💥${combo.name}连击!`; entry.damage = Math.floor(entry.damage * (1+combo.bonus)); }
        // Practice (improve mastery)
        practiceSkill(attEntity, skillId, kernel);
        // Apply cooldown
        applyCooldown(skillId, attEntity, kernel);
        if (newHP <= 0) { battle.status = "ended"; battle.victor = attEntity.id; entry.result = "kill"; entry.message += " — 击杀！"; }
        battle.log.push(entry); break;
      }

      case "defend":
        entry.result = "defended"; entry.message = `${attName} 转为防御姿态`; battle.log.push(entry); break;

      case "flee":
        if (checkFlee(attEntity, defEntity, this.random)) {
          battle.status = "ended"; battle.result = "fled"; entry.result = "fled"; entry.message = `${attName} 成功逃脱！`;
        } else { entry.result = "flee_failed"; entry.message = `${attName} 逃脱失败！`; }
        battle.log.push(entry); break;

      default: entry.message = "无效操作"; battle.log.push(entry);
    }

    // Boss phase check (v2.1)
    const bossDef = battle.bossDef;
    if (bossDef) {
      const phase = getBossPhase(defEntity, bossDef);
      if (phase && phase.name !== bossDef.currentPhase) {
        applyBossPhase(defEntity, bossDef, phase, this.random);
        entry.phaseChange = phase.name;
        entry.message = (entry.message || "") + ` ⚡Boss进入${phase.name}阶段!`;
      }
    }

    // Apply regen/dot buffs
    applyBuffs(attEntity, kernel, this.random);

    if (battle.status === "active") {
      [battle.attacker, battle.defender] = [battle.defender, battle.attacker];
      battle.round++;
    }
    return battle;
  }

  // Auto-resolve NPC vs NPC combat
  autoResolve(entity1, entity2, kernel) {
    const battle = this.startBattle(entity1, entity2, kernel);
    let result = battle;
    for (let i = 0; i < 20; i++) {
      result = this.processAction(battle.battleId, "attack", kernel, true);
      if (result.status === "ended") break;
    }
    return result;
  }

  getBattle(battleId) { return this.activeBattles.get(battleId) || null; }
  cleanup(battleId) { this.activeBattles.delete(battleId); }
}
