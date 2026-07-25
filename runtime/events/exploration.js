// runtime/events/exploration.js → World Event Engine v0.4.1
// Unified event framework for Player, NPC, World, Region, and Chain events.
// All events originate from Runtime simulation. No hardcoded scripts.

import { WorldRandom } from "../random/index.js";

// ─── Event Categories ───
export const EVENT_CATEGORIES = {
  exploration: "探索",
  cultivation:  "修炼",
  breakthrough: "突破",
  battle:       "战斗",
  treasure:     "宝藏",
  merchant:     "商人",
  ruins:        "遗迹",
  cave:         "洞穴",
  spirit_beast: "灵兽",
  weather:      "天象",
  disaster:     "灾祸",
  festival:     "节庆",
  sect:         "宗门",
  resource:     "资源",
  mystery:      "秘境",
  legendary:    "传说",
};

// World Event meta-model
// {
//   category, type, title, description, region,
//   triggerChance, choices, worldImpact, chainEvents
// }

// ─── All Event Types ───
export const ALL_EVENT_TYPES = {

  // Exploration
  treasure: {
    category: "treasure", title: "宝箱现世",
    desc: "前方发现一个古老的宝箱，散发着微弱的灵光。",
    choices: [
      { id: "open",   label: "开启宝箱",   success:0.7, reward:{spirit_stone:50,random_item:true}, risk:"机关陷阱", failPenalty:{hp:-20} },
      { id: "observe",label: "小心观察",   success:0.9, reward:{spirit_stone:20} },
      { id: "leave",  label: "转身离开",   success:1.0, reward:{} },
    ],
  },

  monster: {
    category: "battle", title: "妖兽拦路",
    desc: "一只妖兽挡住了去路，眼中闪烁着凶光。",
    choices: [
      { id: "fight",  label:"正面战斗",     success:0.5, reward:{spirit_stone:100,random_item:true}, risk:"受伤", failPenalty:{hp:-30} },
      { id: "evade",  label:"绕道而行",     success:0.8, reward:{spirit_stone:10} },
      { id: "retreat",label:"迅速撤退",     success:1.0, reward:{} },
    ],
  },

  ruins: {
    category: "ruins", title: "远古遗迹",
    desc: "前方是一座被藤蔓覆盖的远古遗迹，似乎在召唤探索者。",
    choices: [
      { id: "enter",  label:"深入探索",     success:0.4, reward:{ancient_jade:1,spirit_stone:200}, risk:"强敌守卫", failPenalty:{hp:-40}, chain:"ancient_manual" },
      { id: "search", label:"外围搜寻",     success:0.7, reward:{dragon_scale:1,spirit_stone:50} },
      { id: "leave",  label:"标记后离开",   success:1.0, reward:{spirit_stone:10} },
    ],
  },

  merchant: {
    category: "merchant", title: "游方商人",
    desc: "一位游方商人向你招手，他似乎有不少好货。",
    choices: [
      { id: "trade",  label:"交易物品",     success:1.0, reward:{spirit_stone:30,trade:true} },
      { id: "ignore", label:"径直走过",     success:1.0, reward:{} },
    ],
  },

  cave: {
    category: "cave", title: "隐秘洞穴",
    desc: "山壁间露出一个隐秘的洞穴入口，里面似乎有微光。",
    choices: [
      { id: "enter",  label:"进入洞穴",     success:0.6, reward:{random_item:true,spirit_herb:3}, risk:"洞内危险", failPenalty:{hp:-15}, chain:"cave_treasure" },
      { id: "observe",label:"观察洞口",     success:0.9, reward:{spirit_herb:1} },
      { id: "leave",  label:"记录后离开",   success:1.0, reward:{} },
    ],
  },

  traveler: {
    category: "exploration", title: "迷途修士",
    desc: "一位受伤的修士靠在树下，显然需要帮助。",
    choices: [
      { id: "help",   label:"出手相助",     success:0.8, reward:{jade_shard:2}, risk:"可能是陷阱", failPenalty:{hp:-10} },
      { id: "ignore", label:"冷眼旁观",     success:1.0, reward:{} },
    ],
  },

  spirit_beast: {
    category: "spirit_beast", title: "灵兽现身",
    desc: "一只浑身发光的灵兽从林中走出，好奇地打量着你。",
    choices: [
      { id: "tame",   label:"尝试驯服",     success:0.3, reward:{random_item:true,reputation:50}, risk:"灵兽攻击", failPenalty:{hp:-25}, worldImpact:{spirit_beast_tamed:1} },
      { id: "observe",label:"安静观察",     success:0.8, reward:{spirit_stone:30} },
      { id: "leave",  label:"悄悄离开",     success:1.0, reward:{} },
    ],
  },

  resource: {
    category: "resource", title: "天材地宝",
    desc: "前方灵气浓郁，似乎有珍贵资源生长。",
    choices: [
      { id: "collect",label:"全力采集",     success:0.6, reward:{random_item:true,spirit_herb:5}, risk:"惊动守护兽", failPenalty:{hp:-15} },
      { id: "partial",label:"适量采集",     success:0.9, reward:{spirit_herb:2} },
      { id: "leave",  label:"不取不义",     success:1.0, reward:{} },
    ],
  },

  phenomenon: {
    category: "mystery", title: "天地异象",
    desc: "天空中出现了奇异的光芒，灵气浓度瞬间暴增。",
    choices: [
      { id: "meditate",label:"原地感悟",    success:0.5, reward:{cultivation_bonus:0.15}, risk:"灵气反噬", failPenalty:{hp:-20,cultivation_bonus:-0.05} },
      { id: "observe", label:"小心观察",    success:0.8, reward:{cultivation_bonus:0.05} },
      { id: "leave",   label:"远离异象",    success:1.0, reward:{} },
    ],
  },

  // ─── New Events ───
  sect_recruitment: {
    category: "sect", title: "宗门招新",
    desc: "青云宗的弟子正在招募新成员，似乎是个加入宗门的好机会。",
    choices: [
      { id: "join",   label:"加入宗门",     success:0.7, reward:{reputation:20}, risk:"考核失败", failPenalty:{hp:-10} },
      { id: "decline",label:"婉言谢绝",     success:1.0, reward:{} },
    ],
  },

  spirit_storm: {
    category: "disaster", title: "灵潮风暴",
    desc: "天空骤然变色，灵气暴走形成风暴，危险异常！",
    choices: [
      { id: "shelter",label:"寻找庇护",     success:0.8, reward:{spirit_stone:10} },
      { id: "absorb", label:"强行吸收灵气", success:0.3, reward:{cultivation_bonus:0.20}, risk:"经脉断裂", failPenalty:{hp:-50} },
      { id: "flee",   label:"飞速逃离",     success:0.6, reward:{}, risk:"被风暴追赶" },
    ],
  },

  ancient_manual: {
    category: "legendary", title: "上古功法",
    desc: "遗迹深处发现了一部古老的修炼功法，记载着失传的修炼法门！",
    choices: [
      { id: "study",  label:"研习功法",     success:0.4, reward:{cultivation_bonus:0.30,ancient_jade:1}, risk:"走火入魔", failPenalty:{hp:-30,cultivation_bonus:-0.10} },
      { id: "copy",   label:"抄录副本",     success:0.7, reward:{cultivation_bonus:0.10} },
      { id: "leave",  label:"封印遗址",     success:1.0, reward:{reputation:10} },
    ],
  },

  cave_treasure: {
    category: "treasure", title: "洞中宝藏",
    desc: "洞穴深处竟然藏着一处古老的宝藏！",
    choices: [
      { id: "open",   label:"开启宝藏",     success:0.6, reward:{spirit_stone:200,ancient_jade:1,random_item:true}, risk:"守护者苏醒", failPenalty:{hp:-30} },
      { id: "leave",  label:"谨慎退出",     success:1.0, reward:{spirit_stone:20} },
    ],
  },
};

