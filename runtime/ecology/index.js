// runtime/ecology/index.js
// v2.0 Sprint 6 — World Ecology Framework
// Self-sustaining ecosystem: plants, animals, spirit beasts, food chain.
// All deterministic through Kernel API.

import { WorldRandom } from "../random/index.js";

// ══════════════════════════════════════
// Plant Types
// ══════════════════════════════════════
export const PLANT_TYPES = {
  spirit_grass:  { name:"灵草",   type:"spirit_herb", growthRate:0.03, maxDensity:50,  qiConsume:0.01, reproduces:true },
  jade_flower:   { name:"玉兰花", type:"resource",   growthRate:0.02, maxDensity:20,  qiConsume:0.02, reproduces:true },
  iron_bamboo:   { name:"铁竹",   type:"resource",   growthRate:0.01, maxDensity:15,  qiConsume:0.01, reproduces:false },
  ancient_tree:  { name:"古树",   type:"ancient",    growthRate:0.005,maxDensity:5,   qiConsume:0.05, reproduces:false },
  qi_vine:       { name:"灵藤",   type:"qi_plant",   growthRate:0.04, maxDensity:30,  qiConsume:0.03, reproduces:true },
  immortal_mushroom:{name:"仙芝", type:"immortal",   growthRate:0.01, maxDensity:3,   qiConsume:0.10, reproduces:true },
};

// ══════════════════════════════════════
// Wild Animal Types (non-cultivating)
// ══════════════════════════════════════
export const ANIMAL_TYPES = {
  spirit_deer:    { name:"灵鹿",   type:"herbivore", population:20, birthRate:0.03, deathRate:0.01, migrationRate:0.02, diet:"spirit_grass" },
  cloud_hare:     { name:"云兔",   type:"herbivore", population:30, birthRate:0.05, deathRate:0.02, migrationRate:0.03, diet:"jade_flower" },
  iron_bull:      { name:"铁牛",   type:"herbivore", population:10, birthRate:0.02, deathRate:0.01, migrationRate:0.01, diet:"iron_bamboo" },
  forest_wolf:    { name:"林狼",   type:"carnivore", population:8,  birthRate:0.02, deathRate:0.03, migrationRate:0.04, diet:"herbivore" },
  shadow_panther: { name:"影豹",   type:"carnivore", population:5,  birthRate:0.01, deathRate:0.02, migrationRate:0.05, diet:"herbivore" },
};

// ══════════════════════════════════════
// Spirit Beast Types (cultivating)
// ══════════════════════════════════════
export const SPIRIT_BEAST_TYPES = {
  fire_fox:       { name:"火狐",   realm:2, cultivation:0.001, aggression:0.3, habitat:["forest","mountain"], evolvesTo:"nine_tailed_fox", evolveRealm:5 },
  thunder_eagle:  { name:"雷鹰",   realm:3, cultivation:0.002, aggression:0.4, habitat:["mountain","snowfield"], evolvesTo:"thunder_phoenix", evolveRealm:6 },
  ice_turtle:     { name:"冰龟",   realm:1, cultivation:0.0005,aggression:0.1, habitat:["river","snowfield"], evolvesTo:"black_tortoise", evolveRealm:4 },
  jade_snake:     { name:"玉蛇",   realm:2, cultivation:0.001, aggression:0.3, habitat:["swamp","cave"], evolvesTo:"azure_dragon", evolveRealm:7 },
  wind_deer:      { name:"风鹿",   realm:1, cultivation:0.0005,aggression:0.1, habitat:["grassland","forest"], evolvesTo:"qilin", evolveRealm:5 },
};

// ══════════════════════════════════════
// Plant Growth System
// ══════════════════════════════════════
export const PlantSystem = {
  tick(kernel, time, random) {
    const regions = ["area_bamboo_grove","area_misty_peak","area_thunder_valley","area_dragon_vein"];
    for (const region of regions) {
      const plants = kernel.queryEntities("plant", { region }, 500, 0);
      // Total cap per region to prevent infinite growth
      if (plants.filter(p => p.state !== "dead").length >= 200) continue;
      const qi = kernel.world.globalState.qi.get("world") || 1.0;
      const seasonMod = { "春":1.3, "夏":1.0, "秋":0.7, "冬":0.4 }[time.season] || 1.0;

      // Grow existing plants
      for (const plant of plants) {
        if (plant.state === "dead") continue;
        const growth = plant.getComponent("Growth") || { stage:1, health:100 };
        const template = PLANT_TYPES[plant.getComponent("Identity")?.type];
        if (!template) continue;
        growth.health = Math.min(100, (growth.health||100) + template.growthRate * qi * seasonMod * 10);
        growth.stage = Math.floor(growth.health / 100);
        const e = kernel.getEntity(plant.id);
        kernel.updateComponent(e.id, "Growth", growth, e.version);
        if (growth.health <= 0) plant.state = "dead";
      }

      // Spawn new plants if below density cap
      for (const [typeId, template] of Object.entries(PLANT_TYPES)) {
        const count = plants.filter(p => (p.getComponent("Identity")||{}).type === typeId).length;
        if (count < template.maxDensity && random.chance(template.growthRate * seasonMod)) {
          kernel.createEntity("plant", {
            Identity: { name: template.name, type: typeId },
            Location: { area: region },
            Growth: { stage: 0, health: 10 },
          });
        }
      }
    }
  },
};

