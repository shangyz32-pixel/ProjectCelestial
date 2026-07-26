// web/ws.js — WebSocket real-time sync
// Connects to existing HTTP server, pushes world state to clients.
// No polling. Server is the single source of truth.

import { WebSocketServer } from 'ws';

export function createWSServer(httpServer, kernel, sim) {
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  const clients = new Set();

  wss.on('connection', (ws) => {
    clients.add(ws);
    // Send initial state
    ws.send(JSON.stringify(buildState(kernel, sim)));

    ws.on('close', () => clients.delete(ws));
  });

  // Push state every 2 seconds to all clients
  const pushInterval = setInterval(() => {
    const state = buildState(kernel, sim);
    const msg = JSON.stringify(state);
    for (const ws of clients) {
      if (ws.readyState === 1) ws.send(msg);
    }
  }, 2000);

  return {
    wss,
    broadcast(data) {
      const msg = JSON.stringify(data);
      for (const ws of clients) {
        if (ws.readyState === 1) ws.send(msg);
      }
    },
    getClients() { return clients; },
    stop() { clearInterval(pushInterval); wss.close(); },
  };
}

function buildState(kernel, sim) {
  const w = kernel.world;
  const players = kernel.queryEntities('player', {}, 1, 0);
  const npcs = kernel.queryEntities('npc', {}, 10, 0);
  const monsters = kernel.queryEntities('monster', {}, 20, 0);

  return {
    tick: w.tickCount,
    entities: w.entities.size,
    weather: w.globalState.weather.get('world'),
    qi: parseFloat((w.globalState.qi.get('world') || 0).toFixed(2)),
    // Player
    player: players[0] ? serializeEntity(players[0]) : null,
    // NPCs
    npcs: npcs.filter(n => n.state === 'active').map(serializeEntity),
    // Monsters (alive only)
    monsters: monsters.filter(m => m.state !== 'dead').map(serializeEntity),
    // World stats
    plants: countByType(w, 'plant'),
    animals: countByType(w, 'animal'),
    beasts: countByType(w, 'spirit_beast'),
  };
}

function serializeEntity(entity) {
  if (!entity) return null;
  return {
    id: entity.id, type: entity.type, state: entity.state,
    name: (entity.getComponent('Identity') || {}).name || entity.id,
    area: (entity.getComponent('Location') || {}).area,
    hp: (entity.getComponent('HP') || {}).current || 0,
    hpMax: (entity.getComponent('HP') || {}).max || 0,
    realm: (entity.getComponent('Realm') || {}).realm_id || 1,
    combat: entity.getComponent('Combat') || {},
    element: (entity.getComponent('SpiritualRoot') || {}).element,
    behavior: entity.getComponent('Behavior') || {},
    loot: entity.getComponent('LootTable') || entity.getComponent('Loot') || {},
  };
}

function countByType(world, entityType) {
  let count = 0;
  for (const [, e] of world.entities) {
    if (e.type === entityType && e.state !== 'dead') count++;
  }
  return count;
}
