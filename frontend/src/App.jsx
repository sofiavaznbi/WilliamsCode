// =============================================================
// Ficheiro: App.jsx
// Descrição: Componente principal da aplicação React, gere as rotas do frontend.
// Utilidade: Ponto de entrada para o sistema de navegação entre Login e Dashboard.
// =============================================================

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Dashboard from './Dashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
