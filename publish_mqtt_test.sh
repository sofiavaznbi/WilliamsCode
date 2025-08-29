#!/bin/bash
# Script para publicar mensajes MQTT de prueba en los topics de los dispositivos del usuario admin

TOPICS=("iot/device/1" "iot/device/2")
COUNT=${1:-10}




for i in $(seq 1 $COUNT)
do
  # Medidor Principal: alterna tendencia creciente/descendente y añade aleatoriedad
  if ((i % 20 < 10)); then
    # Tendencia creciente
    CONSUMO1=$(awk -v base=0.8 -v step=0.05 -v idx=${i} -v var=0.15 'BEGIN{srand(); print base+step*idx+rand()*var}')
    POTENCIA1=$(awk -v base=1100 -v step=10 -v idx=${i} -v var=40 'BEGIN{srand(); print int(base+step*idx+rand()*var)}')
  else
    # Tendencia descendente
    CONSUMO1=$(awk -v base=1.3 -v step=0.05 -v idx=${i} -v var=0.15 'BEGIN{srand(); print base-step*idx+rand()*var}')
    POTENCIA1=$(awk -v base=1300 -v step=10 -v idx=${i} -v var=40 'BEGIN{srand(); print int(base-step*idx+rand()*var)}')
  fi
  VOLTAJE1=$(awk -v min=228 -v max=232 'BEGIN{srand(); print int(min+rand()*(max-min+1))}')
  mosquitto_pub -h localhost -t "${TOPICS[0]}" -m "{\"consumo\":$(printf "%.2f" $CONSUMO1),\"voltaje\":$VOLTAJE1,\"potencia\":$POTENCIA1}"

  # Medidor Secundario: alterna tendencia descendente/creciente y añade aleatoriedad
  if ((i % 20 < 10)); then
    # Tendencia descendente
    CONSUMO2=$(awk -v base=0.9 -v step=0.04 -v idx=${i} -v var=0.18 'BEGIN{srand(); print base-step*idx+rand()*var}')
    POTENCIA2=$(awk -v base=900 -v step=8 -v idx=${i} -v var=60 'BEGIN{srand(); print int(base-step*idx+rand()*var)}')
  else
    # Tendencia creciente
    CONSUMO2=$(awk -v base=0.4 -v step=0.04 -v idx=${i} -v var=0.18 'BEGIN{srand(); print base+step*idx+rand()*var}')
    POTENCIA2=$(awk -v base=700 -v step=8 -v idx=${i} -v var=60 'BEGIN{srand(); print int(base+step*idx+rand()*var)}')
  fi
  VOLTAJE2=$(awk -v min=227 -v max=231 'BEGIN{srand(); print int(min+rand()*(max-min+1))}')
  mosquitto_pub -h localhost -t "${TOPICS[1]}" -m "{\"consumo\":$(printf "%.2f" $CONSUMO2),\"voltaje\":$VOLTAJE2,\"potencia\":$POTENCIA2}"

  sleep 1
done

echo "$((COUNT*2)) mensajes publicados en los topics ${TOPICS[*]}."