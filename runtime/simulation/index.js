// runtime/simulation/index.js
// Simulation Systems — deterministic world evolution.
// Each system.tick(kernel, time, random) → applies state changes via Kernel API.

import { WorldRandom } from "../random/index.js";
import { Logger } from "../bootstrap/logger.js";
import { WorldEventEngine } from "../events/exploration.js";
import { CombatEngine } from "../combat/index.js";
import { MonsterSpawnSystem, MonsterAISystem, MonsterEncounterSystem } from "../monsters/index.js";
import { HEART_DEMONS } from "../cultivation/index.js";
import { PlantSystem, AnimalSystem, SpiritBeastSystem } from "../ecology/index.js";

// Weather System
export const WeatherSystem = {
  STATES: ["clear", "cloudy", "rain", "storm", "snow", "fog"],
  tick(kernel, time, random) {
    const baseChance = time.season === "冬" ? 0.3 : time.season === "夏" ? 0.05 : 0.15;
    const roll = random.nextFloat(0, 1);
    let weather;
    if (roll < baseChance * 0.5)       weather = "storm";
    else if (roll < baseChance)         weather = "rain";
    else if (roll < baseChance + 0.1)   weather = "cloudy";
    else if (time.season === "冬" && roll < 0.1) weather = "snow";
    else                                 weather = "clear";
    kernel.world.globalState.weather.set("world", weather);
  },
};

// Qi System
export const QiSystem = {
  tick(kernel, time, random) {
    const seasonalMod = { "春": 1.1, "夏": 0.9, "秋": 1.0, "冬": 0.8 }[time.season] || 1.0;
    const fluctuation = random.nextFloat(-0.02, 0.02);
    const qi = Math.max(0.5, Math.min(1.5, seasonalMod + fluctuation));
    kernel.world.globalState.qi.set("world", qi);
  },
};

// Qi Tide System (v2.0) — cyclic qi density waves
export const QiTideSystem = {
  TIDES: ["低潮","正常","高潮","灵潮","混沌潮"],
  tick(kernel, time, random) {
    const dayInSeason = time.day || 0;
    const phase = dayInSeason % 30;
    let tideIdx = 1;
    if (phase < 5) tideIdx = 0; else if (phase < 20) tideIdx = 1;
    else if (phase < 25) tideIdx = 2; else if (phase < 28) tideIdx = 3; else tideIdx = 4;
    const tideMods = [0.7, 1.0, 1.3, 1.5, 0.9];
    kernel.world.globalState.qiTide = QiTideSystem.TIDES[tideIdx];
    kernel.world.globalState.qi.set("tide", tideMods[tideIdx]);
  },
};

// Moon Phase System (v2.0)
export const MoonPhaseSystem = {
  PHASES: ["新月","蛾眉月","上弦月","盈凸月","满月","亏凸月","下弦月","残月"],
  tick(kernel, time, random) {
    const phaseIdx = (time.day || 0) % 8;
    kernel.world.globalState.moonPhase = MoonPhaseSystem.PHASES[phaseIdx];
    kernel.world.globalState.isFullMoon = phaseIdx === 4;
  },
};

// Celestial Events System (v2.0) — rare world-wide phenomena
export const CelestialEventSystem = {
  tick(kernel, time, random) {
    if ((time.day || 0) % 90 === 0 && random.chance(0.30)) {
      const events = ["流星雨","日食","彗星","灵雨","天火"];
      kernel.world.globalState.celestialEvent = events[random.nextInt(0, events.length - 1)];
    }
  },
};

// Spirit Vein System (v2.0) — dynamic qi sources per region
export const SpiritVeinSystem = {
  tick(kernel, time, random) {
    kernel.world.globalState.spiritVeins = kernel.world.globalState.spiritVeins || {};
    const regions = ["area_bamboo_grove","area_misty_peak","area_thunder_valley","area_dragon_vein"];
    for (const region of regions) {
      let vein = kernel.world.globalState.spiritVeins[region] || { strength: 50 };
      vein.growth = random.nextFloat(-2, 3);
      vein.strength = Math.max(10, Math.min(100, (vein.strength || 50) + vein.growth));
      if (vein.strength > 90 && random.chance(0.02)) vein.strength = 20;
      kernel.world.globalState.spiritVeins[region] = vein;
    }
  },
};

