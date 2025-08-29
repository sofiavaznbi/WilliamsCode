const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

// Criar tabelas se não existirem
const criarTabelas = () => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    email TEXT UNIQUE,
    password TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS devices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT,
    topic_mqtt TEXT UNIQUE
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS measurements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id INTEGER,
    timestamp TEXT,
    consumo REAL,
    voltagem REAL,
    potencia REAL,
    FOREIGN KEY(device_id) REFERENCES devices(id)
  )`);
};

criarTabelas();

// Funções para inserir e consultar dados
const inserirUtilizador = (username, email, password, cb) => {
  db.run(
    'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
    [username, email, password],
    cb
  );
};

const inserirDispositivo = (nome, topic_mqtt, cb) => {
  db.run(
    'INSERT INTO devices (nome, topic_mqtt) VALUES (?, ?)',
    [nome, topic_mqtt],
    cb
  );
};

const inserirMedicao = (device_id, timestamp, consumo, voltagem, potencia, cb) => {
  db.run(
    'INSERT INTO measurements (device_id, timestamp, consumo, voltagem, potencia) VALUES (?, ?, ?, ?, ?)',
    [device_id, timestamp, consumo, voltagem, potencia],
    cb
  );
};

const obterMedicoes = (device_id, limite = 50, cb) => {
  db.all(
    'SELECT * FROM measurements WHERE device_id = ? ORDER BY timestamp DESC LIMIT ?',
    [device_id, limite],
    cb
  );
};

module.exports = {
  db,
  inserirUtilizador,
  inserirDispositivo,
  inserirMedicao,
  obterMedicoes,
};
