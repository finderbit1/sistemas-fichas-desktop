import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { loadNetworkConfig } from './utils/configLoader';
import { reloadApiConfig } from './services/api';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // apenas se usar componentes JS como modals, tooltips etc.

const root = ReactDOM.createRoot(document.getElementById('root'));

// 🚀 Carregar configuração de rede ANTES de inicializar a aplicação
loadNetworkConfig()
  .then((config) => {
    console.log('✅ Configuração de rede carregada:', config.baseURL);
    console.log(`📁 Fonte: ${config.source}`);
    
    // Recarregar API com a nova configuração
    reloadApiConfig();
    
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
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  });
