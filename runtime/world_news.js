// runtime/world_news.js
// World News Generator — translates simulation state into readable events.
// Runs each tick, emits narrative text from the 30 simulation systems.
// Pure data → text. No game logic.

import { WorldRandom } from "./random/index.js";

const NEWS_TEMPLATES = {
  weather: {
    rain: ["细雨蒙蒙，山林间雾气弥漫，灵气似乎更加浓郁了几分。", "雨丝飘落，草木摇曳，修行者们纷纷寻地避雨。"],
    storm: ["狂风骤起，电闪雷鸣！渡劫期的修士们面色凝重——天威难测。", "雷暴席卷大地，元婴以下的修士纷纷收敛气息。"],
    snow: ["雪花纷飞，天地银装素裹。寒冰灵根者倍感亲切。", "初雪降临，老修士们说这是灵脉活跃的征兆。"],
    fog: ["大雾锁山，五步之外不见人影。灵兽活动频繁。", "雾气中隐约有阵法波动——哪位高人在此布阵？"],
    clear: ["万里无云，仙鹤掠过天际。正是修炼的好时节。", "晴空朗朗，灵气如潮水般涌动。"],
    cloudy: ["阴云密布，气压低沉。妖兽们躁动不安。"],
  },
  qi_tide: {
    low: ["灵气潮退去，修炼效率大减。老修士们说这是每二十年的小劫。"],
    normal: ["灵气平稳，天地间的道韵流转如常。"],
    high: ["灵气潮涌！方圆百里的修士都感受到了这股波动。", "灵脉喷发，修炼事半功倍！散修们纷纷出关。"],
    spirit: ["灵潮爆发！！！天空中出现异像，七彩光芒照耀大地。各大宗门紧急召集弟子。"],
    chaos: ["混沌潮来袭...灵气狂暴紊乱，修炼极其危险。长老们下令封山。"],
  },
  monster: {
    spawn: ["翠竹林中传出低沉的咆哮——有妖兽出没！", "附近的猎户报告说看到了灵狼的踪迹。", "妖兽族群似乎在向这片区域迁移..."],
    boss: ["一声震天龙吟！古老的存在苏醒了。各大宗门发布了紧急任务。"],
    migration: ["妖兽群正在向北迁徙。散修们议论纷纷——北方有什么？"],
  },
  npc: {
    breakthrough: ["镇上传来消息：${name}道友成功突破！摆下宴席三日。"],
    death: ["噩耗：${name}前辈渡劫失败，陨落于雷劫之下。万古同悲。"],
    marriage: ["喜讯：${name}与道侣缔结连理，广邀四方修士见证。"],
    adventure: ["${name}在${area}遭遇妖兽，苦战后收获${loot}。"],
  },
  sect: {
    recruit: ["${sect}宗门大开山门，招收新弟子。测试灵根者排起长队。"],
    tournament: ["${sect}举办五年一度的宗门大比，胜者可获筑基丹！"],
    war: ["${sect1}与${sect2}的边界摩擦升级，气氛紧张。"],
  },
  economy: {
    boom: ["灵石暴涨！炼丹材料价格飞升，散修们疯狂收购。"],
    crash: ["灵气矿石价格暴跌，矿脉产出过剩。"],
    rumor: ["传言有古修士洞府即将出世，各方势力蠢蠢欲动。"],
  },
  discovery: {
    herb: ["在山崖裂缝中发现了一株${herb}，年份至少在五百年以上。"],
    ruin: ["雷音谷深处发现了一座远古遗迹，阵法仍在运转。"],
    vein: ["地脉震动，一条新的灵脉裸露出来！散修们蜂拥而至。"],
  },
};

export function generateWorldNews(kernel, sim, random) {
  const news = [];
  const tick = kernel.world.tickCount;
  const w = kernel.world;

  if (tick % 3 !== 0) return news; // every 3rd tick = ~6s

  const npcs = kernel.queryEntities("npc", {}, 3, 0);
  const monsters = kernel.queryEntities("monster", {}, 10, 0);

  // 1. Weather
  const weather = w.globalState.weather.get("world");
  if (weather && NEWS_TEMPLATES.weather[weather]) {
    const msgs = NEWS_TEMPLATES.weather[weather];
    if (random.nextFloat(0, 1) < 0.4) {
      news.push({ type: "weather", text: msgs[random.nextInt(0, msgs.length - 1)], tick });
    }
  }

  // 2. Monster activity
  const activeMonsters = monsters.filter(m => m.state === "active");
  if (activeMonsters.length > 5 && random.nextFloat(0, 1) < 0.5) {
    news.push({ type: "monster", text: NEWS_TEMPLATES.monster.spawn[random.nextInt(0, 2)], tick });
  }
  const bosses = activeMonsters.filter(m => m.type?.includes("boss"));
  if (bosses.length > 0 && random.nextFloat(0, 1) < 0.8) {
    news.push({ type: "monster", text: NEWS_TEMPLATES.monster.boss[0], tick, danger: "high" });
  }

  // 3. NPC activity
  for (const npc of npcs.slice(0, 2)) {
    const identity = npc.getComponent("Identity") || {};
    const name = identity.name || "无名修士";
    if (random.nextFloat(0, 1) < 0.25) {
      const templates = NEWS_TEMPLATES.npc;
      const events = [];
      const realm = npc.getComponent("Realm") || {};
      if (realm.breakthrough_ready && random.nextFloat(0, 1) < 0.5) {
        events.push(...templates.breakthrough.map(t => t.replace("${name}", name)));
      }
      const area = (npc.getComponent("Location") || {}).area || "未知之地";
      events.push(templates.adventure.map(t => t.replace("${name}", name).replace("${area}", area).replace("${loot}", "灵石"))[0]);
      if (events.length) {
        news.push({ type: "npc", text: events[random.nextInt(0, events.length - 1)], tick });
      }
    }
  }

  // 4. Economy / discovery
  if (tick % 10 === 0) {
    const ecoRoll = random.nextFloat(0, 1);
    if (ecoRoll < 0.3) {
      news.push({ type: "economy", text: NEWS_TEMPLATES.economy.rumor[0], tick });
    } else if (ecoRoll < 0.6) {
      const herbs = ["千年灵芝", "朱果", "冰心草", "龙血花"];
      news.push({
        type: "discovery",
        text: NEWS_TEMPLATES.discovery.herb[0].replace("${herb}", herbs[random.nextInt(0, herbs.length - 1)]),
        tick,
      });
    }
  }

  return news;
}

// History buffer — stores recent world events
let newsHistory = [];
const MAX_HISTORY = 100;

export function addToHistory(news) {
  newsHistory.push(...news);
  if (newsHistory.length > MAX_HISTORY) {
    newsHistory = newsHistory.slice(-MAX_HISTORY);
  }
}

export function getRecentNews(count = 20) {
  return newsHistory.slice(-count).reverse();
}

export function clearNewsHistory() {
  newsHistory = [];
}
