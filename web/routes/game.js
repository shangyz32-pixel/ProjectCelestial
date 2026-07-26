// web/routes/game.js
// Gameplay APIs — player lifecycle, cultivation, exploration, gathering

import { buyItem as shopBuy, sellItem as shopSell, getShopForRegion } from "../../runtime/shop/index.js";
import { generateConversation } from "../../runtime/dialogue/index.js";
import { getPlayerSectInfo, joinSect, leaveSect, completeMission, buyFromSectStore, SECT_STORE, depositToTreasury } from "../../runtime/sect/gameplay.js";
import { checkAchievements, getEarnedAchievements } from "../../runtime/achievements/index.js";
import { calcCultivationMultiplier, resolveTribulation, calcTribulationResist } from "../../runtime/cultivation/index.js";
import { MAJOR_REALMS, REGION_HIERARCHY, getRealmForArea } from "../../runtime/world/geography.js";
import { createEquipment, generateLoot, equipItem, unequipItem, enhanceEquipment, getEquipmentModifiers } from "../../runtime/equipment/index.js";
import { enterRegion, explore } from "../../runtime/exploration/index.js";
import { WorldRandom } from "../../runtime/random/index.js";
import { RECIPES, HERBS, FURNACES, FIRES, refinePill, consumePill, gatherHerb } from "../../runtime/alchemy/index.js";
import { MATERIALS, CRAFTING_RECIPES, gatherMaterial, forgeEquipment, enchantEquipment, ascendEquipment } from "../../runtime/crafting/index.js";
import { getAvailableQuests, acceptQuest, completeQuest } from "../../runtime/quest/index.js";

