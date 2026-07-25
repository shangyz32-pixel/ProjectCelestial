// runtime/skills/index.js
// Sprint 3 — Skill Framework
// Deterministic, data-driven. All state changes through Kernel API.

// Skill database
export const SKILLS = {
  // Sword
  sword_slash:   { name:"剑气斩",   category:"sword",  type:"attack",  damage:1.5, qiCost:5,  realmReq:1 },
  sword_rain:    { name:"剑雨",     category:"sword",  type:"attack",  damage:2.0, qiCost:12, realmReq:3 },
  sword_heart:   { name:"剑心通明", category:"sword",  type:"attack",  damage:2.5, qiCost:20, realmReq:5 },

  // Magic
  fire_blast:    { name:"烈焰术",   category:"magic",  type:"attack",  damage:1.6, qiCost:8,  realmReq:2 },
  thunder_strike:{ name:"天雷击",   category:"magic",  type:"attack",  damage:2.2, qiCost:15, realmReq:4 },
  ice_lance:     { name:"冰晶矛",   category:"magic",  type:"attack",  damage:1.8, qiCost:10, realmReq:3 },

  // Fist
  iron_palm:     { name:"铁砂掌",   category:"fist",   type:"attack",  damage:1.3, qiCost:3,  realmReq:1 },
  thunder_fist:  { name:"奔雷拳",   category:"fist",   type:"attack",  damage:1.9, qiCost:10, realmReq:3 },

  // Movement
  shadow_step:   { name:"影步",     category:"movement", type:"defense", dodgeBonus:0.3, qiCost:8,  realmReq:2 },

  // Support
  heal_pulse:    { name:"回春术",   category:"support", type:"heal",    heal:0.3,  qiCost:10, realmReq:2 },
  qi_shield:     { name:"灵气护盾", category:"support", type:"defense", shield:0.5,qiCost:15, realmReq:3 },

  // Passive (always active, no qi cost)
  iron_body:     { name:"铁骨功",   category:"passive", type:"passive", defBonus:5, qiCost:0, realmReq:1 },
  sharp_sense:   { name:"锐感",     category:"passive", type:"passive", critBonus:0.05, qiCost:0, realmReq:2 },
};

// Skill book: what skills NPCs learn at each realm
const NPC_SKILL_TABLE = {
  1: ["sword_slash","iron_palm"],
  2: ["fire_blast","shadow_step","iron_body"],
  3: ["sword_rain","thunder_fist","ice_lance"],
  4: ["thunder_strike","qi_shield","sharp_sense"],
  5: ["sword_heart","heal_pulse"],
  8: ["sword_heart","thunder_strike","qi_shield","heal_pulse"],
};

// Assign skills to NPC based on realm
export function assignNPCSkills(realmId, random) {
  const skills = [];
  for (const [req, slist] of Object.entries(NPC_SKILL_TABLE)) {
    if (realmId >= parseInt(req)) {
      for (const sid of slist) {
        if (!skills.includes(sid)) skills.push(sid);
      }
    }
  }
  return skills.length > 0 ? skills : ["sword_slash"];
}

// Calculate skill damage modifier for combat
export function getSkillDamage(skillId, baseDamage) {
  const skill = SKILLS[skillId];
  if (!skill) return baseDamage;
  if (skill.type === "attack") {
    const multiplier = skill.damage || 1.0;
    return Math.floor(baseDamage * multiplier);
  }
  return baseDamage;
}

// Check if entity can use a skill
export function canUseSkill(skillId, entity) {
  const skill = SKILLS[skillId];
  if (!skill) return false;
  const realm = entity.getComponent("Realm")?.realm_id || 1;
  if (realm < (skill.realmReq || 1)) return false;
  const skills = entity.getComponent("Skills")?.learned || [];
  return skills.includes(skillId);
}

// Learn a skill
export function learnSkill(entity, skillId, kernel) {
  const skills = entity.getComponent("Skills") || { learned: [] };
  if (skills.learned.includes(skillId)) return false;
  const skill = SKILLS[skillId];
  if (!skill) return false;
  const realm = entity.getComponent("Realm")?.realm_id || 1;
  if (realm < (skill.realmReq || 1)) return false;
  skills.learned = [...skills.learned, skillId];
  const e = kernel.getEntity(entity.id);
  kernel.updateComponent(e.id, "Skills", skills, e.version);
  return true;
}
