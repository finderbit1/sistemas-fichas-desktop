/**
 * Componente para exibir o status da sincronização em tempo real
 */

import React from 'react';
import './SyncStatusIndicator.css';

const SyncStatusIndicator = ({ 
  isConnected, 
  connectionState, 
  lastSync, 
  reconnectAttempt,
  onReconnect 
}) => {
  const getStatusInfo = () => {
    switch (connectionState) {
      case 'connected':
        return {
          icon: '✅',
          text: 'Sincronizado',
          color: '#4caf50',
          class: 'sync-status-connected'
        };
      case 'connecting':
        return {
          icon: '🔄',
          text: 'Conectando...',
          color: '#ff9800',
          class: 'sync-status-connecting'
        };
      case 'disconnected':
        return {
          icon: '🔌',
          text: 'Desconectado',
          color: '#9e9e9e',
          class: 'sync-status-disconnected'
        };
      case 'error':
        return {
          icon: '❌',
          text: 'Erro na conexão',
          color: '#f44336',
          class: 'sync-status-error'
        };
      default:
        return {
          icon: '❓',
          text: 'Desconhecido',
          color: '#9e9e9e',
          class: 'sync-status-unknown'
        };
    }
  };

  const status = getStatusInfo();
  
  const formatLastSync = () => {
    if (!lastSync) return 'Nunca';
    
    const now = new Date();
    const diff = Math.floor((now - lastSync) / 1000); // diferença em segundos
    
    if (diff < 60) return `${diff}s atrás`;
    if (diff < 3600) return `${Math.floor(diff / 60)}min atrás`;
    return `${Math.floor(diff / 3600)}h atrás`;
  };

  return (
    <div className={`sync-status-indicator ${status.class}`}>
      <div className="sync-status-main">
        <span className="sync-status-icon" style={{ color: status.color }}>
          {status.icon}
        </span>
        <div className="sync-status-text">
          <span className="sync-status-title">{status.text}</span>
          {lastSync && (
            <span className="sync-status-time">
              Última sincronização: {formatLastSync()}
            </span>
          )}
        </div>
      </div>
      
      {reconnectAttempt > 0 && (
        <div className="sync-status-reconnect">
          <span>Tentativa de reconexão: {reconnectAttempt}</span>
        </div>
      )}
      
      {!isConnected && onReconnect && (
        <button 
          className="sync-status-button"
          onClick={onReconnect}
          title="Tentar reconectar"
        >
          🔄 Reconectar
        </button>
      )}
    </div>
  );
};

export default SyncStatusIndicator;


