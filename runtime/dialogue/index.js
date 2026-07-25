// runtime/dialogue/index.js
// Sprint 6 — Dynamic NPC Dialogue System
// All dialogue reflects Runtime state. No fixed trees.

// Greeting templates — vary by relationship/reputation
const GREETINGS = {
  friend: [
    "{npc}笑着迎上来：「{player}道友！好久不见，近来可好？」",
    "{npc}眼中闪过欣喜：「{player}！正好，我刚从{area}回来，有好消息！」",
  ],
  neutral: [
    "{npc}微微点头：「{player}道友，今日{weather_desc}，是个修炼的好日子。」",
    "{npc}瞥了你一眼：「嗯？有什么事吗？」",
  ],
  enemy: [
    "{npc}冷哼一声：「你来做什么？」",
    "{npc}握紧了拳头，戒备地看着你。",
  ],
  master: [
    "{npc}慈祥地望着你：「{player}徒儿，近日修炼可有精进？」",
  ],
};

// Rumor dialogue — reflects world events
const RUMORS = {
  breakthrough: [
    "听说 {npc_other} 前日突破了，已是 Lv{realm} 的修为了。",
    "{npc_other} 的突破震惊了整个 {sect}！",
  ],
  monster: [
    "最近 {area} 出现了妖兽，不少修士受伤了。",
    "小心 {area}，据说有 {monster_type} 出没。",
  ],
  resource: [
    "{area} 最近灵气充沛，资源似乎多了起来。",
    "听说有人在 {area} 发现了 {resource}！",
  ],
  sect: [
    "{sect} 最近在招新，你感兴趣吗？",
    "{sect} 和另一个宗门闹得不太愉快呢。",
  ],
  weather: [
    "这{weather_desc}的天气，还是待在洞府修炼安全。",
    "{weather_desc}，怕是有什么异宝要出世了。",
  ],
};

// Trade dialogue
const TRADE = [
  "我这有些好东西，用灵石交换如何？",
  "听说 {area} 的坊市最近进了新货。",
  "你身上有 {resource} 吗？我愿意出高价。",
];

// Quest hints
const QUEST_HINTS = [
  "如果你能帮我收集一些 {resource}，必有重谢。",
  "{area} 有座古遗迹，一直没人敢深入...",
  "你看起来不错，要不要考虑加入 {sect}？",
];

// Goodbye
const GOODBYES = {
  friend: [
    "{npc}拱手道：「后会有期，{player}道友！」",
    "{npc}目送你远去：「保重！」",
  ],
  neutral: [
    "{npc}微微颔首：「告辞。」",
  ],
  enemy: [
    "{npc}转身离去，不再看你。",
  ],
};

// Weather descriptions
const WEATHER_DESC = {
  clear: "晴空万里", cloudy: "乌云密布", rain: "细雨绵绵",
  storm: "狂风暴雨", snow: "白雪纷飞", fog: "大雾弥漫",
};

// Area descriptions
const AREA_NAMES = {
  area_bamboo_grove: "翠竹林", area_misty_peak: "云雾峰",
  area_thunder_valley: "雷音谷", area_dragon_vein: "龙脉秘境",
};

const RESOURCE_NAMES = {
  spirit_herb: "灵草", jade_shard: "灵石碎片", thunder_ore: "雷晶石",
  dragon_scale: "龙鳞", ancient_jade: "古玉", spirit_stone: "灵石",
};

// Determine relationship type from entity data
function getRelationshipType(npc, player) {
  const npcRel = npc.getComponent("Relationships") || {};
  const playerId = player.id;
  if (npcRel.friends?.includes(playerId)) return "friend";
  if (npcRel.enemies?.includes(playerId)) return "enemy";
  if (npcRel.master === playerId) return "master";
  return "neutral";
}

// Fill template with dynamic data
function fill(template, data) {
  return template.replace(/\{(\w+)\}/g, (_, key) => data[key] ?? `[${key}]`);
}

// Pick random template
function pick(arr, random) {
  return arr[random ? (Math.floor(Math.random() * arr.length)) : 0];
}

// ══════════════════════════════════════
// Generate dialogue based on NPC + world state
// ══════════════════════════════════════
export function generateGreeting(npc, player, kernel) {
  const rel = getRelationshipType(npc, player);
  const weather = kernel.world.globalState.weather?.get("world") || "clear";
  const area = npc.getComponent("Location")?.area || "area_bamboo_grove";
  const data = {
    npc: (npc.getComponent("Identity")||{}).name || "修士",
    player: (player.getComponent("Identity")||{}).name || "道友",
    area: AREA_NAMES[area] || area,
    weather_desc: WEATHER_DESC[weather] || weather,
  };
  return fill(pick(GREETINGS[rel] || GREETINGS.neutral), data);
}

export function generateRumor(npc, kernel) {
  const type = pick(Object.keys(RUMORS));
  const npcs = kernel.queryEntities("npc", {}, 10, 0);
  const other = npcs.find(n => n.id !== npc.id);
  const area = npc.getComponent("Location")?.area || "area_bamboo_grove";
  const data = {
    npc_other: other ? (other.getComponent("Identity")||{}).name : "一位修士",
    realm: other ? other.getComponent("Realm")?.realm_id : 3,
    sect: "青云宗",
    area: AREA_NAMES[area] || area,
    resource: Object.values(RESOURCE_NAMES)[Math.floor(Math.random() * 5)],
    monster_type: "妖兽",
    weather_desc: WEATHER_DESC[kernel.world.globalState.weather?.get("world") || "clear"],
  };
  return fill(pick(RUMORS[type] || RUMORS.breakthrough), data);
}

export function generateTrade(npc, kernel) {
  const area = npc.getComponent("Location")?.area || "area_misty_peak";
  return fill(pick(TRADE), {
    area: AREA_NAMES[area] || area,
    resource: pick(Object.values(RESOURCE_NAMES)),
  });
}

export function generateQuestHint(npc, kernel) {
  const area = npc.getComponent("Location")?.area || "area_thunder_valley";
  return fill(pick(QUEST_HINTS), {
    area: AREA_NAMES[area] || area,
    resource: pick(Object.values(RESOURCE_NAMES)),
    sect: "青云宗",
  });
}

export function generateGoodbye(npc, player) {
  const rel = getRelationshipType(npc, player);
  const data = {
    npc: (npc.getComponent("Identity")||{}).name || "修士",
    player: (player.getComponent("Identity")||{}).name || "道友",
  };
  return fill(pick(GOODBYES[rel] || GOODBYES.neutral), data);
}

// Full conversation turn
export function generateConversation(npc, player, topic, kernel) {
  switch (topic) {
    case "greeting": return generateGreeting(npc, player, kernel);
    case "rumor":    return generateRumor(npc, kernel);
    case "trade":    return generateTrade(npc, kernel);
    case "quest":    return generateQuestHint(npc, kernel);
    case "goodbye":  return generateGoodbye(npc, player);
    default:         return generateGreeting(npc, player, kernel);
  }
}
