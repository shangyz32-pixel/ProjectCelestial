// runtime/achievements/index.js
// Sprint 8 — Achievement System
// Tracks player milestones. All through Kernel API.

export const ACHIEVEMENTS = {
  // Cultivation
  first_cultivate:   { name:"初窥门径",    desc:"首次修炼",          icon:"🌱",  check:(p)=> (p.getComponent("Realm")?.cultivation_value || 0) > 0 },
  reach_lv3:         { name:"小有所成",    desc:"达到 Lv3",          icon:"⭐",  check:(p)=> (p.getComponent("Realm")?.realm_id || 1) >= 3 },
  reach_lv5:         { name:"金丹大成",    desc:"达到 Lv5",          icon:"💎",  check:(p)=> (p.getComponent("Realm")?.realm_id || 1) >= 5 },
  first_breakthrough:{ name:"破境",        desc:"首次突破",          icon:"⚡",  check:(p)=> (p.getComponent("Realm")?.breakthroughs || 0) > 0 },
  ten_breakthroughs: { name:"十次破境",    desc:"突破 10 次",        icon:"🔥",  check:(p)=> (p.getComponent("Realm")?.breakthroughs || 0) >= 10 },

  // Exploration
  first_explore:     { name:"踏出第一步",  desc:"首次探索新区域",    icon:"🗺",  check:(p)=> (p.getComponent("Location")?.area !== "area_bamboo_grove") },
  visit_all_areas:   { name:"走遍天下",    desc:"探索所有 4 个区域", icon:"🌍",  check:(p, kernel) => {
    const loc = p.getComponent("Location") || {};
    const explored = loc.explored || [];
    return explored.length >= 4;
  }},
  dragon_visitor:    { name:"龙脉访客",    desc:"进入龙脉秘境",      icon:"🐉",  check:(p)=> (p.getComponent("Location")?.area === "area_dragon_vein") },

  // Resources
  collect_herb:      { name:"采药人",      desc:"收集灵草",          icon:"🌿",  check:(p)=> (p.getComponent("Inventory")?.items?.spirit_herb || 0) > 0 },
  rich_collector:    { name:"富甲一方",    desc:"拥有 100+ 灵石",    icon:"💰",  check:(p)=> (p.getComponent("Inventory")?.items?.spirit_stone || 0) >= 100 },

  // Sect
  found_sect:        { name:"开宗立派",    desc:"创立宗门",          icon:"🏛",  check:(p)=> !!(p.getComponent("Legacy")?.founded_sect) },
  join_sect:         { name:"拜入山门",    desc:"加入宗门",          icon:"🏯",  check:(p)=> !!(p.getComponent("SectMembership")?.sect_name) },
  sect_elder:        { name:"宗门长老",    desc:"成为宗门长老",      icon:"👑",  check:(p)=> (p.getComponent("SectMembership")?.rank === "elder" || p.getComponent("SectMembership")?.rank === "vice_leader" || p.getComponent("SectMembership")?.rank === "leader") },

  // Combat (tracked via Legacy)
  first_monster_kill:{ name:"初战告捷",    desc:"击败妖兽",          icon:"⚔",  check:(p)=> (p.getComponent("Legacy")?.monster_kills || 0) > 0 },
};

// Check all achievements for a player — return newly earned ones
export function checkAchievements(player, kernel) {
  const earned = player.getComponent("Achievements") || {};
  const newlyEarned = [];

  for (const [id, ach] of Object.entries(ACHIEVEMENTS)) {
    if (earned[id]) continue; // already earned
    if (ach.check(player, kernel)) {
      newlyEarned.push({ id, ...ach });
    }
  }

  // Save newly earned achievements
  if (newlyEarned.length > 0) {
    const allEarned = { ...earned };
    for (const a of newlyEarned) allEarned[a.id] = Date.now();
    const up = kernel.getEntity(player.id);
    kernel.updateComponent(up.id, "Achievements", allEarned, up.version);
  }

  return newlyEarned;
}

// Get all earned achievements for display
export function getEarnedAchievements(player) {
  const earned = player.getComponent("Achievements") || {};
  return Object.entries(earned).map(([id, time]) => {
    const ach = ACHIEVEMENTS[id];
    return ach ? { id, ...ach, earnedAt: time } : null;
  }).filter(Boolean);
}
