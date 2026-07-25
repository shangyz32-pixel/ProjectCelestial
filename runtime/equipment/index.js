// runtime/equipment/index.js
// Sprint 4 — Equipment System
// Equipment modifies combat attributes. Deterministic, data-driven.

// Quality tiers and stat multipliers
export const QUALITY = {
  common:   { name:"凡品",  atkMult:1.0, defMult:1.0, critMult:1.0, dodgeMult:1.0, durability:50 },
  rare:     { name:"稀有",  atkMult:1.3, defMult:1.3, critMult:1.1, dodgeMult:1.1, durability:80 },
  epic:     { name:"史诗",  atkMult:1.6, defMult:1.6, critMult:1.2, dodgeMult:1.2, durability:120 },
  legendary:{ name:"传说",  atkMult:2.0, defMult:2.0, critMult:1.4, dodgeMult:1.4, durability:200 },
  immortal: { name:"仙器",  atkMult:2.5, defMult:2.5, critMult:1.6, dodgeMult:1.6, durability:500 },
};

// Slot definitions
export const SLOTS = ["weapon","armor","helmet","ring","necklace","boots","artifact","talisman"];

// Base equipment templates
export const EQUIPMENT = {
  // Weapons
  iron_sword:     { name:"铁剑",     slot:"weapon", quality:"common",    baseStats:{atk:+5,def:+0} },
  spirit_blade:   { name:"灵刃",     slot:"weapon", quality:"rare",      baseStats:{atk:+12,def:+2} },
  thunder_edge:   { name:"雷刃",     slot:"weapon", quality:"epic",      baseStats:{atk:+20,def:+5} },
  dragon_fang:    { name:"龙牙剑",   slot:"weapon", quality:"legendary", baseStats:{atk:+35,def:+10} },

  // Armor
  cloth_robe:     { name:"布袍",     slot:"armor", quality:"common",    baseStats:{atk:+0,def:+8} },
  spirit_vest:    { name:"灵甲",     slot:"armor", quality:"rare",      baseStats:{atk:+2,def:+18} },
  dragon_scale:   { name:"龙鳞甲",   slot:"armor", quality:"epic",      baseStats:{atk:+5,def:+30} },

  // Accessories
  jade_ring:      { name:"玉戒",     slot:"ring",     quality:"rare",  baseStats:{atk:+3,def:+3} },
  phoenix_ring:   { name:"凤戒",     slot:"ring",     quality:"epic",  baseStats:{atk:+8,def:+8} },
  qi_necklace:    { name:"灵气项坠", slot:"necklace", quality:"rare",  baseStats:{atk:+5,def:+3} },
  wind_boots:     { name:"风行靴",   slot:"boots",    quality:"rare",  baseStats:{atk:+2,def:+5} },

  // Artifacts
  spirit_talisman:{ name:"护身符",   slot:"talisman", quality:"common", baseStats:{atk:+1,def:+5} },
};

// Equip an item — returns updated Equipment component
export function equipItem(entity, equipmentId, kernel) {
  const template = EQUIPMENT[equipmentId];
  if (!template) return null;
  const eq = entity.getComponent("Equipment") || { slots: {}, equipped:[], totalAtk:0, totalDef:0 };

  // Unequip existing item in this slot
  if (eq.slots[template.slot]) {
    const oldId = eq.slots[template.slot];
    eq.equipped = eq.equipped.filter(x => x !== oldId);
  }

  eq.slots[template.slot] = equipmentId;
  if (!eq.equipped.includes(equipmentId)) eq.equipped.push(equipmentId);

  // Recalculate total stats
  const { atk, def } = calcEquipmentStats(eq);
  eq.totalAtk = atk;
  eq.totalDef = def;

  const e = kernel.getEntity(entity.id);
  kernel.updateComponent(e.id, "Equipment", eq, e.version);
  return eq;
}

// Unequip item from a slot
export function unequipSlot(entity, slot, kernel) {
  const eq = entity.getComponent("Equipment") || { slots:{}, equipped:[], totalAtk:0, totalDef:0 };
  const itemId = eq.slots[slot];
  if (!itemId) return null;
  delete eq.slots[slot];
  eq.equipped = eq.equipped.filter(x => x !== itemId);
  const { atk, def } = calcEquipmentStats(eq);
  eq.totalAtk = atk; eq.totalDef = def;
  const e = kernel.getEntity(entity.id);
  kernel.updateComponent(e.id, "Equipment", eq, e.version);
  return eq;
}

// Calculate total equipment stats
export function calcEquipmentStats(eqComponent) {
  let atk = 0, def = 0;
  const items = eqComponent?.slots || {};
  for (const [slot, itemId] of Object.entries(items)) {
    const template = EQUIPMENT[itemId];
    if (!template) continue;
    const quality = QUALITY[template.quality] || QUALITY.common;
    atk += Math.floor(template.baseStats.atk * quality.atkMult);
    def += Math.floor(template.baseStats.def * quality.defMult);
  }
  return { atk, def };
}

// Apply equipment modifiers to combat stats
export function getEquipmentModifiers(entity) {
  const eq = entity.getComponent("Equipment");
  if (!eq) return { atkBonus:0, defBonus:0 };
  return { atkBonus: eq.totalAtk || 0, defBonus: eq.totalDef || 0 };
}

// Starter equipment for NPCs
export const NPC_STARTER_EQ = {
  1: ["iron_sword","cloth_robe"],
  2: ["iron_sword","cloth_robe","qi_necklace"],
  3: ["spirit_blade","spirit_vest","jade_ring"],
  4: ["spirit_blade","spirit_vest","qi_necklace","wind_boots"],
  5: ["thunder_edge","dragon_scale","phoenix_ring","qi_necklace"],
  8: ["dragon_fang","dragon_scale","phoenix_ring","qi_necklace","spirit_talisman"],
};
