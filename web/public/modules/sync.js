// public/modules/sync.js
// WebSocket real-time sync — replaces polling.
// Server pushes world state every 2 seconds.
// Client receives and updates game state.

export function createSync(url, onState) {
  let ws = null, reconnectTimer = null;

  function connect() {
    if (ws && ws.readyState < 2) return;
    try {
      ws = new WebSocket(url);
      ws.onmessage = (e) => {
        try { const state = JSON.parse(e.data); onState(state); } catch (_) { }
      };
      ws.onclose = () => { reconnectTimer = setTimeout(connect, 3000); };
      ws.onerror = () => ws.close();
    } catch (_) { reconnectTimer = setTimeout(connect, 3000); }
  }

  connect();
  return {
    close() { clearTimeout(reconnectTimer); if (ws) ws.close(); },
    get socket() { return ws; },
  };
}
