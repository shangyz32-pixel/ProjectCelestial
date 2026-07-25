// runtime/quest/index.js
// v2.1 Sprint 8 — Dynamic Quest Framework
// Quests emerge from world events. No scripted content.
// Deterministic, Replay-compatible, ECS-integrated.

import { WorldRandom } from "../random/index.js";

// ══════════════════════════════════════
// Quest Detectors — match world state → quest
// ══════════════════════════════════════
const QUEST_DETECTORS = [
  {
    id:"monster_threat",
    check:(kernel, time) => {
      const monsters = kernel.queryEntities("monster", {}, 100, 0);
      const highRealm = monsters.filter(m => (m.getComponent("Realm")?.realm_id||1) >= 5);
      if (highRealm.length > 0) {
        const m = highRealm[0];
        return {
          type:"combat", title:"讨伐"+(m.getComponent("Identity")?.name||"妖兽"),
          desc:`一只强大的${m.getComponent("Identity")?.name||"妖兽"}在附近出没，威胁安全。`,
          difficulty:(m.getComponent("Realm")?.realm_id||1), area:(m.getComponent("Location")?.area||"area_bamboo_grove"),
          objective:{ type:"defeat_entity", target:m.id }, rewardType:"monster_loot",
          source:"world", expiresIn:100,
        };
      }
      return null;
    },
  },
  {
    id:"npc_request",
    check:(kernel, time) => {
      const npcs = kernel.queryEntities("npc", {}, 20, 0).filter(n => n.state === "active");
      for (const npc of npcs) {
        const hp = npc.getComponent("HP") || { current:100, max:100 };
        if (hp.current < hp.max * 0.5) {
          return {
            type:"rescue", title:"救助"+(npc.getComponent("Identity")?.name||"修士"),
            desc:`${npc.getComponent("Identity")?.name||"一位修士"}身受重伤，需要疗伤丹药。`,
            difficulty:2, area:(npc.getComponent("Location")?.area||"area_bamboo_grove"),
            objective:{ type:"deliver_item", item:"pill_healing_pill", count:1 },
            rewardType:"npc_reward", rewardGiver:npc.id, expiresIn:80,
            source:"npc",
          };
        }
      }
      return null;
    },
  },
  {
    id:"resource_shortage",
    check:(kernel, time) => {
      const settlements = kernel.queryEntities("settlement", {}, 10, 0);
      for (const s of settlements) {
        const treasury = s.getComponent("Economy")?.treasury || {};
        if ((treasury.spirit_stone||0) < 50) {
          return {
            type:"gathering", title:"补给"+(s.getComponent("Identity")?.name||"聚落"),
            desc:`${s.getComponent("Identity")?.name||"聚落"}灵石短缺，需要收集灵石。`,
            difficulty:1, area:(s.getComponent("Location")?.area||"area_bamboo_grove"),
            objective:{ type:"gather_items", item:"spirit_stone", count:30 },
            rewardType:"settlement", rewardGiver:s.id, expiresIn:120,
            source:"settlement",
          };
        }
      }
      return null;
    },
  },
  {
    id:"sect_mission",
    check:(kernel, time) => {
      const sects = kernel.queryEntities("sect", {}, 10, 0);
      for (const sect of sects) {
        const power = sect.getComponent("Power") || { strength:50 };
        if (power.strength < 30) {
          return {
            type:"sect", title:"振兴"+(sect.getComponent("Identity")?.name||"宗门"),
            desc:`${sect.getComponent("Identity")?.name||"宗门"}实力衰弱，需要弟子出力。`,
            difficulty:3, area:"area_misty_peak",
            objective:{ type:"sect_mission", missionType:"patrol", count:3 },
            rewardType:"sect_contribution", rewardGiver:sect.id, expiresIn:150,
            source:"sect",
          };
        }
      }
      return null;
    },
  },
  {
    id:"celestial_opportunity",
    check:(kernel, time) => {
      const celestial = kernel.world.globalState.celestialEvent;
      if (celestial) {
        return {
          type:"exploration", title:"天象探索——"+celestial,
          desc:`天空出现${celestial}异象，可能有稀有机遇。`,
          difficulty:5, area:"area_dragon_vein",
          objective:{ type:"explore_area", area:"area_dragon_vein" },
          rewardType:"rare_loot", expiresIn:50,
          source:"celestial",
        };
      }
      return null;
    },
  },
  {
    id:"trade_caravan",
    check:(kernel) => {
      const settlements = kernel.queryEntities("settlement", {}, 10, 0);
      if (settlements.length >= 1) {
        return {
          type:"escort", title:"护送商队",
          desc:`${(settlements[0].getComponent("Identity")?.name||"聚落")}需要护送商队。`,
          difficulty:3, area:"area_bamboo_grove",
          objective:{ type:"escort" }, rewardType:"settlement", expiresIn:120,
          source:"settlement",
        };
      }
      return null;
    },
  },
  {
    id:"investigation",
    check:(kernel) => {
      const npcs = kernel.queryEntities("npc", {}, 20, 0);
      if (npcs.length > 2) {
        return {
          type:"investigation", title:"遗迹调查",
          desc:"有人在附近发现了古老的符文遗迹，需要调查。",
          difficulty:2, area:"area_misty_peak",
          objective:{ type:"investigate" }, rewardType:"rare_loot", expiresIn:150,
          source:"exploration",
        };
      }
      return null;
    },
  },
];

