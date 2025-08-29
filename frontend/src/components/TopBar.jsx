// ============================================================================
// Componente TopBar
//
// Este componente React exibe a barra superior de navegação do dashboard IoT,
// permitindo ao utilizador alternar entre dispositivos, automatizações e definições.
// Facilita o acesso rápido às principais áreas do sistema.
// ============================================================================

import React from "react";

const TopBar = () => (
  <nav className="topbar">
    <div className="topbar-left">🔌 IoT</div>
    <div className="topbar-center">
      <a href="#" className="active">Dispositivos</a>
      <a href="#">Automatizações</a>
      <a href="#">Definições</a>
    </div>
    <div className="topbar-right">...</div>
  </nav>
);

export default TopBar;
