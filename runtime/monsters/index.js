// runtime/monsters/index.js
// v2.2 Sprint 3 — Monster System Refactor
// Bug fixes, Combat Engine integration, Loot to player, Boss framework.
// Deterministic. Replay-compatible. ECS-integrated.

import { WorldRandom } from "../random/index.js";
import { getEquipmentModifiers } from "../equipment/index.js";

// ══════════════════════════════════════
// Monster Definitions
// ══════════════════════════════════════
export const MONSTER_TYPES = {
  wild_beast:    { name:"野兽",   realm:1, hp:40,  atk:8,  def:2, spd:3, aggression:0.3, loot:{spirit_herb:[1,3]},           habitat:"forest",   element:"wood" },
  spirit_wolf:   { name:"灵狼",   realm:2, hp:60,  atk:12, def:4, spd:5, aggression:0.5, loot:{spirit_herb:[1,3],jade_shard:[1,2]},habitat:"mountain", element:"metal" },
  thunder_eagle: { name:"雷鹰",   realm:3, hp:55,  atk:18, def:3, spd:8, aggression:0.4, loot:{thunder_ore:[1,2]},            habitat:"mountain", element:"lightning" },
  demon_serpent: { name:"魔蛇",   realm:4, hp:90,  atk:22, def:6, spd:4, aggression:0.7, loot:{dragon_scale:[1,2]},           habitat:"cave",     element:"dark" },
  ancient_guard: { name:"古卫",   realm:5, hp:120, atk:28, def:10,spd:3, aggression:0.9, loot:{ancient_jade:[1,2],spirit_stone:[20,50]},habitat:"ruins", element:"light" },
  // Boss-tier monsters (Phase 5)
  boss_wyrm:     { name:"龙蟒",   realm:8, hp:250, atk:40, def:15,spd:6, aggression:1.0, loot:{ancient_jade:[1,3],dragon_scale:[2,5],spirit_stone:[100,200]},habitat:"dragon",  element:"fire", boss:true, phases:["normal","enraged"], skills:["fire_blast","thunder_strike"] },
  shadow_dragon: { name:"影龙",   realm:7, hp:300, atk:45, def:18,spd:5, aggression:1.0, loot:{dragon_scale:[3,6],ancient_jade:[2,4],spirit_stone:[200,400]},habitat:"dragon", element:"dark", boss:true, phases:["normal","enraged","desperate"], skills:["shadow_strike","curse","domain"] },
};

// Region habitat mapping
const REGION_HABITATS = {
  area_bamboo_grove:  ["forest"],
  area_misty_peak:    ["forest","mountain","cave"],
  area_thunder_valley:["mountain","cave"],
  area_dragon_vein:   ["mountain","cave","ruins","dragon"],
};

// Population caps
const REGION_CAPS = { area_bamboo_grove:4, area_misty_peak:6, area_thunder_valley:8, area_dragon_vein:10 };

// Element reference (single source of truth — matches combat engine)
const ELEMENT_STRONG = { metal:["wood"],wood:["earth"],water:["fire"],fire:["metal"],earth:["water"],lightning:["water"],ice:["wind"],wind:["lightning"],light:["dark"],dark:["light"] };
const ELEMENT_WEAK   = { metal:["fire"],wood:["metal"],water:["earth"],fire:["water"],earth:["wood"],lightning:["earth"],ice:["fire"],wind:["ice"],light:[],dark:[] };

function getElementMultiplier(attElement, defElement) {
  if (!attElement || !defElement) return 1.0;
  if (ELEMENT_STRONG[attElement]?.includes(defElement)) return 1.3;
  if (ELEMENT_WEAK[attElement]?.includes(defElement)) return 0.7;
  return 1.0;
}

// ══════════════════════════════════════
// Phase 5 — Boss state tracking
// ══════════════════════════════════════
function getBossPhase(monster, template) {
  if (!template.boss) return null;
  const hp = monster.getComponent("HP") || { current:100, max:100 };
  const ratio = hp.current / hp.max;
  if (template.phases.includes("desperate") && ratio <= 0.2) return "desperate";
  if (template.phases.includes("enraged") && ratio <= 0.5) return "enraged";
  return "normal";
}

