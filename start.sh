#!/bin/bash
# =============================================================
# Ficheiro: start.sh
# Descrição: Script para iniciar todos os serviços do sistema IoT (backend, frontend e broker MQTT).
# Utilidade: Automatiza a instalação de dependências, construção do frontend e arranque do backend.
# Uso: ./start.sh
# =============================================================

echo "A iniciar o script de arranque..."
set -e


# Iniciar broker Mosquitto MQTT
echo "A iniciar o broker Mosquitto MQTT..."
sudo systemctl start mosquitto || mosquitto -d || echo "Não foi possível iniciar o Mosquitto automaticamente."

# Instalar dependencias backend

if [ -f package.json ]; then
  echo "A instalar dependências do backend..."
  npm install
fi

# Instalar dependencias frontend

if [ -d frontend ]; then
  cd frontend
  if [ -f package.json ]; then
    echo "A instalar dependências do frontend..."
    npm install
    echo "A construir o frontend..."
    npm run build
  fi
  cd ..
fi

# Iniciar backend
if [ -f server.js ]; then
  echo "A iniciar o backend Express na porta 4000..."
  node server.js
else
  echo "Não foi encontrado o server.js na pasta principal."
fi
