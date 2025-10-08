import React, { createContext, useContext, useState, useEffect } from 'react';
import { reloadApiConfig } from '../services/api';

const ServerConfigContext = createContext();

export const useServerConfig = () => {
  const context = useContext(ServerConfigContext);
  if (!context) {
    throw new Error('useServerConfig deve ser usado dentro de um ServerConfigProvider');
  }
  return context;
};

export const ServerConfigProvider = ({ children }) => {
  const [serverConfig, setServerConfig] = useState(() => {
    // Verificar se há configuração salva no localStorage
    const savedConfig = localStorage.getItem('serverConfig');
    if (savedConfig) {
      return JSON.parse(savedConfig);
    }
    // Configuração padrão
    return {
      baseURL: 'http://localhost:8000',
      timeout: 10000,
      retries: 3
    };
  });

  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('checking');

  const updateServerConfig = (newConfig) => {
    const updatedConfig = { ...serverConfig, ...newConfig };
    setServerConfig(updatedConfig);
    localStorage.setItem('serverConfig', JSON.stringify(updatedConfig));
    
    // Recarregar configuração da API
    reloadApiConfig();
    
    // Limpar cache para forçar buscar dados atualizados do novo servidor
    if (window.cacheManager) {
      window.cacheManager.clearAll();
      console.log('🧹 Cache limpo após mudança de configuração do servidor');
    }
    
    // Testar conexão após atualizar
    testConnection(updatedConfig.baseURL);
  };

  const testConnection = async (url = serverConfig.baseURL) => {
    setConnectionStatus('checking');
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${url}/health`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        setIsConnected(true);
        setConnectionStatus('connected');
      } else {
        setIsConnected(false);
        setConnectionStatus('error');
      }
    } catch (error) {
      setIsConnected(false);
      setConnectionStatus('error');
      console.error('Erro ao testar conexão:', error);
    }
  };

  const resetToDefault = () => {
    const defaultConfig = {
      baseURL: 'http://localhost:8000',
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