// Region-specific event probability tables
const REGION_EVENT_TABLES = {
  area_bamboo_grove: {
    treasure:0.15, resource:0.15, traveler:0.10, merchant:0.10, sect_recruitment:0.08,
  },
  area_misty_peak: {
    treasure:0.10, monster:0.10, cave:0.15, resource:0.10, spirit_beast:0.05, traveler:0.08, sect_recruitment:0.05,
  },
  area_thunder_valley: {
    monster:0.15, ruins:0.10, phenomenon:0.15, resource:0.10, spirit_beast:0.08, spirit_storm:0.10, treasure:0.05,
  },
  area_dragon_vein: {
    ruins:0.20, spirit_beast:0.15, phenomenon:0.15, treasure:0.10, monster:0.10, resource:0.05, ancient_manual:0.05, spirit_storm:0.05, cave_treasure:0.05,
  },
};

const RANDOM_ITEMS = ["spirit_herb","jade_shard","thunder_ore","dragon_scale","ancient_jade","spirit_stone"];

// ══════════════════════════════════════
// World Event Engine
// ══════════════════════════════════════
export class WorldEventEngine {
  constructor(seed) {
    this.random = new WorldRandom(seed);
    this.activeEvents = new Map();     // eventId → event data
    this.eventHistory = [];            // all resolved events
    this.worldImpacts = new Map();     // accumulated world consequences
    this.pendingChains = [];           // chain events waiting to fire
  }

