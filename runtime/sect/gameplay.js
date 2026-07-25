// runtime/sect/gameplay.js
// v2.1 Sprint 7 — Sector Gameplay Framework
// Hierarchy: outer→inner→core→elder→master
// Missions, Contribution, Store, Promotion, Daily Tasks.

import { HERBS } from "../alchemy/index.js";

// ══════════════════════════════════════
// Sect Rank Hierarchy
// ══════════════════════════════════════
export const SECT_RANKS = {
  outer:    { name:"外门弟子", level:1, minContrib:0,    realmReq:1, salary:5,  privileges:["missions","gather"] },
  inner:    { name:"内门弟子", level:2, minContrib:200,  realmReq:2, salary:15, privileges:["missions","store","cultivate_room"] },
  core:     { name:"核心弟子", level:3, minContrib:800,  realmReq:4, salary:40, privileges:["missions","store","library","alchemy_hall"] },
  elder:    { name:"长老",     level:4, minContrib:3000, realmReq:6, salary:100,privileges:["missions","store","library","workshop","training"] },
  master:   { name:"宗主",     level:5, minContrib:0,    realmReq:0, salary:0,  privileges:["all"], isLeader:true },
};

// ══════════════════════════════════════
// Mission Pool
// ══════════════════════════════════════
export const SECT_MISSIONS = {
  cultivate:    { name:"修炼任务", desc:"精进修为",     contrib:25, type:"daily", req:{ cultivation:0.2 } },
  gather:       { name:"采集灵药", desc:"采集灵草x5",   contrib:20, type:"daily", req:{ resource:"spirit_grass", count:5 } },
  patrol:       { name:"巡逻领地", desc:"巡视宗门3次",   contrib:15, type:"daily", req:{ patrol:3 } },
  alchemy:      { name:"炼丹任务", desc:"炼制一颗回气丹",contrib:30, type:"daily", req:{ craft_pill:"qi_pill" } },
  explore:      { name:"探索秘境", desc:"探索新区域",    contrib:35, type:"weekly",req:{ explore:1 } },
  defeat:       { name:"讨伐妖兽", desc:"击败妖兽x3",    contrib:50, type:"weekly",req:{ monster_kills:3 } },
  recruit:      { name:"招募新人", desc:"招募一名弟子",  contrib:40, type:"weekly",req:{ recruits:1 } },
  protect:      { name:"护卫灵脉", desc:"守护灵脉x5",    contrib:30, type:"weekly",req:{ protect:5 } },
  teach:        { name:"教导后辈", desc:"指导3名弟子",   contrib:25, type:"weekly",req:{ teach:3 } },
  donate:       { name:"捐献资源", desc:"捐献灵石x100", contrib:20, type:"any",   req:{ resource:"spirit_stone", count:100 } },
};

// ══════════════════════════════════════
// Sect Store — spend contribution
// ══════════════════════════════════════
export const SECT_STORE = {
  spirit_stone_50:  { name:"灵石x50",    cost:30,  type:"resource", item:"spirit_stone", qty:50, rankReq:"inner" },
  jade_shard_5:     { name:"灵石碎片x5", cost:50,  type:"resource", item:"jade_shard", qty:5, rankReq:"inner" },
  spirit_herb_10:   { name:"灵草x10",    cost:20,  type:"resource", item:"spirit_herb", qty:10, rankReq:"outer" },
  skill_scroll:     { name:"技能卷轴",   cost:100, type:"skill",    rankReq:"core", unlocks:"random" },
  cultivation_room: { name:"修炼室(50t)",cost:60,  type:"buff",     effect:"cultivation_boost", value:0.2, duration:50, rankReq:"inner" },
  breakthrough_aid: { name:"突破辅助",   cost:200, type:"buff",     effect:"breakthrough", value:0.1, rankReq:"core" },
  foundation_pill:  { name:"筑基丹x1",   cost:80,  type:"pill",     item:"pill_foundation_pill", qty:1, rankReq:"inner" },
  promotion_token:  { name:"晋升令",     cost:500, type:"special",  effect:"promote",  rankReq:"core" },
};

const RANK_ORDER = ["outer","inner","core","elder","master"];

