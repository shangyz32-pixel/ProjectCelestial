// runtime/crafting/index.js
// v2.1 Sprint 6 — Crafting Framework (炼器)
// Materials, Forging, Enchantment, Ascension, Artifacts.
// Deterministic, Replay-compatible, ECS-integrated.

import { WorldRandom } from "../random/index.js";
import { EQUIPMENT_CATALOG, createEquipment, QUALITIES, AFFIX_POOL } from "../equipment/index.js";

// ══════════════════════════════════════
// Material Catalog
// ══════════════════════════════════════
export const MATERIALS = {
  iron_ore:     { name:"铁矿石",   grade:1, source:"mine",    rarity:"common",    value:10 },
  copper_ore:   { name:"铜矿石",   grade:1, source:"mine",    rarity:"common",    value:8 },
  silver_ore:   { name:"银矿石",   grade:2, source:"mine",    rarity:"uncommon",  value:30 },
  gold_ore:     { name:"金石",     grade:3, source:"mine",    rarity:"rare",      value:100 },
  spirit_ore:   { name:"灵石矿",   grade:4, source:"spirit_vein",rarity:"epic",   value:400 },
  dragon_ore:   { name:"龙晶矿",   grade:5, source:"dragon_lair",rarity:"legendary",value:1500 },

  beast_fang:   { name:"兽牙",     grade:2, source:"beast",   rarity:"uncommon",  value:25 },
  beast_hide:   { name:"兽皮",     grade:2, source:"beast",   rarity:"uncommon",  value:20 },
  demon_core:   { name:"魔核",     grade:4, source:"demon",   rarity:"rare",      value:250 },
  dragon_scale: { name:"龙鳞",     grade:5, source:"dragon",  rarity:"legendary", value:1000 },
  phoenix_feather:{ name:"凤羽",   grade:6, source:"phoenix", rarity:"mythic",    value:5000 },

  spirit_wood:  { name:"灵木",     grade:2, source:"forest",  rarity:"uncommon",  value:35 },
  ancient_wood: { name:"古木",     grade:4, source:"ancient", rarity:"epic",      value:500 },
  crystal_shard:{ name:"水晶碎片", grade:3, source:"cave",    rarity:"rare",      value:150 },
  jade_essence: { name:"玉髓",     grade:4, source:"spirit_vein",rarity:"epic",   value:600 },
  immortal_jade: { name:"仙玉",    grade:6, source:"heaven",  rarity:"mythic",    value:10000 },
  shadow_essence: { name:"暗影精华", grade:3, source:"cave",    rarity:"rare",      value:200 },
  magma_core:     { name:"熔岩之核", grade:4, source:"volcano", rarity:"epic",      value:500 },
  star_fragment:  { name:"星辰碎片", grade:5, source:"celestial",rarity:"legendary",value:2000 },
};

