// =============================================================
// Ficheiro: DeviceList.jsx
// Descrição: Componente para listar e selecionar dispositivos IoT.
// Utilidade: Permite ao utilizador escolher o dispositivo para visualizar os dados.
// =============================================================

import React from 'react';

function DeviceList({ dispositivos, selecionado, setSelecionado, carregandoDispositivos }) {
  return (
    <section className="device-list card">
      <h3>Dispositivos</h3>
      {carregandoDispositivos ? <div className="loader">A carregar dispositivos...</div> : null}
      <div style={{display:'flex',flexWrap:'wrap',justifyContent:'center',gap:'12px',width:'100%'}}>
        {dispositivos.map(d => (
          <button
            key={d.id}
            className={selecionado === d.id ? 'selected' : ''}
            onClick={() => setSelecionado(d.id)}
            title={`Ver dados de ${d.nome}`}
            style={{minWidth:'120px'}}>
            <span role="img" aria-label="device" style={{fontSize:'1.2rem',marginRight:'6px'}}>🔌</span> {d.nome}
          </button>
        ))}
      </div>
    </section>
  );
}

export default DeviceList;
