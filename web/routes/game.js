// web/routes/game.js
// Gameplay APIs — player lifecycle, cultivation, exploration, gathering

export function registerGameRoutes(kernel, sim, send, url, params) {

  // ── GET ──
  if (!params) {
    switch (url.pathname) {
      case "/api/game/areas":
        return send(200, {
          areas: [
            { id: "area_bamboo_grove", name: "翠竹林", desc: "灵气稀薄的新手区", qi: 0.8, req_realm: 0, resources: ["spirit_herb"], unlocked: true },
            { id: "area_misty_peak", name: "云雾峰", desc: "山间灵气渐浓", qi: 1.0, req_realm: 3, resources: ["spirit_herb", "jade_shard"], unlocked: false },
            { id: "area_thunder_valley", name: "雷音谷", desc: "雷属性灵气充沛", qi: 1.2, req_realm: 6, resources: ["thunder_ore", "spirit_herb"], unlocked: false },
            { id: "area_dragon_vein", name: "龙脉秘境", desc: "上古龙脉所在", qi: 1.5, req_realm: 9, resources: ["dragon_scale", "ancient_jade"], unlocked: false },
          ]
        });

      case "/api/game/player": {
        const players = kernel.queryEntities("player", {}, 1, 0);
        if (players.length === 0) return send(200, { player: null });
        const p = players[0];
        const hp = p.getComponent("HP") || { current: 100, max: 100 };
        const stamina = p.getComponent("Stamina") || { current: 100, max: 100 };
        return send(200, {
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
          }
        });
      }

      case "/api/game/player/resources": {
        const players = kernel.queryEntities("player", {}, 1, 0);
        if (players.length === 0) return send(200, { resources: {} });
        return send(200, { resources: players[0].getComponent("Inventory")?.items || {} });
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
      const increment = m.increment * qi * m.qi_mult + herbBonus;
      const newCV = Math.min(1.0, (realm.cultivation_value || 0) + increment);

      let riskMsg = "";
      if (m.risk > 0 && Math.random() < m.risk) {
        const hp = p.getComponent("HP") || { current: 100, max: 100 };
        kernel.updateComponent(p.id, "HP", { ...hp, current: Math.max(1, hp.current - 15) }, p.version + 1);
        riskMsg = "走火入魔！真气逆行，受伤！";
      }

      if (newCV >= 1.0) {
        kernel.updateComponent(p.id, "Realm", { ...realm, cultivation_value: 1.0, breakthrough_ready: true, breakthrough_bonus: 0 }, p.version);
        kernel.world.tickCount++; sim.tick(kernel.getWorldTime());
        return send(200, { msg: riskMsg || "修为已满！选择: 立刻突破 / 继续压制积蓄力量", ok: true, breakthrough_ready: true });
      }

      kernel.updateComponent(p.id, "Realm", { ...realm, cultivation_value: newCV }, p.version);
      kernel.world.tickCount++; sim.tick(kernel.getWorldTime());
      return send(200, { msg: riskMsg || `${m.label}... (+${(increment*100).toFixed(1)}%)`, ok: true });
    }

    case "/api/game/breakthrough/attempt": {
      const players = kernel.queryEntities("player", {}, 1, 0);
      if (players.length === 0) return send(400, { error: "No player" });
      const p = players[0];
      const realm = p.getComponent("Realm") || {};
      if (!realm.breakthrough_ready) return send(400, { error: "Not ready for breakthrough" });

      let bonusChance = realm.breakthrough_bonus || 0;
      if (params.use_jade) {
        const inv = p.getComponent("Inventory") || { items: {} };
        if ((inv.items.jade_shard || 0) > 0) {
          const up = kernel.getEntity(p.id);
          kernel.updateComponent(up.id, "Inventory", { items: { ...inv.items, jade_shard: inv.items.jade_shard - 1 } }, up.version);
          bonusChance += 0.20;
        }
      }

      const totalChance = Math.min(0.95, 0.30 + bonusChance);
      if (Math.random() < totalChance) {
        kernel.updateComponent(p.id, "Realm", {
          ...realm, realm_id: realm.realm_id + 1, cultivation_value: 0.0,
          breakthrough_ready: false, breakthrough_bonus: 0,
          breakthroughs: (realm.breakthroughs || 0) + 1
        }, p.version);
        return send(200, { msg: `突破成功！境界提升至 Lv${realm.realm_id + 1}！`, ok: true, success: true, chance: totalChance });
      }
      kernel.updateComponent(p.id, "Realm", {
        ...realm, cultivation_value: 0.5, breakthrough_ready: false, breakthrough_bonus: 0,
      }, p.version);
      const hp = p.getComponent("HP") || { current: 100, max: 100 };
      kernel.updateComponent(p.id, "HP", { ...hp, current: Math.max(1, hp.current - 30) }, p.version + 1);
      return send(200, { msg: "突破失败！修为倒退，身受重伤...", ok: true, success: false, chance: totalChance });
    }

    case "/api/game/explore": {
      const players = kernel.queryEntities("player", {}, 1, 0);
      if (players.length === 0) return send(400, { error: "No player" });
      const p = players[0];
      kernel.updateComponent(p.id, "Location", { area: params.area || "area_bamboo_grove" }, p.version);
      kernel.world.tickCount++; sim.tick(kernel.getWorldTime());
      return send(200, { area: params.area, ok: true });
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

    default:
      return null;
  }
}
