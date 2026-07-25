// runtime/events/exploration.js
// Exploration Event System — dynamic events for players and NPCs.
// All events originate from Runtime simulation. No hardcoded scripts.

import { WorldRandom } from "../random/index.js";

// Event type definitions with choices and outcomes
export const EVENT_TYPES = {
  treasure: {
    title: "宝箱现世", desc: "前方发现一个古老的宝箱，散发着微弱的灵光。",
    choices: [
      { id: "open",    label: "开启宝箱",   success: 0.7, reward: { spirit_stone: 50, random_item: true }, risk: "宝箱可能有机关..." },
      { id: "observe", label: "小心观察",   success: 0.9, reward: { spirit_stone: 20 }, risk: "无" },
      { id: "leave",   label: "转身离开",   success: 1.0, reward: {}, risk: "无" },
    ],
  },
  monster: {
    title: "妖兽拦路", desc: "一只妖兽挡住了去路，眼中闪烁着凶光。",
    choices: [
      { id: "fight",   label: "正面战斗",   success: 0.5, reward: { spirit_stone: 100, random_item: true }, risk: "受伤（HP-30）" },
      { id: "evade",   label: "绕道而行",   success: 0.8, reward: { spirit_stone: 10 }, risk: "消耗额外时间" },
      { id: "retreat", label: "迅速撤退",   success: 1.0, reward: {}, risk: "无" },
    ],
  },
  ruins: {
    title: "远古遗迹", desc: "前方是一座被藤蔓覆盖的远古遗迹，似乎在召唤探索者。",
    choices: [
      { id: "enter",   label: "深入探索",   success: 0.4, reward: { ancient_jade: 1, spirit_stone: 200 }, risk: "可能有强敌守卫" },
      { id: "search",  label: "外围搜寻",   success: 0.7, reward: { dragon_scale: 1, spirit_stone: 50 }, risk: "轻度危险" },
      { id: "leave",   label: "标记后离开", success: 1.0, reward: { spirit_stone: 10 }, risk: "无" },
    ],
  },
  merchant: {
    title: "游方商人", desc: "一位游方商人向你招手，他似乎有不少好货。",
    choices: [
      { id: "trade",   label: "交易物品",    success: 1.0, reward: { trade: true, spirit_stone: 30 }, risk: "无" },
      { id: "ignore",  label: "径直走过",    success: 1.0, reward: {}, risk: "无" },
    ],
  },
  cave: {
    title: "隐秘洞穴", desc: "山壁间露出一个隐秘的洞穴入口，里面似乎有微光。",
    choices: [
      { id: "enter",   label: "进入洞穴",   success: 0.6, reward: { random_item: true, spirit_herb: 3 }, risk: "洞内可能有危险" },
      { id: "observe", label: "观察洞口",   success: 0.9, reward: { spirit_herb: 1 }, risk: "无" },
      { id: "leave",   label: "记录后离开", success: 1.0, reward: {}, risk: "无" },
    ],
  },
  traveler: {
    title: "迷途修士", desc: "一位受伤的修士靠在树下，显然需要帮助。",
    choices: [
      { id: "help",    label: "出手相助",    success: 0.8, reward: { jade_shard: 2, reputation: 10 }, risk: "可能是陷阱" },
      { id: "ignore",  label: "冷眼旁观",    success: 1.0, reward: {}, risk: "无" },
    ],
  },
  spirit_beast: {
    title: "灵兽现身", desc: "一只浑身发光的灵兽从林中走出，好奇地打量着你。",
    choices: [
      { id: "tame",    label: "尝试驯服",    success: 0.3, reward: { spirit_beast: 1, reputation: 50 }, risk: "灵兽可能攻击" },
      { id: "observe", label: "安静观察",    success: 0.8, reward: { spirit_stone: 30 }, risk: "无" },
      { id: "leave",   label: "悄悄离开",    success: 1.0, reward: {}, risk: "无" },
    ],
  },
  resource: {
    title: "天材地宝", desc: "前方灵气浓郁，似乎有珍贵资源生长。",
    choices: [
      { id: "collect", label: "全力采集",    success: 0.6, reward: { random_item: true, spirit_herb: 5 }, risk: "可能惊动守护兽" },
      { id: "partial", label: "适量采集",    success: 0.9, reward: { spirit_herb: 2 }, risk: "无" },
      { id: "leave",   label: "不取不义",    success: 1.0, reward: {}, risk: "无" },
    ],
  },
  phenomenon: {
    title: "天地异象", desc: "天空中出现了奇异的光芒，灵气浓度瞬间暴增。",
    choices: [
      { id: "meditate", label: "原地感悟",   success: 0.5, reward: { cultivation_bonus: 0.15, insight: true }, risk: "未知影响" },
      { id: "observe",  label: "小心观察",   success: 0.8, reward: { cultivation_bonus: 0.05 }, risk: "无" },
      { id: "leave",    label: "远离异象",   success: 1.0, reward: {}, risk: "无" },
    ],
  },
};

