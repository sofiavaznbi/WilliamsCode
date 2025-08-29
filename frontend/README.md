# IoT Energy Dashboard

Plataforma fullstack para monitorização e visualização do consumo energético de dispositivos IoT.

## Em que consiste?

Permite aos utilizadores registar dispositivos IoT, receber as suas medições energéticas em tempo real (via MQTT), armazená-las e visualizá-las num dashboard moderno com gráficos, recomendações e automatizações.

## Arquitetura

- **Backend:** Node.js + Express + SQLite + MQTT + WebSocket
	- Autenticação JWT
	- API REST para utilizadores, dispositivos e medições
	- Receção de dados dos dispositivos via MQTT
	- Armazenamento em SQLite
	- Atualizações em tempo real via WebSocket
- **Frontend:** React + Vite
	- Login e registo de utilizadores
	- Visualização de dispositivos e consumo energético
	- Gráficos interativos (Recharts)
	- Exportação de dados para CSV
	- Recomendações, automatizações e alertas

## Fluxo principal

1. O utilizador regista-se/inicia sessão.
2. Adiciona dispositivos IoT (com o seu tópico MQTT).
3. Os dispositivos publicam medições no broker MQTT.
4. O backend recebe os dados, armazena-os e envia-os ao frontend via WebSocket.
5. O utilizador visualiza o consumo, estatísticas e recomendações no dashboard.

## Scripts úteis

- `start.sh`: Instala dependências, constrói o frontend e inicia o backend.
- `init_db.sql`: Inicializa a base de dados com tabelas e dados de exemplo.
- `insert_test_data.sh`: Insere medições de teste na base de dados.
- `publish_mqtt_test.sh`: Publica mensagens MQTT de teste nos tópicos dos dispositivos.
- `reset_db.sh`: Limpa todas as tabelas da base de dados.

## Instalação e execução rápida

1. Instala dependências no backend e frontend (`npm install`).
2. Inicializa a base de dados (`sqlite3 database.db < init_db.sql`).
3. Inicia o broker Mosquitto MQTT.
4. Executa `./start.sh` para lançar tudo.

## Autor

Guillermo