export function registerGameRoutes(kernel, sim, send, url, params) {

  // ── GET ──
  if (!params) {
    switch (url.pathname) {
      case "/api/game/areas":
        return send(200, {
          areas: [
            { id: "area_bamboo_grove", name: "翠竹林", desc: "灵气稀薄的新手区", qi: 0.8, req_realm: 0, resources: ["spirit_herb"], unlocked: true,
              resource_names: { spirit_herb: "灵草" } },
            { id: "area_misty_peak", name: "云雾峰", desc: "山间灵气渐浓", qi: 1.0, req_realm: 3, resources: ["spirit_herb", "jade_shard"], unlocked: false,
              resource_names: { spirit_herb: "灵草", jade_shard: "灵石碎片" } },
            { id: "area_thunder_valley", name: "雷音谷", desc: "雷属性灵气充沛", qi: 1.2, req_realm: 6, resources: ["thunder_ore", "spirit_herb"], unlocked: false,
              resource_names: { thunder_ore: "雷晶石", spirit_herb: "灵草" } },
            { id: "area_dragon_vein", name: "龙脉秘境", desc: "上古龙脉所在", qi: 1.5, req_realm: 9, resources: ["dragon_scale", "ancient_jade"], unlocked: false,
              resource_names: { dragon_scale: "龙鳞", ancient_jade: "古玉" } },
          ],
          realms: Object.entries(MAJOR_REALMS).map(([id,r]) => ({
            id, name:r.name, climate:r.climate, qiType:r.qiType,
            population:r.population, dangerLevel:r.dangerLevel,
            factions:r.factions, description:r.description,
          }))
        });

      case "/api/game/player": {
        const players = kernel.queryEntities("player", {}, 1, 0);
        if (players.length === 0) return send(200, { player: null });
        const p = players[0];
        const hp = p.getComponent("HP") || { current: 100, max: 100 };
        const stamina = p.getComponent("Stamina") || { current: 100, max: 100 };
        return send(200, {
          newAchievements: checkAchievements(p, kernel),
          player: {
            id: p.id, name: p.getComponent("Identity")?.name || "Unknown",
            realm_id: p.getComponent("Realm")?.realm_id || 1,
            cultivation: p.getComponent("Realm")?.cultivation_value || 0,
            breakthroughs: p.getComponent("Realm")?.breakthroughs || 0,
            breakthroughs_ready: p.getComponent("Realm")?.breakthrough_ready || false,
            breakthrough_bonus: p.getComponent("Realm")?.breakthrough_bonus || 0,
            hp_current: hp.current, hp_max: hp.max,
            stamina_current: stamina.current, stamina_max: stamina.max,
            current_area: p.getComponent("Location")?.area || "area_bamboo_grove",
            inventory: p.getComponent("Inventory")?.items || {},
            age: p.getComponent("Identity")?.age || 0,
            reputation: p.getComponent("Reputation") || { score: 0, title: "无名修士" },
            legacy: p.getComponent("Legacy") || {},
            achievements: getEarnedAchievements(p),
            spiritual_root: p.getComponent("SpiritualRoot") || null,
            constitution: p.getComponent("Constitution") || null,
            cultivation_method: p.getComponent("CultivationMethod") || null,
          }
        });
      }

      case "/api/game/sect/info": {
        const players = kernel.queryEntities("player", {}, 1, 0);
        if (players.length === 0) return send(200, { sect: null, msg: "未加入宗门" });
        const info = getPlayerSectInfo(players[0], kernel);
        if (!info) return send(200, { sect: null, msg: "未加入宗门" });
        return send(200, { sect: info, ok: true });
      }

      case "/api/game/player/resources": {
        const players = kernel.queryEntities("player", {}, 1, 0);
        if (players.length === 0) return send(200, { resources: {} });
        return send(200, { resources: players[0].getComponent("Inventory")?.items || {} });
      }

      case "/api/game/shop/list": {
        const players = kernel.queryEntities("player", {}, 1, 0);
        if (players.length === 0) return send(400, { error: "No player" });
        const area = players[0].getComponent("Location")?.area || "area_bamboo_grove";
        const shop = getShopForRegion(area, kernel);
        return send(200, { shop, area, ok: true });
      }

      // ═══ v2.1 Listing endpoints (GET) ═══
      case "/api/game/quests": {
        return send(200, { quests: getAvailableQuests(kernel) });
      }

      case "/api/game/sect/store": {
        return send(200, { store: Object.entries(SECT_STORE).map(([id,i])=>({id,name:i.name,cost:i.cost,type:i.type,rankReq:i.rankReq})) });
      }

      case "/api/game/alchemy/recipes": {
        return send(200, { recipes: Object.entries(RECIPES).map(([id,r])=>({id,name:r.name,difficulty:r.difficulty,ingredients:r.ingredients.map(h=>HERBS[h]?.name||h),output:r.output})) });
      }

      case "/api/game/alchemy/herbs": {
        return send(200, { herbs: Object.entries(HERBS).map(([id,h])=>({id,name:h.name,grade:h.grade,element:h.element,rarity:h.rarity,value:h.value})) });
      }

      case "/api/game/crafting/recipes": {
        return send(200, { recipes: Object.entries(CRAFTING_RECIPES).map(([id,r])=>({id,name:r.name,skillReq:r.skillReq,output:r.output,materials:r.materials.map(m=>MATERIALS[m]?.name||m)})) });
      }

      case "/api/game/crafting/materials": {
        return send(200, { materials: Object.entries(MATERIALS).map(([id,m])=>({id,name:m.name,grade:m.grade,rarity:m.rarity,value:m.value})) });
      }

      default:
        return null;
    }
  }

  // ── POST ──
  switch (url.pathname) {
    case "/api/game/player/create": {
      const existing = kernel.queryEntities("player", {}, 1, 0);
      if (existing.length > 0) return send(200, { player: existing[0].id, ok: true, existed: true });
      const p = kernel.createEntity("player", {
        Identity: { name: params.name || "修士", age: 20 },
        Realm: { realm_id: 1, cultivation_value: 0.1, breakthroughs: 0 },
        HP: { current: 100, max: 100 },
        Stamina: { current: 100, max: 100 },
        Location: { area: "area_bamboo_grove" },
        Inventory: { items: {} },
      });
      return send(200, { player: p.id, ok: true });
    }

    case "/api/game/cultivate": {
      const players = kernel.queryEntities("player", {}, 1, 0);
      if (players.length === 0) return send(400, { error: "No player" });
      const p = players[0];
      const realm = p.getComponent("Realm") || {};
      const qi = kernel.world.globalState.qi.get("world") || 1.0;
      const mode = params.mode || "normal";
      const use_herb = params.use_herb;

      // Area Qi bonus (higher realm areas = more qi)
      const loc = p.getComponent("Location") || {};
      const areaQi = { area_bamboo_grove:0.8, area_misty_peak:1.0, area_thunder_valley:1.2, area_dragon_vein:1.5 }[loc.area] || 0.8;

      // Stamina check: require minimum stamina to cultivate
      const stamina = p.getComponent("Stamina") || { current: 100, max: 100 };
      const staminaCost = { safe: 2, normal: 3, risky: 5 }[mode] || 3;
      if (stamina.current < staminaCost) return send(200, { msg: `体力不足！需要 ${staminaCost} 体力修炼（当前 ${stamina.current}）`, ok: false });

      if (realm.breakthrough_ready) {
        const bonus = (realm.breakthrough_bonus || 0) + 0.02;
        kernel.updateComponent(p.id, "Realm", { ...realm, breakthrough_bonus: bonus }, p.version);
        kernel.world.tickCount++; sim.tick(kernel.getWorldTime());
        return send(200, { msg: `压制修为...突破成功率 +${(bonus*100).toFixed(0)}%`, ok: true, breakthrough_ready: true, bonus: bonus });
      }

      let herbBonus = 0;
      if (use_herb) {
        const inv = p.getComponent("Inventory") || { items: {} };
        if ((inv.items.spirit_herb || 0) > 0) {
          const up = kernel.getEntity(p.id);
          kernel.updateComponent(up.id, "Inventory", { items: { ...inv.items, spirit_herb: inv.items.spirit_herb - 1 } }, up.version);
          herbBonus = 0.08;
        }
      }

      const modes = {
        safe: { increment: 0.01, qi_mult: 0.5, risk: 0, label: "稳妥修炼" },
        normal: { increment: 0.02, qi_mult: 1.0, risk: 0, label: "普通修炼" },
        risky: { increment: 0.05, qi_mult: 1.0, risk: 0.15, label: "冒险修炼" },
      };
      const m = modes[mode] || modes.normal;
      // Qi multiplier: world qi × area qi × stamina efficiency × cultivation bonus
      const staminaEfficiency = stamina.current > 20 ? 1.0 : 0.5;
      const cultMult = calcCultivationMultiplier(p); // v2.0 — root/constitution/method
      const qiMultiplier = qi * areaQi * staminaEfficiency * cultMult;
      const increment = m.increment * qiMultiplier * m.qi_mult + herbBonus;
      const newCV = Math.min(1.0, (realm.cultivation_value || 0) + increment);

      // Consume stamina
      const upStam = kernel.getEntity(p.id);
      kernel.updateComponent(upStam.id, "Stamina", { ...stamina, current: Math.max(0, stamina.current - staminaCost) }, upStam.version);
      // Risk event: qi deviation
      let riskMsg = "";
      if (m.risk > 0 && Math.random() < m.risk) {
        // Possible risk events
        const roll = Math.random();
        if (roll < 0.4) {
          riskMsg = "走火入魔！真气逆行，经脉受损！（生命-15）";
          const hp = p.getComponent("HP") || { current: 100, max: 100 };
          kernel.updateComponent(p.id, "HP", { ...hp, current: Math.max(1, hp.current - 15) }, p.version + 1);
        } else if (roll < 0.7) {
          riskMsg = "修炼过度，体力透支。（体力-20）";
          const stam = p.getComponent("Stamina") || { current: 100, max: 100 };
          kernel.updateComponent(p.id, "Stamina", { ...stam, current: Math.max(0, stam.current - 20) }, p.version + 1);
        } else {
          riskMsg = "心魔入侵！修行进度倒退...";
          // No cultivation progress this tick
          const newCV2 = Math.max(0, (realm.cultivation_value || 0) - 0.02);
          kernel.updateComponent(p.id, "Realm", { ...realm, cultivation_value: newCV2 }, p.version);
          kernel.world.tickCount++; sim.tick(kernel.getWorldTime());
          return send(200, { msg: riskMsg, ok: true });
        }
      } else if (Math.random() < 0.10) {
        // Positive random event
        const roll = Math.random();
        if (roll < 0.5) riskMsg = "✨ 灵光一闪！修行速度翻倍！";
        else if (roll < 0.8) riskMsg = "✨ 天人感应！悟性提升！";
        else riskMsg = "✨ 气运加身！额外获得真气！";
      }

      if (newCV >= 1.0) {
        kernel.updateComponent(p.id, "Realm", { ...realm, cultivation_value: 1.0, breakthrough_ready: true, breakthrough_bonus: 0 }, p.version);
        kernel.world.tickCount++; sim.tick(kernel.getWorldTime());
        return send(200, { msg: riskMsg || "修为已满！选择: 立刻突破 / 继续压制积蓄力量", ok: true, breakthrough_ready: true });
      }

      kernel.updateComponent(p.id, "Realm", { ...realm, cultivation_value: newCV }, p.version);
      kernel.world.tickCount++; sim.tick(kernel.getWorldTime());
      const pct = (increment*100).toFixed(1);
      const areaLabel = { area_bamboo_grove:"翠竹林",area_misty_peak:"云雾峰",area_thunder_valley:"雷音谷",area_dragon_vein:"龙脉秘境"}[loc.area]||"?";
      return send(200, { msg: riskMsg || `${m.label}... (+${pct}%) 📍${areaLabel} Qi${areaQi} ⚡-${staminaCost}`, ok: true });
    }

    case "/api/game/breakthrough/attempt": {
      const players = kernel.queryEntities("player", {}, 1, 0);
      if (players.length === 0) return send(400, { error: "No player" });
      // Always get fresh entity — auto-tick may have changed version
      let p = kernel.getEntity(players[0].id);
      const realm = p.getComponent("Realm") || {};
      if (!realm.breakthrough_ready) return send(400, { error: "Not ready for breakthrough" });

      let bonusChance = realm.breakthrough_bonus || 0;
      // v2.0: cultivation framework bonus
      const cultResist = calcTribulationResist(p);
      bonusChance += cultResist * 0.005; // each resist point = +0.5% success

      if (params.use_jade) {
        const inv = p.getComponent("Inventory") || { items: {} };
        if ((inv.items.jade_shard || 0) > 0) {
          p = kernel.getEntity(p.id); // refresh
          kernel.updateComponent(p.id, "Inventory", { items: { ...inv.items, jade_shard: inv.items.jade_shard - 1 } }, p.version);
          bonusChance += 0.20;
        }
      }

      const totalChance = Math.min(0.95, 0.30 + bonusChance);
      p = kernel.getEntity(p.id); // refresh before breakthrough
      if (Math.random() < totalChance) {
        kernel.updateComponent(p.id, "Realm", {
          ...realm, realm_id: realm.realm_id + 1, cultivation_value: 0.0,
          breakthrough_ready: false, breakthrough_bonus: 0,
          breakthroughs: (realm.breakthroughs || 0) + 1
        }, p.version);
        return send(200, { msg: `突破成功！境界提升至 Lv${realm.realm_id + 1}！`, ok: true, success: true, chance: totalChance });
      }
      // FAILURE
      kernel.updateComponent(p.id, "Realm", {
        ...realm, cultivation_value: 0.5, breakthrough_ready: false, breakthrough_bonus: 0,
      }, p.version);
      p = kernel.getEntity(p.id); // refresh for HP update
      const hp = p.getComponent("HP") || { current: 100, max: 100 };
      kernel.updateComponent(p.id, "HP", { ...hp, current: Math.max(1, hp.current - 30) }, p.version);
      return send(200, { msg: "突破失败！修为倒退，身受重伤...", ok: true, success: false, chance: totalChance });
    }

    case "/api/game/explore": {
      const players = kernel.queryEntities("player", {}, 1, 0);
      if (players.length === 0) return send(400, { error: "No player" });
      const p = players[0];
      const area = params.area || "area_bamboo_grove";
      const rng = new WorldRandom(kernel.world.tickCount * 7 + process.hrtime()[1]);
      // Move action — just change location
      if (params.action === "move") {
        const id2 = p.getComponent("Identity") || { name:"无名修士" };
        const result = enterRegion(id2, p, area, kernel);
        kernel.world.tickCount++; sim.tick(kernel.getWorldTime());
        return send(200, result);
      }

      // Explore action — encounter generation with variety
      const identity = p.getComponent("Identity") || { name:"无名修士" };
      const result = explore(identity, p, kernel, rng);

      // Enrich result with region context
      const REGION_NAMES = { area_bamboo_grove:"翠竹林",area_misty_peak:"云雾峰",area_thunder_valley:"雷音谷",area_dragon_vein:"龙脉秘境" };
      const REGION_DANGER = { area_bamboo_grove:1,area_misty_peak:3,area_thunder_valley:5,area_dragon_vein:8 };

      // Track exploration count on player
      const meta = p.getComponent("Metadata") || {};
      const explored = (meta.explored||0) + 1;

      // Milestone discovery
      let milestone = null;
      if (explored === 5) milestone = "初涉江湖 — 探索5次！";
      else if (explored === 20) milestone = "老江湖 — 探索20次！";
      else if (explored === 50) milestone = "游历四方 — 探索50次！";
      else if (REGION_DANGER[area] >= 5 && explored === 1) milestone = `首次踏入危险区域 — ${REGION_NAMES[area]}！`;

      kernel.updateComponent(p.id, "Metadata", { ...meta, explored }, p.version);
      kernel.world.tickCount++; sim.tick(kernel.getWorldTime());

      return send(200, {
        ...result,
        region: { id:area, name:REGION_NAMES[area]||area, danger:REGION_DANGER[area]||1 },
        step: explored,
        milestone,
        ok: true
      });
    }

    case "/api/game/move": {
      const players = kernel.queryEntities("player", {}, 1, 0);
      if (players.length === 0) return send(200, { error: "No player" });
      const p = players[0];
      const loc = p.getComponent("Location") || {};
      const x = (loc.x||0) + (params.dx||0);
      const y = (loc.y||0) + (params.dy||0);
      kernel.updateComponent(p.id, "Location", { ...loc, x, y }, p.version);
      kernel.world.tickCount++; sim.tick(kernel.getWorldTime());
      return send(200, { ok:true, x, y, area:loc.area });
    }

    case "/api/game/event/resolve": {
      const eventId = params.eventId;
      const choiceId = params.choice;
      if (!eventId || !choiceId) return send(400, { error: "Need eventId and choice" });
      const exploration = sim.exploration;
      if (!exploration) return send(500, { error: "Exploration system unavailable" });
      // Retrieve event from active events
      const event = exploration.activeEvents.get(eventId);
      if (!event) return send(404, { error: "Event not found or expired" });
      const outcome = exploration.resolveChoice(event, choiceId, kernel);
      // Apply rewards
      if (outcome.success && outcome.reward) {
        const players = kernel.queryEntities("player", {}, 1, 0);
        if (players.length > 0) {
          const p = players[0];
          const inv = p.getComponent("Inventory") || { items: {} };
          const rewards = { ...inv.items };
          if (outcome.reward.spirit_herb) rewards.spirit_herb = (rewards.spirit_herb||0) + outcome.reward.spirit_herb;
          if (outcome.reward.spirit_stone) rewards.spirit_stone = (rewards.spirit_stone||0) + outcome.reward.spirit_stone;
          if (outcome.reward.jade_shard) rewards.jade_shard = (rewards.jade_shard||0) + outcome.reward.jade_shard;
          if (outcome.reward.dragon_scale) rewards.dragon_scale = (rewards.dragon_scale||0) + outcome.reward.dragon_scale;
          if (outcome.reward.ancient_jade) rewards.ancient_jade = (rewards.ancient_jade||0) + outcome.reward.ancient_jade;
          if (outcome.reward.random_item) rewards[outcome.reward.random_item] = (rewards[outcome.reward.random_item]||0) + 1;
          if (outcome.reward.cultivation_bonus) {
            const realm = p.getComponent("Realm") || {};
            kernel.updateComponent(p.id, "Realm", { ...realm, cultivation_value: Math.min(1.0, realm.cultivation_value + outcome.reward.cultivation_bonus) }, p.version);
          }
          const up = kernel.getEntity(p.id);
          kernel.updateComponent(up.id, "Inventory", { items: rewards }, up.version);
        }
        // Apply risk/damage
        if (outcome.risk && outcome.risk.includes("受伤")) {
          const players = kernel.queryEntities("player", {}, 1, 0);
          if (players.length > 0) {
            const p = kernel.getEntity(players[0].id);
            const hp = p.getComponent("HP") || { current: 100, max: 100 };
            kernel.updateComponent(p.id, "HP", { ...hp, current: Math.max(1, hp.current - 30) }, p.version);
          }
        }
      }
      exploration.activeEvents.delete(eventId);
      kernel.world.tickCount++; sim.tick(kernel.getWorldTime());
      return send(200, { outcome, ok: true });
    }

    case "/api/game/rest": {
      const players = kernel.queryEntities("player", {}, 1, 0);
      if (players.length === 0) return send(400, { error: "No player" });
      const p = players[0];
      const stam = p.getComponent("Stamina") || { current: 100, max: 100 };
      const newStam = Math.min(stam.max, stam.current + 30);
      kernel.updateComponent(p.id, "Stamina", { ...stam, current: newStam }, p.version);
      kernel.world.tickCount++; sim.tick(kernel.getWorldTime());
      return send(200, { msg: `休息恢复 +30 体力 (${newStam}/${stam.max})`, ok: true });
    }

    case "/api/game/sect/found": {
      const players = kernel.queryEntities("player", {}, 1, 0);
      if (players.length === 0) return send(400, { error: "No player" });
      const p = players[0];
      const identity = p.getComponent("Identity") || {};
      const name = params.name || `${identity.name || "修士"}宗`;
      const legacy = p.getComponent("Legacy") || {};
      if (legacy.founded_sect) return send(400, { error: "已创立宗门" });
      const sect = kernel.createEntity("sect", {
        Identity: { name, founder: identity.name },
        Members: { count: 1, leader: identity.name },
        Territory: { regions: [p.getComponent("Location")?.area || "area_bamboo_grove"], influence: 30 },
        Power: { strength: 50, reputation: 40 },
        Age: { ticks: 0, era: "新立宗门" },
      });
      kernel.updateComponent(p.id, "Legacy", { ...legacy, founded_sect: name, founded_at_tick: kernel.world.tickCount }, p.version);
      kernel.updateComponent(p.id, "SectMembership", { sect_name: name, rank: "master", contribution: 0, joined_at: kernel.world.tickCount }, p.version + 1);
      const rep = p.getComponent("Reputation") || { score: 0, title: "无名修士" };
      kernel.updateComponent(p.id, "Reputation", { ...rep, score: (rep.score||0) + 50, title: `${name} 宗主` }, p.version + 1);
      kernel.world.tickCount++; sim.tick(kernel.getWorldTime());
      return send(200, { msg: `宗门 "${name}" 创立成功！`, sect_id: sect.id, ok: true });
    }

    case "/api/game/combat/start": {
      const players = kernel.queryEntities("player", {}, 1, 0);
      if (players.length === 0) return send(400, { error: "No player" });
      const p = players[0];
      const targets = kernel.queryEntities("npc", {}, 10, 0);
      if (targets.length === 0) return send(400, { error: "No NPCs nearby" });
      const target = targets[0];
      const combat = sim.engine?.combat;
      if (!combat) return send(500, { error: "Combat engine offline" });
      const battle = combat.startBattle(p, target, kernel);
      const targetName = (target.getComponent("Identity")||{}).name || "NPC";
      return send(200, { battle, target_name: targetName, msg: `与 ${targetName} 的战斗开始！`, ok: true });
    }

    case "/api/game/combat/action": {
      const battleId = params.battleId;
      const action = params.action || "attack";
      const skillId = params.skill || null;
      if (!battleId) return send(400, { error: "Need battleId" });
      const combat = sim.engine?.combat;
      if (!combat) return send(500, { error: "Combat engine offline" });
      const result = combat.processAction(battleId, action, kernel);
      if (!result) return send(404, { error: "Battle not found" });
      const lastLog = result.log[result.log.length - 1] || {};
      kernel.world.tickCount++; sim.tick(kernel.getWorldTime());
      return send(200, {
        battle: result,
        lastAction: lastLog,
        msg: lastLog.message || "",
        ok: true,
      });
    }

    case "/api/game/shop/buy": {
      const players = kernel.queryEntities("player", {}, 1, 0);
      if (players.length === 0) return send(400, { error: "No player" });
      const itemId = params.item;
      if (!itemId) return send(400, { error: "Need item" });
      const result = shopBuy(players[0], itemId, kernel);
      if (result.error) return send(400, result);
      kernel.world.tickCount++; sim.tick(kernel.getWorldTime());
      return send(200, result);
    }

    case "/api/game/shop/sell": {
      const players = kernel.queryEntities("player", {}, 1, 0);
      if (players.length === 0) return send(400, { error: "No player" });
      const itemId = params.item;
      if (!itemId) return send(400, { error: "Need item" });
      const result = shopSell(players[0], itemId, kernel);
      if (result.error) return send(400, result);
      kernel.world.tickCount++; sim.tick(kernel.getWorldTime());
      return send(200, result);
    }

    case "/api/game/dialogue": {
      const players = kernel.queryEntities("player", {}, 1, 0);
      if (players.length === 0) return send(400, { error: "No player" });
      const p = players[0];
      const npcs = kernel.queryEntities("npc", {}, 10, 0);
      if (npcs.length === 0) return send(400, { error: "No NPCs" });
      const npc = npcs[0];
      const topic = params.topic || "greeting";
      const text = generateConversation(npc, p, topic, kernel);
      const npcName = (npc.getComponent("Identity")||{}).name || "NPC";
      kernel.world.tickCount++; sim.tick(kernel.getWorldTime());
      return send(200, { npc: npcName, topic, text, ok: true });
    }

    case "/api/game/sect/join": {
      const players = kernel.queryEntities("player", {}, 1, 0);
      if (players.length === 0) return send(400, { error: "No player" });
      const sects = kernel.queryEntities("sect", {}, 10, 0);
      if (sects.length === 0) return send(400, { error: "世界尚无宗门" });
      const sectName = params.name || (sects[0].getComponent("Identity")||{}).name;
      const result = joinSect(players[0], sectName, kernel);
      if (result.error) return send(400, result);
      kernel.world.tickCount++; sim.tick(kernel.getWorldTime());
      return send(200, result);
    }

    case "/api/game/sect/leave": {
      const players = kernel.queryEntities("player", {}, 1, 0);
      if (players.length === 0) return send(400, { error: "No player" });
      const result = leaveSect(players[0], kernel);
      if (result.error) return send(400, result);
      kernel.world.tickCount++; sim.tick(kernel.getWorldTime());
      return send(200, result);
    }

    case "/api/game/sect/mission": {
      const players = kernel.queryEntities("player", {}, 1, 0);
      if (players.length === 0) return send(400, { error: "No player" });
      const missionType = params.mission || "cultivate";
      const result = completeMission(players[0], missionType, kernel);
      kernel.world.tickCount++; sim.tick(kernel.getWorldTime());
      return send(200, result);
    }

    case "/api/game/sect/store": {
      return send(200, { store: Object.entries(SECT_STORE).map(([id,i])=>({id,name:i.name,cost:i.cost,type:i.type,rankReq:i.rankReq})) });
    }

    case "/api/game/sect/store/buy": {
      const players = kernel.queryEntities("player", {}, 1, 0);
      if (players.length === 0) return send(400, { error: "No player" });
      const result = buyFromSectStore(players[0], params.item, kernel);
      if (result.error) return send(400, result);
      kernel.world.tickCount++; sim.tick(kernel.getWorldTime());
      return send(200, result);
    }

    case "/api/game/sect/deposit": {
      const players = kernel.queryEntities("player", {}, 1, 0);
      if (players.length === 0) return send(400, { error: "No player" });
      const result = depositToTreasury(players[0], params.resource, params.amount || 1, kernel);
      if (result.error) return send(400, result);
      kernel.world.tickCount++; sim.tick(kernel.getWorldTime());
      return send(200, result);
    }

    case "/api/game/gather": {
      const players = kernel.queryEntities("player", {}, 1, 0);
      if (players.length === 0) return send(400, { error: "No player" });
      const p = players[0];
      const inv = p.getComponent("Inventory") || { items: {} };
      const resource = params.resource || "spirit_herb";
      const current = inv.items[resource] || 0;
      const up = kernel.getEntity(p.id);
      kernel.updateComponent(up.id, "Inventory", { items: { ...inv.items, [resource]: current + 1 } }, up.version);
      kernel.world.tickCount++; sim.tick(kernel.getWorldTime());
      return send(200, { resource, count: current + 1, ok: true });
    }

    case "/api/game/rejoin": {
      const players = kernel.queryEntities("player", {}, 1, 0);
      if (players.length === 0) return send(400, { error: "No player" });
      const p = players[0];
      const loc = p.getComponent("Location") || {};
      const lastTick = loc.last_active_tick || 0;
      const currentTick = kernel.getTickCount();
      const elapsed = currentTick - lastTick;

      // Mark player as active now
      kernel.updateComponent(p.id, "Location", { ...loc, last_active_tick: currentTick }, p.version);

      // Generate world change summary
      const events = kernel.getEventLog(lastTick);
      const npcEvents = events.filter(e => e.type === "EntityUpdated");
      const breakthroughs = events.filter(e => e.payload?.component === "Realm" && e.payload?.newValue?.realm_id > (e.payload?.oldValue?.realm_id || 0)).length;

      // Count NPC state changes
      const npcs = kernel.queryEntities("npc", {}, 100, 0);
      const npcSummary = npcs.map(n => {
        const id = n.getComponent("Identity");
        const realm = n.getComponent("Realm");
        return { name: id?.name || "?", realm: realm?.realm_id || 0, breakthroughs: realm?.breakthroughs || 0 };
      });

      const summary = {
        elapsed_ticks: elapsed,
        time_passed: `${elapsed} 天`,
        total_new_events: events.length,
        npc_breakthroughs: breakthroughs,
        current_npcs: npcSummary,
        world_state: {
          tick: currentTick,
          weather: kernel.world.globalState.weather.get("world"),
          qi: kernel.world.globalState.qi.get("world"),
        },
      };

      return send(200, { msg: `你离开了 ${elapsed} 天。世界已经改变。`, summary, ok: true });
    }

    // ═══ Equipment API (v2.1) ═══
    case "/api/game/equipment/view": {
      const players = kernel.queryEntities("player", {}, 1, 0);
      if (players.length === 0) return send(400, { error: "No player" });
      const eq = players[0].getComponent("Equipment") || { slots:{},equipped:[] };
      return send(200, { equipment: eq, slots: eq.slots, modifiers: getEquipmentModifiers(players[0]) });
    }

    case "/api/game/equipment/equip": {
      const players = kernel.queryEntities("player", {}, 1, 0);
      if (players.length === 0) return send(400, { error: "No player" });
      const item = params.item;
      if (!item) return send(400, { error: "Need item" });
      const result = equipItem(players[0], item, kernel);
      if (result.error) return send(400, result);
      kernel.world.tickCount++; sim.tick(kernel.getWorldTime());
      return send(200, result);
    }

    case "/api/game/equipment/unequip": {
      const players = kernel.queryEntities("player", {}, 1, 0);
      if (players.length === 0) return send(400, { error: "No player" });
      const slot = params.slot;
      if (!slot) return send(400, { error: "Need slot" });
      const result = unequipItem(players[0], slot, kernel);
      if (result.error) return send(400, result);
      kernel.world.tickCount++; sim.tick(kernel.getWorldTime());
      return send(200, result);
    }

    case "/api/game/equipment/enhance": {
      const players = kernel.queryEntities("player", {}, 1, 0);
      if (players.length === 0) return send(400, { error: "No player" });
      const rng = new WorldRandom(42);
      const result = enhanceEquipment(players[0], params.slot, kernel, rng);
      if (result.error) return send(400, result);
      kernel.world.tickCount++; sim.tick(kernel.getWorldTime());
      return send(200, result);
    }

    case "/api/game/equipment/generate": {
      const players = kernel.queryEntities("player", {}, 1, 0);
      if (players.length === 0) return send(400, { error: "No player" });
      const realm = players[0].getComponent("Realm")?.realm_id || 1;
      const rng = new WorldRandom(42);
      const items = generateLoot(kernel, params.source || "explore", realm, rng);
      return send(200, { items, count: items.length });
    }

    // ═══ Alchemy API (v2.1 Sprint 5) ═══
    case "/api/game/alchemy/recipes": {
      return send(200, { recipes: Object.entries(RECIPES).map(([id,r])=>({id,name:r.name,difficulty:r.difficulty,ingredients:r.ingredients.map(h=>HERBS[h]?.name||h),output:r.output})) });
    }

    case "/api/game/alchemy/herbs": {
      return send(200, { herbs: Object.entries(HERBS).map(([id,h])=>({id,name:h.name,grade:h.grade,element:h.element,rarity:h.rarity,value:h.value})) });
    }

    case "/api/game/alchemy/refine": {
      const players = kernel.queryEntities("player", {}, 1, 0);
      if (players.length === 0) return send(400, { error: "No player" });
      const rng = new WorldRandom(42);
      const result = refinePill(params.recipe, players[0], kernel, rng);
      if (result.error) return send(400, result);
      kernel.world.tickCount++; sim.tick(kernel.getWorldTime());
      return send(200, result);
    }

    case "/api/game/alchemy/consume": {
      const players = kernel.queryEntities("player", {}, 1, 0);
      if (players.length === 0) return send(400, { error: "No player" });
      const result = consumePill(players[0], params.pill, kernel);
      if (result.error) return send(400, result);
      kernel.world.tickCount++; sim.tick(kernel.getWorldTime());
      return send(200, result);
    }

    case "/api/game/alchemy/gather": {
      const players = kernel.queryEntities("player", {}, 1, 0);
      if (players.length === 0) return send(400, { error: "No player" });
      const rng = new WorldRandom(42);
      const area = players[0].getComponent("Location")?.area || "area_bamboo_grove";
      const region = { area_bamboo_grove:"forest", area_misty_peak:"mountain", area_thunder_valley:"storm", area_dragon_vein:"ancient" }[area] || "forest";
      const herb = gatherHerb(players[0], params.herb, region, kernel, rng);
      if (!herb) return send(200, { empty: true, msg: "没有找到药材" });
      kernel.world.tickCount++; sim.tick(kernel.getWorldTime());
      return send(200, herb);
    }

    // ═══ Crafting API (v2.1 Sprint 6) ═══
    case "/api/game/crafting/recipes": {
      return send(200, { recipes: Object.entries(CRAFTING_RECIPES).map(([id,r])=>({id,name:r.name,skillReq:r.skillReq,output:r.output,materials:r.materials.map(m=>MATERIALS[m]?.name||m)})) });
    }

    case "/api/game/crafting/materials": {
      return send(200, { materials: Object.entries(MATERIALS).map(([id,m])=>({id,name:m.name,grade:m.grade,rarity:m.rarity,value:m.value})) });
    }

    case "/api/game/crafting/forge": {
      const players = kernel.queryEntities("player", {}, 1, 0);
      if (players.length === 0) return send(400, { error: "No player" });
      const rng = new WorldRandom(42);
      const result = forgeEquipment(params.recipe, players[0], kernel, rng);
      if (result.error) return send(400, result);
      kernel.world.tickCount++; sim.tick(kernel.getWorldTime());
      return send(200, result);
    }

    case "/api/game/crafting/enchant": {
      const players = kernel.queryEntities("player", {}, 1, 0);
      if (players.length === 0) return send(400, { error: "No player" });
      const rng = new WorldRandom(42);
      const result = enchantEquipment(players[0], params.slot, kernel, rng);
      if (result.error) return send(400, result);
      kernel.world.tickCount++; sim.tick(kernel.getWorldTime());
      return send(200, result);
    }

    case "/api/game/crafting/ascend": {
      const players = kernel.queryEntities("player", {}, 1, 0);
      if (players.length === 0) return send(400, { error: "No player" });
      const rng = new WorldRandom(42);
      const result = ascendEquipment(players[0], params.slot, kernel, rng);
      if (result.error) return send(400, result);
      kernel.world.tickCount++; sim.tick(kernel.getWorldTime());
      return send(200, result);
    }

    // ═══ Quest API (v2.1 Sprint 8) ═══
    case "/api/game/quests": {
      return send(200, { quests: getAvailableQuests(kernel) });
    }

    case "/api/game/quest/accept": {
      const players = kernel.queryEntities("player", {}, 1, 0);
      if (players.length === 0) return send(400, { error: "No player" });
      const result = acceptQuest(players[0], params.questId, kernel);
      if (result.error) return send(400, result);
      kernel.world.tickCount++; sim.tick(kernel.getWorldTime());
      return send(200, result);
    }

    case "/api/game/quest/complete": {
      const players = kernel.queryEntities("player", {}, 1, 0);
      if (players.length === 0) return send(400, { error: "No player" });
      const rng = new WorldRandom(42);
      const result = completeQuest(players[0], params.questId, kernel, rng);
      if (result.error) return send(400, result);
      kernel.world.tickCount++; sim.tick(kernel.getWorldTime());
      return send(200, result);
    }

    default:
      return null;
  }
}