// ══════════════════════════════════════
// Animal Population System
// ══════════════════════════════════════
export const AnimalSystem = {
  tick(kernel, time, random) {
    const regions = ["area_bamboo_grove","area_misty_peak","area_thunder_valley","area_dragon_vein"];
    for (const region of regions) {
      const animals = kernel.queryEntities("animal", { region }, 500, 0);
      // Total cap to prevent infinite growth
      if (animals.filter(a => a.state !== "dead").length >= 200) continue;
      const plants = kernel.queryEntities("plant", { region }, 500, 0);
      const herbCount = animals.filter(a => {
        const t = ANIMAL_TYPES[(a.getComponent("Identity")||{}).type]; return t?.type === "herbivore";
      }).length;
      const carnCount = animals.filter(a => {
        const t = ANIMAL_TYPES[(a.getComponent("Identity")||{}).type]; return t?.type === "carnivore";
      }).length;
      const plantCount = plants.filter(p => p.state !== "dead").length;

      // Process each animal population
      for (const animal of animals) {
        const pop = animal.getComponent("Population") || { count: 10, growth: 0 };
        const template = ANIMAL_TYPES[(animal.getComponent("Identity")||{}).type];
        if (!template) continue;

        const foodAvailable = template.type === "herbivore" ? plantCount : herbCount;
        const growthRate = template.birthRate * (foodAvailable / 10) - template.deathRate;
        pop.count = Math.max(0, Math.round(pop.count * (1 + growthRate)));
        if (pop.count <= 0) { animal.state = "dead"; continue; }

        const e = kernel.getEntity(animal.id);
        kernel.updateComponent(e.id, "Population", pop, e.version);

        // Migration chance
        if (random.chance(template.migrationRate)) {
          const ri = regions.indexOf(region);
          const dest = regions[(ri + random.nextInt(1, 3)) % regions.length];
          kernel.updateComponent(e.id, "Location", { area: dest }, e.version);
        }
      }

      // Spawn new animal types if missing
      for (const [typeId, template] of Object.entries(ANIMAL_TYPES)) {
        const exists = animals.some(a => (a.getComponent("Identity")||{}).type === typeId);
        if (!exists && random.chance(0.05)) {
          kernel.createEntity("animal", {
            Identity: { name: template.name, type: typeId },
            Location: { area: region },
            Population: { count: template.population, growth: 0 },
          });
        }
      }
    }
  },
};

// ══════════════════════════════════════
// Spirit Beast System (cultivating beasts)
// ══════════════════════════════════════
export const SpiritBeastSystem = {
  tick(kernel, time, random) {
    const regions = ["area_bamboo_grove","area_misty_peak","area_thunder_valley","area_dragon_vein"];
    for (const region of regions) {
      const beasts = kernel.queryEntities("spirit_beast", { region }, 50, 0);
      for (const beast of beasts) {
        if (beast.state === "dead") continue;
        const realm = beast.getComponent("Realm") || { realm_id: 1, cultivation_value: 0.1 };
        const template = SPIRIT_BEAST_TYPES[(beast.getComponent("Identity")||{}).type];
        if (!template) continue;

        // Cultivate
        const qi = kernel.world.globalState.qi.get("world") || 1.0;
        const inc = template.cultivation * qi;
        realm.cultivation_value = Math.min(1.0, (realm.cultivation_value || 0) + inc);
        const e1 = kernel.getEntity(beast.id);
        kernel.updateComponent(e1.id, "Realm", realm, e1.version);

        // Breakthrough
        if (realm.cultivation_value >= 1.0 && random.chance(0.15)) {
          realm.realm_id = (realm.realm_id || 1) + 1;
          realm.cultivation_value = 0;
          const e2 = kernel.getEntity(beast.id);
          kernel.updateComponent(e2.id, "Realm", realm, e2.version);

          // Evolution check
          if (template.evolvesTo && realm.realm_id >= template.evolveRealm && random.chance(0.20)) {
            const e3 = kernel.getEntity(beast.id);
            kernel.updateComponent(e3.id, "Identity", { ...e3.getComponent("Identity"), name: template.evolvesTo.replace(/_/g, " ") }, e3.version);
          }
        }

        // Hunt animals for sustenance
        const animals = kernel.queryEntities("animal", { region }, 50, 0);
        if (animals.length > 0 && random.chance(template.aggression)) {
          const prey = animals[random.nextInt(0, animals.length - 1)];
          const preyPop = prey.getComponent("Population") || { count: 10 };
          if (preyPop.count > 0) {
            const e4 = kernel.getEntity(prey.id);
            kernel.updateComponent(e4.id, "Population", { ...preyPop, count: Math.max(0, preyPop.count - 1) }, e4.version);
          }
        }
      }

      // Spawn new spirit beasts
      const habitatTypes = {
        area_bamboo_grove: ["forest"], area_misty_peak: ["mountain","forest"],
        area_thunder_valley: ["mountain","snowfield"], area_dragon_vein: ["mountain","cave"],
      };
      if (beasts.length < 3 && random.chance(0.10)) {
        const habitats = habitatTypes[region] || ["forest"];
        const candidates = Object.entries(SPIRIT_BEAST_TYPES).filter(([_,t]) => t.habitat.some(h => habitats.includes(h)));
        if (candidates.length > 0) {
          const [id, tmpl] = candidates[random.nextInt(0, candidates.length - 1)];
          kernel.createEntity("spirit_beast", {
            Identity: { name: tmpl.name, type: id },
            Realm: { realm_id: tmpl.realm, cultivation_value: 0.1 },
            HP: { current: tmpl.realm * 30, max: tmpl.realm * 30 },
            Behavior: { aggression: tmpl.aggression },
            Location: { area: region },
          });
        }
      }
    }
  },
};
