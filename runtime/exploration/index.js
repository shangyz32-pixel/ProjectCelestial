// runtime/exploration/index.js
// v2.2 Sprint 4.5 — Exploration System
// Enter region → tick → encounter → combat → loot → continue.
// Deterministic. Kernel-driven. Replay-compatible.

import { WorldRandom } from "../random/index.js";
import { REGION_DATA, MONSTER_TYPES } from "../monsters/index.js";
import { CombatEvents } from "../combat/index.js";
import { createParticipant, validateParticipant } from "../combat/participant.js";
import { calcDamage } from "../combat/index.js";

// ══════════════════════════════════════
// Enter a region
// ══════════════════════════════════════
export function enterRegion(player, playerEntity, regionId, kernel) {
  const region = REGION_DATA[regionId];
  if (!region) return { ok:false, error:"未知区域" };

  const realm = playerEntity.getComponent("Realm")?.realm_id || 1;
  if (region.danger > realm + 1) return { ok:false, error:`${region.name}太过危险(建议Lv${region.danger})` };

  kernel.updateComponent(playerEntity.id, "Location", { area:regionId }, playerEntity.version);

  CombatEvents.emit("RegionEntered", { player:player.name, region:region.name, danger:region.danger, tick:kernel.world?.tickCount||0 });

  return {
    ok:true,
    region: { id:regionId, name:region.name, danger:region.danger, desc:region.desc, qiMod:region.qiMod },
    msg: `进入${region.name} — ${region.desc}`,
  };
}

