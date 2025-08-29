// =============================================================
// Ficheiro: mqtt.js
// Descrição: Módulo para ligação ao broker MQTT, receção de mensagens dos dispositivos IoT e armazenamento das medições na base de dados.
// Utilidade: Recebe dados dos dispositivos via MQTT e envia atualizações em tempo real para o frontend via WebSocket.
// =============================================================
const mqtt = require('mqtt');
const db = require('./db');
const { broadcastMedicion } = require('./ws');

// Ligação ao broker local
const client = mqtt.connect('mqtt://localhost:1883');

const TOPICO = '#';

client.on('connect', () => {
  console.log('Ligado ao broker MQTT');
  client.subscribe(TOPICO, (err) => {
    if (err) {
      console.error('Erro ao subscrever o tópico:', err);
    } else {
      console.log(`Subscrito ao tópico: ${TOPICO}`);
    }
  });
});

client.on('message', async (topic, message) => {
  try {
    const dados = JSON.parse(message.toString());
    console.log('Mensagem recebida:', dados);

    // Procurar device_id pelo topic_mqtt
    db.db.get(
      'SELECT id FROM devices WHERE topic_mqtt = ?',
      [topic],
      (err, row) => {
        if (err) {
          console.error('Erro ao procurar dispositivo:', err);
          return;
        }
        if (!row) {
          console.warn('Não foi encontrado dispositivo para o tópico:', topic);
          return;
        }
        const id_dispositivo = row.id;
        const timestamp = new Date().toISOString();
        db.inserirMedicao(
          id_dispositivo,
          timestamp,
          dados.consumo,
          dados.voltagem,
          dados.potencia,
          (err) => {
            if (err) {
              console.error('Erro ao inserir medição:', err);
            } else {
              console.log('Medição guardada na base de dados');
              broadcastMedicion({
                device_id: id_dispositivo,
                timestamp,
                consumo: dados.consumo,
                voltagem: dados.voltagem,
                potencia: dados.potencia
              });
            }
          }
        );
      }
    );
  } catch (err) {
    console.error('Erro ao analisar mensagem MQTT:', err);
  }
});

module.exports = client;