// ══════════════════════════════════════
// Get player sect info (enhanced)
// ══════════════════════════════════════
export function getPlayerSectInfo(player, kernel) {
  const legacy = player.getComponent("Legacy") || {};
  const membership = player.getComponent("SectMembership") || {};
  if (!legacy.founded_sect && !membership.sect_name) return null;

  const sects = kernel.queryEntities("sect", {}, 10, 0);
  const sectName = membership.sect_name || legacy.founded_sect;
  const sect = sects.find(s => (s.getComponent("Identity")||{}).name === sectName);
  if (!sect) return null;

  const members = sect.getComponent("Members") || { count:1, leader:"?" };
  const treasury = sect.getComponent("Treasury") || { resources:{} };
  const power = sect.getComponent("Power") || { strength:50, reputation:40 };
  const age = sect.getComponent("Age") || { ticks:0, era:"新立宗门" };

  const rankId = membership.rank || (legacy.founded_sect ? "master" : "outer");
  const rankDef = SECT_RANKS[rankId] || SECT_RANKS.outer;
  const contrib = membership.contribution || 0;

  // Daily missions available
  const todayMissions = Object.entries(SECT_MISSIONS)
    .filter(([_,m]) => m.type === "daily" || m.type === "any")
    .slice(0, 3)
    .map(([id,m]) => ({ id, name:m.name, desc:m.desc, contrib:m.contrib }));

  return {
    name: sectName,
    rank: rankId,
    rankName: rankDef.name,
    rankLevel: rankDef.level,
    contribution: contrib,
    memberCount: members.count,
    treasury,
    power,
    era: age.era,
    privileges: rankDef.privileges,
    missions: todayMissions,
    isLeader: !!legacy.founded_sect || rankId === "master",
    nextRank: rankId !== "master" ? SECT_RANKS[RANK_ORDER[RANK_ORDER.indexOf(rankId)+1]] : null,
  };
}

// ══════════════════════════════════════
// Join sect
// ══════════════════════════════════════
export function joinSect(player, sectName, kernel) {
  const membership = player.getComponent("SectMembership") || {};
  if (membership.sect_name) return { error:"已有宗门" };
  const sects = kernel.queryEntities("sect", {}, 10, 0);
  const sect = sects.find(s => (s.getComponent("Identity")||{}).name === sectName);
  if (!sect) return { error:"宗门不存在" };
  const members = sect.getComponent("Members") || { count:1, leader:"?" };
  const up = kernel.getEntity(player.id);
  kernel.updateComponent(up.id, "SectMembership", { sect_name:sectName, rank:"outer", contribution:0, joined_at:kernel.world.tickCount }, up.version);
  kernel.updateComponent(sect.id, "Members", { ...members, count:members.count+1 }, sect.version);
  return { ok:true, msg:`成功加入 ${sectName}，成为外门弟子`, rank:"outer" };
}

export function leaveSect(player, kernel) {
  const membership = player.getComponent("SectMembership") || {};
  if (!membership.sect_name) return { error:"无宗门" };
  const legacy = player.getComponent("Legacy") || {};
  if (legacy.founded_sect && membership.sect_name === legacy.founded_sect) return { error:"宗主不能离开自己创立的宗门" };
  const sects = kernel.queryEntities("sect", {}, 10, 0);
  const sect = sects.find(s => (s.getComponent("Identity")||{}).name === membership.sect_name);
  if (sect) {
    const members = sect.getComponent("Members") || { count:1 };
    kernel.updateComponent(sect.id, "Members", { ...members, count:Math.max(1, members.count-1) }, sect.version);
  }
  kernel.updateComponent(player.id, "SectMembership", {}, player.version);
  return { ok:true, msg:`已离开 ${membership.sect_name}` };
}

// ══════════════════════════════════════
// Add contribution + auto-promotion
// ══════════════════════════════════════
export function addContribution(player, amount, kernel) {
  const membership = player.getComponent("SectMembership") || {};
  const legacy = player.getComponent("Legacy") || {};
  const sectName = membership.sect_name || legacy.founded_sect;
  if (!sectName) return null;
  const newContrib = (membership.contribution||0) + amount;
  const currentRank = membership.rank || "outer";
  const realm = player.getComponent("Realm")?.realm_id || 1;

  // Check promotion
  let newRank = currentRank;
  let promoted = false;
  const currentIdx = RANK_ORDER.indexOf(currentRank);
  if (currentIdx < RANK_ORDER.length - 1) {
    const nextRank = SECT_RANKS[RANK_ORDER[currentIdx + 1]];
    if (newContrib >= nextRank.minContrib && realm >= nextRank.realmReq) {
      newRank = RANK_ORDER[currentIdx + 1];
      promoted = true;
    }
  }

  const up = kernel.getEntity(player.id); // refresh for latest version
  kernel.updateComponent(up.id, "SectMembership", { ...up.getComponent("SectMembership"), contribution:newContrib, rank:newRank }, up.version);
  return { contribution:newContrib, rank:newRank, promoted, rankName:SECT_RANKS[newRank]?.name };
}

