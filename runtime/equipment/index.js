// runtime/equipment/index.js
// v2.1 Sprint 2 — Equipment Framework
// ECS entities, random affixes, drop system, enhancement, equipment sets.
// Deterministic, Replay-compatible, Kernel API-driven.

import { WorldRandom } from "../random/index.js";

// ══════════════════════════════════════
// Equipment Base Catalog
// ══════════════════════════════════════
export const EQUIPMENT_CATALOG = {
  // Weapons (slot: weapon)
  spirit_sword:  { name:"灵剑",   slot:"weapon",  category:"weapon",  baseAtk:12, baseDef:0,  baseHp:0,  quality:"common",    value:90 },
  flying_sword:  { name:"飞剑",   slot:"weapon",  category:"weapon",  baseAtk:18, baseDef:2,  baseHp:0,  quality:"uncommon",  value:200 },
  spear:         { name:"长枪",   slot:"weapon",  category:"weapon",  baseAtk:15, baseDef:3,  baseHp:0,  quality:"common",    value:120 },
  blade:         { name:"弯刀",   slot:"weapon",  category:"weapon",  baseAtk:20, baseDef:1,  baseHp:0,  quality:"uncommon",  value:250 },
  bow:           { name:"灵弓",   slot:"weapon",  category:"weapon",  baseAtk:14, baseDef:0,  baseHp:0,  quality:"common",    value:100 },
  thunder_edge:  { name:"雷刃",   slot:"weapon",  category:"weapon",  baseAtk:25, baseDef:5,  baseHp:0,  quality:"rare",      value:500 },
  ice_lance:     { name:"冰刺",   slot:"weapon",  category:"weapon",  baseAtk:22, baseDef:2,  baseHp:0,  quality:"rare",      value:450 },
  dragon_blade:  { name:"龙牙剑", slot:"weapon",  category:"weapon",  baseAtk:35, baseDef:8,  baseHp:10, quality:"epic",      value:1500 },
  soul_reaper:   { name:"噬魂镰", slot:"weapon",  category:"weapon",  baseAtk:30, baseDef:3,  baseHp:0,  quality:"epic",      value:1200 },
  divine_sword:  { name:"天剑",   slot:"weapon",  category:"weapon",  baseAtk:50, baseDef:10, baseHp:20, quality:"legendary", value:5000 },

  // Armor — Head (slot: head)
  cloth_hat:     { name:"布帽",   slot:"head",   category:"armor",   baseAtk:0,  baseDef:3,  baseHp:10, quality:"common",    value:30 },
  iron_helmet:   { name:"铁盔",   slot:"head",   category:"armor",   baseAtk:0,  baseDef:8,  baseHp:15, quality:"uncommon",  value:80 },
  spirit_crown:  { name:"灵冠",   slot:"head",   category:"armor",   baseAtk:2,  baseDef:10, baseHp:20, quality:"rare",      value:300 },
  dragon_helm:   { name:"龙盔",   slot:"head",   category:"armor",   baseAtk:3,  baseDef:15, baseHp:30, quality:"epic",      value:800 },
  immortal_crown:{ name:"仙冠",   slot:"head",   category:"armor",   baseAtk:5,  baseDef:20, baseHp:50, quality:"legendary", value:3000 },

  // Armor — Body (slot: body)
  cloth_robe:    { name:"布袍",   slot:"body",   category:"armor",   baseAtk:0,  baseDef:5,  baseHp:20, quality:"common",    value:50 },
  leather_vest:  { name:"皮甲",   slot:"body",   category:"armor",   baseAtk:0,  baseDef:10, baseHp:25, quality:"uncommon",  value:120 },
  spirit_vest:   { name:"灵甲",   slot:"body",   category:"armor",   baseAtk:2,  baseDef:15, baseHp:35, quality:"rare",      value:400 },
  dragon_scale:  { name:"龙鳞甲", slot:"body",   category:"armor",   baseAtk:3,  baseDef:25, baseHp:50, quality:"epic",      value:1200 },
  celestial_robe:{ name:"天衣",   slot:"body",   category:"armor",   baseAtk:5,  baseDef:35, baseHp:80, quality:"legendary", value:4000 },

  // Armor — Legs (slot: legs)
  cloth_pants:   { name:"布裤",   slot:"legs",   category:"armor",   baseAtk:0,  baseDef:2,  baseHp:8,  quality:"common",    value:25 },
  iron_greaves:  { name:"铁护腿", slot:"legs",   category:"armor",   baseAtk:0,  baseDef:6,  baseHp:12, quality:"uncommon",  value:70 },
  spirit_greaves:{ name:"灵护腿", slot:"legs",   category:"armor",   baseAtk:1,  baseDef:10, baseHp:20, quality:"rare",      value:250 },
  dragon_greaves:{ name:"龙护腿", slot:"legs",   category:"armor",   baseAtk:2,  baseDef:18, baseHp:35, quality:"epic",      value:800 },

  // Armor — Boots (slot: boots)
  cloth_boots:   { name:"布鞋",   slot:"boots",  category:"armor",   baseAtk:0,  baseDef:1,  baseHp:5,  quality:"common",    value:20 },
  iron_boots:    { name:"铁靴",   slot:"boots",  category:"armor",   baseAtk:0,  baseDef:5,  baseHp:10, quality:"uncommon",  value:60 },
  wind_boots:    { name:"疾风靴", slot:"boots",  category:"armor",   baseAtk:2,  baseDef:3,  baseHp:10, quality:"rare",      value:300 },
  cloud_boots:   { name:"云履",   slot:"boots",  category:"armor",   baseAtk:3,  baseDef:8,  baseHp:20, quality:"epic",      value:700 },

  // Armor — Gloves (slot: gloves)
  cloth_gloves:  { name:"布手套", slot:"gloves", category:"armor",   baseAtk:1,  baseDef:2,  baseHp:5,  quality:"common",    value:20 },
  iron_gauntlets:{ name:"铁护手", slot:"gloves", category:"armor",   baseAtk:3,  baseDef:5,  baseHp:8,  quality:"uncommon",  value:60 },
  spirit_gauntlets:{ name:"灵手甲",slot:"gloves", category:"armor",   baseAtk:5,  baseDef:8,  baseHp:15, quality:"rare",      value:250 },
  dragon_gauntlets:{name:"龙手甲",slot:"gloves", category:"armor",   baseAtk:8,  baseDef:12, baseHp:25, quality:"epic",      value:800 },

  // Accessories (slots: ring, necklace, belt)
  jade_ring:     { name:"玉戒",   slot:"ring",   category:"accessory",baseAtk:3,  baseDef:5,  baseHp:15, quality:"uncommon",  value:100 },
  spirit_ring:   { name:"灵戒",   slot:"ring",   category:"accessory",baseAtk:5,  baseDef:8,  baseHp:25, quality:"rare",      value:350 },
  dragon_ring:   { name:"龙戒",   slot:"ring",   category:"accessory",baseAtk:8,  baseDef:10, baseHp:40, quality:"epic",      value:1000 },
  jade_pendant:  { name:"玉佩",   slot:"necklace",category:"accessory",baseAtk:2,  baseDef:3,  baseHp:20, quality:"uncommon",  value:80 },
  spirit_amulet: { name:"灵符",   slot:"necklace",category:"accessory",baseAtk:4,  baseDef:5,  baseHp:30, quality:"rare",      value:300 },
  immortal_jade: { name:"仙玉",   slot:"necklace",category:"accessory",baseAtk:6,  baseDef:8,  baseHp:50, quality:"legendary", value:2500 },

  // Belt (slot: belt)
  cloth_belt:    { name:"布带",   slot:"belt",   category:"accessory",baseAtk:0,  baseDef:1,  baseHp:5,  quality:"common",    value:10 },
  spirit_belt:   { name:"灵带",   slot:"belt",   category:"accessory",baseAtk:2,  baseDef:4,  baseHp:15, quality:"uncommon",  value:80 },
  jade_belt:     { name:"玉带",   slot:"belt",   category:"accessory",baseAtk:3,  baseDef:6,  baseHp:25, quality:"rare",      value:300 },
  dragon_belt:   { name:"龙带",   slot:"belt",   category:"accessory",baseAtk:5,  baseDef:10, baseHp:40, quality:"epic",      value:900 },
  immortal_belt: { name:"仙带",   slot:"belt",   category:"accessory",baseAtk:8,  baseDef:15, baseHp:60, quality:"legendary", value:3000 },

  // Bracelet (slot: bracelet) — v2.2
  copper_bangle: { name:"铜镯",   slot:"bracelet",category:"accessory",baseAtk:1,  baseDef:2,  baseHp:8,  quality:"common",    value:15 },
  silver_bangle: { name:"银镯",   slot:"bracelet",category:"accessory",baseAtk:2,  baseDef:4,  baseHp:15, quality:"uncommon",  value:60 },
  spirit_bangle: { name:"灵镯",   slot:"bracelet",category:"accessory",baseAtk:4,  baseDef:6,  baseHp:22, quality:"rare",      value:250 },
  dragon_bangle: { name:"龙镯",   slot:"bracelet",category:"accessory",baseAtk:7,  baseDef:10, baseHp:35, quality:"epic",      value:700 },
  phoenix_bangle:{ name:"凤镯",   slot:"bracelet",category:"accessory",baseAtk:9,  baseDef:12, baseHp:50, quality:"legendary", value:2000 },

  // Ring expansion
  gold_ring:     { name:"金戒",   slot:"ring",   category:"accessory",baseAtk:2,  baseDef:3,  baseHp:10, quality:"common",    value:50 },
  diamond_ring:  { name:"钻戒",   slot:"ring",   category:"accessory",baseAtk:4,  baseDef:6,  baseHp:20, quality:"uncommon",  value:150 },
  phoenix_ring:  { name:"凤戒",   slot:"ring",   category:"accessory",baseAtk:10, baseDef:12, baseHp:50, quality:"legendary", value:3500 },

  // Artifacts
  magic_mirror:  { name:"灵镜",   slot:"artifact",category:"artifact",baseAtk:5,  baseDef:10, baseHp:30, quality:"rare",      value:500 },
  ancient_seal:  { name:"古印",   slot:"artifact",category:"artifact",baseAtk:3,  baseDef:15, baseHp:40, quality:"epic",      value:1000 },
  spirit_bell:   { name:"灵钟",   slot:"artifact",category:"artifact",baseAtk:2,  baseDef:8,  baseHp:25, quality:"rare",      value:400 },
};

