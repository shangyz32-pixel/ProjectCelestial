// runtime/monsters/index.js
// Sprint 2 — Monster Ecology System
// All state changes through Kernel API. Deterministic. Replay-compatible.

import { WorldRandom } from "../random/index.js";

// Monster type definitions
export const MONSTER_TYPES = {
  wild_beast:    { realm: 1, hp: 40,  attack: 8,  defense: 2, speed: 3, aggression: 0.3, loot: { spirit_herb: [1,3] }, habitat: "forest" },
  spirit_wolf:   { realm: 2, hp: 60,  attack: 12, defense: 4, speed: 5, aggression: 0.5, loot: { jade_shard: [1,2] }, habitat: "mountain" },
  thunder_eagle: { realm: 3, hp: 55,  attack: 18, defense: 3, speed: 8, aggression: 0.4, loot: { thunder_ore: [1,2] }, habitat: "mountain" },
  demon_serpent: { realm: 4, hp: 90,  attack: 22, defense: 6, speed: 4, aggression: 0.7, loot: { dragon_scale: [1,2] }, habitat: "cave" },
  ancient_guard: { realm: 5, hp: 120, attack: 28, defense: 10, speed: 3, aggression: 0.9, loot: { ancient_jade: [1,2], spirit_stone: [20,50] }, habitat: "ruins" },
  boss_wyrm:     { realm: 8, hp: 250, attack: 40, defense: 15, speed: 6, aggression: 1.0, loot: { ancient_jade: [1,3], dragon_scale: [2,5], spirit_stone: [100,200] }, habitat: "dragon" },
};

// Region habitat mapping
const REGION_HABITATS = {
  area_bamboo_grove: ["forest"],
  area_misty_peak:   ["forest","mountain","cave"],
  area_thunder_valley: ["mountain","cave"],
  area_dragon_vein:  ["mountain","cave","ruins","dragon"],
};

// Monster population caps per region
const REGION_CAPS = {
  area_bamboo_grove: 4,
  area_misty_peak: 6,
  area_thunder_valley: 8,
  area_dragon_vein: 10,
};

// ══════════════════════════════════════
// Monster Spawn System
// ══════════════════════════════════════
export const MonsterSpawnSystem = {
  tick(kernel, time, random) {
    const regions = Object.keys(REGION_HABITATS);
    for (const region of regions) {
      const cap = REGION_CAPS[region] || 4;
      const monsters = kernel.queryEntities("monster", { region }, cap, 0);
      const alive = monsters.filter(m => m.state !== "dead" && m.state !== "inactive");
      if (alive.length >= cap) continue;
      // Spawn new monster
      const habitats = REGION_HABITATS[region];
      const types = Object.entries(MONSTER_TYPES).filter(([_,t]) => habitats.includes(t.habitat));
      if (types.length === 0) continue;
      const [typeId, template] = types[random.nextInt(0, types.length - 1)];
      const hp = template.hp + random.nextInt(-5, 10);
      const name = typeId.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
      kernel.createEntity("monster", {
        Identity: { name, type: typeId },
        Realm: { realm_id: template.realm, cultivation_value: 0.5 },
        HP: { current: hp, max: hp },
        Combat: { attack: template.attack, defense: template.defense, speed: template.speed },
        Behavior: { state: "patrol", aggression: template.aggression, target: null },
        Location: { area: region },
        Loot: { table: { ...template.loot } },
      });
    }
  },
};

// ══════════════════════════════════════
// Monster AI System
// ══════════════════════════════════════
export const MonsterAISystem = {
  tick(kernel, time, random) {
    const monsters = kernel.queryEntities("monster", {}, 100, 0);
    for (const m of monsters) {
      if (m.state === "dead" || m.state === "inactive") continue;
      const beh = m.getComponent("Behavior") || {};
      const hp = m.getComponent("HP") || { current: 100, max: 100 };
      const loc = m.getComponent("Location") || {};
      const template = MONSTER_TYPES[m.getComponent("Identity")?.type];

      // Dead check
      if (hp.current <= 0) {
        m.state = "dead";
        const e = kernel.getEntity(m.id);
        kernel.updateComponent(e.id, "HP", { ...hp, current: 0 }, e.version);
        continue;
      }

      // Behavior state machine
      if (hp.current < hp.max * 0.3) {
        // Low HP: flee or rest
        beh.state = "rest";
        const e = kernel.getEntity(m.id);
        kernel.updateComponent(e.id, "HP", { ...hp, current: Math.min(hp.max, hp.current + 5) }, e.version);
        continue;
      }

      if (random.chance(beh.aggression || 0.3)) {
        // Hunt: find nearest NPC
        const npcs = kernel.queryEntities("npc", {}, 10, 0);
        if (npcs.length > 0) {
          const target = npcs[random.nextInt(0, npcs.length - 1)];
          beh.state = "hunt";
          beh.target = target.id;
          const e = kernel.getEntity(m.id);
          kernel.updateComponent(e.id, "Behavior", beh, e.version);
        }
      } else if (random.chance(0.10)) {
        // Patrol: move to random adjacent region
        const regions = Object.keys(REGION_HABITATS);
        const ci = regions.indexOf(loc.area);
        if (ci >= 0) {
          const next = regions[(ci + random.nextInt(1, regions.length - 1)) % regions.length];
          const e = kernel.getEntity(m.id);
          kernel.updateComponent(e.id, "Location", { ...loc, area: next }, e.version);
          beh.state = "patrol";
          kernel.updateComponent(e.id, "Behavior", beh, e.version);
        }
      } else {
        beh.state = "rest";
        const e = kernel.getEntity(m.id);
        kernel.updateComponent(e.id, "Behavior", { ...beh, state: "rest" }, e.version);
      }
    }
  },
};

