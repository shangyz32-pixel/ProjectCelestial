// web/routes/core.js
// Core observation APIs — world, npcs, events, entities, systems, perf, snapshots, alerts

export function registerCoreRoutes(kernel, sim, snap, history, config, send, url) {

  switch (url.pathname) {
    case "/api/world": {
      const t = kernel.getWorldTime();
      return send(200, {
        world_id: kernel.world.id, seed: config.world.seed,
        tick: kernel.getTickCount(),
        time: `天历${t.year}-${t.month}-${t.day} ${t.day_phase}`,
        season: t.season, era: t.era,
        weather: kernel.world.globalState.weather.get("world"),
        qi: kernel.world.globalState.qi.get("world"),
        entities: kernel.world.entities.size,
        npcs: kernel.queryEntities("npc", {}, 100, 0).length,
        beasts: kernel.queryEntities("spirit_beast", {}, 1000, 0).length,
        animals: kernel.queryEntities("animal", {}, 1000, 0).length,
        plants: kernel.queryEntities("plant", {}, 1000, 0).length,
        monsters: kernel.queryEntities("monster", {}, 1000, 0).length,
        snapshots: snap ? snap.list().length : 0,
        sim_state: sim ? sim.state : "unknown",
      });
    }

    case "/api/npcs": {
      const npcs = kernel.queryEntities("npc", {}, 100, 0);
      return send(200, npcs.map(n => {
        const identity = n.getComponent("Identity");
        const realm = n.getComponent("Realm");
        const hp = n.getComponent("HP");
        const stamina = n.getComponent("Stamina");
        return {
          id: n.id,
          name: identity ? identity.name : "Unknown",
          age: identity ? identity.age : 0,
          realm_id: realm ? realm.realm_id : 0,
          cultivation: realm ? realm.cultivation_value.toFixed(4) : "0",
          breakthroughs: realm ? realm.breakthroughs : 0,
          hp_current: hp ? hp.current : 100,
          hp_max: hp ? hp.max : 100,
          stamina_current: stamina ? stamina.current : 100,
          stamina_max: stamina ? stamina.max : 100,
          state: n.state,
          version: n.version,
        };
      }));
    }

    case "/api/events": {
      const from = parseInt(url.searchParams.get("from") || "0");
      const limit = parseInt(url.searchParams.get("limit") || "50");
      const events = kernel.getEventLog(from).slice(-limit);
      return send(200, events.map(e => ({
        eventId: e.eventId, tick: e.tick, type: e.type,
        target: e.target, payload: e.payload,
      })));
    }

    case "/api/history": {
      return send(200, history ? history.getEntries() : []);
    }

    case "/api/hash": {
      const h = history || { computeHash: () => "n/a" };
      return send(200, {
        history_hash: h.computeHash(),
        event_count: kernel.getEventLog(0).length,
        tick: kernel.getTickCount(),
      });
    }

    case "/api/diff": {
      const from = url.searchParams.get("from") || "";
      const to = url.searchParams.get("to") || "";
      if (!from || !to) return send(400, { error: "Need from and to snapshot IDs" });
      const s1 = snap.load(from), s2 = snap.load(to);
      if (!s1 || !s2) return send(404, { error: "Snapshot not found" });
      const added = [], removed = [];
      const e1 = new Set((s1.world_state.entities||[]).map(e=>e.id));
      const e2 = new Set((s2.world_state.entities||[]).map(e=>e.id));
      for (const id of e2) if (!e1.has(id)) added.push(id);
      for (const id of e1) if (!e2.has(id)) removed.push(id);
      return send(200, {
        from_tick: s1.tick, to_tick: s2.tick,
        entities_from: e1.size, entities_to: e2.size,
        added, removed, tick_diff: s2.tick - s1.tick,
      });
    }

    case "/api/world_diff": {
      const from = url.searchParams.get("from") || "", to = url.searchParams.get("to") || "";
      if (!from || !to) return send(400, { error: "Need from and to snapshot IDs" });
      const s1 = snap.load(from), s2 = snap.load(to);
      if (!s1 || !s2) return send(404, { error: "Snapshot not found" });
      const changed = [], e1map = {}, e2map = {};
      for (const e of (s1.world_state.entities||[])) e1map[e.id] = e;
      for (const e of (s2.world_state.entities||[])) e2map[e.id] = e;
      for (const id of new Set([...Object.keys(e1map), ...Object.keys(e2map)])) {
        if (!e1map[id]) { changed.push({ id, change: "added" }); continue; }
        if (!e2map[id]) { changed.push({ id, change: "removed" }); continue; }
        if (e1map[id].version !== e2map[id].version) changed.push({ id, change: "modified", v1: e1map[id].version, v2: e2map[id].version });
      }
      return send(200, { from_tick: s1.tick, to_tick: s2.tick, changed: changed.slice(0, 100), total_changes: changed.length });
    }

    case "/api/alerts": {
      const alerts = [];
      const mem = process.memoryUsage();
      if (mem.heapUsed / 1024 / 1024 > 500) alerts.push({ level: "warn", msg: "Memory > 500MB" });
      const events = kernel.getEventLog(0);
      if (events.length > 1000000) alerts.push({ level: "warn", msg: "Event log > 1M entries" });
      return send(200, { alerts: alerts.length ? alerts : [{ level: "info", msg: "All systems normal" }] });
    }

    case "/api/snapshots":
      return send(200, { list: snap ? snap.list() : [] });

    case "/api/entities": {
      const type = url.searchParams.get("type") || null;
      const search = url.searchParams.get("search") || "";
      const limit = parseInt(url.searchParams.get("limit") || "100");
      const all = [...kernel.world.entities.values()]
        .filter(e => (!type || e.type === type) && (!search || e.id.includes(search)));
      return send(200, all.slice(0, limit).map(e => ({
        id: e.id, type: e.type, version: e.version, state: e.state,
        components: Object.keys(Object.fromEntries(e.components)),
        compCount: e.components.size, createdAt: e.createdAt,
      })));
    }

    case "/api/entity": {
      const id = url.searchParams.get("id") || "";
      const e = kernel.getEntity(id);
      if (!e) return send(404, { error: "Entity not found" });
      return send(200, { id: e.id, type: e.type, version: e.version, state: e.state, components: Object.fromEntries(e.components), createdAt: e.createdAt });
    }

    case "/api/systems":
      return send(200, {
        systems: ["time","weather","qi","npc","economy","faction","war","events","snapshot"].map(n => ({ name: n, status: "active" })),
        sim_state: sim ? sim.state : "unknown",
      });

    case "/api/perf": {
      const mem = process.memoryUsage();
      return send(200, {
        tick: kernel.getTickCount(), entities: kernel.world.entities.size,
        npcs: kernel.queryEntities("npc", {}, 100, 0).length,
        events: kernel.getEventLog(0).length,
        snapshots: snap ? snap.list().length : 0,
        memory_mb: Math.round(mem.heapUsed / 1024 / 1024),
        uptime: process.uptime().toFixed(0),
      });
    }

    case "/api/transactions":
      return send(200, {
        active: kernel.txManager ? kernel.txManager.activeTransactions.size : 0,
        event_log_size: kernel.getEventLog(0).length,
      });

    default:
      return null; // not handled by core routes
  }
}