// ══════════════════════════════════════
// Quality & Rarity
// ══════════════════════════════════════
export const QUALITIES = {
  common:    { name:"凡品",  multi:1.0,  affixSlots:0, color:"#aaa",   dropWeight:40 },
  uncommon:  { name:"良品",  multi:1.2,  affixSlots:1, color:"#0f0",   dropWeight:25 },
  rare:      { name:"稀有",  multi:1.5,  affixSlots:2, color:"#06f",   dropWeight:15 },
  epic:      { name:"史诗",  multi:2.0,  affixSlots:3, color:"#90f",   dropWeight:8  },
  legendary: { name:"传说",  multi:3.0,  affixSlots:4, color:"#f90",   dropWeight:2  },
  immortal:  { name:"不朽",  multi:4.5,  affixSlots:5, color:"#f00",   dropWeight:0  },
  divine:    { name:"神品",  multi:7.0,  affixSlots:6, color:"#ff0",   dropWeight:0  },
};

// ══════════════════════════════════════
// Random Affix Pool
// ══════════════════════════════════════
export const AFFIX_POOL = {
  swift:       { name:"疾风",    stat:"speed",    value:5,  weight:10 },
  spirit:      { name:"聚灵",    stat:"qi_recovery",value:3,weight:10 },
  flaming:     { name:"烈焰",    stat:"attack",   value:5,  weight:8  },
  frozen:      { name:"寒冰",    stat:"defense",  value:5,  weight:8  },
  thunder:     { name:"雷霆",    stat:"critical", value:3,  weight:6  },
  bloodthirst: { name:"嗜血",    stat:"lifesteal",value:2,  weight:5  },
  lucky:       { name:"幸运",    stat:"luck",     value:3,  weight:5  },
  heavy:       { name:"沉重",    stat:"attack",   value:8,  statPenalty:"speed", penaltyValue:3, weight:4 },
  ancient:     { name:"远古",    stat:"all_stats",value:3,  weight:2  },
  divine:      { name:"神圣",    stat:"attack",   value:12, weight:1  },
};

