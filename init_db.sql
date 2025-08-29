-- =============================================================
-- Ficheiro: init_db.sql
-- Descrição: Script para inicializar a base de dados SQLite do sistema IoT.
-- Cria as tabelas de utilizadores, dispositivos e medições, e insere dados de exemplo.
-- Utilidade: Executar este script para preparar a base de dados antes de iniciar o sistema.
-- =============================================================
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS devices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT,
  topic_mqtt TEXT UNIQUE
);

CREATE TABLE IF NOT EXISTS measurements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  device_id INTEGER,
  timestamp DATETIME,
  potencia REAL,
  voltagem REAL,
  consumo REAL,
  FOREIGN KEY(device_id) REFERENCES devices(id)
);



DELETE FROM users;
DELETE FROM devices;
DELETE FROM measurements;


-- Dados de exemplo para utilizadores
INSERT OR IGNORE INTO users (username, email, password) VALUES ('admin', 'admin@example.com', 'admin123');


-- Dados de exemplo para dispositivos
INSERT OR IGNORE INTO devices (nome, topic_mqtt) VALUES ('Medidor Principal', 'iot/device/1');
INSERT OR IGNORE INTO devices (nome, topic_mqtt) VALUES ('Medidor Secundário', 'iot/device/2');


-- Dados de exemplo para medições
INSERT INTO measurements (device_id, timestamp, potencia, voltagem, consumo) VALUES (1, '2025-08-29 08:00:00', 1200, 230, 0.5);
INSERT INTO measurements (device_id, timestamp, potencia, voltagem, consumo) VALUES (1, '2025-08-29 09:00:00', 1500, 231, 0.6);
INSERT INTO measurements (device_id, timestamp, potencia, voltagem, consumo) VALUES (2, '2025-08-29 08:00:00', 800, 229, 0.3);
INSERT INTO measurements (device_id, timestamp, potencia, voltagem, consumo) VALUES (2, '2025-08-29 09:00:00', 900, 230, 0.35);
