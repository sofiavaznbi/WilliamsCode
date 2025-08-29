#!/bin/bash
# =============================================================
# Ficheiro: publish_mqtt_test.sh
# Descrição: Script para publicar mensagens MQTT de teste nos tópicos dos dispositivos do utilizador admin.
# Utilidade: Simula o envio de medições para o broker MQTT, útil para testes do sistema.
# Uso: ./publish_mqtt_test.sh [quantidade]
# =============================================================

TOPICOS=("iot/device/1" "iot/device/2")
QUANTIDADE=${1:-10}

for i in $(seq 1 $QUANTIDADE)
do
  # Medidor Principal: alterna tendência crescente/decrescente e adiciona aleatoriedade
  if ((i % 20 < 10)); then
    # Tendência crescente
    CONSUMO1=$(awk -v base=0.8 -v step=0.05 -v idx=${i} -v var=0.15 'BEGIN{srand(); print base+step*idx+rand()*var}')
    POTENCIA1=$(awk -v base=1100 -v step=10 -v idx=${i} -v var=40 'BEGIN{srand(); print int(base+step*idx+rand()*var)}')
  else
    # Tendência decrescente
    CONSUMO1=$(awk -v base=1.3 -v step=0.05 -v idx=${i} -v var=0.15 'BEGIN{srand(); print base-step*idx+rand()*var}')
    POTENCIA1=$(awk -v base=1300 -v step=10 -v idx=${i} -v var=40 'BEGIN{srand(); print int(base-step*idx+rand()*var)}')
  fi
  VOLTAGEM1=$(awk -v min=228 -v max=232 'BEGIN{srand(); print int(min+rand()*(max-min+1))}')
  mosquitto_pub -h localhost -t "${TOPICOS[0]}" -m "{\"consumo\":$(printf "%.2f" $CONSUMO1),\"voltagem\":$VOLTAGEM1,\"potencia\":$POTENCIA1}"

  # Medidor Secundário: alterna tendência decrescente/crescente e adiciona aleatoriedade
  if ((i % 20 < 10)); then
    # Tendência decrescente
    CONSUMO2=$(awk -v base=0.9 -v step=0.04 -v idx=${i} -v var=0.18 'BEGIN{srand(); print base-step*idx+rand()*var}')
    POTENCIA2=$(awk -v base=900 -v step=8 -v idx=${i} -v var=60 'BEGIN{srand(); print int(base-step*idx+rand()*var)}')
  else
    # Tendência crescente
    CONSUMO2=$(awk -v base=0.4 -v step=0.04 -v idx=${i} -v var=0.18 'BEGIN{srand(); print base+step*idx+rand()*var}')
    POTENCIA2=$(awk -v base=700 -v step=8 -v idx=${i} -v var=60 'BEGIN{srand(); print int(base+step*idx+rand()*var)}')
  fi
  VOLTAGEM2=$(awk -v min=227 -v max=231 'BEGIN{srand(); print int(min+rand()*(max-min+1))}')
  mosquitto_pub -h localhost -t "${TOPICOS[1]}" -m "{\"consumo\":$(printf "%.2f" $CONSUMO2),\"voltagem\":$VOLTAGEM2,\"potencia\":$POTENCIA2}"

  sleep 1
done

echo "$((QUANTIDADE*2)) mensagens publicadas nos tópicos ${TOPICOS[*]}."