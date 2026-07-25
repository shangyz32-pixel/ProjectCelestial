// runtime/cultivation/index.js
// v2.0 Advanced Cultivation Framework
// Spiritual Roots, Constitutions, Methods, Tribulation, Heart Demon
// Pure data + extension of existing ECS. Deterministic. Replay-compatible.

// ══════════════════════════════════════
// Spiritual Roots
// ══════════════════════════════════════
export const SPIRITUAL_ROOTS = {
  // Basic elements
  metal:     { name:"金灵根",   element:"metal",   rarity:"common",  speedMult:1.0,  purity:{min:30,max:100} },
  wood:      { name:"木灵根",   element:"wood",    rarity:"common",  speedMult:1.0,  purity:{min:30,max:100} },
  water:     { name:"水灵根",   element:"water",   rarity:"common",  speedMult:1.0,  purity:{min:30,max:100} },
  fire:      { name:"火灵根",   element:"fire",    rarity:"common",  speedMult:1.0,  purity:{min:30,max:100} },
  earth:     { name:"土灵根",   element:"earth",   rarity:"common",  speedMult:1.0,  purity:{min:30,max:100} },
  wind:      { name:"风灵根",   element:"wind",    rarity:"uncommon",speedMult:1.1,  purity:{min:40,max:100} },
  lightning: { name:"雷灵根",   element:"lightning",rarity:"uncommon",speedMult:1.15, purity:{min:40,max:100} },
  ice:       { name:"冰灵根",   element:"ice",     rarity:"uncommon",speedMult:1.1,  purity:{min:40,max:100} },

  // Special roots
  light:     { name:"光灵根",   element:"light",   rarity:"rare",    speedMult:1.3,  purity:{min:60,max:100} },
  dark:      { name:"暗灵根",   element:"dark",    rarity:"rare",    speedMult:1.3,  purity:{min:60,max:100} },

  // Legendary roots
  heaven:    { name:"天灵根",   element:"heaven",  rarity:"legendary",speedMult:2.0, purity:{min:80,max:100} },
  earth_root:{ name:"地灵根",   element:"earth_special",rarity:"legendary",speedMult:1.8,purity:{min:70,max:100} },
  chaos:     { name:"混沌灵根", element:"chaos",   rarity:"legendary",speedMult:1.5, purity:{min:50,max:100} },

  // Mortal
  mortal:    { name:"凡根",     element:"none",    rarity:"mortal",   speedMult:0.5,  purity:{min:10,max:30} },
};

// Multi-root types
export const ROOT_COMBINATIONS = {
  single:  { name:"单一灵根", count:1,  speedBonus:0.0,  desc:"专精一道" },
  dual:    { name:"双灵根",   count:2,  speedBonus:0.05, desc:"相辅相成" },
  triple:  { name:"三灵根",   count:3,  speedBonus:0.0,  desc:"博而不精" },
  five:    { name:"五行灵根", count:5,  speedBonus:-0.05, desc:"五行俱全", special:"five_elements" },
  mixed:   { name:"杂灵根",   count:"4+",speedBonus:-0.10,desc:"根基混杂" },
};

// ══════════════════════════════════════
// Special Constitutions
// ══════════════════════════════════════
export const CONSTITUTIONS = {
  none:        { name:"凡体",      rarity:"common",    speedMult:1.0,  tribulationResist:0,  passives:{} },

  spirit_body:{ name:"灵体",      rarity:"uncommon",  speedMult:1.2,  tribulationResist:5,  passives:{qiBoost:0.1} },
  sword_body: { name:"剑体",      rarity:"uncommon",  speedMult:1.1,  tribulationResist:10, passives:{atkBonus:5} },
  fire_body:  { name:"火灵体",    rarity:"rare",      speedMult:1.3,  tribulationResist:5,  passives:{fireAffinity:0.2} },
  ice_body:   { name:"冰灵体",    rarity:"rare",      speedMult:1.3,  tribulationResist:5,  passives:{iceAffinity:0.2} },
  dragon_body:{ name:"龙体",      rarity:"legendary", speedMult:2.0,  tribulationResist:20, passives:{atkBonus:15,defBonus:10} },
  phoenix_body:{name:"凤体",      rarity:"legendary", speedMult:1.8,  tribulationResist:15, passives:{healBonus:0.3,fireAffinity:0.3} },
  chaos_body: { name:"混沌体",    rarity:"legendary", speedMult:1.5,  tribulationResist:10, passives:{allElements:0.15} },
};

