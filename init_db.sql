CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS devices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT,
  topic_mqtt TEXT UNIQUE
);

CREATE TABLE IF NOT EXISTS measurements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  device_id INTEGER,
  timestamp DATETIME,
  potencia REAL,
  voltaje REAL,
  consumo REAL,
  FOREIGN KEY(device_id) REFERENCES devices(id)
);


DELETE FROM users;
DELETE FROM devices;
DELETE FROM measurements;

-- Datos de ejemplo para usuarios
INSERT OR IGNORE INTO users (username, email, password) VALUES ('admin', 'admin@example.com', 'admin123');

-- Datos de ejemplo para dispositivos
INSERT OR IGNORE INTO devices (nombre, topic_mqtt) VALUES ('Medidor Principal', 'iot/device/1');
INSERT OR IGNORE INTO devices (nombre, topic_mqtt) VALUES ('Medidor Secundario', 'iot/device/2');

-- Datos de ejemplo para mediciones
INSERT INTO measurements (device_id, timestamp, potencia, voltaje, consumo) VALUES (1, '2025-08-29 08:00:00', 1200, 230, 0.5);
INSERT INTO measurements (device_id, timestamp, potencia, voltaje, consumo) VALUES (1, '2025-08-29 09:00:00', 1500, 231, 0.6);
INSERT INTO measurements (device_id, timestamp, potencia, voltaje, consumo) VALUES (2, '2025-08-29 08:00:00', 800, 229, 0.3);
INSERT INTO measurements (device_id, timestamp, potencia, voltaje, consumo) VALUES (2, '2025-08-29 09:00:00', 900, 230, 0.35);
