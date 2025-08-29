// ============================================================================
// Componente Sidebar
//
// Este componente React exibe a barra lateral do dashboard IoT, permitindo ao utilizador
// alternar entre modo claro/escuro e terminar sessão. Facilita a navegação e gestão do tema.
// ============================================================================

import React from 'react';

function Sidebar({ escuro, setEscuro, handleLogout }) {
  return (
    <aside className={escuro ? 'sidebar dark card' : 'sidebar card'}>
      <h2>Dashboard IoT</h2>
      <button className="theme-toggle" onClick={() => setEscuro(d => !d)} title="Alternar tema">
        {escuro ? '🌞 Modo claro' : '🌙 Modo escuro'}
      </button>
      <button onClick={handleLogout} title="Terminar sessão">🔒 Terminar sessão</button>
    </aside>
  );
}

export default Sidebar;