// ══════════════════════════════════════
// Cultivation Methods
// ══════════════════════════════════════
export const CULTIVATION_METHODS = {
  qi_refining:     { name:"炼气诀",   category:"qi",     speedMult:1.0,  qiRecovery:0.05, style:"稳健",   breakthroughBonus:0  },
  body_refining:   { name:"锻体术",   category:"body",   speedMult:0.8,  qiRecovery:0.03, style:"刚猛",   breakthroughBonus:5  },
  sword_dao:       { name:"剑道心法", category:"sword",  speedMult:1.1,  qiRecovery:0.04, style:"锐利",   breakthroughBonus:3  },
  five_elements:   { name:"五行真解", category:"elements",speedMult:1.2, qiRecovery:0.06, style:"全面",   breakthroughBonus:2  },
  demonic_path:    { name:"魔道功法", category:"demonic",speedMult:1.5,  qiRecovery:0.08, style:"激进",   breakthroughBonus:-5 },
  buddhist_path:   { name:"佛门心经", category:"buddhist",speedMult:0.9, qiRecovery:0.07, style:"平和",   breakthroughBonus:10 },
  formation_path:  { name:"阵法真解", category:"formation",speedMult:1.0,qiRecovery:0.05, style:"巧变",   breakthroughBonus:0  },
  alchemy_path:    { name:"丹道真经", category:"alchemy",speedMult:0.9,  qiRecovery:0.06, style:"滋养",   breakthroughBonus:5  },
};

// ══════════════════════════════════════
// Heavenly Tribulation
// ══════════════════════════════════════
export const TRIBULATION_TYPES = {
  lightning:   { name:"天雷劫",    difficulty:1.0, damage:30, resistFactor:0.05 },
  fire:        { name:"天火劫",    difficulty:1.2, damage:35, resistFactor:0.04 },
  wind:        { name:"罡风劫",    difficulty:1.1, damage:25, resistFactor:0.06 },
  illusion:    { name:"心魔幻劫",  difficulty:1.3, damage:20, resistFactor:0.03 },
  heart_demon: { name:"心魔劫",    difficulty:1.5, damage:15, resistFactor:0.02 },
  mixed:       { name:"混元劫",    difficulty:1.8, damage:50, resistFactor:0.03 },
};

// Heart demon types
export const HEART_DEMONS = {
  greed:   { name:"贪欲之魔",   penalty:{speedMult:-0.3}, recoveryChance:0.3 },
  fear:    { name:"恐惧之魔",   penalty:{speedMult:-0.2,tribulationResist:-10}, recoveryChance:0.4 },
  hatred:  { name:"仇恨之魔",   penalty:{speedMult:-0.25,atkBonus:-5}, recoveryChance:0.35 },
  attachment:{ name:"执念之魔", penalty:{speedMult:-0.2,breakthroughBonus:-10}, recoveryChance:0.3 },
  pride:   { name:"傲慢之魔",   penalty:{speedMult:-0.15}, recoveryChance:0.5 },
  madness: { name:"疯狂之魔",   penalty:{speedMult:-0.4,tribulationResist:-20}, recoveryChance:0.2 },
};

// ══════════════════════════════════════
// Helper: Assign random spiritual root to entity
// ══════════════════════════════════════
export function assignRandomRoot(random, realmId) {
  const rootTypes = Object.keys(SPIRITUAL_ROOTS).filter(r => r !== "mortal");
  // Higher realm = better chance of rare roots
  const rareChance = Math.min(0.3, realmId * 0.05);
  const legendaryChance = Math.min(0.1, realmId * 0.02);

  let rootId;
  if (random.chance(legendaryChance)) {
    const legendaries = rootTypes.filter(r => SPIRITUAL_ROOTS[r].rarity === "legendary");
    rootId = legendaries[random.nextInt(0, legendaries.length - 1)] || rootTypes[0];
  } else if (random.chance(rareChance)) {
    const rares = rootTypes.filter(r => SPIRITUAL_ROOTS[r].rarity === "rare" || SPIRITUAL_ROOTS[r].rarity === "uncommon");
    rootId = rares[random.nextInt(0, rares.length - 1)] || rootTypes[0];
  } else {
    const commons = rootTypes.filter(r => SPIRITUAL_ROOTS[r].rarity === "common");
    rootId = commons[random.nextInt(0, commons.length - 1)] || "metal";
  }

  const template = SPIRITUAL_ROOTS[rootId];
  return {
    id: rootId,
    name: template.name,
    element: template.element,
    rarity: template.rarity,
    purity: random.nextInt(template.purity.min, template.purity.max),
    speedMultiplier: template.speedMult,
  };
}

// Assign random constitution
export function assignRandomConstitution(random, realmId) {
  const constitutions = Object.keys(CONSTITUTIONS);
  const legendaryChance = Math.min(0.08, realmId * 0.01);
  const rareChance = Math.min(0.2, realmId * 0.03);

  let conId;
  if (random.chance(legendaryChance)) {
    const legendaries = constitutions.filter(c => CONSTITUTIONS[c].rarity === "legendary");
    conId = legendaries.length > 0 ? legendaries[random.nextInt(0, legendaries.length - 1)] : "none";
  } else if (random.chance(rareChance)) {
    const rares = constitutions.filter(c => CONSTITUTIONS[c].rarity === "rare" || CONSTITUTIONS[c].rarity === "uncommon");
    conId = rares.length > 0 ? rares[random.nextInt(0, rares.length - 1)] : "none";
  } else {
    conId = "none";
  }

  return { id: conId, ...CONSTITUTIONS[conId] };
}