  // Generate event based on region probabilities
  generateEvent(regionId) {
    const probs = REGION_EVENT_TABLES[regionId] || REGION_EVENT_TABLES.area_bamboo_grove;
    const roll = this.random.nextFloat(0, 1);
    let cumulative = 0;
    for (const [type, prob] of Object.entries(probs)) {
      cumulative += prob;
      if (roll < cumulative) {
        const template = ALL_EVENT_TYPES[type];
        if (!template) continue;
        return {
          eventId: `evt_${Date.now()}_${Math.floor(Math.random()*10000)}`,
          type,
          category: template.category,
          title: template.title,
          description: template.desc,
          region: regionId,
          choices: template.choices.map(c => ({ ...c, reward: c.reward ? { ...c.reward } : {} })),
          timestamp: Date.now(),
          resolved: false,
        };
      }
    }
    return null;
  }

  // Resolve a choice and apply outcomes
  resolveChoice(event, choiceId, kernel) {
    const choice = event.choices.find(c => c.id === choiceId);
    if (!choice) return { success: false, message: "无效选择" };

    const roll = Math.random();
    const success = roll < choice.success;
    const outcome = {
      success,
      eventId: event.eventId,
      eventType: event.type,
      category: event.category,
      choice: choiceId,
      reward: { ...(choice.reward || {}) },
      risk: choice.risk,
      failPenalty: !success ? (choice.failPenalty || {}) : null,
      chainEvent: choice.chain || null,
      worldImpact: choice.worldImpact || null,
      message: success
        ? `${event.title} — 成功！${choice.reward ? '获得奖励。' : ''}`
        : `${event.title} — 失败！${choice.risk || '遭遇意外。'}`,
    };

    // Resolve random item
    if (outcome.reward.random_item) {
      outcome.reward.random_item_resolved = RANDOM_ITEMS[Math.floor(Math.random() * RANDOM_ITEMS.length)];
    }

    // Record history
    this.eventHistory.push({
      eventId: event.eventId,
      type: event.type,
      category: event.category,
      region: event.region,
      choice: choiceId,
      success,
      timestamp: Date.now(),
    });

    // Queue chain event
    if (choice.chain && success) {
      const chainTemplate = ALL_EVENT_TYPES[choice.chain];
      if (chainTemplate) {
        this.pendingChains.push({
          type: choice.chain,
          region: event.region,
          triggeredBy: event.eventId,
        });
      }
    }

    // Accumulate world impacts
    if (choice.worldImpact && success) {
      for (const [key, value] of Object.entries(choice.worldImpact)) {
        const current = this.worldImpacts.get(key) || 0;
        this.worldImpacts.set(key, current + value);
      }
    }

    // Clean up
    this.activeEvents.delete(event.eventId);
    event.resolved = true;

    return outcome;
  }

  // NPC auto-decision based on NPC state
  npcDecide(event, npcState) {
    const realm = npcState.realm_id || 1;
    const isStrong = realm >= 5;
    const isWeak = realm <= 2;
    const riskyChoices = event.choices.filter(c => c.success < 0.5);
    const safeChoices = event.choices.filter(c => c.success >= 0.8);

    if (isStrong && riskyChoices.length > 0) return riskyChoices[0].id;
    if (isWeak && safeChoices.length > 0) return safeChoices[safeChoices.length - 1].id;
    return event.choices[Math.floor(Math.random() * event.choices.length)]?.id || "leave";
  }

  // Get pending chain events
  popChainEvents() {
    return this.pendingChains.splice(0, this.pendingChains.length);
  }

  // Summary for World Intelligence
  getSummary() {
    return {
      totalEvents: this.eventHistory.length,
      activeEvents: this.activeEvents.size,
      worldImpacts: Object.fromEntries(this.worldImpacts),
      recentEvents: this.eventHistory.slice(-10).reverse(),
    };
  }
}

// Backward-compatible alias
export { WorldEventEngine as ExplorationEventSystem };
