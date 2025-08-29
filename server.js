// =============================================================
// Ficheiro: server.js
// Descrição: Servidor principal Express para o backend do sistema IoT.
// Utilidade: Gera a API REST, gere autenticação, serve o frontend, recebe dados dos dispositivos e envia atualizações em tempo real para o frontend.
// =============================================================
const express = require('express');
require('./mqtt');
const path = require('path');
const app = express();
const PORT = 4000;
const http = require('http');
const server = http.createServer(app);
const { setupWebSocket } = require('./ws');
setupWebSocket(server);
const db = require('./db');
const { authMiddleware, SECRET } = require('./auth');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

app.use(express.json());

// Servir ficheiros estáticos do frontend
app.use(express.static(path.join(__dirname, 'frontend', 'dist')));

// Endpoint principal (API)
app.get('/api', (req, res) => {
  res.send('API a funcionar');
});

// Login
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  db.db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err) return res.status(500).json({ error: 'Erro de BD' });
    if (!user) return res.status(401).json({ error: 'Utilizador não encontrado' });
    // Palavra-passe em texto plano (apenas para testes, usar hash em produção)
    if (user.password !== password) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    const token = jwt.sign({ id: user.id, email: user.email }, SECRET, { expiresIn: '1d' });
    res.json({ token });
  });
});

// Obter dispositivos do utilizador autenticado
app.get('/devices', authMiddleware, (req, res) => {
  db.db.all('SELECT * FROM devices', (err, rows) => {
    if (err) return res.status(500).json({ error: 'Erro de BD' });
    res.json(rows);
  });
});

// Obter os últimos 50 registos de medições de um dispositivo
app.get('/consumption/:deviceId', authMiddleware, (req, res) => {
  const deviceId = req.params.deviceId;
  const { start, end } = req.query;
  let sql = 'SELECT * FROM measurements WHERE device_id = ?';
  const params = [deviceId];
  if (start && end) {
    sql += ' AND timestamp >= ? AND timestamp <= ?';
    params.push(start, end);
  }
  sql += ' ORDER BY timestamp DESC LIMIT 50';
  db.db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: 'Erro de BD' });
    res.json(rows);
  });
});

// Gestão básica de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// Para qualquer outra rota que NÃO seja /api, servir index.html do frontend
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'dist', 'index.html'));
});

server.listen(PORT, () => {
  console.log(`Servidor Express a ouvir na porta ${PORT}`);
});

// ...existing code...
// Registo de utilizador
app.post('/signup', (req, res) => {
  const { nome, email, password } = req.body;
  if (!nome || !email || !password) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
  }
  db.db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err) return res.status(500).json({ error: 'Erro de BD' });
    if (user) return res.status(409).json({ error: 'O email já está registado' });
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) return res.status(500).json({ error: 'Erro ao encriptar palavra-passe' });
      db.insertUsuario(nome, email, hash, (err) => {
        if (err) return res.status(500).json({ error: 'Erro ao criar utilizador' });
        res.json({ ok: true });
      });
    });
  });
});

// Criar dispositivo para utilizador autenticado
app.post('/devices', authMiddleware, (req, res) => {
  const { nome, topic_mqtt } = req.body;
  if (!nome || !topic_mqtt) {
    return res.status(400).json({ error: 'Nome e tópico MQTT são obrigatórios' });
  }
  db.insertDispositivo(req.user.id, nome, topic_mqtt, (err) => {
    if (err) return res.status(500).json({ error: 'Erro ao criar dispositivo' });
    res.json({ ok: true });
  });
});