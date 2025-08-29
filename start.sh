#!/bin/bash


echo "Iniciando script de arranque..."
set -e

# Iniciar broker Mosquitto MQTT
echo "Iniciando broker Mosquitto MQTT..."
sudo systemctl start mosquitto || mosquitto -d || echo "No se pudo iniciar Mosquitto automáticamente."

# Instalar dependencias backend
if [ -f package.json ]; then
  echo "Instalando dependencias backend..."
  npm install
fi

# Instalar dependencias frontend
if [ -d frontend ]; then
  cd frontend
  if [ -f package.json ]; then
    echo "Instalando dependencias frontend..."
    npm install
    echo "Construyendo frontend..."
    npm run build
  fi
  cd ..
fi

# Iniciar backend
if [ -f server.js ]; then
  echo "Iniciando backend Express en puerto 4000..."
  node server.js
else
  echo "No se encontró server.js en la carpeta principal."
fi
