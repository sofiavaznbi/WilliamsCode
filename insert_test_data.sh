#!/bin/bash
# Script para insertar mediciones de prueba en la base de datos SQLite
# Uso: ./insert_test_data.sh <dispositivo_id>

if [ -z "$1" ]; then
  echo "Uso: $0 <dispositivo_id>"
  exit 1
fi

DEVICE_ID=$1

for i in {0..49}
do
  # Generar fecha y hora para cada medición
  TS=$(date -d "2025-08-28 12:00:00 +${i} hour" +"%Y-%m-%dT%H:%M:%S")
  # Valores aleatorios de ejemplo
  CONSUMO=$(echo "scale=2; 1 + $i * 0.1" | bc)
  VOLTAJE=220
  POTENCIA=$(echo "scale=2; 50 + $i * 2" | bc)
  sqlite3 energy.db "INSERT INTO mediciones (dispositivo_id, timestamp, consumo, voltaje, potencia) VALUES ($DEVICE_ID, '$TS', $CONSUMO, $VOLTAJE, $POTENCIA);"
done

echo "50 mediciones de prueba insertadas para dispositivo $DEVICE_ID."
