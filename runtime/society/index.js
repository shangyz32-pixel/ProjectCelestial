// runtime/society/index.js
// v2.0 Sprint 10 — Society & Civilization Framework
// Family, Master/Disciple, Diplomacy, City, Kingdom.
// All deterministic through Kernel API.

import { WorldRandom } from "../random/index.js";

// ══════════════════════════════════════
// Marriage & Family
// ══════════════════════════════════════
export const FamilySystem = {
  tick(kernel, time, random) {
    const npcs = kernel.queryEntities("npc", {}, 100, 0).filter(n => n.state === "active");
    for (const npc of npcs) {
      const family = npc.getComponent("Family") || { spouse: null, children: [], parents: [] };
      const personality = npc.getComponent("Personality") || {};

      // Marriage check: single NPCs with high kindness/loyalty
      if (!family.spouse && personality.kindness >= 5 && personality.loyalty >= 5 && random.chance(0.01)) {
        const candidates = npcs.filter(n => {
          const f = n.getComponent("Family") || {};
          return n.id !== npc.id && !f.spouse;
        });
        if (candidates.length > 0) {
          const spouse = candidates[random.nextInt(0, candidates.length - 1)];
          const sf = spouse.getComponent("Family") || { spouse: null, children: [], parents: [] };
          family.spouse = spouse.id; sf.spouse = npc.id;
          const e1 = kernel.getEntity(npc.id);
          kernel.updateComponent(e1.id, "Family", family, e1.version);
          const e2 = kernel.getEntity(spouse.id);
          kernel.updateComponent(e2.id, "Family", sf, e2.version);
        }
      }

      // Child birth: married NPCs with time
      if (family.spouse && random.chance(0.005) && Math.random() < 0.3) {
        const childName = `${(npc.getComponent("Identity")||{}).name || "?"}之子`;
        const child = kernel.createEntity("npc", {
          Identity: { name: childName, age: 0 },
          Realm: { realm_id: Math.max(1, Math.floor(((npc.getComponent("Realm")||{}).realm_id || 1) * 0.5)), cultivation_value: 0 },
          HP: { current: 40, max: 40 },
          Stamina: { current: 50, max: 50 },
          Family: { parents: [npc.id, family.spouse] },
          Personality: { ambition:random.nextInt(3,8), curiosity:random.nextInt(3,8), kindness:random.nextInt(3,8) },
        });
        family.children = [...(family.children || []), child.id];
        const e1 = kernel.getEntity(npc.id);
        kernel.updateComponent(e1.id, "Family", family, e1.version);
      }
    }
  },
};

// ══════════════════════════════════════
// Master & Disciple
// ══════════════════════════════════════
export const MentorshipSystem = {
  tick(kernel, time, random) {
    const npcs = kernel.queryEntities("npc", {}, 100, 0).filter(n => n.state === "active");
    for (const npc of npcs) {
      const realm = npc.getComponent("Realm")?.realm_id || 1;
      const mentorship = npc.getComponent("Mentorship") || { master: null, disciples: [] };
      const personality = npc.getComponent("Personality") || {};

      // Become master: high realm + high kindness/loyalty
      if (realm >= 5 && personality.kindness >= 6 && mentorship.disciples.length < 3 && random.chance(0.02)) {
        const candidates = npcs.filter(n => {
          const nr = n.getComponent("Realm")?.realm_id || 1;
          const nm = n.getComponent("Mentorship") || {};
          return n.id !== npc.id && nr < realm && !nm.master;
        });
        if (candidates.length > 0) {
          const disciple = candidates[random.nextInt(0, candidates.length - 1)];
          const dm = disciple.getComponent("Mentorship") || { master: null, disciples: [] };
          dm.master = npc.id;
          mentorship.disciples = [...mentorship.disciples, disciple.id];
          const e1 = kernel.getEntity(npc.id);
          kernel.updateComponent(e1.id, "Mentorship", mentorship, e1.version);
          const e2 = kernel.getEntity(disciple.id);
          kernel.updateComponent(e2.id, "Mentorship", dm, e2.version);
        }
      }

      // Seek master: low realm + high ambition
      if (realm <= 3 && personality.ambition >= 6 && !mentorship.master && random.chance(0.03)) {
        const candidates = npcs.filter(n => {
          const nr = n.getComponent("Realm")?.realm_id || 1;
          const nm = n.getComponent("Mentorship") || {};
          return n.id !== npc.id && nr >= realm + 3 && (nm.disciples || []).length < 3;
        });
        if (candidates.length > 0) {
          const master = candidates[random.nextInt(0, candidates.length - 1)];
          const mm = master.getComponent("Mentorship") || { master: null, disciples: [] };
          mm.disciples = [...mm.disciples, npc.id];
          mentorship.master = master.id;
          const e1 = kernel.getEntity(npc.id);
          kernel.updateComponent(e1.id, "Mentorship", mentorship, e1.version);
          const e2 = kernel.getEntity(master.id);
          kernel.updateComponent(e2.id, "Mentorship", mm, e2.version);
        }
      }
    }
  },
};

