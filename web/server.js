// web/server.js
// World Observer — thin HTTP router.
// Delegates to route modules. Browser NEVER simulates.

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { registerCoreRoutes } from "./routes/core.js";
import { registerGameRoutes } from "./routes/game.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createObserverServer(kernel, sim, snap, history, config) {
  const server = http.createServer(async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") { res.writeHead(204); res.end(); return; }

    const url = new URL(req.url, "http://localhost");
    const send = (code, data) => { res.writeHead(code, {"Content-Type":"application/json"}); res.end(JSON.stringify(data)); };

    try {
      // ── Static files ──
      if (req.method === "GET" && (!url.pathname.startsWith("/api/") || url.pathname === "/")) {
        let filePath = url.pathname === "/" ? "/game.html" : url.pathname;
        const fullPath = path.join(__dirname, "public", filePath);
        if (fs.existsSync(fullPath)) {
          const ext = path.extname(fullPath);
          const mime = { ".html":"text/html", ".js":"text/javascript", ".css":"text/css" };
          res.writeHead(200, {"Content-Type": mime[ext] || "text/plain"});
          res.end(fs.readFileSync(fullPath));
          return;
        }
        res.writeHead(404); res.end("Not Found"); return;
      }

      // ── GET: delegate to core + game routes ──
      if (req.method === "GET") {
        let result = registerCoreRoutes(kernel, sim, snap, history, config, send, url);
        if (result === null) result = registerGameRoutes(kernel, sim, send, url, null);
        if (result === null) return send(404, { error: "Not Found" });
        return;
      }

      // ── POST: delegate to game + ops routes ──
      if (req.method === "POST") {
        const body = await new Promise(r => { let d=""; req.on("data",c=>d+=c); req.on("end",()=>r(d)); });
        const params = body ? JSON.parse(body) : {};

        // Ops routes (tick, snapshot, npc, sim)
        switch (url.pathname) {
          case "/api/tick/advance": {
            const count = params.count || 1;
            for (let i = 0; i < count; i++) { kernel.world.tickCount++; sim.tick(kernel.getWorldTime()); }
            return send(200, { tick: kernel.getTickCount(), ok: true });
          }
          case "/api/snapshot/take": {
            const s = snap.take(); return send(200, { snapshot_id: s.snapshot_id, tick: s.tick, ok: true });
          }
          case "/api/snapshot/load": {
            snap.restore(params.snapshot_id); return send(200, { tick: kernel.getTickCount(), ok: true });
          }
          case "/api/npc/create": {
            const npc = kernel.createEntity("npc", {
              Identity: { name: params.name || "New NPC", age: params.age || 20 },
              Realm: { realm_id: params.realm || 1, cultivation_value: 0.1, breakthroughs: 0 },
              HP: { current: 100, max: 100 }, Stamina: { current: 100, max: 100 },
            });
            return send(200, { id: npc.id, ok: true });
          }
          case "/api/sim/pause": { sim.pause(); return send(200, { state: sim.state, ok: true }); }
          case "/api/sim/resume": { sim.resume(); return send(200, { state: sim.state, ok: true }); }
        }

        // Game routes
        let result = registerGameRoutes(kernel, sim, send, url, params);
        if (result === null) return send(404, { error: "Not Found" });
        return;
      }
    } catch (err) {
      send(500, { error: err.message });
    }
  });

  return server;
}