// ══════════════════════════════════════
// Complete mission
// ══════════════════════════════════════
export function completeMission(player, missionType, kernel) {
  const mission = SECT_MISSIONS[missionType];
  if (!mission) return { error:"未知任务" };
  const inv = player.getComponent("Inventory") || { items:{} };
  if (mission.req.resource) {
    const count = inv.items[mission.req.resource] || 0;
    if (count < mission.req.count) return { ok:false, error:`需要 ${HERBS[mission.req.resource]?.name||mission.req.resource} x${mission.req.count}` };
    kernel.updateComponent(player.id, "Inventory", { items:{ ...inv.items, [mission.req.resource]:count-mission.req.count } }, player.version);
  }
  const up = kernel.getEntity(player.id); // refresh
  const result = addContribution(up, mission.contrib, kernel);
  const membership = player.getComponent("SectMembership") || {};
  if (membership.sect_name) {
    const sects = kernel.queryEntities("sect", {}, 10, 0);
    const sect = sects.find(s => (s.getComponent("Identity")||{}).name === membership.sect_name);
    if (sect) {
      const treasury = sect.getComponent("Treasury") || { resources:{} };
      kernel.updateComponent(sect.id, "Treasury", { resources:{ ...treasury.resources, spirit_stone:(treasury.resources.spirit_stone||0)+mission.contrib*2 } }, sect.version);
    }
  }
  return { ok:true, msg:`${mission.name}完成！+${mission.contrib}贡献`, ...result };
}

// ══════════════════════════════════════
// Sect Store — buy item with contribution
// ══════════════════════════════════════
export function buyFromSectStore(player, storeItemId, kernel) {
  const item = SECT_STORE[storeItemId];
  if (!item) return { error:"物品不存在" };
  const membership = player.getComponent("SectMembership") || {};
  if (!membership.sect_name) return { error:"未加入宗门" };
  const rank = membership.rank || "outer";
  if (RANK_ORDER.indexOf(rank) < RANK_ORDER.indexOf(item.rankReq)) return { error:`需要${SECT_RANKS[item.rankReq]?.name}及以上` };
  if ((membership.contribution||0) < item.cost) return { error:`贡献不足(需${item.cost})` };

  // Deduct contribution
  kernel.updateComponent(player.id, "SectMembership", { ...membership, contribution:membership.contribution-item.cost }, player.version);

  // Grant item
  if (item.type === "resource") {
    const inv = player.getComponent("Inventory") || { items:{} };
    kernel.updateComponent(player.id, "Inventory", { items:{ ...inv.items, [item.item]:(inv.items[item.item]||0)+item.qty } }, player.version + 1);
  } else if (item.type === "pill") {
    const inv = player.getComponent("Inventory") || { items:{} };
    kernel.updateComponent(player.id, "Inventory", { items:{ ...inv.items, [item.item]:(inv.items[item.item]||0)+item.qty } }, player.version + 1);
  } else if (item.type === "buff") {
    const realm = player.getComponent("Realm") || {};
    if (item.effect === "breakthrough") {
      kernel.updateComponent(player.id, "Realm", { ...realm, breakthrough_bonus:(realm.breakthrough_bonus||0)+item.value }, player.version);
    }
  }

  return { ok:true, msg:`兑换 ${item.name}`, item };
}

// ══════════════════════════════════════
// NPC sect rank progression
// ══════════════════════════════════════
export function npcSectTick(npc, kernel, random) {
  const membership = npc.getComponent("SectMembership") || {};
  if (!membership.sect_name) return;
  const realm = npc.getComponent("Realm")?.realm_id || 1;
  const contrib = membership.contribution || 0;
  const currentRank = membership.rank || "outer";

  // NPC auto-gains contribution slowly
  const newContrib = contrib + random.nextInt(1, 5);

  // Promotion check
  let newRank = currentRank;
  const currentIdx = RANK_ORDER.indexOf(currentRank);
  if (currentIdx < RANK_ORDER.length - 1) {
    const nextRank = SECT_RANKS[RANK_ORDER[currentIdx + 1]];
    if (newContrib >= nextRank.minContrib && realm >= nextRank.realmReq) {
      newRank = RANK_ORDER[currentIdx + 1];
    }
  }

  kernel.updateComponent(npc.id, "SectMembership", { ...membership, contribution:newContrib, rank:newRank }, npc.version);
}

// ══════════════════════════════════════
// Deposit resources to sect treasury
// ══════════════════════════════════════
export function depositToTreasury(player, resource, amount, kernel) {
  const membership = player.getComponent("SectMembership") || {};
  const legacy = player.getComponent("Legacy") || {};
  const sectName = membership.sect_name || legacy.founded_sect;
  if (!sectName) return { error:"无宗门" };
  const inv = player.getComponent("Inventory") || { items:{} };
  if ((inv.items[resource]||0) < amount) return { error:"资源不足" };
  const sects = kernel.queryEntities("sect", {}, 10, 0);
  const sect = sects.find(s => (s.getComponent("Identity")||{}).name === sectName);
  if (!sect) return { error:"宗门不存在" };
  const treasury = sect.getComponent("Treasury") || { resources:{} };
  kernel.updateComponent(player.id, "Inventory", { items:{ ...inv.items, [resource]:inv.items[resource]-amount } }, player.version);
  kernel.updateComponent(sect.id, "Treasury", { resources:{ ...treasury.resources, [resource]:(treasury.resources[resource]||0)+amount } }, sect.version);
  // Small contribution bonus for donating
  addContribution(player, Math.floor(amount/10), kernel);
  return { ok:true, msg:`向宗门缴纳 ${resource} x${amount}` };
}
