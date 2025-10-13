import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { loadApiConfig } from './utils/configLoader';
import { reloadApiConfig } from './services/api';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // apenas se usar componentes JS como modals, tooltips etc.

const root = ReactDOM.createRoot(document.getElementById('root'));

// 🚀 Carregar configuração da API ANTES de inicializar a aplicação
// Lê do arquivo config/api-config.json automaticamente
console.log('🚀 Sistema de Fichas - Iniciando...\n');

loadApiConfig()
  .then((config) => {
    console.log('\n✅ Configuração carregada com sucesso!');
    console.log('📡 API URL:', config.apiURL);
    console.log('🔌 WebSocket URL:', config.wsURL);
    
    // Recarregar API com a nova configuração
    reloadApiConfig();
    
    console.log('\n🎨 Renderizando aplicação...\n');
    
    // Renderizar aplicação
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  })
  .catch((error) => {
    console.error('❌ Erro ao carregar configuração:', error);
    
    // Renderizar mesmo assim (usará fallback)
    console.warn('⚠️ Usando configuração padrão (localhost)\n');
    
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  });
