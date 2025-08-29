// =============================================================
// Ficheiro: main.jsx
// Descrição: Ponto de entrada do frontend React.
// Utilidade: Inicializa a aplicação React e aplica estilos globais.
// =============================================================

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <App />
);
