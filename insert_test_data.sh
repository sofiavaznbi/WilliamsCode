#!/bin/bash
# =============================================================
# Ficheiro: insert_test_data.sh
# Descrição: Script para inserir medições de teste na base de dados SQLite.
# Utilidade: Executar este script para adicionar dados simulados a um dispositivo específico.
# Uso: ./insert_test_data.sh <id_dispositivo>
# =============================================================

if [ -z "$1" ]; then
  echo "Uso: $0 <id_dispositivo>"
  exit 1
fi

ID_DISPOSITIVO=$1

for i in {0..49}
do
  # Gerar data e hora para cada medição
  TS=$(date -d "2025-08-28 12:00:00 +${i} hour" +"%Y-%m-%dT%H:%M:%S")
  # Valores aleatórios de exemplo
  CONSUMO=$(echo "scale=2; 1 + $i * 0.1" | bc)
  VOLTAGEM=220
  POTENCIA=$(echo "scale=2; 50 + $i * 2" | bc)
  sqlite3 energy.db "INSERT INTO measurements (device_id, timestamp, consumo, voltagem, potencia) VALUES ($ID_DISPOSITIVO, '$TS', $CONSUMO, $VOLTAGEM, $POTENCIA);"
done

echo "50 medições de teste inseridas para o dispositivo $ID_DISPOSITIVO."
