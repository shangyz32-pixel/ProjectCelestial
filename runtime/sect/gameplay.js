// runtime/sect/gameplay.js
// Sprint 7 — Advanced Sect Gameplay
// Contribution, Ranks, Treasury, Missions, NPC management

// Sect rank definitions
export const SECT_RANKS = {
  disciple:   { name:"弟子",    minContrib:0,   salary:10 },
  elite:      { name:"精英弟子",minContrib:100, salary:30 },
  elder:      { name:"长老",    minContrib:500, salary:80 },
  vice_leader:{ name:"副宗主",  minContrib:2000,salary:200 },
  leader:     { name:"宗主",    minContrib:5000,salary:500 },
};

// Mission types
export const SECT_MISSIONS = {
  cultivate:    { name:"修炼任务", desc:"修炼至指定进度", contrib:20, req:{ cultivation:0.3 } },
  gather:       { name:"采集任务", desc:"收集指定资源x5", contrib:15, req:{ resource:"spirit_herb", count:5 } },
  explore:      { name:"探索任务", desc:"探索新区域",      contrib:25, req:{ areas:2 } },
  defeat:       { name:"讨伐任务", desc:"击败一头妖兽",    contrib:40, req:{ monster_kills:1 } },
  recruit:      { name:"招募任务", desc:"招募一名新成员", contrib:30, req:{ recruits:1 } },
  patrol:       { name:"巡逻任务", desc:"巡视宗门领地",    contrib:10, req:{ patrol:1 } },
};

// ══════════════════════════════════════
// Get player sect info
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

  return {
    name: sectName,
    rank: membership.rank || (legacy.founded_sect ? "leader" : "disciple"),
    contribution: membership.contribution || 0,
    memberCount: members.count,
    treasury,
    power,
    era: age.era,
    isLeader: !!legacy.founded_sect || membership.rank === "leader",
  };
}

// Join a sect
export function joinSect(player, sectName, kernel) {
  const membership = player.getComponent("SectMembership") || {};
  if (membership.sect_name) return { error: "已有宗门" };
  const sects = kernel.queryEntities("sect", {}, 10, 0);
  const sect = sects.find(s => (s.getComponent("Identity")||{}).name === sectName);
  if (!sect) return { error: "宗门不存在" };
  const members = sect.getComponent("Members") || { count:1, leader:"?" };
  const up = kernel.getEntity(player.id);
  kernel.updateComponent(up.id, "SectMembership", { sect_name: sectName, rank: "disciple", contribution: 0, joined_at: kernel.world.tickCount }, up.version);
  const se = kernel.getEntity(sect.id);
  kernel.updateComponent(se.id, "Members", { ...members, count: members.count + 1 }, se.version);
  return { ok: true, msg: `成功加入 ${sectName}`, rank:"disciple" };
}

// Leave sect
export function leaveSect(player, kernel) {
  const membership = player.getComponent("SectMembership") || {};
  if (!membership.sect_name) return { error: "无宗门" };
  const legacy = player.getComponent("Legacy") || {};
  if (legacy.founded_sect && membership.sect_name === legacy.founded_sect) return { error: "宗主不能离开自己创立的宗门" };
  const sects = kernel.queryEntities("sect", {}, 10, 0);
  const sect = sects.find(s => (s.getComponent("Identity")||{}).name === membership.sect_name);
  if (sect) {
    const members = sect.getComponent("Members") || { count:1, leader:"?" };
    kernel.updateComponent(sect.id, "Members", { ...members, count: Math.max(1, members.count - 1) }, sect.version);
  }
  kernel.updateComponent(player.id, "SectMembership", {}, player.version);
  return { ok: true, msg: `已离开 ${membership.sect_name}` };
}

// Add contribution
export function addContribution(player, amount, kernel) {
  const membership = player.getComponent("SectMembership") || {};
  if (!membership.sect_name) return;
  const newContrib = (membership.contribution || 0) + amount;
  const oldRank = membership.rank || "disciple";
  // Check promotion
  let newRank = oldRank;
  for (const [rkey, rdef] of Object.entries(SECT_RANKS)) {
    if (newContrib >= rdef.minContrib) newRank = rkey;
  }
  const up = kernel.getEntity(player.id);
  kernel.updateComponent(up.id, "SectMembership", { ...membership, contribution: newContrib, rank: newRank }, up.version);
  return { contribution: newContrib, rank: newRank, promoted: newRank !== oldRank, newRank: SECT_RANKS[newRank].name };
}

// Complete a sect mission
export function completeMission(player, missionType, kernel) {
  const mission = SECT_MISSIONS[missionType];
  if (!mission) return { error: "未知任务" };
  // Verify requirements
  const inv = player.getComponent("Inventory") || { items:{} };
  if (mission.req.resource) {
    const count = inv.items[mission.req.resource] || 0;
    if (count < mission.req.count) return { error: `资源不足 (需要 ${mission.req.resource} x${mission.req.count})` };
    // Deduct resources
    const up = kernel.getEntity(player.id);
    kernel.updateComponent(up.id, "Inventory", { items: { ...inv.items, [mission.req.resource]: count - mission.req.count } }, up.version);
  }
  // Add contribution + treasury
  const result = addContribution(player, mission.contrib, kernel);
  const membership = player.getComponent("SectMembership") || {};
  if (membership.sect_name) {
    const sects = kernel.queryEntities("sect", {}, 10, 0);
    const sect = sects.find(s => (s.getComponent("Identity")||{}).name === membership.sect_name);
    if (sect) {
      const treasury = sect.getComponent("Treasury") || { resources:{} };
      const tre = { ...treasury.resources, spirit_stone: (treasury.resources.spirit_stone||0) + mission.contrib * 2 };
      kernel.updateComponent(sect.id, "Treasury", { resources: tre }, sect.version);
    }
  }
  return { ok: true, msg: `${mission.name}完成！+${mission.contrib}贡献`, ...result };
}

// Treasury management — deposit/withdraw
export function depositToTreasury(player, resource, amount, kernel) {
  const membership = player.getComponent("SectMembership") || {};
  const legacy = player.getComponent("Legacy") || {};
  const sectName = membership.sect_name || legacy.founded_sect;
  if (!sectName) return { error: "无宗门" };
  const inv = player.getComponent("Inventory") || { items:{} };
  if ((inv.items[resource]||0) < amount) return { error: "资源不足" };
  const sects = kernel.queryEntities("sect", {}, 10, 0);
  const sect = sects.find(s => (s.getComponent("Identity")||{}).name === sectName);
  if (!sect) return { error: "宗门不存在" };
  const treasury = sect.getComponent("Treasury") || { resources:{} };
  const up = kernel.getEntity(player.id);
  kernel.updateComponent(up.id, "Inventory", { items:{ ...inv.items, [resource]: inv.items[resource] - amount } }, up.version);
  kernel.updateComponent(sect.id, "Treasury", { resources:{ ...treasury.resources, [resource]: (treasury.resources[resource]||0) + amount } }, sect.version);
  return { ok: true, msg: `向宗门缴纳 ${resource} x${amount}` };
}
