const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

// Crear tablas si no existen
const createTables = () => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    email TEXT UNIQUE,
    password TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS devices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT,
    topic_mqtt TEXT UNIQUE
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS measurements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id INTEGER,
    timestamp TEXT,
    consumo REAL,
    voltaje REAL,
    potencia REAL,
    FOREIGN KEY(device_id) REFERENCES devices(id)
  )`);
};

createTables();

// Funciones para insertar y consultar datos
const insertUsuario = (username, email, password, cb) => {
  db.run(
    'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
    [username, email, password],
    cb
  );
};

const insertDispositivo = (nombre, topic_mqtt, cb) => {
  db.run(
    'INSERT INTO devices (nombre, topic_mqtt) VALUES (?, ?)',
    [nombre, topic_mqtt],
    cb
  );
};

const insertMedicion = (device_id, timestamp, consumo, voltaje, potencia, cb) => {
  db.run(
    'INSERT INTO measurements (device_id, timestamp, consumo, voltaje, potencia) VALUES (?, ?, ?, ?, ?)',
    [device_id, timestamp, consumo, voltaje, potencia],
    cb
  );
};

const getMediciones = (device_id, limit = 50, cb) => {
  db.all(
    'SELECT * FROM measurements WHERE device_id = ? ORDER BY timestamp DESC LIMIT ?',
    [device_id, limit],
    cb
  );
};

module.exports = {
  db,
  insertUsuario,
  insertDispositivo,
  insertMedicion,
  getMediciones,
};
