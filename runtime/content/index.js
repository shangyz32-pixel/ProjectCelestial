// runtime/content/index.js
// Content Evolution Engine — Autonomous Content Expansion
// Analyzes, generates, validates, and registers new gameplay content.
// Deterministic, simulation-compatible, balance-aware.

import { WorldRandom } from "../random/index.js";
import { EQUIPMENT_CATALOG, QUALITIES, AFFIX_POOL, EQUIPMENT_SETS } from "../equipment/index.js";
import { SKILLS, SKILL_TREE } from "../skills/index.js";
import { HERBS, RECIPES, FURNACES, FIRES } from "../alchemy/index.js";
import { MATERIALS, CRAFTING_RECIPES } from "../crafting/index.js";
import { DUNGEON_TYPES } from "../dungeon/index.js";

// ══════════════════════════════════════
// Content Registry — tracks all content metrics
// ══════════════════════════════════════
export function getContentRegistry() {
  return {
    equipment: {
      total: Object.keys(EQUIPMENT_CATALOG).length,
      bySlot: groupBy(Object.values(EQUIPMENT_CATALOG), "slot"),
      byQuality: groupBy(Object.values(EQUIPMENT_CATALOG), "quality"),
      byCategory: groupBy(Object.values(EQUIPMENT_CATALOG), "category"),
      slots: [...new Set(Object.values(EQUIPMENT_CATALOG).map(e => e.slot))],
      affixes: Object.keys(AFFIX_POOL).length,
      sets: Object.keys(EQUIPMENT_SETS).length,
    },
    skills: {
      total: Object.keys(SKILLS).length,
      byCategory: groupBy(Object.values(SKILLS), "category"),
      byType: groupBy(Object.values(SKILLS), "type"),
      branches: [...new Set(Object.values(SKILLS).map(s => s.category))],
      treeNodes: Object.keys(SKILL_TREE).length,
    },
    alchemy: {
      herbs: Object.keys(HERBS).length,
      recipes: Object.keys(RECIPES).length,
      furnaces: Object.keys(FURNACES).length,
      fires: Object.keys(FIRES).length,
    },
    crafting: {
      materials: Object.keys(MATERIALS).length,
      recipes: Object.keys(CRAFTING_RECIPES).length,
    },
    dungeons: {
      types: Object.keys(DUNGEON_TYPES).length,
    },
    timestamp: Date.now(),
  };
}

// ══════════════════════════════════════
// Diversity Analyzer — find gaps
// ══════════════════════════════════════
export function analyzeDiversity() {
  const registry = getContentRegistry();
  const gaps = [];

  // Equipment gaps
  const eq = registry.equipment;
  const allSlots = ["weapon","head","body","legs","boots","gloves","ring","necklace","artifact","belt"];
  const missingSlots = allSlots.filter(s => !eq.slots?.includes(s));
  if (missingSlots.length > 0) gaps.push({ system:"equipment", issue:"missing_slots", detail:missingSlots });

  const qualityDistribution = eq.byQuality || {};
  const allQualities = Object.keys(QUALITIES).filter(q => QUALITIES[q].dropWeight > 0);
  const lowQuality = allQualities.filter(q => (qualityDistribution[q]||0) < 3);
  if (lowQuality.length > 0) gaps.push({ system:"equipment", issue:"quality_diversity", detail:lowQuality });

  // Skill gaps
  const skills = registry.skills;
  const elements = ["fire","water","wood","metal","earth","wind","lightning","ice","light","dark"];
  const coveredElements = skills.branches || [];
  const missingElements = elements.filter(e => !coveredElements.includes(e));
  if (missingElements.length > 0) gaps.push({ system:"skills", issue:"missing_elements", detail:missingElements });

  const skillTypes = ["attack","aoe","heal","defense","passive","debuff","buff","aura","summon","movement"];
  const coveredTypes = Object.keys(skills.byType || {});
  const missingTypes = skillTypes.filter(t => !coveredTypes.includes(t));
  if (missingTypes.length > 0) gaps.push({ system:"skills", issue:"missing_types", detail:missingTypes });

  // Alchemy gaps
  if (registry.alchemy.recipes < 15) gaps.push({ system:"alchemy", issue:"recipe_count", detail:registry.alchemy.recipes });
  if (registry.alchemy.herbs < 20) gaps.push({ system:"alchemy", issue:"herb_count", detail:registry.alchemy.herbs });

  // Crafting gaps
  if (registry.crafting.materials < 25) gaps.push({ system:"crafting", issue:"material_count", detail:registry.crafting.materials });
  if (registry.crafting.recipes < 15) gaps.push({ system:"crafting", issue:"recipe_count", detail:registry.crafting.recipes });

  // Dungeon gaps
  if (registry.dungeons.types < 12) gaps.push({ system:"dungeons", issue:"type_count", detail:registry.dungeons.types });

  return { registry, gaps, timestamp: Date.now() };
}

// ══════════════════════════════════════
// Balance Validator
// ══════════════════════════════════════
export function validateBalance(proposals) {
  const issues = [];
  for (const p of proposals) {
    // No duplicate names
    if (p.system === "equipment") {
      const existing = Object.values(EQUIPMENT_CATALOG);
      if (existing.some(e => e.name === p.name)) issues.push({ item:p.name, issue:"duplicate_name" });
      const powerGrade = (p.baseAtk||0) + (p.baseDef||0) + (p.baseHp||0);
      if (powerGrade > 100) issues.push({ item:p.name, issue:"power_creep", value:powerGrade });
    }
    if (p.system === "skill") {
      const existing = Object.values(SKILLS);
      if (existing.some(s => s.name === p.name)) issues.push({ item:p.name, issue:"duplicate_name" });
    }
  }
  return { valid: issues.length === 0, issues };
}

// ══════════════════════════════════════
// Content Evolution Tick
// ══════════════════════════════════════
export const ContentEvolutionSystem = {
  tick(kernel, time, random) {
    const tick = kernel.world.tickCount;
    if (tick % 1000 !== 0) return; // Only analyze every 1000 ticks

    const analysis = analyzeDiversity();
    kernel.world.globalState.contentAnalysis = analysis;

    // Auto-fix critical gaps
    if (analysis.gaps.length > 0) {
      kernel.world.globalState.contentGaps = analysis.gaps.map(g => `${g.system}:${g.issue}`);
    }
  },
};

// ══════════════════════════════════════
// Generate Evolution Report
// ══════════════════════════════════════
export function generateEvolutionReport() {
  const registry = getContentRegistry();
  const analysis = analyzeDiversity();

  return {
    title:"Content Evolution Report",
    timestamp: new Date().toISOString(),
    registry: {
      equipment: `${registry.equipment.total} items (${registry.equipment.slots?.length||0} slots)`,
      skills: `${registry.skills.total} skills (${registry.skills.branches?.length||0} branches)`,
      alchemy: `${registry.alchemy.herbs} herbs, ${registry.alchemy.recipes} recipes`,
      crafting: `${registry.crafting.materials} materials, ${registry.crafting.recipes} recipes`,
      dungeons: `${registry.dungeons.types} dungeon types`,
    },
    gaps: analysis.gaps.map(g => `${g.system}: ${g.issue} — ${JSON.stringify(g.detail)}`),
    status: analysis.gaps.length === 0 ? "COMPLETE" : `${analysis.gaps.length} gaps detected`,
  };
}

function groupBy(arr, key) {
  const result = {};
  for (const item of arr) {
    const val = item[key];
    if (!result[val]) result[val] = [];
    result[val].push(item);
  }
  return Object.fromEntries(Object.entries(result).map(([k,v]) => [k, v.length]));
}
