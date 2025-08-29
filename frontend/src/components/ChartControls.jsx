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
