import React, { createContext, useContext, useState, useEffect } from 'react';

const ServerConfigContext = createContext();

export const useServerConfig = () => {
  const context = useContext(ServerConfigContext);
  if (!context) {
    throw new Error('useServerConfig deve ser usado dentro de um ServerConfigProvider');
  }
  return context;
};

export const ServerConfigProvider = ({ children }) => {
  // Detectar se estamos no Tauri
  const isTauri = typeof window !== 'undefined' && window.__TAURI__;
  
  const [serverConfig, setServerConfig] = useState(() => {
    // Verificar se há configuração salva no localStorage
    const savedConfig = localStorage.getItem('serverConfig');
    if (savedConfig) {
      return JSON.parse(savedConfig);
    }
    // Configuração padrão
    return {
      baseURL: 'tauri://local',
      timeout: 10000,
      retries: 3,
      isTauri: isTauri
    };
  });

  const [isConnected, setIsConnected] = useState(isTauri); // Tauri sempre conectado
  const [connectionStatus, setConnectionStatus] = useState(isTauri ? 'connected' : 'checking');

  const updateServerConfig = (newConfig) => {
    const updatedConfig = { ...serverConfig, ...newConfig };
    setServerConfig(updatedConfig);
    localStorage.setItem('serverConfig', JSON.stringify(updatedConfig));
    
    // Testar conexão após atualizar
    testConnection(updatedConfig.baseURL);
  };

  const testConnection = async (url = serverConfig.baseURL) => {
    // Sempre usar Tauri - sem HTTP
    setIsConnected(true);
    setConnectionStatus('connected');
    console.log('✅ Usando backend Rust (Tauri) - Sempre conectado');
  };

  const resetToDefault = () => {
    const defaultConfig = {
      baseURL: 'tauri://local',
      timeout: 10000,
      retries: 3
    };
    updateServerConfig(defaultConfig);
  };

  // Testar conexão ao carregar
  useEffect(() => {
    testConnection();
  }, []);

  const value = {
    serverConfig,
    updateServerConfig,
    testConnection,
    resetToDefault,
    isConnected,
    connectionStatus
  };

  return (
    <ServerConfigContext.Provider value={value}>
      {children}
    </ServerConfigContext.Provider>
  );
};














