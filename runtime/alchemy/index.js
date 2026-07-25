// runtime/alchemy/index.js
// v2.1 Sprint 5 — Alchemy Framework
// Herbs, Recipes, Pills, Refining, Breakthrough Integration.
// Deterministic. Replay-compatible. ECS-integrated.

import { WorldRandom } from "../random/index.js";

// ══════════════════════════════════════
// Herb Catalog
// ══════════════════════════════════════
export const HERBS = {
  spirit_grass:    { name:"灵草",    grade:1, element:"wood",   rarity:"common",    region:["all"],        growthTime:10, value:5 },
  fire_lotus:      { name:"火莲",    grade:2, element:"fire",   rarity:"uncommon",  region:["volcanic","desert"], growthTime:30, value:30 },
  moon_orchid:     { name:"月兰",    grade:2, element:"water",  rarity:"uncommon",  region:["forest","mountain"], growthTime:25, value:25 },
  thunder_vine:    { name:"雷藤",    grade:3, element:"lightning",rarity:"rare",   region:["mountain","storm"],  growthTime:50, value:80 },
  ice_crystal:     { name:"冰晶花",  grade:3, element:"ice",    rarity:"rare",      region:["snowfield"],        growthTime:60, value:100 },
  golden_ginseng:  { name:"金参",    grade:4, element:"metal",  rarity:"epic",      region:["mountain","ancient"],growthTime:100, value:300 },
  soul_mushroom:   { name:"魂菇",    grade:4, element:"dark",   rarity:"epic",      region:["cavern","underworld"],growthTime:120, value:350 },
  blood_root:      { name:"血根",    grade:5, element:"fire",   rarity:"legendary", region:["volcanic","ancient"],growthTime:200, value:1000 },
  heavenly_peach:  { name:"仙桃",    grade:6, element:"light",  rarity:"legendary", region:["floating_island"],growthTime:500, value:5000 },
  dream_flower:    { name:"梦昙花",  grade:3, element:"dark",   rarity:"rare",      region:["cave","forest"],    growthTime:80, value:200 },
  sun_grass:       { name:"阳炎草",  grade:4, element:"fire",   rarity:"epic",      region:["desert","volcanic"],growthTime:150, value:500 },
  moon_dew:        { name:"月华露",  grade:2, element:"water",  rarity:"uncommon",  region:["forest","mountain"],  growthTime:30, value:40 },
  crystal_herb:    { name:"晶凝草",  grade:3, element:"metal",  rarity:"rare",      region:["cave","mountain"],    growthTime:70, value:150 },
};

// ══════════════════════════════════════
// Recipe Catalog
// ══════════════════════════════════════
export const RECIPES = {
  qi_pill: {
    name:"回气丹", difficulty:1, furnaceReq:"iron",
    ingredients:["spirit_grass"], quantities:[3],
    successRate:0.9, refineTime:3,
    output:{ type:"qi_recovery", value:20, quality:"common" },
  },
  foundation_pill: {
    name:"筑基丹", difficulty:2, furnaceReq:"iron",
    ingredients:["spirit_grass","fire_lotus"], quantities:[5,1],
    successRate:0.7, refineTime:5,
    output:{ type:"breakthrough", value:0.10, quality:"good" },
  },
  healing_pill: {
    name:"疗伤丹", difficulty:1, furnaceReq:"iron",
    ingredients:["spirit_grass","moon_orchid"], quantities:[3,1],
    successRate:0.85, refineTime:3,
    output:{ type:"hp_recovery", value:30, quality:"common" },
  },
  spirit_gathering: {
    name:"聚灵丹", difficulty:2, furnaceReq:"spirit",
    ingredients:["fire_lotus","moon_orchid"], quantities:[2,2],
    successRate:0.65, refineTime:6,
    output:{ type:"cultivation_boost", value:0.15, duration:50, quality:"excellent" },
  },
  breakthrough_pill: {
    name:"破境丹", difficulty:4, furnaceReq:"ancient",
    ingredients:["thunder_vine","golden_ginseng","blood_root"], quantities:[2,1,1],
    successRate:0.4, refineTime:10,
    output:{ type:"breakthrough", value:0.30, quality:"excellent" },
  },
  immortal_pill: {
    name:"飞升丹", difficulty:6, furnaceReq:"heaven",
    ingredients:["golden_ginseng","soul_mushroom","heavenly_peach"], quantities:[2,2,1],
    successRate:0.2, refineTime:20,
    output:{ type:"breakthrough", value:0.50, quality:"legendary" },
  },
  longevity_pill: {
    name:"延寿丹", difficulty:3, furnaceReq:"spirit",
    ingredients:["golden_ginseng","blood_root"], quantities:[2,1],
    successRate:0.5, refineTime:8,
    output:{ type:"hp_max_boost", value:20, quality:"excellent" },
  },
  poison_antidote: {
    name:"解毒丹", difficulty:1, furnaceReq:"iron",
    ingredients:["moon_orchid","dream_flower"], quantities:[2,1],
    successRate:0.8, refineTime:2,
    output:{ type:"hp_recovery", value:15, quality:"good" },
  },
  enlightenment_pill: {
    name:"顿悟丹", difficulty:5, furnaceReq:"ancient",
    ingredients:["sun_grass","soul_mushroom","dream_flower"], quantities:[1,1,1],
    successRate:0.3, refineTime:15,
    output:{ type:"cultivation_boost", value:0.25, duration:100, quality:"epic" },
  },
  crystal_pill: {
    name:"晶凝丹", difficulty:3, furnaceReq:"spirit",
    ingredients:["crystal_herb","moon_dew"], quantities:[2,1],
    successRate:0.6, refineTime:5,
    output:{ type:"qi_recovery", value:35, quality:"excellent" },
  },
  fate_pill: {
    name:"天命丹", difficulty:4, furnaceReq:"ancient",
    ingredients:["golden_ginseng","moon_dew","dream_flower"], quantities:[1,2,1],
    successRate:0.35, refineTime:12,
    output:{ type:"breakthrough", value:0.15, quality:"epic" },
  },
  ice_soul_pill: {
    name:"冰心丹", difficulty:5, furnaceReq:"immortal",
    ingredients:["ice_crystal","soul_mushroom","moon_dew"], quantities:[2,1,1],
    successRate:0.25, refineTime:18,
    output:{ type:"cultivation_boost", value:0.20, duration:150, quality:"legendary" },
  },
};

