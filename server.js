// ...existing code...


// ...existing code...
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

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, 'frontend', 'dist')));

// Endpoint principal (API)
app.get('/api', (req, res) => {
  res.send('API funcionando');
});

// Login
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  db.db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err) return res.status(500).json({ error: 'Error de BD' });
    if (!user) return res.status(401).json({ error: 'Usuario no encontrado' });
    // Contraseña en texto plano (solo para pruebas, cambiar a hash en producción)
    if (user.password !== password) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    const token = jwt.sign({ id: user.id, email: user.email }, SECRET, { expiresIn: '1d' });
    res.json({ token });
  });
});

// Obtener dispositivos del usuario autenticado
app.get('/devices', authMiddleware, (req, res) => {
  db.db.all('SELECT * FROM devices', (err, rows) => {
    if (err) return res.status(500).json({ error: 'Error de BD' });
    res.json(rows);
  });
});

// Obtener últimos 50 registros de mediciones de un dispositivo
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
    if (err) return res.status(500).json({ error: 'Error de BD' });
    res.json(rows);
  });
});

// Manejo básico de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Para cualquier otra ruta que NO sea /api, servir index.html del frontend
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'dist', 'index.html'));
});

server.listen(PORT, () => {
  console.log(`Servidor Express escuchando en puerto ${PORT}`);
});

// ...existing code...
// Registro de usuario
app.post('/signup', (req, res) => {
  const { nombre, email, password } = req.body;
  if (!nombre || !email || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }
  db.db.get('SELECT * FROM usuarios WHERE email = ?', [email], (err, user) => {
    if (err) return res.status(500).json({ error: 'Error de BD' });
    if (user) return res.status(409).json({ error: 'El email ya está registrado' });
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) return res.status(500).json({ error: 'Error al encriptar contraseña' });
      db.insertUsuario(nombre, email, hash, (err) => {
        if (err) return res.status(500).json({ error: 'Error al crear usuario' });
        res.json({ ok: true });
      });
    });
  });
});

// Crear dispositivo para usuario autenticado
app.post('/devices', authMiddleware, (req, res) => {
  const { nombre, topic_mqtt } = req.body;
  if (!nombre || !topic_mqtt) {
    return res.status(400).json({ error: 'Nombre y topic MQTT son obligatorios' });
  }
  db.insertDispositivo(req.user.id, nombre, topic_mqtt, (err) => {
    if (err) return res.status(500).json({ error: 'Error al crear dispositivo' });
    res.json({ ok: true });
  });
});