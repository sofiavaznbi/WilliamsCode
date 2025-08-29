import React from 'react';

function CustomTooltip({ active, payload, label, costePorKwh, anomalías }) {
  if (active && payload && payload.length) {
    const punto = payload[0].payload;
    const coste = punto.consumo * costePorKwh;
    const esAnomalia = anomalías?.some(a => a.timestamp === punto.timestamp);
    return (
      <div className="custom-tooltip" style={{background:'#fff',border:'1px solid #ccc',padding:10,borderRadius:8}}>
        <div><b>{new Date(label).toLocaleString()}</b></div>
        <div>Consumo: <b>{punto.consumo.toFixed(3)} kWh</b></div>
        <div>Coste: <b>{coste.toFixed(2)} €</b></div>
        <div>Potencia: <b>{punto.potencia} W</b></div>
        <div>Voltaje: <b>{punto.voltaje} V</b></div>
        {esAnomalia && <div style={{color:'red'}}><b>¡Anomalía detectada!</b></div>}
      </div>
    );
  }
  return null;
}

export default CustomTooltip;