// ══════════════════════════════════════
// Enhancement levels
// ══════════════════════════════════════
export const ENHANCEMENT_COST = [50, 100, 200, 400, 800, 1500, 3000, 5000, 8000, 10000];
export const ENHANCEMENT_CHANCE = [1.0, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.15];
export const ENHANCEMENT_BONUS = [0.05, 0.10, 0.15, 0.20, 0.25, 0.30, 0.40, 0.50, 0.65, 1.0];

// ══════════════════════════════════════
// Equipment Sets
// ══════════════════════════════════════
export const EQUIPMENT_SETS = {
  azure_dragon: {
    name:"青龙套装", pieces:["dragon_blade","dragon_helm","dragon_scale","dragon_ring"],
    bonuses:{ 2:{ atk:10, def:5 }, 4:{ atk:25, def:15, hp:50 } },
  },
  immortal: {
    name:"仙器套装", pieces:["divine_sword","immortal_crown","celestial_robe","immortal_jade"],
    bonuses:{ 2:{ atk:15, def:10 }, 3:{ atk:40, def:25, hp:100 } },
  },
};

// ══════════════════════════════════════
// Create Equipment Entity
// ══════════════════════════════════════
export function createEquipment(kernel, catalogId, random, forceQuality) {
  const template = EQUIPMENT_CATALOG[catalogId];
  if (!template) return null;

  // Quality roll
  let quality;
  if (forceQuality) {
    quality = forceQuality;
  } else {
    const totalWeight = Object.values(QUALITIES).reduce((s, q) => s + q.dropWeight, 0);
    let roll = random.nextFloat(0, totalWeight);
    for (const [qid, q] of Object.entries(QUALITIES)) {
      roll -= q.dropWeight;
      if (roll <= 0) { quality = qid; break; }
    }
    if (!quality) quality = "common";
  }

  const qDef = QUALITIES[quality];
  const qualityMulti = qDef.multi;

  // Generate affixes
  const affixes = [];
  for (let i = 0; i < qDef.affixSlots; i++) {
    if (random.chance(0.7 + i * -0.1)) {
      const totalW = Object.values(AFFIX_POOL).reduce((s,a)=>s+a.weight,0);
      let roll = random.nextFloat(0, totalW);
      for (const [aid, a] of Object.entries(AFFIX_POOL)) {
        roll -= a.weight;
        if (roll <= 0) {
          if (!affixes.find(x => x.id === aid)) affixes.push({ id: aid, ...a });
          break;
        }
      }
    }
  }

  // Calculate total stats
  const atk = Math.round((template.baseAtk || 0) * qualityMulti);
  const def = Math.round((template.baseDef || 0) * qualityMulti);
  const hp  = Math.round((template.baseHp  || 0) * qualityMulti);
  const totalAtk = affixes.reduce((s,a) => s + (a.stat === "attack" || a.stat === "all_stats" ? a.value : 0), atk);
  const totalDef = affixes.reduce((s,a) => s + (a.stat === "defense" || a.stat === "all_stats" ? a.value : 0), def);
  const totalHp  = affixes.reduce((s,a) => s + (a.stat === "all_stats" ? a.value * 2 : 0), hp);

  const equipment = {
    catalogId,
    name: template.name,
    slot: template.slot,
    category: template.category,
    quality,
    qualityName: qDef.name,
    qualityColor: qDef.color,
    baseAtk: atk, baseDef: def, baseHp: hp,
    totalAtk, totalDef, totalHp,
    affixes,
    enhancement: 0,
    durability: { current: 100, max: 100 },
    value: Math.round(template.value * qualityMulti),
    setId: template.setId || null,
  };

  return equipment;
}