// ══════════════════════════════════════
// Explore — one tick, generates encounter
// ══════════════════════════════════════
export function explore(player, playerEntity, kernel, random) {
  const loc = playerEntity.getComponent("Location") || {};
  const regionId = loc.area || "area_bamboo_grove";
  const region = REGION_DATA[regionId] || REGION_DATA.area_bamboo_grove;

  // 1. Progress tick
  kernel.world.tickCount++;

  // 2. Encounter roll — weighted by danger
  const encounterRate = Math.min(0.6, 0.15 + region.danger * 0.05);
  const roll = random ? random.nextFloat(0, 1) : Math.random();

  if (roll > encounterRate) {
    return { type:"nothing", msg:`${region.name}探索中...未发现异常` };
  }

  // 3. Encounter type
  const encounterRoll = random ? random.nextFloat(0, 1) : Math.random();
  let encounterType = "monster";  // 70% monster

  if (encounterRoll > 0.85) encounterType = "treasure";
  else if (encounterRoll > 0.75 && region.danger >= 4) encounterType = "boss";

  // 4. Monster encounter
  if (encounterType === "monster" || encounterType === "boss") {
    const pool = region.monsterPool || ["wild_beast"];
    const isBoss = encounterType === "boss";
    const candidates = Object.entries(MONSTER_TYPES)
      .filter(([id, t]) => pool.includes(id) && (isBoss ? t.boss : !t.boss));

    if (candidates.length === 0) return { type:"nothing", msg:"区域暂无怪物" };

    const idx = random ? random.nextInt(0, candidates.length - 1) : Math.floor(Math.random() * candidates.length);
    const [monsterType, template] = candidates[idx];

    // 5. Spawn monster entity
    const hpVar = random ? random.nextInt(-5, 10) : 0;
    const hp = Math.max(10, template.hp + hpVar);
    const monsterEntity = kernel.createEntity("monster", {
      Identity: { name:template.name, type:monsterType },
      Realm: { realm_id:template.realm, cultivation_value:0.3 },
      HP: { current:hp, max:hp },
      Combat: { attack:template.atk, defense:template.def, speed:template.spd },
      Behavior: { state:"hostile", aggression:template.aggression, target:null },
      Location: { area:regionId },
      LootTable: { drops:{ ...template.loot } },
      SpiritualRoot: { element:template.element||"none", rarity:"common" },
      Boss: template.boss ? { bossType:monsterType, currentPhase:"normal", phases:template.phases, skills:template.skills||[] } : null,
    });

    // 6. Quick-resolve combat (single round, deterministic)
    const monsterParticipant = createParticipant(monsterEntity, "defender");
    const playerParticipant = createParticipant(playerEntity, "attacker");

    // Player attacks first (speed-based)
    const { damage:playerDmg, critical, elementMultiplier } = calcDamage(playerEntity, monsterEntity, "attack", random || new WorldRandom(42));
    const mHp = Math.max(0, hp - playerDmg);
    kernel.updateComponent(monsterEntity.id, "HP", { current:mHp, max:hp }, monsterEntity.version);

    if (mHp <= 0) {
      // Victory — loot
      const lootTable = template.loot;
      const inv = playerEntity.getComponent("Inventory") || { items:{} };
      const items = { ...inv.items };
      for (const [item, [lo, hi]] of Object.entries(lootTable)) {
        items[item] = (items[item]||0) + (random||new WorldRandom(42)).nextInt(lo, hi);
      }
      kernel.updateComponent(playerEntity.id, "Inventory", { items }, playerEntity.version);

      CombatEvents.emit("EncounterVictory", { player:player.name, monster:template.name, loot:Object.keys(lootTable).join(","), tick:kernel.world?.tickCount||0 });

      return {
        type:"victory",
        monster:{ name:template.name, realm:template.realm, hp, element:template.element },
        result:"killed",
        damage:playerDmg, critical,
        loot:Object.entries(lootTable).map(([k,v])=>`${k}x${v[0]}-${v[1]}`),
        msg:`击杀${template.name}！${critical?"暴击！":""}伤害${playerDmg} ${elementMultiplier!==1?(elementMultiplier>1?"⚔克制":"🛡抵抗"):""}`,
      };
    }

    // Monster counterattacks
    const { damage:monsterDmg } = calcDamage(monsterEntity, playerEntity, "attack", random || new WorldRandom(42));
    const pHp = playerEntity.getComponent("HP") || { current:100, max:100 };
    const newHP = Math.max(1, pHp.current - monsterDmg);
    kernel.updateComponent(playerEntity.id, "HP", { ...pHp, current:newHP }, playerEntity.version);

    CombatEvents.emit("EncounterFight", { player:player.name, monster:template.name, playerDmg, monsterDmg, tick:kernel.world?.tickCount||0 });

    return {
      type:"fight",
      monster:{ name:template.name, realm:template.realm, hp:mHp, element:template.element },
      playerDmg, monsterDmg,
      playerHP: newHP,
      msg:`${template.name}出现！你造成${playerDmg}点伤害，受到${monsterDmg}点伤害(HP:${newHP})`,
    };
  }

  // Treasure encounter
  if (encounterType === "treasure") {
    const lootTiers = { common:["spirit_herb","spirit_grass"], uncommon:["jade_shard","fire_lotus"], rare:["ancient_jade","thunder_ore"], epic:["dragon_scale","golden_ginseng"] };
    const tier = region.lootTier||"common";
    const pool = lootTiers[tier]||lootTiers.common;
    const item = pool[(random||new WorldRandom(42)).nextInt(0, pool.length-1)];
    const qty = (random||new WorldRandom(42)).nextInt(1, 3);
    const inv = playerEntity.getComponent("Inventory")||{items:{}};
    const items = { ...inv.items, [item]:(items[item]||0)+qty };
    kernel.updateComponent(playerEntity.id, "Inventory", { items }, playerEntity.version);
    return { type:"treasure", item, qty, msg:`发现宝箱！获得${item}x${qty}` };
  }

  return { type:"nothing", msg:"继续探索..." };
}

// ══════════════════════════════════════
// Exploration Simulation System — NPC autonomous exploration
// ══════════════════════════════════════
export const ExplorationSystem = {
  tick(kernel, time, random) {
    const npcs = kernel.queryEntities("npc", {}, 10, 0).filter(n => n.state === "active");
    for (const npc of npcs) {
      if (!random.chance(0.05)) continue;
      const loc = npc.getComponent("Location") || {};
      const regions = Object.keys(REGION_DATA);
      const ci = regions.indexOf(loc.area);
      if (ci < 0) continue;
      const next = regions[(ci + random.nextInt(1, regions.length - 1)) % regions.length];
      kernel.updateComponent(npc.id, "Location", { area:next }, npc.version);
    }
  },
};
