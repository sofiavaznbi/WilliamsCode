import React from 'react';

function DeviceList({ devices, selected, setSelected, loadingDevices }) {
  return (
    <section className="device-list card">
      <h3>Dispositivos</h3>
      {loadingDevices ? <div className="loader">Cargando dispositivos...</div> : null}
      <div style={{display:'flex',flexWrap:'wrap',justifyContent:'center',gap:'12px',width:'100%'}}>
        {devices.map(d => (
          <button
            key={d.id}
            className={selected === d.id ? 'selected' : ''}
            onClick={() => setSelected(d.id)}
            title={`Ver datos de ${d.nombre}`}
            style={{minWidth:'120px'}}>
            <span role="img" aria-label="device" style={{fontSize:'1.2rem',marginRight:'6px'}}>🔌</span> {d.nombre}
          </button>
        ))}
      </div>
    </section>
  );
}

export default DeviceList;