// NPC System (v0.4: aging, HP, stamina, cultivation, breakthrough, travel, gather, rest)
export const NPCSystem = {
  tick(kernel, time, random) {
    const npcs = kernel.queryEntities("npc", {}, 100, 0);
    if (npcs.length === 0) return;
    for (const npc of npcs) {
      if (npc.state !== "active") continue;
      // Age
      const identity = npc.getComponent("Identity") || {};
      kernel.updateComponent(npc.id, "Identity", { ...identity, age: (identity.age || 0) + 1 }, npc.version);
      // HP recovery
      const hp = npc.getComponent("HP");
      if (hp && hp.current < hp.max) {
        const recovery = time.season === "冬" ? 0.5 : 1;
        const e1 = kernel.getEntity(npc.id);
        const hpNow = e1.getComponent("HP");
        kernel.updateComponent(e1.id, "HP", { ...hpNow, current: Math.min(hpNow.current + recovery, hpNow.max) }, e1.version);
      }
      // Stamina
      const stamina = npc.getComponent("Stamina") || { current: 100, max: 100 };
      const isNight = time.hour >= 6 && time.hour <= 8;
      const e2 = kernel.getEntity(npc.id);
      if (isNight) {
        kernel.updateComponent(e2.id, "Stamina", { ...stamina, current: Math.min((stamina.current || 100) + 5, stamina.max || 100) }, e2.version);
      } else {
        kernel.updateComponent(e2.id, "Stamina", { ...stamina, current: Math.max((stamina.current || 100) - 2, 0) }, e2.version);
      }
      // Cultivation
      const realm = npc.getComponent("Realm");
      const e3 = kernel.getEntity(npc.id);
      if (realm && !realm.breakthrough_pending) {
        const qi = kernel.world.globalState.qi.get("world") || 1.0;
        const staminaNow = e3.getComponent("Stamina");
        const staminaMod = staminaNow && staminaNow.current > 0 ? 1.0 : 0.3;
        const dayNightMod = isNight ? 0.8 : 1.0;
        const increment = random.nextFloat(0.001, 0.01) * qi * staminaMod * dayNightMod;
        const newCV = Math.min(1.0, (realm.cultivation_value || 0) + increment);
        const e4 = kernel.getEntity(npc.id);
        kernel.updateComponent(e4.id, "Realm", { ...realm, cultivation_value: newCV }, e4.version);
        // Breakthrough
        if (newCV >= 1.0 && !realm.breakthrough_pending) {
          const breakthroughChance = 0.1 + (realm.realm_id || 1) * 0.02;
          if (random.chance(breakthroughChance)) {
            const e5 = kernel.getEntity(npc.id);
            kernel.updateComponent(e5.id, "Realm", { ...e5.getComponent("Realm"), realm_id: (realm.realm_id || 0) + 1, cultivation_value: 0.0, breakthrough_pending: false, breakthroughs: ((realm.breakthroughs || 0) + 1) }, e5.version);
          } else {
            const e5 = kernel.getEntity(npc.id);
            kernel.updateComponent(e5.id, "Realm", { ...e5.getComponent("Realm"), cultivation_value: 0.7, breakthrough_pending: false }, e5.version);
            // v2.0: Heart demon may develop on failed breakthrough
            if (random.chance(0.25)) {
              const demonTypes = ["greed","fear","hatred","attachment","pride","madness"];
              const demonId = demonTypes[random.nextInt(0, demonTypes.length - 1)];
              const demon = HEART_DEMONS[demonId];
              kernel.updateComponent(e5.id, "HeartDemon", { type: demonId, name: demon.name, active: true, developedAt: kernel.world.tickCount }, e5.version + 1);
            }
          }
        }
      }
      // v0.4: Travel, Gather, Rest
      const loc = npc.getComponent("Location") || {};
      const stam = npc.getComponent("Stamina") || { current: 100, max: 100 };
      const inv = npc.getComponent("Inventory") || { items: {} };
      // Travel (10%)
      // Travel (10%) — generate exploration event for NPCs
      const areas = ["area_bamboo_grove","area_misty_peak","area_thunder_valley","area_dragon_vein"];
      if (random.chance(0.10)) {
        const ci = areas.indexOf(loc.area || areas[0]);
        const next = areas[(ci + random.nextInt(1, 3)) % areas.length];
        const e6 = kernel.getEntity(npc.id);
        kernel.updateComponent(e6.id, "Location", { ...loc, area: next }, e6.version);
        // Generate a simple exploration event for the NPC
        if (next !== (loc.area || areas[0])) {
          const eventTypes = ["发现了一处秘境","遭遇了灵兽","找到了稀有资源","发现远古遗迹"];
          const evt = eventTypes[random.nextInt(0, eventTypes.length - 1)];
          const identity = npc.getComponent("Identity") || {};
          // Record via transaction manager event log
          kernel.world.events = kernel.world.events || [];
          kernel.world.events.push({
            eventId: `evt_${Date.now()}_${Math.floor(Math.random()*10000)}`,
            tick: kernel.world.tickCount,
            type: "NPCExplored",
            target: npc.id,
            payload: { npc: identity.name, to: next, discovery: evt },
          });
        }
      }
      // Gather (15%)
      if (random.chance(0.15)) {
        const rmap = { area_bamboo_grove:"spirit_herb", area_misty_peak:"jade_shard", area_thunder_valley:"thunder_ore", area_dragon_vein:"ancient_jade" };
        const res = rmap[loc.area] || "spirit_herb";
        const e7 = kernel.getEntity(npc.id);
        kernel.updateComponent(e7.id, "Inventory", { items: { ...inv.items, [res]: (inv.items[res] || 0) + 1 } }, e7.version);
      }
      // Rest (20%)
      if (random.chance(0.20) && stam.current < stam.max) {
        const e8 = kernel.getEntity(npc.id);
        kernel.updateComponent(e8.id, "Stamina", { ...stam, current: Math.min(stam.max, stam.current + 10) }, e8.version);
      }
      // Heart demon recovery (2% chance per tick)
      const hd = npc.getComponent("HeartDemon");
      if (hd && hd.active && random.chance(0.02)) {
        const demon = HEART_DEMONS[hd.type];
        if (demon && random.chance(demon.recoveryChance || 0.3)) {
          const e9 = kernel.getEntity(npc.id);
          kernel.updateComponent(e9.id, "HeartDemon", { ...hd, active: false, recoveredAt: kernel.world.tickCount }, e9.version);
        }
      }
    }
  },
};

