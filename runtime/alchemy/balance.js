// runtime/alchemy/balance.js
// v2.2 Sprint 5.5 — Alchemy Balance Engine
// Evaluates herbs, recipes, furnaces, fires, pills for economy/balance.
// Deterministic analysis. No gameplay changes — only numerical balancing.

import { HERBS, RECIPES, FURNACES, FIRES, PILL_QUALITIES } from "../alchemy/index.js";

// ══════════════════════════════════════
// Recipe Cost Analysis
// ══════════════════════════════════════
export function analyzeRecipeCosts() {
  const report = [];
  for (const [id, recipe] of Object.entries(RECIPES)) {
    let totalCost = 0;
    const details = [];
    for (let i = 0; i < recipe.ingredients.length; i++) {
      const herbId = recipe.ingredients[i];
      const qty = recipe.quantities[i];
      const herb = HERBS[herbId];
      if (!herb) { details.push(`??? x${qty}`); continue; }
      const cost = herb.value * qty;
      totalCost += cost;
      details.push(`${herb.name} x${qty} (${cost}💰)`);
    }

    // Expected output value based on quality
    const outputValue = Math.round(totalCost * 1.5 * (1 + recipe.difficulty * 0.2));
    const efficiency = recipe.successRate * recipe.difficulty;

    report.push({
      id, name: recipe.name, difficulty: recipe.difficulty,
      cost: totalCost, outputValue, efficiency: efficiency.toFixed(2),
      successRate: recipe.successRate, ingredients: details.join(", "),
    });
  }
  return report.sort((a,b) => b.efficiency - a.efficiency);
}

// ══════════════════════════════════════
// Pill Value Analysis
// ══════════════════════════════════════
export function analyzePillValues() {
  const report = [];
  for (const [id, recipe] of Object.entries(RECIPES)) {
    const output = recipe.output;
    let combatValue = 0, cultivationValue = 0, breakthroughValue = 0;

    switch (output.type) {
      case "hp_recovery": combatValue = output.value * 2; break;
      case "qi_recovery": combatValue = output.value * 1.5; break;
      case "breakthrough": breakthroughValue = output.value * 500; break;
      case "cultivation_boost": cultivationValue = output.value * output.duration * 10; break;
      case "hp_max_boost": combatValue = output.value * 5; break;
    }

    const totalValue = combatValue + cultivationValue + breakthroughValue;
    report.push({
      id, name: recipe.name, type: output.type,
      combatValue, cultivationValue, breakthroughValue,
      totalValue, difficulty: recipe.difficulty,
    });
  }
  return report.sort((a,b) => b.totalValue - a.totalValue);
}

// ══════════════════════════════════════
// Success Rate Curve Analysis
// ══════════════════════════════════════
export function analyzeSuccessCurves() {
  const report = [];
  for (const [id, recipe] of Object.entries(RECIPES)) {
    const rates = {};
    for (const [fid, furnace] of Object.entries(FURNACES)) {
      for (const [frid, fire] of Object.entries(FIRES)) {
        if (!furnace.fireTypes.includes(frid)) continue;
        const totalRate = Math.min(0.95, recipe.successRate + (furnace.successBonus + fire.successBonus) * 0.01);
        rates[`${furnace.name}+${fire.name}`] = (totalRate * 100).toFixed(0) + "%";
      }
    }
    report.push({ id, name: recipe.name, baseRate: (recipe.successRate*100).toFixed(0)+"%", bestRate: Object.values(rates)[0]||"N/A", rates });
  }
  return report;
}