// Region-specific event probabilities
const REGION_EVENTS = {
  area_bamboo_grove: { treasure: 0.15, resource: 0.15, traveler: 0.10, merchant: 0.10 },
  area_misty_peak:  { treasure: 0.10, monster: 0.10, cave: 0.15, resource: 0.10, spirit_beast: 0.05, traveler: 0.08 },
  area_thunder_valley: { monster: 0.15, ruins: 0.10, phenomenon: 0.15, resource: 0.10, spirit_beast: 0.08, treasure: 0.05 },
  area_dragon_vein: { ruins: 0.20, spirit_beast: 0.15, phenomenon: 0.15, treasure: 0.10, monster: 0.10, resource: 0.05, cave: 0.05 },
};

// Random items pool
const RANDOM_ITEMS = ["spirit_herb","jade_shard","thunder_ore","dragon_scale","ancient_jade","spirit_stone"];

export class ExplorationEventSystem {
  constructor(seed) {
    this.random = new WorldRandom(seed);
    this.activeEvents = new Map(); // entityId → current event
  }

  // Generate a random exploration event for a region
  generateEvent(regionId) {
    const probs = REGION_EVENTS[regionId] || REGION_EVENTS.area_bamboo_grove;
    const roll = this.random.nextFloat(0, 1);
    let cumulative = 0;
    for (const [type, prob] of Object.entries(probs)) {
      cumulative += prob;
      if (roll < cumulative) {
        const template = EVENT_TYPES[type];
        return {
          eventId: `evt_${Date.now()}_${Math.floor(Math.random()*10000)}`,
          type,
          title: template.title,
          description: template.desc,
          region: regionId,
          choices: template.choices.map(c => ({ ...c, reward: { ...c.reward } })),
          timestamp: Date.now(),
        };
      }
    }
    return null;
  }

  // Resolve a player's choice and compute outcome
  resolveChoice(event, choiceId) {
    const choice = event.choices.find(c => c.id === choiceId);
    if (!choice) return { success: false, message: "无效选择" };

    const roll = Math.random();
    const success = roll < choice.success;
    const reward = { ...choice.reward };

    // Random item resolution
    if (reward.random_item) {
      reward.random_item = RANDOM_ITEMS[Math.floor(Math.random() * RANDOM_ITEMS.length)];
    }

    return {
      success,
      eventType: event.type,
      choice: choiceId,
      reward,
      risk: choice.risk,
      message: success
        ? `${event.title} — 成功！获得奖励。`
        : `${event.title} — 失败！${choice.risk}`
    };
  }

  // NPC auto-decision based on simple heuristics (v0.4 compatibility)
  npcDecide(event, npcState) {
    // Simple heuristic: more aggressive NPCs fight/enter, cautious ones observe/leave
    const realm = npcState.realm_id || 1;
    const isStrong = realm >= 5;
    const isWeak = realm <= 2;

    const riskyChoices = event.choices.filter(c => c.success < 0.5);
    const safeChoices = event.choices.filter(c => c.success >= 0.8);

    if (isStrong && riskyChoices.length > 0) {
      return riskyChoices[0].id;
    }
    if (isWeak && safeChoices.length > 0) {
      return safeChoices[safeChoices.length - 1].id; // safest option
    }
    // Middle: random weighted by success rate
    const choice = event.choices[Math.floor(Math.random() * event.choices.length)];
    return choice ? choice.id : "leave";
  }
}
