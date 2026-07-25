// runtime/skills/index.js
// v2.1 Sprint 3 — Skill Framework
// Mastery tiers, practice, cooldowns, skill tree, qi costs.
// Deterministic, Replay-compatible, ECS-based.

// ══════════════════════════════════════
// Skill Mastery Tiers
// ══════════════════════════════════════
export const MASTERY_TIERS = {
  1: { name:"习得",   multi:1.0,  practiceNeeded:0    },
  2: { name:"熟练",   multi:1.15, practiceNeeded:10   },
  3: { name:"精通",   multi:1.3,  practiceNeeded:30   },
  4: { name:"大成",   multi:1.5,  practiceNeeded:80   },
  5: { name:"化境",   multi:2.0,  practiceNeeded:200  },
};

// ══════════════════════════════════════
// Skill Database (enhanced with cooldown)
// ══════════════════════════════════════
export const SKILLS = {
  // Sword
  sword_slash:   { name:"剑气斩",   category:"sword",  type:"attack",  damage:1.5, qiCost:5,  cooldown:1, realmReq:1 },
  sword_rain:    { name:"剑雨",     category:"sword",  type:"attack",  damage:2.0, qiCost:12, cooldown:2, realmReq:3 },
  sword_heart:   { name:"剑心通明", category:"sword",  type:"attack",  damage:2.5, qiCost:20, cooldown:3, realmReq:5 },

  // Magic
  fire_blast:    { name:"烈焰术",   category:"magic",  type:"attack",  damage:1.6, qiCost:8,  cooldown:1, realmReq:2 },
  thunder_strike:{ name:"天雷击",   category:"magic",  type:"attack",  damage:2.2, qiCost:15, cooldown:2, realmReq:4 },
  ice_lance:     { name:"冰晶矛",   category:"magic",  type:"attack",  damage:1.8, qiCost:10, cooldown:1, realmReq:3 },

  // Fist
  iron_palm:     { name:"铁砂掌",   category:"fist",   type:"attack",  damage:1.3, qiCost:3,  cooldown:0, realmReq:1 },
  thunder_fist:  { name:"奔雷拳",   category:"fist",   type:"attack",  damage:1.9, qiCost:10, cooldown:1, realmReq:3 },

  // Movement
  shadow_step:   { name:"影步",     category:"movement",type:"defense", dodgeBonus:0.3, qiCost:8,  cooldown:1, realmReq:2 },

  // Support
  heal_pulse:    { name:"回春术",   category:"support", type:"heal",    heal:0.3,  qiCost:10, cooldown:2, realmReq:2 },
  qi_shield:     { name:"灵气护盾", category:"support", type:"defense", shield:0.5, qiCost:15, cooldown:2, realmReq:3 },

  // Passive
  iron_body:     { name:"铁骨功",   category:"passive", type:"passive", defBonus:5,  qiCost:0, cooldown:0, realmReq:1 },
  sharp_sense:   { name:"锐感",     category:"passive", type:"passive", critBonus:0.05, qiCost:0, cooldown:0, realmReq:2 },
  meditation:    { name:"静心诀",   category:"passive", type:"passive", qiRegen:3,   qiCost:0, cooldown:0, realmReq:1 },

  // Wind (new branch)
  wind_blade:    { name:"风刃",     category:"wind",    type:"attack",  damage:1.7, qiCost:8,  cooldown:1, realmReq:2 },
  gale_storm:    { name:"狂风",     category:"wind",    type:"aoe",     damage:1.5, qiCost:18, cooldown:3, realmReq:4 },

  // Ice (new branch)
  frost_nova:    { name:"霜冻新星", category:"ice",     type:"aoe",     damage:1.4, qiCost:12, cooldown:2, realmReq:3 },
  absolute_zero: { name:"绝对零度", category:"ice",     type:"debuff",  freeze:2,   qiCost:25, cooldown:4, realmReq:6 },

  // Dark (new branch)
  shadow_strike: { name:"暗影刺",   category:"dark",    type:"attack",  damage:2.0, qiCost:15, cooldown:2, realmReq:4 },
  curse:         { name:"诅咒术",   category:"dark",    type:"debuff",  curse:0.2,  qiCost:20, cooldown:3, realmReq:5 },

  // Buff (new type)
  fire_aura:     { name:"烈焰光环", category:"magic",   type:"buff",    atkBoost:10,  qiCost:15, cooldown:3, realmReq:3 },
  spirit_bless:  { name:"灵动祝福", category:"support", type:"buff",    speedBoost:0.2, qiCost:12, cooldown:2, realmReq:2 },

  // Summon (new type)
  spirit_wolf:   { name:"召唤灵狼", category:"summon",  type:"summon",  damage:1.5, qiCost:25, cooldown:5, realmReq:4 },

  // Elements (v2.2) — water/wood/metal/earth/light
  water_whip:    { name:"水鞭",     category:"water",   type:"attack",  damage:1.5, qiCost:7,  cooldown:1, realmReq:2 },
  vine_trap:     { name:"藤缚术",   category:"wood",    type:"debuff",  root:2,     qiCost:12, cooldown:2, realmReq:3 },
  iron_spear:    { name:"金矛术",   category:"metal",   type:"attack",  damage:1.8, qiCost:10, cooldown:1, realmReq:3 },
  holy_light:    { name:"圣光术",   category:"light",   type:"heal",    heal:0.25,  qiCost:15, cooldown:2, realmReq:3 },

  // Divine (realm 5+)
  sword_intent:  { name:"剑意",     category:"divine",  type:"attack",  damage:4.0, qiCost:50, cooldown:5, realmReq:6 },
  domain:        { name:"领域展开", category:"divine",  type:"aura",    allBoost:0.3, qiCost:80, cooldown:10, realmReq:8 },
  soul_suppress: { name:"神魂镇压", category:"divine",  type:"debuff",  weaken:0.3, qiCost:40, cooldown:4, realmReq:7 },
};