// ══════════════════════════════════════
// Drop Generator
// ══════════════════════════════════════
export function generateLoot(kernel, sourceType, sourceRealm, random) {
  const items = [];
  const baseCount = sourceType === "boss" ? 3 : sourceType === "monster" ? 1 : 2;
  const count = baseCount + random.nextInt(0, Math.floor(sourceRealm / 3));

  // Filter catalog by realm level
  const available = Object.keys(EQUIPMENT_CATALOG).filter(id => {
    const t = EQUIPMENT_CATALOG[id];
    const qLevel = { common:1, uncommon:2, rare:4, epic:6, legendary:8 }[t.quality] || 1;
    return qLevel <= sourceRealm + 1;
  });

  for (let i = 0; i < count; i++) {
    if (available.length === 0) break;
    const catalogId = available[random.nextInt(0, available.length - 1)];
    const item = createEquipment(kernel, catalogId, random);
    if (item) items.push(item);
  }

  return items;
}

// ══════════════════════════════════════
// Enhancement
// ══════════════════════════════════════
export function enhanceEquipment(entity, slotId, kernel, random) {
  const equipment = entity.getComponent("Equipment");
  if (!equipment || !equipment.slots) return { error: "No equipment" };

  const item = equipment.slots[slotId];
  if (!item) return { error: "No item in slot" };
  if (item.enhancement >= 10) return { error: "Max enhancement reached" };

  const level = item.enhancement || 0;
  const cost = ENHANCEMENT_COST[level];
  const chance = ENHANCEMENT_CHANCE[level];
  const bonus = ENHANCEMENT_BONUS[level];

  // Check resources
  const inv = entity.getComponent("Inventory") || { items: {} };
  if ((inv.items.spirit_stone || 0) < cost) return { error: `Need ${cost} spirit stones` };

  // Consume stones
  kernel.updateComponent(entity.id, "Inventory", { items: { ...inv.items, spirit_stone: inv.items.spirit_stone - cost } }, entity.version);

  if (!random.chance(chance)) {
    if (level >= 3 && random.chance(0.3)) {
      item.enhancement = Math.max(0, level - 1);
      return { error: `Enhancement failed! -1 level`, item };
    }
    return { error: "Enhancement failed!", item };
  }

  item.enhancement = level + 1;
  item.totalAtk = Math.round(item.totalAtk * (1 + bonus));
  item.totalDef = Math.round(item.totalDef * (1 + bonus));
  item.totalHp = Math.round(item.totalHp * (1 + bonus));

  equipment.slots[slotId] = item;
  kernel.updateComponent(entity.id, "Equipment", equipment, entity.version + 1);
  return { ok: true, level: item.enhancement, item };
}