// ══════════════════════════════════════
// Furnace Catalog
// ══════════════════════════════════════
export const FURNACES = {
  iron:     { name:"铁炉",    qualityMult:1.0, fireTypes:["ordinary"],         cost:100, successBonus:0 },
  spirit:   { name:"灵炉",    qualityMult:1.2, fireTypes:["ordinary","spirit"], cost:500, successBonus:5 },
  ancient:  { name:"古炉",    qualityMult:1.5, fireTypes:["spirit","earth"],    cost:2000, successBonus:10 },
  heaven:   { name:"天炉",    qualityMult:2.0, fireTypes:["spirit","heavenly"], cost:8000, successBonus:20 },
  immortal: { name:"仙炉",    qualityMult:3.0, fireTypes:["heavenly","phoenix","chaos"], cost:50000, successBonus:30 },
};

// ══════════════════════════════════════
// Fire Types
// ══════════════════════════════════════
export const FIRES = {
  ordinary: { name:"凡火",    successBonus:0,   qualityBoost:0, mutationChance:0.02 },
  spirit:   { name:"灵火",    successBonus:5,   qualityBoost:0.1, mutationChance:0.05 },
  earth:    { name:"地火",    successBonus:10,  qualityBoost:0.15, mutationChance:0.08 },
  heavenly: { name:"天火",    successBonus:15,  qualityBoost:0.25, mutationChance:0.12 },
  phoenix:  { name:"凤凰火",  successBonus:20,  qualityBoost:0.30, mutationChance:0.20 },
  chaos:    { name:"混沌火",  successBonus:25,  qualityBoost:0.40, mutationChance:0.30 },
};

// ══════════════════════════════════════
// Pill Quality
// ══════════════════════════════════════
export const PILL_QUALITIES = {
  common:    { name:"凡品",   multi:1.0,  color:"#aaa" },
  good:      { name:"良品",   multi:1.2,  color:"#0f0" },
  excellent: { name:"上品",   multi:1.5,  color:"#06f" },
  perfect:   { name:"极品",   multi:2.0,  color:"#90f" },
  legendary: { name:"仙品",   multi:3.0,  color:"#f90" },
  immortal:  { name:"神品",   multi:5.0,  color:"#ff0" },
};