// ══════════════════════════════════════
// Crafting Recipes (materials → equipment)
// ══════════════════════════════════════
export const CRAFTING_RECIPES = {
  forge_spirit_sword: {
    name:"锻造灵剑", skillReq:1, output:"spirit_sword",
    materials:["iron_ore"], quantities:[3],
    successRate:0.9, qualityChance:{ uncommon:0.3 },
  },
  forge_flying_sword: {
    name:"锻造飞剑", skillReq:2, output:"flying_sword",
    materials:["iron_ore","silver_ore"], quantities:[2,1],
    successRate:0.7, qualityChance:{ rare:0.1, uncommon:0.4 },
  },
  forge_spear: {
    name:"锻造长枪", skillReq:1, output:"spear",
    materials:["iron_ore","copper_ore"], quantities:[3,1],
    successRate:0.85, qualityChance:{ uncommon:0.2 },
  },
  forge_dragon_sword: {
    name:"铸龙牙剑", skillReq:5, output:"dragon_blade",
    materials:["dragon_ore","dragon_scale","spirit_ore"], quantities:[2,1,2],
    successRate:0.4, qualityChance:{ epic:0.5, legendary:0.1 },
  },
  forge_spirit_vest: {
    name:"制灵甲", skillReq:3, output:"spirit_vest",
    materials:["beast_hide","spirit_wood","silver_ore"], quantities:[3,2,1],
    successRate:0.6, qualityChance:{ rare:0.2, epic:0.05 },
  },
  forge_dragon_armor: {
    name:"铸龙鳞甲", skillReq:6, output:"dragon_scale",
    materials:["dragon_scale","spirit_ore","beast_hide"], quantities:[3,2,2],
    successRate:0.3, qualityChance:{ epic:0.4, legendary:0.15 },
  },
  forge_ring: {
    name:"制玉戒", skillReq:2, output:"jade_ring",
    materials:["jade_essence","silver_ore"], quantities:[1,2],
    successRate:0.75, qualityChance:{ rare:0.1, uncommon:0.3 },
  },
  forge_amulet: {
    name:"制灵符", skillReq:3, output:"spirit_amulet",
    materials:["jade_essence","crystal_shard","spirit_wood"], quantities:[1,1,1],
    successRate:0.55, qualityChance:{ rare:0.3, epic:0.08 },
  },
  forge_shadow_blade: {
    name:"锻暗影刃", skillReq:4, output:"blade",
    materials:["shadow_essence","iron_ore","crystal_shard"], quantities:[1,2,1],
    successRate:0.5, qualityChance:{ rare:0.4, epic:0.1 },
  },
  forge_magma_armor: {
    name:"铸熔岩甲", skillReq:5, output:"spirit_vest",
    materials:["magma_core","silver_ore","beast_hide"], quantities:[1,3,2],
    successRate:0.45, qualityChance:{ epic:0.3, legendary:0.05 },
  },
  forge_star_ring: {
    name:"铸星戒", skillReq:6, output:"dragon_ring",
    materials:["star_fragment","jade_essence","crystal_shard"], quantities:[1,2,1],
    successRate:0.35, qualityChance:{ epic:0.5, legendary:0.1 },
  },
  forge_celestial_bow: {
    name:"铸星辰弓", skillReq:5, output:"bow",
    materials:["star_fragment","spirit_wood","ancient_wood"], quantities:[1,2,1],
    successRate:0.4, qualityChance:{ epic:0.3, legendary:0.08 },
  },
};

// ══════════════════════════════════════
// Gather materials from region
// ══════════════════════════════════════
const REGION_MATERIALS = {
  forest: ["copper_ore","beast_fang","beast_hide","spirit_wood"],
  mountain: ["iron_ore","silver_ore","crystal_shard","spirit_wood"],
  cave: ["iron_ore","crystal_shard","gold_ore","demon_core"],
  spirit_vein: ["spirit_ore","jade_essence"],
  dragon_lair: ["dragon_ore","dragon_scale"],
  ancient: ["ancient_wood","gold_ore","jade_essence"],
};

export function gatherMaterial(entity, region, kernel, random) {
  const available = REGION_MATERIALS[region] || REGION_MATERIALS.forest;
  const matId = available[random.nextInt(0, available.length - 1)];
  const mat = MATERIALS[matId];
  if (!mat) return null;

  const gatherChance = mat.rarity === "common" ? 0.5 : mat.rarity === "uncommon" ? 0.3 : mat.rarity === "rare" ? 0.15 : 0.05;
  if (!random.chance(gatherChance)) return null;

  const inv = entity.getComponent("Inventory") || { items:{} };
  const items = { ...inv.items };
  items[matId] = (items[matId] || 0) + 1;
  kernel.updateComponent(entity.id, "Inventory", { items }, entity.version);
  return { material: matId, name: mat.name, grade: mat.grade, rarity: mat.rarity };
}

// ══════════════════════════════════════
// Forge equipment
// ══════════════════════════════════════
export function forgeEquipment(recipeId, entity, kernel, random) {
  const recipe = CRAFTING_RECIPES[recipeId];
  if (!recipe) return { error:"未知配方" };
  const realm = entity.getComponent("Realm")?.realm_id || 1;
  if (realm < recipe.skillReq) return { error:`需要Lv${recipe.skillReq}` };

  const inv = entity.getComponent("Inventory") || { items:{} };
  const items = inv.items || {};
  for (let i = 0; i < recipe.materials.length; i++) {
    const mat = recipe.materials[i];
    const qty = recipe.quantities[i];
    if ((items[mat] || 0) < qty) return { error:`需要 ${qty}x ${MATERIALS[mat]?.name || mat}` };
  }

  // Consume materials
  const newItems = { ...items };
  for (let i = 0; i < recipe.materials.length; i++) {
    newItems[recipe.materials[i]] -= recipe.quantities[i];
    if (newItems[recipe.materials[i]] <= 0) delete newItems[recipe.materials[i]];
  }

  // Success check
  if (!random.chance(recipe.successRate)) {
    kernel.updateComponent(entity.id, "Inventory", { items: newItems }, entity.version);
    return { error:"锻造失败，材料损耗" };
  }

  // Quality roll
  let quality = "common";
  const roll = random.nextFloat(0, 1);
  let cumulative = 0;
  for (const [qid, chance] of Object.entries(recipe.qualityChance || {})) {
    cumulative += chance;
    if (roll < cumulative) { quality = qid; break; }
  }

  const equipment = createEquipment(kernel, recipe.output, random, quality);
  if (!equipment) return { error:"锻造异常" };

  // Add to inventory
  const eqKey = `eq_${recipe.output}`;
  newItems[eqKey] = (newItems[eqKey] || 0) + 1;
  kernel.updateComponent(entity.id, "Inventory", { items: newItems }, entity.version);
  return { success:true, equipment, quality:quality, recipe:recipe.name };
}

