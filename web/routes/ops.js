// web/routes/ops.js
// Operations APIs — tick, snapshot, npc management, simulation control

export function registerOpsRoutes(kernel, sim, snap, send, params) {

  switch (params ? url_path(params) : "") {
    case "/api/tick/advance": {
      const count = params.count || 1;
      for (let i = 0; i < count; i++) {
        kernel.world.tickCount++;
        sim.tick(kernel.getWorldTime());
      }
      return send(200, { tick: kernel.getTickCount(), ok: true });
    }

    case "/api/snapshot/take": {
      const s = snap.take();
      return send(200, { snapshot_id: s.snapshot_id, tick: s.tick, ok: true });
    }

    case "/api/snapshot/load": {
      snap.restore(params.snapshot_id);
      return send(200, { tick: kernel.getTickCount(), ok: true });
    }

    case "/api/npc/create": {
      const npc = kernel.createEntity("npc", {
        Identity: { name: params.name || "New NPC", age: params.age || 20 },
        Realm: { realm_id: params.realm || 1, cultivation_value: 0.1, breakthroughs: 0 },
        HP: { current: 100, max: 100 },
        Stamina: { current: 100, max: 100 },
      });
      return send(200, { id: npc.id, ok: true });
    }

    case "/api/sim/pause":
      sim.pause();
      return send(200, { state: sim.state, ok: true });

    case "/api/sim/resume":
      sim.resume();
      return send(200, { state: sim.state, ok: true });

    default:
      return null;
  }
}

function url_path(params) { return null; }