// ══════════════════════════════════════
// Refining Process
// ══════════════════════════════════════
export function refinePill(recipeId, entity, kernel, random) {
  const recipe = RECIPES[recipeId];
  if (!recipe) return { error:"Unknown recipe" };
  const furnace = entity.getComponent("Furnace") || { type:"iron" };
  const furnaceDef = FURNACES[furnace.type] || FURNACES.iron;
  const fireDef = FIRES[furnace.fire || "ordinary"];

  // Check ingredients
  const inv = entity.getComponent("Inventory") || { items:{} };
  const items = inv.items || {};
  for (let i = 0; i < recipe.ingredients.length; i++) {
    const herb = recipe.ingredients[i];
    const qty = recipe.quantities[i];
    if ((items[herb] || 0) < qty) return { error:`需要 ${qty}x ${HERBS[herb]?.name || herb}` };
  }

  // Consume ingredients
  const newItems = { ...items };
  for (let i = 0; i < recipe.ingredients.length; i++) {
    newItems[recipe.ingredients[i]] -= recipe.quantities[i];
    if (newItems[recipe.ingredients[i]] <= 0) delete newItems[recipe.ingredients[i]];
  }
  kernel.updateComponent(entity.id, "Inventory", { items: newItems }, entity.version);

  // Success check
  const successRate = recipe.successRate + (furnaceDef.successBonus + fireDef.successBonus) * 0.01;
  if (!random.chance(successRate)) {
    // Failure — possible partial recovery or damage
    const failureType = random.chance(0.3) ? "burst" : "burn";
    return { error: failureType === "burst" ? "炸炉！药材尽毁" : "炼丹失败，药材烧焦", success: false };
  }

  // Quality roll
  const qualityRoll = random.nextFloat(0, 1) + fireDef.qualityBoost;
  let quality = "common";
  if (qualityRoll > 0.95) quality = "immortal";
  else if (qualityRoll > 0.85) quality = "legendary";
  else if (qualityRoll > 0.7) quality = "perfect";
  else if (qualityRoll > 0.5) quality = "excellent";
  else if (qualityRoll > 0.3) quality = "good";

  const qDef = PILL_QUALITIES[quality];
  const output = recipe.output;
  const pill = {
    recipeId, name: recipe.name, type: output.type,
    value: Math.round((output.value || 0) * qDef.multi),
    duration: output.duration || 0,
    quality, qualityName: qDef.name, qualityColor: qDef.color,
  };

  // Add to inventory
  const pillKey = `pill_${recipeId}`;
  newItems[pillKey] = (newItems[pillKey] || 0) + 1;

  // Mutation chance
  let mutation = null;
  if (random.chance(fireDef.mutationChance)) {
    pill.mutated = true;
    pill.value = Math.round(pill.value * 1.5);
    pill.name = `变异${pill.name}`;
    pill.quality = "legendary";
    mutation = "变异成功！药效提升50%";
  }

  kernel.updateComponent(entity.id, "Inventory", { items: newItems }, entity.version);
  return { success: true, pill, mutation };
}

// ══════════════════════════════════════
// Consume pill
// ══════════════════════════════════════
export function consumePill(entity, pillKey, kernel) {
  const inv = entity.getComponent("Inventory") || { items:{} };
  const items = inv.items || {};
  if (!items[pillKey] || items[pillKey] <= 0) return { error:"没有此丹药" };

  const [_, recipeId] = pillKey.split("_");
  const recipe = RECIPES[recipeId];
  if (!recipe) return { error:"未知丹药" };

  // Consume
  items[pillKey] -= 1;
  if (items[pillKey] <= 0) delete items[pillKey];
  kernel.updateComponent(entity.id, "Inventory", { items }, entity.version);

  const output = recipe.output;
  let effect = {};

  switch (output.type) {
    case "hp_recovery": {
      const hp = entity.getComponent("HP") || { current:100, max:100 };
      const newHP = Math.min(hp.max, hp.current + output.value);
      kernel.updateComponent(entity.id, "HP", { ...hp, current: newHP }, entity.version);
      effect = { type:"hp", healed: output.value };
      break;
    }
    case "qi_recovery": {
      effect = { type:"qi", recovered: output.value, msg: `恢复${output.value}点真气` };
      break;
    }
    case "breakthrough": {
      const realm = entity.getComponent("Realm") || {};
      kernel.updateComponent(entity.id, "Realm", { ...realm, breakthrough_bonus: (realm.breakthrough_bonus||0) + output.value }, entity.version);
      effect = { type:"breakthrough", bonus: output.value, msg: `突破成功率+${Math.round(output.value*100)}%` };
      break;
    }
    case "cultivation_boost": {
      effect = { type:"cultivation", boost: output.value, msg: `修炼速度+${Math.round(output.value*100)}%` };
      break;
    }
    case "hp_max_boost": {
      const hp = entity.getComponent("HP") || { current:100, max:100 };
      kernel.updateComponent(entity.id, "HP", { ...hp, max: hp.max + output.value, current: hp.current + output.value }, entity.version);
      effect = { type:"hp_max", boost: output.value, msg: `生命上限+${output.value}` };
      break;
    }
  }

  return { success:true, pillName: recipe.name, effect };
}

// ══════════════════════════════════════
// Herbalism — gather specific herb in world
// ══════════════════════════════════════
export function gatherHerb(entity, herbId, region, kernel, random) {
  const herb = HERBS[herbId];
  if (!herb) return null;
  if (!herb.region.includes("all") && !herb.region.includes(region)) return null;
  if (!random.chance(0.3 + (herb.rarity === "common" ? 0.3 : herb.rarity === "uncommon" ? 0.15 : herb.rarity === "rare" ? 0.08 : 0.03))) return null;

  const inv = entity.getComponent("Inventory") || { items:{} };
  const items = { ...inv.items };
  items[herbId] = (items[herbId] || 0) + 1;
  kernel.updateComponent(entity.id, "Inventory", { items }, entity.version);
  return { herb: herbId, name: herb.name, grade: herb.grade, rarity: herb.rarity };
}
