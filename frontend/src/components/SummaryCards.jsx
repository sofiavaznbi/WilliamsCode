// ============================================================================
// Componente SummaryCards
//
// Este componente React exibe cartões resumo com os principais indicadores:
// consumo total, potência máxima e última medição. Apresenta ícones e valores
// formatados para facilitar a leitura rápida dos dados energéticos.
// ============================================================================
import React from 'react';

function SummaryCards({ consumoTotal, potenciaMax, ultimaMedicion }) {
  return (
    <div className="cards card">
      <div className="card-summary" title="Consumo total">
        <span className="icon" role="img" aria-label="energia">⚡</span>
        <div>
          <div className="sub-value">Consumo total</div>
          <div className="main-value">{consumoTotal.toFixed(2)} kWh</div>
        </div>
      </div>
      <div className="card-summary" title="Potência máxima">
        <span className="icon" role="img" aria-label="potência">🔋</span>
        <div>
          <div className="sub-value">Potência máxima</div>
          <div className="main-value">{potenciaMax.toFixed(2)} W</div>
        </div>
      </div>
      {ultimaMedicion && (
        <div className="card-summary" title="Última medição">
          <span className="icon" role="img" aria-label="última">📈</span>
          <div>
            <div className="sub-value">Última medição</div>
            <div style={{fontSize:'1.05rem',color:'#222',textAlign:'center'}}>
              {new Date(ultimaMedicion.timestamp).toLocaleString()}<br/>
              <span style={{fontWeight:'bold'}}>Consumo:</span> {ultimaMedicion.consumo} | <span style={{fontWeight:'bold'}}>Voltagem:</span> {ultimaMedicion.voltaje} | <span style={{fontWeight:'bold'}}>Potência:</span> {ultimaMedicion.potencia}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SummaryCards;
