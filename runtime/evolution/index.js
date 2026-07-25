// runtime/evolution/index.js
// v2.0 Sprint 8 — Evolution Framework
// Bloodlines, mutations, adaptation. Deterministic.

import { WorldRandom } from "../random/index.js";

// ══════════════════════════════════════
// Bloodlines
// ══════════════════════════════════════
export const BLOODLINES = {
  dragon:      { name:"龙族血脉",  rarity:"legendary", statBonus:{atk:+8,def:+8,hp:+30},   speedBonus:0.15, element:"fire" },
  phoenix:     { name:"凤凰血脉",  rarity:"legendary", statBonus:{atk:+5,def:+5,hp:+20},   speedBonus:0.12, element:"fire", special:"reborn" },
  white_tiger: { name:"白虎血脉",  rarity:"legendary", statBonus:{atk:+12,def:+4,hp:+15},  speedBonus:0.10, element:"metal" },
  black_tortoise:{ name:"玄武血脉",rarity:"legendary", statBonus:{atk:+3,def:+15,hp:+40}, speedBonus:0.05, element:"water" },
  vermilion:   { name:"朱雀血脉",  rarity:"legendary", statBonus:{atk:+10,def:+3,hp:+20}, speedBonus:0.15, element:"fire" },

  chaos:       { name:"混沌血脉",  rarity:"mythic",    statBonus:{atk:+15,def:+10,hp:+50},speedBonus:0.20, element:"chaos" },
  ancient:     { name:"上古血脉",  rarity:"mythic",    statBonus:{atk:+12,def:+12,hp:+35},speedBonus:0.18, element:"heaven" },
  heavenly:    { name:"天脉",      rarity:"mythic",    statBonus:{atk:+20,def:+15,hp:+60},speedBonus:0.25, element:"heaven", special:"divine" },

  spirit_fox:  { name:"灵狐血脉",  rarity:"rare",     statBonus:{atk:+3,def:+2,hp:+10},  speedBonus:0.08, element:"wind" },
  thunder_bird:{ name:"雷鸟血脉",  rarity:"rare",     statBonus:{atk:+5,def:+1,hp:+8},   speedBonus:0.10, element:"lightning" },
};

// Awaken bloodline — very rare event
export function checkBloodlineAwakening(entity, random) {
  const existing = entity.getComponent("Bloodline");
  if (existing) return null; // already awakened
  const realm = entity.getComponent("Realm")?.realm_id || 1;

  // Base chance: 0.1%, +0.05% per realm
  if (!random.chance(realm * 0.0005)) return null;

  const candidates = Object.entries(BLOODLINES);
  // Higher realm = better chance at mythic bloodlines
  const mythicChance = Math.min(0.3, realm * 0.05);
  let pool;
  if (random.chance(mythicChance)) {
    pool = candidates.filter(([_,b]) => b.rarity === "mythic");
  } else {
    pool = candidates.filter(([_,b]) => b.rarity === "legendary" || b.rarity === "rare");
  }
  if (pool.length === 0) pool = candidates;

  const [id, template] = pool[random.nextInt(0, pool.length - 1)];
  return { id, ...template, awakenedAt: Date.now(), generation: 1 };
}

// Inherit bloodline (parent → child)
export function inheritBloodline(parent1, parent2, random) {
  const b1 = parent1.getComponent("Bloodline");
  const b2 = parent2.getComponent("Bloodline");
  if (!b1 && !b2) return null;
  const inheritChance = b1 && b2 ? 0.8 : 0.3;
  if (!random.chance(inheritChance)) return null;
  const winner = b1 && b2 ? (random.chance(0.5) ? b1 : b2) : (b1 || b2);
  return { ...winner, generation: (winner.generation || 1) + 1 };
}

// ══════════════════════════════════════
// Mutation System
// ══════════════════════════════════════
export const MUTATION_TYPES = {
  // Positive
  strength_boost:    { name:"力量强化", effect:"atk",   value:3,  type:"positive" },
  defense_boost:     { name:"防御强化", effect:"def",   value:3,  type:"positive" },
  vitality_boost:    { name:"生机旺盛", effect:"hp",    value:10, type:"positive" },
  speed_boost:       { name:"敏捷提升", effect:"speed", value:0.05,type:"positive" },
  qi_affinity:       { name:"灵气亲和", effect:"cultivation",value:0.03,type:"positive" },

  // Negative
  weakness:          { name:"体质虚弱", effect:"hp",    value:-10, type:"negative" },
  slow_cultivation:  { name:"天赋受损", effect:"cultivation",value:-0.03,type:"negative" },
  qi_leak:           { name:"灵气泄漏", effect:"speed", value:-0.05,type:"negative" },
};

// Check for mutation on breakthrough
export function checkMutation(entity, random) {
  // 20% chance on breakthrough
  if (!random.chance(0.20)) return null;

  const allMutations = Object.entries(MUTATION_TYPES);
  // 60% positive, 40% negative
  const isPositive = random.chance(0.6);
  const pool = allMutations.filter(([_,m]) => m.type === (isPositive ? "positive" : "negative"));
  if (pool.length === 0) return null;

  const [id, template] = pool[random.nextInt(0, pool.length - 1)];
  return { id, ...template };
}

// Apply mutation to entity
export function applyMutation(entity, mutation, kernel) {
  const existing = entity.getComponent("Mutations") || { list: [] };
  existing.list = [...(existing.list || []), {
    id: mutation.id,
    name: mutation.name,
    effect: mutation.effect,
    value: mutation.value,
    appliedAt: Date.now(),
  }];
  const e = kernel.getEntity(entity.id);
  kernel.updateComponent(e.id, "Mutations", existing, e.version);
  return existing;
}

// ══════════════════════════════════════
// Adaptation System
// ══════════════════════════════════════
export function checkAdaptation(entity, regionInfo, random) {
  const climate = regionInfo?.climate || "温和";
  const qiType = regionInfo?.qiType || "spirit";

  if (!random.chance(0.01)) return null;

  if (qiType === "ice" || climate === "严寒") return { type: "cold_resist", name: "抗寒", effect:"ice_resist", value:0.05 };
  if (qiType === "fire" || climate.includes("炎热")) return { type: "heat_resist", name: "抗热", effect:"fire_resist", value:0.05 };
  if (qiType === "death") return { type: "death_resist", name: "死气抗性", effect:"death_resist", value:0.03 };
  return null;
}

// Combine evolution systems into tick check
export function evolutionTick(entity, kernel, random) {
  const realm = entity.getComponent("Realm")?.realm_id || 1;

  // Bloodline awakening (check on breakthrough or high realm ticks)
  const awakened = checkBloodlineAwakening(entity, random);
  if (awakened) {
    kernel.updateComponent(entity.id, "Bloodline", awakened, entity.version);
  }

  // Mutation check
  const mutation = checkMutation(entity, random);
  if (mutation) {
    applyMutation(entity, mutation, kernel);
  }
}
