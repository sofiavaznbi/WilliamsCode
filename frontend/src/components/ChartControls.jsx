// ============================================================================
// Componente ChartControls
//
// Este componente React exibe um conjunto de botões para controlar o intervalo
// de visualização dos dados do gráfico. Permite ao utilizador selecionar entre
// diferentes predefinições de intervalo, alterando o estado do gráfico conforme
// a escolha. Utilizado principalmente para navegação rápida entre períodos de dados.
// ============================================================================
import React from 'react';

function ChartControls({ presets, rango, setRango }) {
  return (
    <div className="chart-controls" style={{display:'flex',justifyContent:'center',gap:'12px',marginBottom:'16px'}}>
      {presets.map(p => (
        <button key={p.value} className={rango === p.value ? 'selected' : ''} onClick={() => setRango(p.value)}>{p.label}</button>
      ))}
    </div>
  );
}

export default ChartControls;
