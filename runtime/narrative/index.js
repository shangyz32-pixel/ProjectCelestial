// runtime/narrative/index.js
// v2.0 Sprint 11 — Narrative Emergence Framework
// Auto-generated news, rumors, legends from simulation events.
// All deterministic through Runtime.

// ══════════════════════════════════════
// Event Detection & News Generation
// ══════════════════════════════════════
const NEWS_TEMPLATES = {
  breakthrough:    "{name} 突破至 Lv{realm}，天地异象震动{region}！",
  sect_founded:    "{name} 创立宗门「{sect}」，开宗立派！",
  marriage:        "{name1} 与 {name2} 结为道侣，仙缘佳话！",
  birth:           "{name} 喜得贵子，修仙世家后继有人！",
  settlement_grew: "{city} 人口突破 {pop}，晋升为繁荣城镇。",
  sect_war:        "{sect1} 与 {sect2} 爆发冲突，修仙界震动！",
  discovery:       "{name} 在 {region} 发现{phenomenon}！",
  ascension:       "{name} 飞升仙界！万仙朝拜！",
  beast_tide:      "{region} 遭遇兽潮袭击，修士伤亡惨重！",
  celestial:       "天空出现{event}，天下修士纷纷仰望！",
  alliance:        "{sect1} 与 {sect2} 结盟，修仙格局变化！",
  legendary:       "{name} 觉醒{bloodline}，天降异象！",
};

export function generateNews(eventType, data) {
  const template = NEWS_TEMPLATES[eventType];
  if (!template) return null;
  let text = template;
  for (const [key, value] of Object.entries(data)) {
    text = text.replace(`{${key}}`, String(value));
  }
  return { type: eventType, text, tick: data.tick || 0, importance: data.importance || 5 };
}

// ══════════════════════════════════════
// Rumor System
// ══════════════════════════════════════
export const RumorSystem = {
  tick(kernel, time, random) {
    // NPCs share rumors
    const npcs = kernel.queryEntities("npc", {}, 50, 0).filter(n => n.state === "active");
    const rumors = kernel.world.globalState.rumors || [];
    if (npcs.length < 2) return;

    // Spread existing rumors between NPCs
    for (const rumor of rumors.slice(0, 5)) {
      if (random.chance(0.3)) {
        const spreader = npcs[random.nextInt(0, npcs.length - 1)];
        const hearer = npcs[random.nextInt(0, npcs.length - 1)];
        if (spreader.id !== hearer.id) {
          rumor.spreadCount = (rumor.spreadCount || 0) + 1;
          rumor.lastSpreader = (spreader.getComponent("Identity")||{}).name;
        }
      }
    }

    // Generate new rumor from event log
    if (random.chance(0.10) && rumors.length < 20) {
      const events = kernel.getEventLog(Math.max(0, kernel.world.tickCount - 100));
      const recent = events.filter(e => e.type === "NPCExplored" || e.type === "EntityUpdated");
      if (recent.length > 0) {
        const event = recent[random.nextInt(0, Math.min(10, recent.length - 1))];
        let rumorText = "据传，最近发生了一件大事...";
        if (event.type === "NPCExplored") {
          const name = event.payload?.npc || "一位修士";
          rumorText = `听说 ${name} ${event.payload?.discovery || "探索了新区域"}`;
        } else if (event.payload?.component === "Realm") {
          const target = kernel.getEntity(event.target);
          const name = (target?.getComponent("Identity")||{}).name || event.target;
          rumorText = `传闻 ${name} 的修为又精进了`;
        }
        const rumor = { id: `rumor_${Date.now()}`, text: rumorText, spreadCount: 1, tick: kernel.world.tickCount, accuracy: random.nextFloat(0.5, 1.0) };
        rumors.unshift(rumor);
      }
    }

    // Keep max 20 rumors
    kernel.world.globalState.rumors = rumors.slice(0, 20);
  },
};

// ══════════════════════════════════════
// Legend System
// ══════════════════════════════════════
const LEGEND_THRESHOLDS = {
  sword_saint:      { name:"剑圣",     realmReq:6,  skillReq:"sword_heart", desc:"剑道通神" },
  alchemy_master:   { name:"丹圣",     realmReq:5,  constitution:"fire_body", desc:"炼丹如神" },
  beast_king:       { name:"兽王",     realmReq:5,  bloodline:"dragon", desc:"万兽臣服" },
  merchant_prince:  { name:"商王",     realmReq:0,  wealthReq:5000, desc:"富可敌国" },
  immortal_emperor: { name:"仙帝",     realmReq:9,  ambitionReq:9, desc:"威震天下" },
  wandering_immortal:{ name:"游仙",    realmReq:8,  curiosityReq:8, desc:"游戏人间" },
  demon_slayer:     { name:"诛魔真人", realmReq:5,  aggressionReq:8, desc:"妖魔克星" },
};