// ══════════════════════════════════════
// Skill Tree — unlock paths
// ══════════════════════════════════════
export const SKILL_TREE = {
  // Sword path
  sword_slash:  { unlocks:["sword_rain"],        requires:[] },
  sword_rain:   { unlocks:["sword_heart"],       requires:["sword_slash"] },
  sword_heart:  { unlocks:["sword_intent"],      requires:["sword_rain"] },
  sword_intent: { unlocks:[],                     requires:["sword_heart"] },

  // Magic path
  fire_blast:    { unlocks:["thunder_strike","ice_lance"], requires:[] },
  thunder_strike:{ unlocks:[],                     requires:["fire_blast"] },
  ice_lance:     { unlocks:["soul_suppress"],      requires:["fire_blast"] },
  soul_suppress: { unlocks:[],                     requires:["ice_lance"] },

  // Fist path
  iron_palm:     { unlocks:["thunder_fist"],       requires:[] },
  thunder_fist:  { unlocks:[],                     requires:["iron_palm"] },

  // Support path
  heal_pulse:    { unlocks:["qi_shield"],          requires:[] },
  qi_shield:     { unlocks:[],                     requires:["heal_pulse"] },

  // Standalone
  shadow_step:   { unlocks:[], requires:[] },
  iron_body:     { unlocks:[], requires:[] },
  sharp_sense:   { unlocks:[], requires:[] },
  domain:        { unlocks:[], requires:["sword_heart"] },
};

// ══════════════════════════════════════
// NPC Skill Table by realm
// ══════════════════════════════════════
const NPC_SKILL_TABLE = {
  1: ["sword_slash","iron_palm","iron_body"],
  2: ["fire_blast","shadow_step","sharp_sense","heal_pulse"],
  3: ["sword_rain","thunder_fist","ice_lance","qi_shield"],
  4: ["thunder_strike"],
  5: ["sword_heart"],
  6: ["sword_intent"],
  7: ["soul_suppress"],
  9: ["domain"],
};

export function assignNPCSkills(realmId, random) {
  const skills = [];
  for (const [req, slist] of Object.entries(NPC_SKILL_TABLE)) {
    if (realmId >= parseInt(req)) {
      for (const sid of slist) if (!skills.includes(sid)) skills.push(sid);
    }
  }
  return skills.length > 0 ? skills : ["sword_slash"];
}

// ══════════════════════════════════════
// Skill damage with mastery multiplier
// ══════════════════════════════════════
export function getSkillDamage(skillId, baseDamage, masteryLevel) {
  const skill = SKILLS[skillId];
  if (!skill || skill.type !== "attack") return baseDamage;
  const tier = MASTERY_TIERS[masteryLevel || 1] || MASTERY_TIERS[1];
  return Math.floor(baseDamage * (skill.damage || 1.0) * tier.multi);
}