// ══════════════════════════════════════
// Equip / Unequip
// ══════════════════════════════════════
export function equipItem(entity, item, kernel) {
  const equipment = entity.getComponent("Equipment") || { slots: {}, equipped: [] };
  const slot = item.slot;
  const current = equipment.slots[slot];
  if (current) {
    // Unequip current
    equipment.equipped = (equipment.equipped || []).filter(i => i !== current.catalogId);
  }
  equipment.slots[slot] = item;
  equipment.equipped = [...(equipment.equipped || []), item.catalogId];
  equipment.totalAtk = Object.values(equipment.slots).reduce((s,i) => s + (i.totalAtk||0), 0);
  equipment.totalDef = Object.values(equipment.slots).reduce((s,i) => s + (i.totalDef||0), 0);
  equipment.totalHp  = Object.values(equipment.slots).reduce((s,i) => s + (i.totalHp||0), 0);

  // Check set bonuses
  equipment.setBonuses = {};
  for (const [setId, setDef] of Object.entries(EQUIPMENT_SETS)) {
    const matched = setDef.pieces.filter(p => equipment.equipped.includes(p)).length;
    for (const [count, bonus] of Object.entries(setDef.bonuses)) {
      if (matched >= parseInt(count)) {
        equipment.setBonuses[setId] = { count: matched, bonus };
        if (bonus.atk) { equipment.totalAtk += bonus.atk; equipment.setBonuses.atk = (equipment.setBonuses.atk||0) + bonus.atk; }
        if (bonus.def) { equipment.totalDef += bonus.def; equipment.setBonuses.def = (equipment.setBonuses.def||0) + bonus.def; }
        if (bonus.hp)  { equipment.totalHp  += bonus.hp;  equipment.setBonuses.hp  = (equipment.setBonuses.hp||0)  + bonus.hp; }
      }
    }
  }

  kernel.updateComponent(entity.id, "Equipment", equipment, entity.version);
  return { ok: true, equipment };
}

export function unequipItem(entity, slotId, kernel) {
  const equipment = entity.getComponent("Equipment") || { slots: {}, equipped: [] };
  const item = equipment.slots[slotId];
  if (!item) return { error: "No item in slot" };

  equipment.equipped = (equipment.equipped || []).filter(i => i !== item.catalogId);
  delete equipment.slots[slotId];
  equipment.totalAtk = Object.values(equipment.slots).reduce((s,i) => s + (i.totalAtk||0), 0);
  equipment.totalDef = Object.values(equipment.slots).reduce((s,i) => s + (i.totalDef||0), 0);
  equipment.totalHp  = Object.values(equipment.slots).reduce((s,i) => s + (i.totalHp||0), 0);

  kernel.updateComponent(entity.id, "Equipment", equipment, entity.version);
  return { ok: true, unequipped: item };
}

// ══════════════════════════════════════
// Get equipment modifiers for combat
// ══════════════════════════════════════
export function getEquipmentModifiers(entity) {
  const eq = entity.getComponent("Equipment") || {};
  return {
    atkBonus: eq.totalAtk || 0,
    defBonus: eq.totalDef || 0,
    hpBonus:  eq.totalHp || 0,
    criticalBonus: Object.values(eq.slots || {}).reduce((s, i) =>
      s + (i.affixes || []).filter(a => a.stat === "critical").reduce((x,a)=>x+a.value, 0), 0
    ),
    speedBonus: Object.values(eq.slots || {}).reduce((s, i) =>
      s + (i.affixes || []).filter(a => a.stat === "speed").reduce((x,a)=>x+a.value, 0), 0
    ),
    lifesteal: Object.values(eq.slots || {}).reduce((s, i) =>
      s + (i.affixes || []).filter(a => a.stat === "lifesteal").reduce((x,a)=>x+a.value, 0), 0
    ),
  };
}
