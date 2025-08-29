// ============================================================================
// Componente Sidebar
//
// Este componente React exibe a barra lateral do dashboard IoT, permitindo ao utilizador
// alternar entre modo claro/escuro e terminar sessão. Facilita a navegação e gestão do tema.
// ============================================================================

import React, { useState, useEffect } from 'react';

function Sidebar({ escuro, setEscuro, handleLogout }) {
  const [open, setOpen] = useState(window.innerWidth > 600);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 600) {
        setOpen(false);
      } else {
        setOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <aside className={escuro ? 'sidebar dark card' : 'sidebar card'}>
      <button
        className="sidebar-toggle"
        onClick={() => setOpen(v => !v)}
        aria-label={open ? 'Fechar menu' : 'Abrir menu'}
        style={{ display: window.innerWidth <= 600 ? 'block' : 'none', marginBottom: '8px' }}
      >
        {open ? '✖' : '☰'}
      </button>
      {open && (
        <>
          <h2>Dashboard IoT</h2>
          <button className="theme-toggle" onClick={() => setEscuro(d => !d)} title="Alternar tema">
            {escuro ? '🌞 Modo claro' : '🌙 Modo escuro'}
          </button>
          <button onClick={handleLogout} title="Terminar sessão">🔒 Terminar sessão</button>
        </>
      )}
    </aside>
  );
}

export default Sidebar;