// ══════════════════════════════════════
// Enchant — add/reroll affix on equipment
// ══════════════════════════════════════
export function enchantEquipment(entity, slotId, kernel, random) {
  const eq = entity.getComponent("Equipment");
  if (!eq || !eq.slots || !eq.slots[slotId]) return { error:"No item in slot" };
  const item = eq.slots[slotId];
  const maxAffixes = QUALITIES[item.quality]?.affixSlots || 1;
  if (item.affixes && item.affixes.length >= maxAffixes) return { error:"词缀已满" };

  // Cost: spirit stones
  const inv = entity.getComponent("Inventory") || { items:{} };
  const stones = inv.items?.spirit_stone || 0;
  const cost = item.quality === "legendary" ? 500 : item.quality === "epic" ? 200 : 50;
  if (stones < cost) return { error:`需要${cost}灵石` };

  const newItems = { ...inv.items, spirit_stone: stones - cost };
  kernel.updateComponent(entity.id, "Inventory", { items: newItems }, entity.version);

  // Select random affix not already present
  const available = Object.entries(AFFIX_POOL).filter(([id]) => !(item.affixes||[]).find(a => a.id === id));
  if (available.length === 0) return { error:"无可附魔词缀" };
  const [aid, affix] = available[random.nextInt(0, available.length - 1)];
  item.affixes = [...(item.affixes||[]), { id:aid, ...affix }];
  eq.slots[slotId] = item;
  kernel.updateComponent(entity.id, "Equipment", eq, entity.version);
  return { success:true, affix:{ id:aid, name:affix.name }, item };
}

// ══════════════════════════════════════
// Ascend — upgrade equipment quality tier
// ══════════════════════════════════════
const QUALITY_TIERS = ["common","uncommon","rare","epic","legendary" /*,"immortal","divine" explicitly crafted*/];

export function ascendEquipment(entity, slotId, kernel, random) {
  const eq = entity.getComponent("Equipment");
  if (!eq || !eq.slots || !eq.slots[slotId]) return { error:"No item in slot" };
  const item = eq.slots[slotId];
  const currentTier = QUALITY_TIERS.indexOf(item.quality);
  if (currentTier < 0 || currentTier >= QUALITY_TIERS.length - 1) return { error:"无法升阶" };

  // Cost: rare materials
  const inv = entity.getComponent("Inventory") || { items:{} };
  const items = inv.items || {};
  const needJade = currentTier + 1;
  if ((items.jade_essence || 0) < needJade) return { error:`需要${needJade}玉髓` };

  const newItems = { ...items, jade_essence: items.jade_essence - needJade };
  if (newItems.jade_essence <= 0) delete newItems.jade_essence;

  // Success check: 70% → 40% → 25%
  const successChance = [0.7, 0.4, 0.25, 0.15][currentTier] || 0.1;
  if (!random.chance(successChance)) {
    kernel.updateComponent(entity.id, "Inventory", { items: newItems }, entity.version);
    return { error:"升阶失败，材料消耗" };
  }

  // Upgrade
  const newQuality = QUALITY_TIERS[currentTier + 1];
  const qDef = QUALITIES[newQuality];
  item.quality = newQuality;
  item.qualityName = qDef.name;
  item.qualityColor = qDef.color;
  item.totalAtk = Math.round(item.totalAtk * 1.3);
  item.totalDef = Math.round(item.totalDef * 1.3);
  item.totalHp  = Math.round(item.totalHp * 1.3);
  eq.slots[slotId] = item;
  kernel.updateComponent(entity.id, "Equipment", eq, entity.version);
  kernel.updateComponent(entity.id, "Inventory", { items: newItems }, entity.version);
  return { success:true, quality:newQuality, qualityName:qDef.name, item };
}