// Economy System
export const EconomySystem = {
  BASE_PRICES: { spirit_stone: 100, pill: 50, herb: 10 },
  tick(kernel, time, random) {
    const weather = kernel.world.globalState.weather.get("world") || "clear";
    const prices = kernel.world.globalState.economy.priceTable;
    const weatherMod = { "clear": 0.98, "cloudy": 1.0, "rain": 1.02, "storm": 1.05, "snow": 1.03, "fog": 1.01 }[weather];
    const seasonalMod = { "春": 0.97, "夏": 1.0, "秋": 1.01, "冬": 1.04 }[time.season];
    for (const [item, base] of Object.entries(EconomySystem.BASE_PRICES)) {
      const prev = prices[item] || base;
      const drift = random.nextFloat(-0.01, 0.01);
      prices[item] = Math.round(Math.max(base * 0.5, Math.min(base * 2.0, prev * weatherMod * seasonalMod + drift * base)));
    }
  },
};

// Sect System (v0.4) — autonomous sect evolution
export const SectSystem = {
  tick(kernel, time, random) {
    const sects = kernel.queryEntities("sect", {}, 10, 0);
    if (sects.length === 0) {
      kernel.createEntity("sect", {
        Identity: { name: "青云宗" },
        Members: { count: 10, leader: "太虚真人" },
        Territory: { regions: ["area_misty_peak"], influence: 50 },
        Treasury: { resources: { spirit_stone: 1000, spirit_herb: 50 } },
        Power: { strength: 100, reputation: 80 },
      });
      return;
    }
    for (const sect of sects) {
      const power = sect.getComponent("Power") || { strength: 100 };
      const members = sect.getComponent("Members") || { count: 10 };
      const territory = sect.getComponent("Territory") || { regions: [], influence: 50 };
      if (random.chance(0.05)) {
        const e = kernel.getEntity(sect.id);
        kernel.updateComponent(e.id, "Members", { ...members, count: members.count + 1 }, e.version);
      }
      if (random.chance(0.03) && territory.regions.length < 3) {
        const allR = ["area_bamboo_grove","area_misty_peak","area_thunder_valley","area_dragon_vein"];
        const newR = allR[random.nextInt(0, allR.length - 1)];
        if (!territory.regions.includes(newR)) {
          const e = kernel.getEntity(sect.id);
          kernel.updateComponent(e.id, "Territory", { ...territory, regions: [...territory.regions, newR], influence: Math.min(100, territory.influence + 5) }, e.version);
        }
      }
      if (random.chance(0.08)) {
        const e = kernel.getEntity(sect.id);
        kernel.updateComponent(e.id, "Power", { ...power, strength: Math.max(10, Math.min(200, power.strength + random.nextInt(-5, 10))) }, e.version);
      }
    }
  },
};