export function checkLegendStatus(npc, kernel) {
  const realm = npc.getComponent("Realm")?.realm_id || 1;
  const personality = npc.getComponent("Personality") || {};
  const bloodline = npc.getComponent("Bloodline");
  const skills = npc.getComponent("Skills")?.learned || [];
  const constitution = npc.getComponent("Constitution");
  const inv = npc.getComponent("Inventory")?.items || {};
  const wealth = (inv.spirit_stone || 0) + (inv.ancient_jade || 0) * 200;
  const existing = npc.getComponent("LegendTitle");

  for (const [id, threshold] of Object.entries(LEGEND_THRESHOLDS)) {
    if (realm >= (threshold.realmReq || 0) &&
        (!threshold.skillReq || skills.includes(threshold.skillReq)) &&
        (!threshold.constitution || (constitution?.id === threshold.constitution)) &&
        (!threshold.bloodline || (bloodline?.id === threshold.bloodline)) &&
        (!threshold.wealthReq || wealth >= threshold.wealthReq) &&
        (!threshold.ambitionReq || (personality.ambition || 5) >= threshold.ambitionReq) &&
        (!threshold.aggressionReq || (personality.aggression || 5) >= threshold.aggressionReq) &&
        (!threshold.curiosityReq || (personality.curiosity || 5) >= threshold.curiosityReq)) {
      if (!existing || existing.id !== id) {
        return { id, name: threshold.name, desc: threshold.desc, achievedAt: kernel.world.tickCount };
      }
    }
  }
  return null;
}

// ══════════════════════════════════════
// Chronicle system — permanent history
// ══════════════════════════════════════
export function recordToChronicle(kernel, entry) {
  kernel.world.globalState.chronicle = kernel.world.globalState.chronicle || [];
  kernel.world.globalState.chronicle.push({
    ...entry,
    recordedAt: kernel.world.tickCount,
  });
  // Keep last 200 entries
  if (kernel.world.globalState.chronicle.length > 200) {
    kernel.world.globalState.chronicle = kernel.world.globalState.chronicle.slice(-200);
  }
}

// ══════════════════════════════════════
// Narrative Tick — detect and record events
// ══════════════════════════════════════
export const NarrativeSystem = {
  tick(kernel, time, random) {
    const npcs = kernel.queryEntities("npc", {}, 100, 0);
    const sects = kernel.queryEntities("sect", {}, 10, 0);
    const celestialEvent = kernel.world.globalState.celestialEvent;
    const settlements = kernel.queryEntities("settlement", {}, 10, 0);

    // Detect NPC breakthroughs
    for (const npc of npcs) {
      if (npc.state !== "active") continue;
      const realm = npc.getComponent("Realm") || {};
      const name = (npc.getComponent("Identity")||{}).name || npc.id;

      if (realm.realm_id >= 5 && realm.realm_id !== (npc.getComponent("LastAnnounced")?.realm || 0)) {
        const news = generateNews("breakthrough", { name, realm: realm.realm_id, region: "东方域", tick: kernel.world.tickCount, importance: 7 });
        if (news) recordToChronicle(kernel, news);
        kernel.updateComponent(npc.id, "LastAnnounced", { realm: realm.realm_id }, npc.version);
      }

      // Check legend status
      const legend = checkLegendStatus(npc, kernel);
      if (legend) {
        recordToChronicle(kernel, { type: "legendary", text: `${name} 获得称号「${legend.name}」——${legend.desc}`, tick: kernel.world.tickCount, importance: 9 });
        kernel.updateComponent(npc.id, "LegendTitle", legend, npc.version);
      }
    }

    // Detect celestial events
    if (celestialEvent && kernel.world.tickCount % 90 < 2) {
      recordToChronicle(kernel, { type: "celestial", text: `天空出现${celestialEvent}，天下修士纷纷仰望！`, tick: kernel.world.tickCount, importance: 6 });
    }

    // Detect settlement milestones
    for (const s of settlements) {
      const pop = s.getComponent("Population")?.count || 0;
      const era = s.getComponent("Age")?.era || "";
      const name = (s.getComponent("Identity")||{}).name || "?";
      if (pop >= 500 && era === "繁荣") {
        const news = generateNews("settlement_grew", { city: name, pop, tick: kernel.world.tickCount, importance: 5 });
        if (news) recordToChronicle(kernel, news);
      }
    }
  },
};
