// =============================================================
// Ficheiro: ws.js
// Descrição: Módulo para gerir WebSocket no backend do sistema IoT.
// Utilidade: Permite enviar atualizações em tempo real para o frontend sempre que há novas medições.
// =============================================================
const WebSocket = require('ws');
let wss;
const clients = new Set();

function setupWebSocket(server) {
  wss = new WebSocket.Server({ server });
  wss.on('connection', (ws) => {
    clients.add(ws);
    ws.on('close', () => clients.delete(ws));
  });
}

function broadcastMedicion(medicion) {
  if (!wss) return;
  const msg = JSON.stringify({ type: 'medicion', data: medicion });
  for (const ws of clients) {
    if (ws.readyState === WebSocket.OPEN) ws.send(msg);
  }
}

module.exports = { setupWebSocket, broadcastMedicion };