// NPC Relationship System (Phase 4) — relationship network
export const RelationshipSystem = {
  tick(kernel, time, random) {
    const npcs = kernel.queryEntities("npc", {}, 100, 0);
    for (const npc of npcs) {
      if (npc.state !== "active") continue;
      if (!random.chance(0.05)) continue;
      const others = kernel.queryEntities("npc", {}, 100, 0).filter(x => x.id !== npc.id);
      if (others.length === 0) continue;
      const target = others[random.nextInt(0, others.length - 1)];
      const rel = npc.getComponent("Relationships") || { friends:[], enemies:[], master:null };
      const targetName = (target.getComponent("Identity")||{}).name || target.id;
      const npcName = (npc.getComponent("Identity")||{}).name || npc.id;
      // Random relationship change
      if (random.chance(0.6)) {
        if (!rel.friends.includes(target.id)) rel.friends.push(target.id);
        const e = kernel.getEntity(npc.id);
        kernel.updateComponent(e.id, "Relationships", rel, e.version);
      } else if (random.chance(0.3)) {
        if (!rel.enemies.includes(target.id)) rel.enemies.push(target.id);
        const e = kernel.getEntity(npc.id);
        kernel.updateComponent(e.id, "Relationships", rel, e.version);
      }
    }
  },
};

// Enhanced Sect System (Phase 5) — sect lifecycle
export const EnhancedSectSystem = {
  tick(kernel, time, random) {
    const sects = kernel.queryEntities("sect", {}, 10, 0);
    for (const sect of sects) {
      const members = sect.getComponent("Members") || { count: 10 };
      const power = sect.getComponent("Power") || { strength: 100 };
      const territory = sect.getComponent("Territory") || { regions: [], influence: 50 };
      const age = (sect.getComponent("Age") || { ticks: 0, era: "创立之初" });
      age.ticks = (age.ticks || 0) + 1;
      // Era progression based on age
      if (age.ticks > 1000) age.era = "鼎盛时期";
      else if (age.ticks > 500) age.era = "发展壮大";
      else if (age.ticks > 100) age.era = "初具规模";
      const e1 = kernel.getEntity(sect.id);
      kernel.updateComponent(e1.id, "Age", age, e1.version);
      // Schism: if too large, chance to split
      if (members.count > 30 && random.chance(0.02)) {
        kernel.createEntity("sect", {
          Identity: { name: `${(sect.getComponent("Identity")||{}).name||"?"}分宗` },
          Members: { count: Math.floor(members.count * 0.3), leader: "?" },
          Territory: { regions: territory.regions.slice(0, 1), influence: 20 },
          Power: { strength: Math.floor(power.strength * 0.3), reputation: 30 },
          Age: { ticks: 0, era: "新立宗门" },
        });
        const e2 = kernel.getEntity(sect.id);
        kernel.updateComponent(e2.id, "Members", { ...members, count: Math.floor(members.count * 0.7) }, e2.version);
      }
      // Decline: if too weak
      if (power.strength < 20 && random.chance(0.10)) {
        sect.state = "inactive";
      }
      // Rise: if strong
      if (random.chance(0.05)) {
        const e3 = kernel.getEntity(sect.id);
        kernel.updateComponent(e3.id, "Members", { ...members, count: members.count + 1 }, e3.version);
      }
    }
  },
};

