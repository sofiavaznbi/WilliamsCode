import React from 'react';

function Sidebar({ dark, setDark, handleLogout }) {
  return (
    <aside className={dark ? 'sidebar dark card' : 'sidebar card'}>
      <h2>IoT Dashboard</h2>
      <button className="theme-toggle" onClick={() => setDark(d => !d)} title="Cambiar tema">
        {dark ? '🌞 Modo claro' : '🌙 Modo oscuro'}
      </button>
      <button onClick={handleLogout} title="Cerrar sesión">🔒 Cerrar sesión</button>
    </aside>
  );
}

export default Sidebar;