// ══════════════════════════════════════
// Furnace Balance Check
// ══════════════════════════════════════
export function analyzeFurnaces() {
  const report = [];
  for (const [id, furnace] of Object.entries(FURNACES)) {
    const compatibleRecipes = Object.entries(RECIPES).filter(([_,r]) => r.furnaceReq === id).length;
    const fireCount = furnace.fireTypes.length;
    const costEfficiency = furnace.successBonus / Math.max(1, furnace.cost / 100);

    report.push({
      id, name: furnace.name, cost: furnace.cost,
      successBonus: furnace.successBonus, qualityMult: furnace.qualityMult,
      compatibleRecipes, fireCount, costEfficiency: costEfficiency.toFixed(2),
    });
  }
  return report.sort((a,b) => b.costEfficiency - a.costEfficiency);
}

// ══════════════════════════════════════
// Dependency Analysis — detect dead content
// ══════════════════════════════════════
export function analyzeDependencies() {
  const issues = [];

  // Check which herbs are used in recipes
  const usedHerbs = new Set();
  for (const [_, recipe] of Object.entries(RECIPES)) {
    for (const herbId of recipe.ingredients) usedHerbs.add(herbId);
  }

  // Dead herbs (not used in any recipe)
  for (const [id, herb] of Object.entries(HERBS)) {
    if (!usedHerbs.has(id)) issues.push({ type:"dead_herb", id, name: herb.name, detail:"未用于任何丹方" });
  }

  // Herbs used but have no recipe that uses them in combination
  const recipeCount = Object.keys(RECIPES).length;
  if (recipeCount < 10) issues.push({ type:"low_diversity", id:"recipes", detail:`仅${recipeCount}个丹方` });

  // Check furnace-to-recipe mapping
  for (const [fid, furnace] of Object.entries(FURNACES)) {
    const count = Object.values(RECIPES).filter(r => r.furnaceReq === fid).length;
    if (count === 0) issues.push({ type:"unused_furnace", id:fid, name:furnace.name, detail:"无丹方使用此丹炉" });
  }

  return issues;
}

// ══════════════════════════════════════
// Quality Distribution Analysis
// ══════════════════════════════════════
export function analyzeQualityDistribution() {
  const qualities = Object.entries(PILL_QUALITIES).map(([id,q]) => ({
    id, name: q.name, multi: q.multi, percentage: q.multi,
  }));

  // Expected distribution (with all bonuses maxed)
  const expectedDist = {
    common: 25, good: 25, excellent: 20,
    perfect: 15, legendary: 10, immortal: 5,
  };

  return { qualities, expectedDistribution: expectedDist };
}

// ══════════════════════════════════════
// Full Balance Report Generator
// ══════════════════════════════════════
export function generateBalanceReport() {
  const recipes = analyzeRecipeCosts();
  const pills = analyzePillValues();
  const curves = analyzeSuccessCurves();
  const furnaces = analyzeFurnaces();
  const issues = analyzeDependencies();
  const quality = analyzeQualityDistribution();

  // Top 3 issues
  const topIssues = [
    ...issues,
    ...recipes.filter(r => r.efficiency < 0.3).map(r => ({ type:"low_efficiency", id:r.id, name:r.name, detail:`效率 ${r.efficiency}` })),
    ...pills.filter(p => p.totalValue < 30).map(p => ({ type:"low_value", id:p.id, name:p.name, detail:`价值 ${p.totalValue}` })),
  ].slice(0, 8);

  return {
    title: "Alchemy Balance Report",
    timestamp: new Date().toISOString(),
    summary: {
      totalRecipes: recipes.length,
      totalHerbs: Object.keys(HERBS).length,
      totalFurnaces: furnaces.length,
      totalFires: Object.keys(FIRES).length,
      issuesFound: issues.length,
    },
    topRecipes: recipes.slice(0, 5).map(r => ({ name:r.name, cost:r.cost, value:r.outputValue, efficiency:r.efficiency })),
    topPills: pills.slice(0, 5).map(p => ({ name:p.name, totalValue:p.totalValue, type:p.type })),
    furnaces: furnaces.map(f => ({ name:f.name, costEfficiency:f.costEfficiency, recipes:f.compatibleRecipes })),
    issues: topIssues,
    status: issues.length === 0 ? "PASS" : `${issues.length} issues`,
  };
}