// ══════════════════════════════════════
// Monster-NPC Encounter System
// ══════════════════════════════════════
export const MonsterEncounterSystem = {
  tick(kernel, time, random) {
    const monsters = kernel.queryEntities("monster", {}, 100, 0).filter(m => m.state !== "dead");
    const npcs = kernel.queryEntities("npc", {}, 100, 0);
    for (const monster of monsters) {
      const beh = monster.getComponent("Behavior") || {};
      if (beh.state !== "hunt" || !beh.target) continue;
      const target = kernel.getEntity(beh.target);
      if (!target) { beh.target = null; continue; }
      const mHp = monster.getComponent("HP") || { current: 100, max: 100 };
      const tHp = target.getComponent("HP") || { current: 100, max: 100 };
      // Simple deterministic combat: monster attacks NPC
      const mRealm = monster.getComponent("Realm")?.realm_id || 1;
      const tRealm = target.getComponent("Realm")?.realm_id || 1;
      const mAtk = monster.getComponent("Combat")?.attack || 10;
      const tDef = target.getComponent("Combat")?.defense || 2;
      // Enhanced combat — use element multiplier (v2.0)
      const mRoot = monster.getComponent("SpiritualRoot");
      const tRoot = target.getComponent("SpiritualRoot");
      let elemMult = 1.0;
      if (mRoot && tRoot) {
        const elem = mRoot.element || "none";
        const defElem = tRoot.element || "none";
        const strong = { metal:["wood"],wood:["earth"],water:["fire"],fire:["metal"],earth:["water"] };
        const weak = { metal:["fire"],wood:["metal"],water:["earth"],fire:["water"],earth:["wood"] };
        if (strong[elem]?.includes(defElem)) elemMult = 1.3;
        if (weak[elem]?.includes(defElem)) elemMult = 0.7;
      }
      const baseDmg = mAtk + (mRealm - tRealm) * 3 - tDef + random.nextInt(-3, 5);
      const damage = Math.max(1, Math.floor(baseDmg * elemMult));
      // NPCs don't die from monster encounters (too disruptive)
      const newHP = Math.max(10, tHp.current - damage); // minimum 10 HP
      const e1 = kernel.getEntity(target.id);
      kernel.updateComponent(e1.id, "HP", { ...tHp, current: newHP }, e1.version);
      // If NPC died, monster returns to patrol; if survived, NPC counterattacks
      if (newHP <= 0) {
        target.state = "inactive";
        const e2 = kernel.getEntity(monster.id);
        kernel.updateComponent(e2.id, "Behavior", { ...beh, state: "patrol", target: null }, e2.version);
        // Loot monster
        const loot = monster.getComponent("Loot")?.table || {};
        const mInv = monster.getComponent("Inventory") || { items: {} };
        for (const [item, [lo, hi]] of Object.entries(loot)) {
          mInv.items[item] = (mInv.items[item] || 0) + random.nextInt(lo, hi);
        }
        const e3 = kernel.getEntity(monster.id);
        kernel.updateComponent(e3.id, "Inventory", { items: mInv.items }, e3.version);
      } else {
        // NPC counterattacks
        const tAtk = target.getComponent("Combat")?.attack || 8;
        const mDef = monster.getComponent("Combat")?.defense || 2;
        const counterDmg = Math.max(1, tAtk - mDef + random.nextInt(-2, 4));
        const e2 = kernel.getEntity(monster.id);
        kernel.updateComponent(e2.id, "HP", { ...mHp, current: Math.max(0, mHp.current - counterDmg) }, e2.version);
        if (mHp.current - counterDmg <= 0) {
          const e3 = kernel.getEntity(monster.id);
          kernel.updateComponent(e3.id, "Behavior", { ...beh, state: "rest" }, e3.version);
        }
      }
    }
  },
};
