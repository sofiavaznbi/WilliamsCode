const mqtt = require('mqtt');
const db = require('./db');
const { broadcastMedicion } = require('./ws');

// Conexión al broker local
const client = mqtt.connect('mqtt://localhost:1883');

const TOPIC = '#';

client.on('connect', () => {
  console.log('Conectado a MQTT broker');
  client.subscribe(TOPIC, (err) => {
    if (err) {
      console.error('Error al suscribirse al topic:', err);
    } else {
      console.log(`Suscrito al topic: ${TOPIC}`);
    }
  });
});


client.on('message', async (topic, message) => {
  try {
    const data = JSON.parse(message.toString());
    console.log('Mensaje recibido:', data);

    // Buscar dispositivo_id por topic_mqtt
    db.db.get(
      'SELECT id FROM devices WHERE topic_mqtt = ?',
      [topic],
      (err, row) => {
        if (err) {
          console.error('Error buscando dispositivo:', err);
          return;
        }
        if (!row) {
          console.warn('No se encontró dispositivo para el topic:', topic);
          return;
        }
        const dispositivo_id = row.id;
        const timestamp = new Date().toISOString();
        db.insertMedicion(
          dispositivo_id,
          timestamp,
          data.consumo,
          data.voltaje,
          data.potencia,
          (err) => {
            if (err) {
              console.error('Error insertando medición:', err);
            } else {
              console.log('Medición guardada en la BD');
              broadcastMedicion({
                device_id: dispositivo_id,
                timestamp,
                consumo: data.consumo,
                voltaje: data.voltaje,
                potencia: data.potencia
              });
            }
          }
        );
      }
    );
  } catch (err) {
    console.error('Error al parsear mensaje MQTT:', err);
  }
});

module.exports = client;
