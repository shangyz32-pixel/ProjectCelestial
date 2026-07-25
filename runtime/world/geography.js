// runtime/world/geography.js
// v2.0 Sprint 5 — World Geography Framework
// Multi-region continental geography with climate/civilization/resources.

// ══════════════════════════════════════
// Major Realms
// ══════════════════════════════════════
export const MAJOR_REALMS = {
  eastern_domain: {
    id:"eastern_domain", name:"东方域", type:"continent",
    climate:"温和", qiType:"spirit", qiDensity:{min:0.7,max:1.2},
    terrain:["forest","grassland","mountain","river"],
    civilization:"修仙帝国", population:100000, dangerLevel:2,
    description:"东方修仙文明的核心，灵气充沛，宗门林立。",
    factions:["青云宗","天剑宗","灵药谷"],
    resources:{spirit_herb:0.3,jade_shard:0.2,spirit_stone:0.15},
  },
  southern_wild: {
    id:"southern_wild", name:"南荒", type:"continent",
    climate:"炎热潮湿", qiType:"chaotic", qiDensity:{min:0.4,max:1.5},
    terrain:["swamp","jungle","volcano","cave"],
    civilization:"部落联盟", population:30000, dangerLevel:7,
    description:"蛮荒之地，妖兽横行，原始部落散居。",
    factions:["蛮族联盟","毒王谷"],
    resources:{spirit_herb:0.2,dragon_scale:0.15,thunder_ore:0.10},
  },
  western_desert: {
    id:"western_desert", name:"西漠", type:"continent",
    climate:"干燥酷热", qiType:"fire", qiDensity:{min:0.3,max:0.9},
    terrain:["desert","canyon","oasis","ruins"],
    civilization:"沙漠王朝", population:20000, dangerLevel:6,
    description:"无尽黄沙之下，埋葬着无数古国遗迹。",
    factions:["沙海商会","古墓派"],
    resources:{ancient_jade:0.20,spirit_stone:0.10,thunder_ore:0.10},
  },
  northern_frontier: {
    id:"northern_frontier", name:"北疆", type:"continent",
    climate:"严寒", qiType:"ice", qiDensity:{min:0.5,max:1.0},
    terrain:["snowfield","mountain","frozen_lake","tundra"],
    civilization:"雪域王朝", population:15000, dangerLevel:5,
    description:"冰天雪地，银装素裹，隐藏着上古遗迹。",
    factions:["冰魄宫","北疆剑派"],
    resources:{thunder_ore:0.15,ancient_jade:0.10,jade_shard:0.15},
  },
  central_continent: {
    id:"central_continent", name:"中州", type:"continent",
    climate:"四季分明", qiType:"spirit", qiDensity:{min:0.8,max:1.5},
    terrain:["mountain","forest","grassland","river","plain"],
    civilization:"修仙联盟", population:200000, dangerLevel:3,
    description:"天下中枢，万派汇聚，强者如云。",
    factions:["天道盟","万剑山庄","天机阁"],
    resources:{spirit_stone:0.25,ancient_jade:0.15,dragon_scale:0.10},
  },
  overseas_isles: {
    id:"overseas_isles", name:"海外仙岛", type:"archipelago",
    climate:"温和湿润", qiType:"spirit", qiDensity:{min:0.6,max:1.3},
    terrain:["island","ocean","coral","volcanic_island"],
    civilization:"仙岛联盟", population:25000, dangerLevel:4,
    description:"散落在东海之外的仙家岛屿，风景秀丽。",
    factions:["蓬莱仙岛","东海龙宫"],
    resources:{spirit_herb:0.20,dragon_scale:0.20,ancient_jade:0.10},
  },
  netherworld: {
    id:"netherworld", name:"幽都", type:"underworld",
    climate:"阴冷", qiType:"death", qiDensity:{min:0.3,max:0.8},
    terrain:["cavern","underground","abyss","ghost_city"],
    civilization:"冥界势力", population:5000, dangerLevel:9,
    description:"九幽之下，亡灵徘徊，死气弥漫的诡异世界。",
    factions:["幽冥殿","轮回宗"],
    resources:{ancient_jade:0.25,dragon_scale:0.15,spirit_stone:0.05},
  },
  immortal_realm: {
    id:"immortal_realm", name:"仙界", type:"heaven",
    climate:"仙气缭绕", qiType:"immortal", qiDensity:{min:1.5,max:3.0},
    terrain:["floating_island","jade_palace","cloud_sea","peach_garden"],
    civilization:"仙庭", population:1000, dangerLevel:10,
    description:"仙人居所，灵气化雾，非飞升不可至。",
    factions:["凌霄殿","太虚门"],
    resources:{ancient_jade:0.30,spirit_stone:0.30},
  },
};

// ══════════════════════════════════════
// Region hierarchy: Major Realm → Regions (areas)
// ══════════════════════════════════════
export const REGION_HIERARCHY = {
  eastern_domain: ["area_bamboo_grove","area_misty_peak"],
  southern_wild: ["area_thunder_valley"],
  central_continent: ["area_dragon_vein"],
};

// Travel costs between regions (in ticks)
export const TRAVEL_COSTS = {
  area_bamboo_grove: { area_misty_peak:3, area_thunder_valley:15, area_dragon_vein:25 },
  area_misty_peak: { area_bamboo_grove:3, area_thunder_valley:12, area_dragon_vein:20 },
  area_thunder_valley: { area_misty_peak:12, area_bamboo_grove:15, area_dragon_vein:10 },
  area_dragon_vein: { area_misty_peak:20, area_thunder_valley:10, area_bamboo_grove:25 },
};

// ══════════════════════════════════════
// Qi Environment Modifiers
// ══════════════════════════════════════
export const QI_ENVIRONMENTS = {
  spirit:   { name:"灵气",     speedMod:1.0,  desc:"纯净的天地灵气" },
  chaotic:  { name:"混沌灵气", speedMod:1.2,  desc:"狂暴而难以吸收" },
  fire:     { name:"火灵气",   speedMod:0.9,  desc:"炽热，火灵根加成" },
  ice:      { name:"冰灵气",   speedMod:0.9,  desc:"寒冷，冰灵根加成" },
  death:    { name:"死气",     speedMod:0.7,  desc:"侵蚀生机" },
  immortal: { name:"仙气",     speedMod:2.0,  desc:"仙人呼吸间即是修炼" },
};

// ══════════════════════════════════════
// Get region info for display
// ══════════════════════════════════════
export function getRegionInfo(regionId) {
  if (MAJOR_REALMS[regionId]) return MAJOR_REALMS[regionId];

  // Look up via hierarchy
  for (const [realmId, areas] of Object.entries(REGION_HIERARCHY)) {
    if (areas.includes(regionId)) return MAJOR_REALMS[realmId];
  }
  return null;
}

// Get realm for an area
export function getRealmForArea(areaId) {
  for (const [realmId, areas] of Object.entries(REGION_HIERARCHY)) {
    if (areas.includes(areaId)) return realmId;
  }
  return null;
}

// Get travel cost between two areas
export function getTravelCost(fromArea, toArea) {
  if (fromArea === toArea) return 0;
  return TRAVEL_COSTS[fromArea]?.[toArea] || 10;
}

// Qi modifier for a region
export function getRegionQiModifier(realmId) {
  const realm = MAJOR_REALMS[realmId];
  if (!realm) return { speedMod:1.0, type:"spirit" };
  const env = QI_ENVIRONMENTS[realm.qiType] || QI_ENVIRONMENTS.spirit;
  return { speedMod:env.speedMod, type:realm.qiType, name:env.name };
}