// NPC Sect Behavior System (Sprint 7) — NPCs join/leave/challenge sects
export const NPCSectBehaviorSystem = {
  tick(kernel, time, random) {
    const npcs = kernel.queryEntities("npc", {}, 100, 0);
    const sects = kernel.queryEntities("sect", {}, 10, 0);
    for (const npc of npcs) {
      if (npc.state !== "active") continue;
      const membership = npc.getComponent("SectMembership") || {};
      // Join a sect (5% chance, if not already in one)
      if (!membership.sect_name && sects.length > 0 && random.chance(0.05)) {
        const sect = sects[random.nextInt(0, sects.length - 1)];
        const name = (sect.getComponent("Identity")||{}).name || "?";
        const e = kernel.getEntity(npc.id);
        kernel.updateComponent(e.id, "SectMembership", { sect_name: name, rank: "disciple", contribution: 0 }, e.version);
        const members = sect.getComponent("Members") || { count:1 };
        const se = kernel.getEntity(sect.id);
        kernel.updateComponent(se.id, "Members", { ...members, count: (members.count||1) + 1 }, se.version);
      }
      // Leave sect (2% chance)
      if (membership.sect_name && random.chance(0.02)) {
        const e = kernel.getEntity(npc.id);
        kernel.updateComponent(e.id, "SectMembership", {}, e.version);
      }
    }
  },
};

// Simulation Engine
export class SimulationEngine {
  constructor(seed) {
    this.random = new WorldRandom(seed);
    this.log = new Logger("Simulation");
    this.exploration = new WorldEventEngine(seed);
    this.combat = new CombatEngine(seed);
    this.systems = [
      { name: "weather",  fn: WeatherSystem },
      { name: "qi",       fn: QiSystem },
      { name: "qi_tide",  fn: QiTideSystem },
      { name: "moon",     fn: MoonPhaseSystem },
      { name: "celestial",fn: CelestialEventSystem },
      { name: "spirit_vein",fn: SpiritVeinSystem },
      { name: "npc",      fn: NPCSystem },
      { name: "economy",  fn: EconomySystem },
      { name: "sect",     fn: SectSystem },
      { name: "relations",fn: RelationshipSystem },
      { name: "sect_life",fn: EnhancedSectSystem },
      { name: "m_spawn",  fn: MonsterSpawnSystem },
      { name: "m_ai",     fn: MonsterAISystem },
      { name: "m_encounter",fn: MonsterEncounterSystem },
      { name: "npc_sect",   fn: NPCSectBehaviorSystem },
      { name: "plants",     fn: PlantSystem },
      { name: "animals",    fn: AnimalSystem },
      { name: "spirit_bst", fn: SpiritBeastSystem },
    ];
  }
  tick(kernel, time) {
    for (const sys of this.systems) {
      try { sys.fn.tick(kernel, time, this.random); }
      catch (err) { this.log.error(`System "${sys.name}" failed: ${err.message}`); }
    }
  }
  getRandomState() { return this.random.getState(); }
  setRandomState(state) { this.random.setState(state); }
  reset() { this.random.reset(); }
}

// Simulation Manager
export class SimulationManager {
  constructor(seed) {
    this.engine = new SimulationEngine(seed);
    this.state = "uninitialized";
    this.tickCount = 0;
    this.log = new Logger("SimManager");
  }
  async initialize(kernel) { this.state = "running"; this.kernel = kernel; this.log.info("Simulation Initialized."); }
  tick(time) { if (this.state !== "running") return; this.engine.tick(this.kernel, time); this.tickCount++; }
  pause() { this.state = "paused"; }
  resume() { this.state = "running"; }
  stop() { this.state = "stopped"; }
}