// ══════════════════════════════════════
// Check if skill is usable (qi + cooldown)
// ══════════════════════════════════════
export function canUseSkill(skillId, entity) {
  const skill = SKILLS[skillId];
  if (!skill) return false;
  const realm = entity.getComponent("Realm")?.realm_id || 1;
  if (realm < (skill.realmReq || 1)) return false;
  const skillsComp = entity.getComponent("Skills") || { learned:[], masteries:{}, cooldowns:{} };
  if (!skillsComp.learned?.includes(skillId)) return false;
  // Cooldown check
  const cd = (skillsComp.cooldowns || {})[skillId] || 0;
  if (cd > 0) return false;
  return true;
}

// ══════════════════════════════════════
// Learn a skill (with tree prerequisite)
// ══════════════════════════════════════
export function learnSkill(entity, skillId, kernel) {
  const skillsComp = entity.getComponent("Skills") || { learned:[], masteries:{}, cooldowns:{}, practices:{} };
  if (skillsComp.learned?.includes(skillId)) return false;
  const skill = SKILLS[skillId];
  if (!skill) return false;
  const realm = entity.getComponent("Realm")?.realm_id || 1;
  if (realm < (skill.realmReq || 1)) return false;

  // Skill tree prereq
  const tree = SKILL_TREE[skillId];
  if (tree?.requires?.length) {
    for (const reqId of tree.requires) {
      if (!skillsComp.learned?.includes(reqId)) return false;
    }
  }

  skillsComp.learned = [...(skillsComp.learned || []), skillId];
  skillsComp.masteries = { ...(skillsComp.masteries || {}), [skillId]: 1 };
  skillsComp.practices = { ...(skillsComp.practices || {}), [skillId]: 0 };
  const e = kernel.getEntity(entity.id);
  kernel.updateComponent(e.id, "Skills", skillsComp, e.version);
  return true;
}

// ══════════════════════════════════════
// Practice — improve skill through use
// ══════════════════════════════════════
export function practiceSkill(entity, skillId, kernel) {
  const skillsComp = entity.getComponent("Skills") || { learned:[], masteries:{}, cooldowns:{}, practices:{} };
  if (!skillsComp.learned?.includes(skillId)) return null;

  const mastery = skillsComp.masteries?.[skillId] || 1;
  if (mastery >= 5) return null; // maxed

  const tier = MASTERY_TIERS[mastery + 1];
  const practices = (skillsComp.practices?.[skillId] || 0) + 1;
  skillsComp.practices = { ...skillsComp.practices, [skillId]: practices };

  let result = null;
  if (practices >= tier.practiceNeeded) {
    skillsComp.masteries = { ...skillsComp.masteries, [skillId]: mastery + 1 };
    skillsComp.practices = { ...skillsComp.practices, [skillId]: 0 };
    result = { skillId, skillName: SKILLS[skillId]?.name, mastery: mastery + 1, tierName: MASTERY_TIERS[mastery + 1].name };
  }

  const e = kernel.getEntity(entity.id);
  kernel.updateComponent(e.id, "Skills", skillsComp, e.version);
  return result;
}

// ══════════════════════════════════════
// Tick cooldowns down by 1 each round
// ══════════════════════════════════════
export function tickCooldowns(entity, kernel) {
  const skillsComp = entity.getComponent("Skills") || {};
  if (!skillsComp.cooldowns) return;
  const updated = {};
  for (const [sid, cd] of Object.entries(skillsComp.cooldowns || {})) {
    updated[sid] = Math.max(0, cd - 1);
  }
  kernel.updateComponent(entity.id, "Skills", { ...skillsComp, cooldowns: updated }, entity.version);
}

// Apply cooldown after skill use
export function applyCooldown(skillId, entity, kernel) {
  const skill = SKILLS[skillId];
  if (!skill || !skill.cooldown) return;
  const skillsComp = entity.getComponent("Skills") || { cooldowns:{} };
  skillsComp.cooldowns = { ...skillsComp.cooldowns, [skillId]: skill.cooldown };
  kernel.updateComponent(entity.id, "Skills", skillsComp, entity.version);
}

// Get entity skill proficiency summary
export function getSkillSummary(entity) {
  const skillsComp = entity.getComponent("Skills") || { learned:[], masteries:{}, cooldowns:{}, practices:{} };
  return {
    learned: skillsComp.learned || [],
    total: (skillsComp.learned || []).length,
    masteries: skillsComp.masteries || {},
    cooldowns: skillsComp.cooldowns || {},
    byTier: (skillsComp.learned || []).reduce((acc, sid) => {
      const m = skillsComp.masteries?.[sid] || 1;
      acc[m] = (acc[m] || 0) + 1;
      return acc;
    }, {}),
  };
}