// ══════════════════════════════════════
// City/Kingdom Settlement System
// ══════════════════════════════════════
export const SettlementSystem = {
  tick(kernel, time, random) {
    const settlements = kernel.queryEntities("settlement", {}, 10, 0);
    const npcs = kernel.queryEntities("npc", {}, 100, 0).filter(n => n.state === "active");

    // Create first settlement if none exist
    if (settlements.length === 0 && npcs.length >= 3 && random.chance(0.05)) {
      kernel.createEntity("settlement", {
        Identity: { name: "新手村", type:"village" },
        Location: { area: "area_bamboo_grove" },
        Population: { count: 50, growth: 0 },
        Economy: { treasury: { spirit_stone: 100 }, trade_routes: [] },
        Government: { type:"council", leader: null, laws: ["defense","trade"] },
        Buildings: { houses:5, inn:1, market:1, walls:0 },
        Age: { ticks: 0, era: "初建" },
      });
      return;
    }

    for (const s of settlements) {
      const pop = s.getComponent("Population") || { count: 50, growth: 0 };
      const buildings = s.getComponent("Buildings") || { houses:5 };
      const age = s.getComponent("Age") || { ticks: 0, era: "初建" };

      // Population growth
      const growthRate = 0.02 + (npcs.filter(n => (n.getComponent("Location")||{}).area === (s.getComponent("Location")||{}).area).length * 0.01);
      pop.count = Math.round(pop.count * (1 + growthRate));
      pop.growth = growthRate;
      const e1 = kernel.getEntity(s.id);
      kernel.updateComponent(e1.id, "Population", pop, e1.version);

      // Building construction
      if (pop.count > 100 && !buildings.market && random.chance(0.05)) {
        buildings.market = 1;
        kernel.updateComponent(e1.id, "Buildings", buildings, e1.version);
      }
      if (pop.count > 200 && !buildings.walls && random.chance(0.03)) {
        buildings.walls = 1;
        kernel.updateComponent(e1.id, "Buildings", buildings, e1.version);
      }

      // Settlement evolution
      age.ticks = (age.ticks || 0) + 1;
      if (pop.count > 500) age.era = "繁荣";
      else if (pop.count > 200) age.era = "发展中";
      else if (pop.count > 100) age.era = "成长";
      kernel.updateComponent(e1.id, "Age", age, e1.version);
    }
  },
};

// ══════════════════════════════════════
// Diplomacy System — sect-to-sect relations
// ══════════════════════════════════════
export const DiplomacySystem = {
  tick(kernel, time, random) {
    const sects = kernel.queryEntities("sect", {}, 10, 0);
    if (sects.length < 2) return;

    for (let i = 0; i < sects.length; i++) {
      for (let j = i + 1; j < sects.length; j++) {
        const s1 = sects[i]; const s2 = sects[j];
        const s1Name = (s1.getComponent("Identity")||{}).name || "?";
        const s2Name = (s2.getComponent("Identity")||{}).name || "?";
        const dip = s1.getComponent("Diplomacy") || { relations: {} };

        if (!dip.relations[s2Name]) dip.relations[s2Name] = { status:"neutral", score:50, trade:false, alliance:false };

        const rel = dip.relations[s2Name];
        // Random diplomatic shifts
        if (random.chance(0.02)) {
          rel.score += random.nextInt(-5, 8);
          if (rel.score > 75 && !rel.alliance) { rel.alliance = true; rel.status = "alliance"; }
          else if (rel.score > 60) rel.status = "friendly";
          else if (rel.score < 25) { rel.status = "hostile"; rel.alliance = false; }
          else if (rel.score < 40) rel.status = "tense";
          else rel.status = "neutral";
        }
        // Trade agreement
        if (rel.status === "friendly" && !rel.trade && random.chance(0.03)) {
          rel.trade = true;
        }

        const e1 = kernel.getEntity(s1.id);
        kernel.updateComponent(e1.id, "Diplomacy", dip, e1.version);
      }
    }
  },
};
