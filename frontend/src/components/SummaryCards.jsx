import React from 'react';

function SummaryCards({ consumoTotal, potenciaMax, ultimaMedicion }) {
  return (
    <div className="cards card">
      <div className="card-summary" title="Consumo total">
        <span className="icon" role="img" aria-label="energy">⚡</span>
        <div>
          <div className="sub-value">Consumo total</div>
          <div className="main-value">{consumoTotal.toFixed(2)} kWh</div>
        </div>
      </div>
      <div className="card-summary" title="Potencia máxima">
        <span className="icon" role="img" aria-label="power">🔋</span>
        <div>
          <div className="sub-value">Potencia máxima</div>
          <div className="main-value">{potenciaMax.toFixed(2)} W</div>
        </div>
      </div>
      {ultimaMedicion && (
        <div className="card-summary" title="Última medición">
          <span className="icon" role="img" aria-label="last">📈</span>
          <div>
            <div className="sub-value">Última medición</div>
            <div style={{fontSize:'1.05rem',color:'#222',textAlign:'center'}}>
              {new Date(ultimaMedicion.timestamp).toLocaleString()}<br/>
              <span style={{fontWeight:'bold'}}>Consumo:</span> {ultimaMedicion.consumo} | <span style={{fontWeight:'bold'}}>Voltaje:</span> {ultimaMedicion.voltaje} | <span style={{fontWeight:'bold'}}>Potencia:</span> {ultimaMedicion.potencia}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SummaryCards;
