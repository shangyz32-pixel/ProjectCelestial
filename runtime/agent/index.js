// runtime/agent/index.js
// v2.0 Sprint 9 — Autonomous Agent Framework
// Personality, Goals, Memory, Planning, Decision Making.
// All deterministic through Kernel API.

// ══════════════════════════════════════
// Personality Traits
// ══════════════════════════════════════
export const PERSONALITY_AXES = {
  caution:     { name:"谨慎", min:1, max:10, affects:["risk_taking","exploration","flee"] },
  aggression:  { name:"好斗", min:1, max:10, affects:["combat","sect_conflict","initiative"] },
  greed:       { name:"贪婪", min:1, max:10, affects:["trade","gather","merchant"] },
  kindness:    { name:"善良", min:1, max:10, affects:["help_others","share_resources","refugee"] },
  curiosity:   { name:"好奇", min:1, max:10, affects:["exploration","research","ruins"] },
  ambition:    { name:"野心", min:1, max:10, affects:["sect_founding","leadership","ascension"] },
  loyalty:     { name:"忠诚", min:1, max:10, affects:["stay_in_sect","defend_ally","promise"] },
  patience:    { name:"耐心", min:1, max:10, affects:["cultivation","waiting","long_term"] },
  pride:       { name:"自尊", min:1, max:10, affects:["reputation","refuse_help","independence"] },
  emotion:     { name:"感性", min:1, max:10, affects:["friend_making","love","revenge"] },
};

// ══════════════════════════════════════
// Life Goals
// ══════════════════════════════════════
export const LIFE_GOALS = [
  { id:"ascend",        name:"飞升成仙",    type:"ultimate", duration:"lifetime",   steps:["cultivate_to_lv9","pass_tribulation","ascend"] },
  { id:"found_sect",    name:"开宗立派",    type:"major",    duration:500,           steps:["gather_followers","build_reputation","establish_sect"] },
  { id:"become_wealthy",name:"富甲一方",    type:"major",    duration:200,           steps:["gather_resources","trade","establish_business"] },
  { id:"master_sword",  name:"剑道大成",    type:"personal", duration:300,           steps:["learn_sword_skills","defeat_masters","create_technique"] },
  { id:"explore_world", name:"遍历九州",    type:"personal", duration:150,           steps:["visit_all_regions","discover_secrets","map_world"] },
  { id:"protect_family",name:"守护家族",    type:"social",   duration:"lifetime",   steps:["build_family","defend_territory","pass_legacy"] },
  { id:"revenge",       name:"复仇之路",    type:"social",   duration:200,           steps:["find_target","grow_stronger","confront"] },
  { id:"immortal_legacy",name:"名留青史",   type:"ultimate", duration:"lifetime",   steps:["achieve_greatness","record_history","inspire_generations"] },
];

// ══════════════════════════════════════
// NPC Memory
// ══════════════════════════════════════
export function recordMemory(npc, eventType, details, kernel) {
  const memories = npc.getComponent("Memories") || { recent:[], longterm:[] };
  const entry = {
    type: eventType,
    details,
    tick: kernel.world.tickCount,
    timestamp: Date.now(),
    importance: details.importance || 3,
  };
  memories.recent = [entry, ...(memories.recent || [])].slice(0, 20);
  // Promote to long-term if important
  if (entry.importance >= 7) {
    memories.longterm = [entry, ...(memories.longterm || [])].slice(0, 10);
  }
  const e = kernel.getEntity(npc.id);
  kernel.updateComponent(e.id, "Memories", memories, e.version);
}

// ══════════════════════════════════════
// Generate personality for NPC
// ══════════════════════════════════════
export function generatePersonality(random) {
  const traits = {};
  for (const [key, axis] of Object.entries(PERSONALITY_AXES)) {
    // Bell-curve distribution around 5
    const base = random.nextInt(3, 7); // 3-7 range
    const extreme = random.chance(0.10) ? random.nextInt(1, 3) : 0; // 10% extreme low
    const high = random.chance(0.10) ? random.nextInt(8, 10) : 0;   // 10% extreme high
    traits[key] = high || extreme || base;
  }
  return traits;
}

// ══════════════════════════════════════
// Assign life goal based on personality
// ══════════════════════════════════════
export function assignLifeGoal(personality, random) {
  const { ambition, aggression, greed, curiosity, kindness, loyalty } = personality;
  const weights = {};
  for (const goal of LIFE_GOALS) {
    let w = 1;
    if (goal.id === "ascend" && ambition >= 7) w += 3;
    if (goal.id === "found_sect" && ambition >= 6 && aggression >= 5) w += 2;
    if (goal.id === "become_wealthy" && greed >= 6) w += 2;
    if (goal.id === "master_sword" && aggression >= 6) w += 2;
    if (goal.id === "explore_world" && curiosity >= 7) w += 3;
    if (goal.id === "protect_family" && kindness >= 6 && loyalty >= 6) w += 3;
    if (goal.id === "revenge" && aggression >= 7 && kindness <= 3) w += 3;
    if (goal.id === "immortal_legacy" && ambition >= 8) w += 4;
    weights[goal.id] = w;
  }
  // Weighted random selection
  const total = Object.values(weights).reduce((s,v) => s + v, 0);
  let roll = random.nextFloat(0, total);
  for (const [id, w] of Object.entries(weights)) {
    roll -= w;
    if (roll <= 0) return LIFE_GOALS.find(g => g.id === id);
  }
  return LIFE_GOALS[0];
}

// ══════════════════════════════════════
// Decision Engine — personality-weighted action selection
// ══════════════════════════════════════
export function npcDecideAction(npc, options, kernel, random) {
  const personality = npc.getComponent("Personality") || {};
  const goal = npc.getComponent("Goal") || {};
  const memories = npc.getComponent("Memories") || { recent:[] };
  const realm = npc.getComponent("Realm")?.realm_id || 1;
  const hp = npc.getComponent("HP") || { current: 100, max: 100 };

  const scores = {};
  for (const opt of options) {
    let score = 0;
    // Personality weights
    if (opt.tag === "risk" && personality.caution) score -= personality.caution * 2;
    if (opt.tag === "fight" && personality.aggression) score += personality.aggression * 3;
    if (opt.tag === "help" && personality.kindness) score += personality.kindness * 2;
    if (opt.tag === "explore" && personality.curiosity) score += personality.curiosity * 2;
    if (opt.tag === "trade" && personality.greed) score += personality.greed * 2;
    if (opt.tag === "lead" && personality.ambition) score += personality.ambition * 2;

    // Goal alignment
    if (goal.id === "ascend" && opt.tag === "cultivate") score += 5;
    if (goal.id === "explore_world" && opt.tag === "explore") score += 5;
    if (goal.id === "become_wealthy" && opt.tag === "trade") score += 4;

    // Memory influence (avoid previously failed actions)
    const failedBefore = memories.recent?.some(m => m.type === opt.tag && m.details?.success === false);
    if (failedBefore) score *= 0.5;

    // Survival instinct
    if (hp.current < hp.max * 0.3 && opt.tag === "flee") score += 10;
    if (hp.current < hp.max * 0.3 && opt.tag === "fight") score *= 0.3;

    scores[opt.id] = Math.max(0, score + random.nextFloat(0, 3)); // small randomness
  }

  // Pick highest score
  let best = options[0];
  for (const opt of options) {
    if (scores[opt.id] > scores[best.id]) best = opt;
  }
  return best;
}
