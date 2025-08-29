// =============================================================
// Ficheiro: vite.config.js
// Descrição: Configuração do Vite para o projeto frontend React.
// Utilidade: Define plugins e opções de build para o frontend.
// =============================================================
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})