// ══════════════════════════════════════
// Quest States
// ══════════════════════════════════════
export const QUEST_STATES = ["available","accepted","progressing","completed","failed","expired"];

// ══════════════════════════════════════
// Quest System Tick — detect + generate
// ══════════════════════════════════════
export const QuestSystem = {
  tick(kernel, time, random) {
    kernel.world.globalState.quests = kernel.world.globalState.quests || [];
    const quests = kernel.world.globalState.quests;

    // Clean expired quests
    kernel.world.globalState.quests = quests.filter(q => {
      if (q.status === "available" && q.expiresAt && kernel.world.tickCount >= q.expiresAt) {
        q.status = "expired";
      }
      return q.status !== "expired" || kernel.world.tickCount - (q.expiresAt||0) < 200;
    });

    // Generate new quests (max 10 active)
    const activeCount = quests.filter(q => q.status === "available" || q.status === "accepted").length;
    if (activeCount >= 10) return;

    for (const detector of QUEST_DETECTORS) {
      if (random.chance(0.15)) {
        const questData = detector.check(kernel, time);
        if (questData) {
          const quest = {
            id: `quest_${kernel.world.tickCount}_${Date.now()}`,
            ...questData,
            status:"available",
            createdAt: kernel.world.tickCount,
            expiresAt: kernel.world.tickCount + questData.expiresIn,
            acceptedBy: null,
            progress:{},
          };
          quests.push(quest);
        }
      }
    }

    // NPC auto-resolve (NPCs can complete quests too)
    const npcs = kernel.queryEntities("npc", {}, 20, 0).filter(n => n.state === "active");
    for (const quest of quests.filter(q => q.status === "available")) {
      if (npcs.length > 0 && random.chance(0.05)) {
        const npc = npcs[random.nextInt(0, npcs.length - 1)];
        quest.acceptedBy = npc.id;
        quest.status = "accepted";
        // NPC resolves in 20-60 ticks
        setTimeout(() => {
          if (quest.status === "accepted") {
            quest.status = "completed";
            quest.completedAt = kernel.world.tickCount;
          }
        }, random.nextInt(20000, 60000));
      }
    }
  },
};

// ══════════════════════════════════════
// Accept quest
// ══════════════════════════════════════
export function acceptQuest(player, questId, kernel) {
  const quests = kernel.world.globalState.quests || [];
  const quest = quests.find(q => q.id === questId);
  if (!quest) return { error:"任务不存在" };
  if (quest.status !== "available") return { error:"任务不可接受" };
  quest.status = "accepted";
  quest.acceptedBy = player.id;
  quest.acceptedAt = kernel.world.tickCount;
  return { ok:true, quest };
}

// ══════════════════════════════════════
// Complete quest
// ══════════════════════════════════════
export function completeQuest(player, questId, kernel, random) {
  const quests = kernel.world.globalState.quests || [];
  const quest = quests.find(q => q.id === questId);
  if (!quest) return { error:"任务不存在" };
  if (quest.status !== "accepted" && quest.status !== "progressing") return { error:"任务未接受" };

  quest.status = "completed";
  quest.completedAt = kernel.world.tickCount;

  // Generate reward
  const reward = generateReward(quest, player, kernel, random);

  return { ok:true, quest, reward };
}

// ══════════════════════════════════════
// Generate reward from world resources
// ══════════════════════════════════════
function generateReward(quest, player, kernel, random) {
  const difficulty = quest.difficulty || 1;
  const rewards = [];

  // Spirit stones (base)
  const stones = difficulty * random.nextInt(10, 50);
  const inv = player.getComponent("Inventory") || { items:{} };
  kernel.updateComponent(player.id, "Inventory", { items:{ ...inv.items, spirit_stone:(inv.items.spirit_stone||0)+stones } }, player.version);
  rewards.push({ type:"spirit_stone", amount:stones });

  // Cultivation progress
  const realm = player.getComponent("Realm") || {};
  kernel.updateComponent(player.id, "Realm", { ...realm, cultivation_value:Math.min(1.0, (realm.cultivation_value||0)+difficulty*0.02) }, player.version);
  rewards.push({ type:"cultivation", amount:difficulty*2 });

  // Equipment chance
  if (random.chance(0.2 * difficulty)) {
    rewards.push({ type:"equipment", msg:"获得随机装备" });
  }

  // Herb chance
  if (random.chance(0.3)) {
    const herbItems = { ...inv.items, spirit_grass:(inv.items.spirit_grass||0)+difficulty };
    kernel.updateComponent(player.id, "Inventory", { items:herbItems }, player.version + 1);
    rewards.push({ type:"herb", herb:"spirit_grass", amount:difficulty });
  }

  // Reputation
  const rep = player.getComponent("Reputation") || { score:0, title:"无名修士" };
  kernel.updateComponent(player.id, "Reputation", { ...rep, score:rep.score+difficulty*5 }, player.version + 2);

  return { items:rewards, total_stones:stones, rep_gain:difficulty*5 };
}

// ══════════════════════════════════════
// Get available quests for display
// ══════════════════════════════════════
export function getAvailableQuests(kernel) {
  const quests = kernel.world.globalState.quests || [];
  return quests.filter(q => q.status === "available" || q.status === "accepted")
    .map(q => ({
      id:q.id, type:q.type, title:q.title, desc:q.desc,
      difficulty:q.difficulty, area:q.area, source:q.source,
      status:q.status, expiresIn:q.expiresAt ? q.expiresAt - kernel.world.tickCount : "?",
    }));
}