// Calculate effective cultivation speed multiplier
export function calcCultivationMultiplier(entity) {
  let multiplier = 1.0;

  const root = entity.getComponent("SpiritualRoot");
  if (root) multiplier *= root.speedMultiplier || 1.0;

  const constitution = entity.getComponent("Constitution");
  if (constitution) multiplier *= constitution.speedMult || 1.0;

  const method = entity.getComponent("CultivationMethod");
  if (method) multiplier *= method.speedMult || 1.0;

  const heartDemon = entity.getComponent("HeartDemon");
  if (heartDemon && heartDemon.active) {
    const demon = HEART_DEMONS[heartDemon.type];
    if (demon) multiplier *= 1.0 + (demon.penalty.speedMult || 0);
  }

  return multiplier;
}

// Calculate tribulation modifier
export function calcTribulationResist(entity) {
  let resist = 0;
  const constitution = entity.getComponent("Constitution");
  if (constitution) resist += constitution.tribulationResist || 0;
  const method = entity.getComponent("CultivationMethod");
  if (method) resist += method.breakthroughBonus || 0;
  return resist;
}

// Resolve tribulation outcome
export function resolveTribulation(entity, realmId, random) {
  const resist = calcTribulationResist(entity);
  const tribType = realmId >= 5 ? "mixed" : (realmId >= 3 ? "lightning" : "lightning");
  const template = TRIBULATION_TYPES[tribType];

  const passChance = 0.3 + resist * template.resistFactor;
  const success = random.chance(passChance);
  const damage = success ? 0 : Math.floor(template.damage * (1 - resist * 0.02));

  return {
    type: tribType,
    name: template.name,
    success,
    damage: Math.max(0, damage),
    passChance,
  };
}

// ══════════════════════════════════════
// Techniques (v2.0 Sprint 4) — non-combat cultivation arts
// ══════════════════════════════════════
export const TECHNIQUES = {
  meditation:     { name:"静心诀",     quality:"common",    effect:"speed",   value:0.05, desc:"稳固心神" },
  qi_gathering:   { name:"聚灵术",     quality:"common",    effect:"qi_boost",value:0.10,desc:"提升灵气汇集" },
  body_tempering: { name:"淬体术",     quality:"uncommon",  effect:"hp_max",  value:20,  desc:"强化肉身" },
  soul_cultivation:{ name:"养魂术",    quality:"rare",      effect:"tribulation",value:10,desc:"滋养神魂" },
  meridian_expand:{ name:"通脉诀",     quality:"rare",      effect:"speed",   value:0.15, desc:"拓宽经脉" },
  heart_cleansing:{ name:"清心咒",     quality:"epic",      effect:"heart_demon_recovery",value:0.1,desc:"净化心魔" },
  heaven_breath:  { name:"天息术",     quality:"legendary", effect:"speed",   value:0.25, desc:"汲取天地精华" },
};

export function assignRandomTechnique(random, realmId) {
  if (realmId < 2) return null;
  const entries = Object.entries(TECHNIQUES);
  const epicChance = Math.min(0.05, realmId * 0.01);
  const rareChance = Math.min(0.15, realmId * 0.03);
  let pool = entries.filter(([_,t]) => t.quality === "common");
  if (random.chance(epicChance)) pool = entries.filter(([_,t]) => t.quality === "legendary" || t.quality === "epic");
  else if (random.chance(rareChance)) pool = entries.filter(([_,t]) => t.quality === "rare" || t.quality === "uncommon");
  const [id, template] = pool[random.nextInt(0, pool.length - 1)] || entries[0];
  return { id, ...template };
}

export const DIVINE_POWERS = {
  sword_intent:   { name:"剑意",     realmReq:5,  effect:"critical", value:0.15, desc:"剑气通神" },
  domain:         { name:"领域",     realmReq:7,  effect:"all_stats",value:0.10,desc:"掌控天地" },
  teleportation:  { name:"瞬移",     realmReq:6,  effect:"dodge",    value:0.15,desc:"瞬息千里" },
  clone:          { name:"分身术",   realmReq:7,  effect:"double_atk",value:0.5,desc:"化出分身" },
  heaven_eye:     { name:"天眼",     realmReq:5,  effect:"dodge",    value:0.10,desc:"洞察万物" },
  soul_suppress:  { name:"神魂镇压", realmReq:6,  effect:"damage",   value:0.12,desc:"灵魂威压" },
};

export function checkAwakenDivinePower(entity, random) {
  const realm = entity.getComponent("Realm")?.realm_id || 1;
  const existing = entity.getComponent("DivinePower");
  if (existing) return null;
  const candidates = Object.entries(DIVINE_POWERS).filter(([_,p]) => realm >= p.realmReq);
  if (candidates.length === 0) return null;
  if (!random.chance(realm * 0.02)) return null;
  const [id, template] = candidates[random.nextInt(0, candidates.length - 1)];
  return { id, ...template };
}
