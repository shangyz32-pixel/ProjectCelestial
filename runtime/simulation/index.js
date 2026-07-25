// runtime/simulation/index.js
// Simulation Systems — deterministic world evolution.
// Each system.tick(kernel, time, random) → applies state changes via Kernel API.

import { WorldRandom } from "../random/index.js";
import { Logger } from "../bootstrap/logger.js";

// ══════════════════════════════════════
// Weather System (Step 02)
// Deterministic weather based on season + tick
// ══════════════════════════════════════
export const WeatherSystem = {
  STATES: ["clear", "cloudy", "rain", "storm", "snow", "fog"],

  tick(kernel, time, random) {
    // Deterministic weather: seed + season + tick → weather
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

// ══════════════════════════════════════
// Qi System (Step 03)
// Qi density fluctuates with season + spiritual tide
// ══════════════════════════════════════
export const QiSystem = {
  tick(kernel, time, random) {
    // Base qi + seasonal modifier + small random fluctuation
    const seasonalMod = { "春": 1.1, "夏": 0.9, "秋": 1.0, "冬": 0.8 }[time.season] || 1.0;
    const fluctuation = random.nextFloat(-0.02, 0.02);
    const qi = Math.max(0.5, Math.min(1.5, seasonalMod + fluctuation));

    kernel.world.globalState.qi.set("world", qi);
  },
};

// ══════════════════════════════════════
// NPC System (Step 04)
// Age, HP recovery, stamina, cultivation, breakthrough
// ══════════════════════════════════════
export const NPCSystem = {
  tick(kernel, time, random) {
    const npcs = kernel.queryEntities("npc", {}, 100, 0);
    if (npcs.length === 0) return;

    for (const npc of npcs) {
      if (npc.state !== "active") continue;

      // 1. Age: +1 day per tick
      const identity = npc.getComponent("Identity") || {};
      const age = (identity.age || 0) + 1;
      kernel.updateComponent(npc.id, "Identity", { ...identity, age }, npc.version);

      // 2. HP recovery
      const hp = npc.getComponent("HP");
      if (hp && hp.current < hp.max) {
        const recovery = time.season === "冬" ? 0.5 : 1;
        const e1 = kernel.getEntity(npc.id);
        const hpNow = e1.getComponent("HP");
        kernel.updateComponent(e1.id, "HP", { ...hpNow, current: Math.min(hpNow.current + recovery, hpNow.max) }, e1.version);
      }

      // 3. Stamina: consume + recover
      const stamina = npc.getComponent("Stamina") || { current: 100, max: 100 };
      const isNight = time.hour >= 6 && time.hour <= 8; // 戌亥子 — rest hours
      const e2 = kernel.getEntity(npc.id);
      if (isNight) {
        // Night: recover stamina
        kernel.updateComponent(e2.id, "Stamina", {
          ...stamina, current: Math.min((stamina.current || 100) + 5, stamina.max || 100)
        }, e2.version);
      } else {
        // Day: consume stamina (cultivation is exhausting)
        kernel.updateComponent(e2.id, "Stamina", {
          ...stamina, current: Math.max((stamina.current || 100) - 2, 0)
        }, e2.version);
      }

      // 4. Cultivation: accumulate progress
      const realm = npc.getComponent("Realm");
      const e3 = kernel.getEntity(npc.id);
      if (realm && !realm.breakthrough_pending) {
        const qi = kernel.world.globalState.qi.get("world") || 1.0;
        const staminaNow = e3.getComponent("Stamina");
        const staminaMod = staminaNow && staminaNow.current > 0 ? 1.0 : 0.3; // tired = slow cultivation
        const dayNightMod = isNight ? 0.8 : 1.0;
        const increment = random.nextFloat(0.001, 0.01) * qi * staminaMod * dayNightMod;
        const newCV = Math.min(1.0, (realm.cultivation_value || 0) + increment);
        const e4 = kernel.getEntity(npc.id);

        kernel.updateComponent(e4.id, "Realm", {
          ...realm,
          cultivation_value: newCV,
        }, e4.version);

        // 5. Breakthrough: when cultivation reaches 1.0
        if (newCV >= 1.0 && !realm.breakthrough_pending) {
          const breakthroughChance = 0.1 + (realm.realm_id || 1) * 0.02;
          if (random.chance(breakthroughChance)) {
            const e5 = kernel.getEntity(npc.id);
            kernel.updateComponent(e5.id, "Realm", {
              ...e5.getComponent("Realm"),
              realm_id: (realm.realm_id || 0) + 1,
              cultivation_value: 0.0,
              breakthrough_pending: false,
              breakthroughs: ((realm.breakthroughs || 0) + 1),
            }, e5.version);
          } else {
            // Failed breakthrough: reset cultivation, try again
            const e5 = kernel.getEntity(npc.id);
            kernel.updateComponent(e5.id, "Realm", {
              ...e5.getComponent("Realm"),
              cultivation_value: 0.7, // setback but not zero
              breakthrough_pending: false,
            }, e5.version);
          }
        }
      }
    }
  },
};

// ══════════════════════════════════════
// Economy System (Step 05)
// Prices fluctuate based on season + weather
// ══════════════════════════════════════
export const EconomySystem = {
  BASE_PRICES: { spirit_stone: 100, pill: 50, herb: 10 },

  tick(kernel, time, random) {
    const weather = kernel.world.globalState.weather.get("world") || "clear";
    const season = time.season;
    const prices = kernel.world.globalState.economy.priceTable;

    // Weather impacts: storm = supply shortage = prices up
    const weatherMod = { "clear": 0.98, "cloudy": 1.0, "rain": 1.02, "storm": 1.05, "snow": 1.03, "fog": 1.01 }[weather];
    const seasonalMod = { "春": 0.97, "夏": 1.0, "秋": 1.01, "冬": 1.04 }[season];

    for (const [item, base] of Object.entries(EconomySystem.BASE_PRICES)) {
      const prev = prices[item] || base;
      const drift = random.nextFloat(-0.01, 0.01);
      prices[item] = Math.round(Math.max(base * 0.5, Math.min(base * 2.0, prev * weatherMod * seasonalMod + drift * base)));
    }
  },
};

// ══════════════════════════════════════
// Simulation System aggregator
// ══════════════════════════════════════
export class SimulationEngine {
  constructor(seed) {
    this.random = new WorldRandom(seed);
    this.log = new Logger("Simulation");
    this.systems = [
      { name: "weather",  fn: WeatherSystem },
      { name: "qi",       fn: QiSystem },
      { name: "npc",      fn: NPCSystem },
      { name: "economy",  fn: EconomySystem },
    ];
  }

  // Run all systems for one Tick
  tick(kernel, time) {
    for (const sys of this.systems) {
      try {
        sys.fn.tick(kernel, time, this.random);
      } catch (err) {
        this.log.error(`System "${sys.name}" failed: ${err.message}`);
      }
    }
  }

  // Snapshot the random state
  getRandomState() {
    return this.random.getState();
  }

  // Restore random state (for replay)
  setRandomState(state) {
    this.random.setState(state);
  }

  reset() {
    this.random.reset();
  }
}

// ══════════════════════════════════════
// SimulationManager — official lifecycle
// ══════════════════════════════════════
export class SimulationManager {
  constructor(seed) {
    this.engine = new SimulationEngine(seed);
    this.state = "uninitialized"; // uninitialized | running | paused | stopped
    this.tickCount = 0;
    this.log = new Logger("SimManager");
  }

  async initialize(kernel) {
    this.state = "running";
    this.kernel = kernel;
    this.log.info("Simulation Initialized.");
  }

  tick(time) {
    if (this.state !== "running") return;
    this.engine.tick(this.kernel, time);
    this.tickCount++;
  }

  pause() { this.state = "paused"; }
  resume() { this.state = "running"; }
  stop() { this.state = "stopped"; }
}