// ══════════════════════════════════════
// Monster Spawn System
// ══════════════════════════════════════
export const MonsterSpawnSystem = {
  tick(kernel, time, random) {
    for (const region of Object.keys(REGION_HABITATS)) {
      const cap = REGION_CAPS[region] || 4;
      const monsters = kernel.queryEntities("monster", {}, cap + 10, 0);
      const aliveInRegion = monsters.filter(m => (m.getComponent("Location")||{}).area === region && m.state !== "dead");
      if (aliveInRegion.length >= cap) continue;

      const habitats = REGION_HABITATS[region];
      const types = Object.entries(MONSTER_TYPES).filter(([_,t]) => habitats.includes(t.habitat));
      if (types.length === 0) continue;

      const [typeId, template] = types[random.nextInt(0, types.length - 1)];
      const hpVar = random.nextInt(-5, 10);
      const hp = Math.max(10, template.hp + hpVar);

      kernel.createEntity("monster", {
        Identity: { name: template.name, type: typeId },
        Realm: { realm_id: template.realm, cultivation_value: 0.3 },
        HP: { current: hp, max: hp },
        Stamina: { current: 100, max: 100 },
        Combat: { attack: template.atk, defense: template.def, speed: template.spd },
        Behavior: { state: "patrol", aggression: template.aggression, target: null, personality:"aggressive" },
        Location: { area: region },
        LootTable: { drops: { ...template.loot } },
        SpiritualRoot: { id: template.element, element: template.element, rarity: "common", speedMultiplier: 1.0 },
        Boss: template.boss ? { bossType: typeId, currentPhase: "normal", phases: template.phases, skills: template.skills||[] } : null,
      });
    }
  },
};

// ══════════════════════════════════════
// Monster AI System (fixed version)
// ══════════════════════════════════════
export const MonsterAISystem = {
  tick(kernel, time, random) {
    const monsters = kernel.queryEntities("monster", {}, 100, 0);
    for (const m of monsters) {
      if (m.state === "dead") continue;
      const hp = m.getComponent("HP") || { current:100, max:100 };
      if (hp.current <= 0) { m.state = "dead"; continue; }

      const beh = m.getComponent("Behavior") || { state:"patrol", aggression:0.3, target:null };
      const loc = m.getComponent("Location") || { area:"area_bamboo_grove" };

      // Low HP → rest and heal
      if (hp.current < hp.max * 0.3) {
        const e = kernel.getEntity(m.id);
        kernel.updateComponent(e.id, "HP", { ...e.getComponent("HP"), current: Math.min(hp.max, hp.current + 5) }, e.version);
        kernel.updateComponent(e.id, "Behavior", { ...e.getComponent("Behavior"), state: "rest", target: null }, e.version + 1);
        continue;
      }

      // Hunt
      if (random.chance(beh.aggression || 0.3)) {
        const npcs = kernel.queryEntities("npc", {}, 10, 0).filter(n => n.state === "active");
        if (npcs.length > 0) {
          const target = npcs[random.nextInt(0, npcs.length - 1)];
          const e = kernel.getEntity(m.id);
          kernel.updateComponent(e.id, "Behavior", { ...e.getComponent("Behavior"), state: "hunt", target: target.id }, e.version);
        }
      } else if (random.chance(0.10)) {
        // Patrol — move region
        const regions = Object.keys(REGION_HABITATS);
        const ci = regions.indexOf(loc.area);
        if (ci >= 0) {
          const next = regions[(ci + random.nextInt(1, regions.length - 1)) % regions.length];
          const e = kernel.getEntity(m.id);
          kernel.updateComponent(e.id, "Location", { ...e.getComponent("Location"), area: next }, e.version);
          kernel.updateComponent(e.id, "Behavior", { ...e.getComponent("Behavior"), state: "patrol", target: null }, e.version + 1);
        }
      }
    }
  },
};

// ══════════════════════════════════════
// Monster Encounter System (fixed with Combat Engine integration)
// ══════════════════════════════════════
export const MonsterEncounterSystem = {
  tick(kernel, time, random) {
    const monsters = kernel.queryEntities("monster", {}, 100, 0).filter(m => m.state !== "dead");
    const npcs = kernel.queryEntities("npc", {}, 100, 0).filter(n => n.state === "active");

    for (const monster of monsters) {
      const beh = monster.getComponent("Behavior") || {};
      if (beh.state !== "hunt" || !beh.target) continue;

      const target = kernel.getEntity(beh.target);
      if (!target) { beh.target = null; continue; }

      // Refresh both entities for latest HP
      const m = kernel.getEntity(monster.id);
      const t = kernel.getEntity(target.id);
      const mHp = m.getComponent("HP") || { current:100, max:100 };
      const tHp = t.getComponent("HP") || { current:100, max:100 };

      // Combat formula — integrated with equipment + element
      const mRealm = m.getComponent("Realm")?.realm_id || 1;
      const tRealm = t.getComponent("Realm")?.realm_id || 1;
      const mAtk = (m.getComponent("Combat")?.attack || 10);
      const tDef = (t.getComponent("Combat")?.defense || 2);
      const eqTarget = getEquipmentModifiers(t);

      // Element multiplier — unified with combat engine
      const mElement = m.getComponent("SpiritualRoot")?.element || "none";
      const tElement = t.getComponent("SpiritualRoot")?.element || "none";
      const elemMult = getElementMultiplier(mElement, tElement);

      // Damage calculation
      const baseDmg = mAtk + (mRealm - tRealm) * 3 - (tDef + (eqTarget.defBonus||0)) * 0.5 + random.nextInt(-3, 5);
      const damage = Math.max(1, Math.floor(baseDmg * elemMult));

      // Boss check
      const bossComp = m.getComponent("Boss");
      if (bossComp) {
        const phase = getBossPhase(m, MONSTER_TYPES[bossComp.bossType] || {});
        if (phase && phase !== bossComp.currentPhase) {
          const atkMult = phase === "enraged" ? 1.5 : phase === "desperate" ? 2.0 : 1.0;
          const phaseDmg = Math.floor(damage * atkMult);
          const newHP = Math.max(0, tHp.current - phaseDmg);
          kernel.updateComponent(t.id, "HP", { ...t.getComponent("HP"), current: newHP }, t.version);
          kernel.updateComponent(m.id, "Boss", { ...bossComp, currentPhase: phase }, m.version);
          continue; // Boss phase change triggers, skip counterattack this round
        }
      }

      // NPC HP floor — prevent extinction (Phase 3: proper loot uses event bus)
      const newHP = Math.max(1, tHp.current - damage);
      kernel.updateComponent(t.id, "HP", { ...t.getComponent("HP"), current: newHP }, t.version);

      // NPC counterattack
      const tAtk = (t.getComponent("Combat")?.attack || 8);
      const eqAtk = getEquipmentModifiers(t);
      const mDef = (m.getComponent("Combat")?.defense || 2);
      const counterDmg = Math.max(1, tAtk + (eqAtk.atkBonus||0) - mDef + random.nextInt(-2, 4));
      const mNewHP = Math.max(0, mHp.current - counterDmg);
      kernel.updateComponent(m.id, "HP", { ...m.getComponent("HP"), current: mNewHP }, m.version);

      // Monster killed → loot to NPC (Phase 3)
      if (mNewHP <= 0) {
        m.state = "dead";
        kernel.updateComponent(m.id, "Behavior", { ...m.getComponent("Behavior"), state: "dead", target: null }, m.version + 1);
        // Loot to target
        const lootTable = m.getComponent("LootTable")?.drops || {};
        const tInv = t.getComponent("Inventory") || { items:{} };
        const lootItems = { ...tInv.items };
        for (const [item, [lo, hi]] of Object.entries(lootTable)) {
          lootItems[item] = (lootItems[item] || 0) + random.nextInt(lo, hi);
        }
        kernel.updateComponent(t.id, "Inventory", { items: lootItems }, t.version + 1);
        // Also reward player if they are in same area
        const players = kernel.queryEntities("player", {}, 1, 0);
        if (players.length > 0 && (players[0].getComponent("Location")||{}).area === (m.getComponent("Location")||{}).area) {
          const pInv = players[0].getComponent("Inventory") || { items:{} };
          const pItems = { ...pInv.items };
          for (const [item, [lo, hi]] of Object.entries(lootTable)) {
            pItems[item] = (pItems[item] || 0) + random.nextInt(lo, hi);
          }
          kernel.updateComponent(players[0].id, "Inventory", { items: pItems }, players[0].version);
        }
      }
    }
  },
};
