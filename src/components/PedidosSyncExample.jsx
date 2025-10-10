/**
 * Componente de exemplo demonstrando o uso da sincronização em tempo real de pedidos
 */

import React, { useState } from 'react';
import { usePedidosSync } from '../hooks/usePedidosSync';
import SyncStatusIndicator from './SyncStatusIndicator';
import './PedidosSyncExample.css';

const PedidosSyncExample = () => {
  const [showLogs, setShowLogs] = useState(false);
  const [selectedPedido, setSelectedPedido] = useState(null);

  // Hook de sincronização com callbacks
  const {
    pedidos,
    isLoading,
    error,
    lastSync,
    syncLog,
    wsConnected,
    wsState,
    reconnectAttempt,
    fetchPedidos,
    updatePedido,
    wsReconnect,
  } = usePedidosSync({
    autoFetch: true,
    onPedidoCreate: (pedido) => {
      console.log('🆕 Novo pedido criado:', pedido);
      // Você pode adicionar notificação aqui
    },
    onPedidoUpdate: (pedido) => {
      console.log('✏️ Pedido atualizado:', pedido);
      // Você pode adicionar notificação aqui
    },
    onPedidoDelete: (pedidoId) => {
      console.log('🗑️ Pedido deletado:', pedidoId);
      // Você pode adicionar notificação aqui
    },
    onStatusUpdate: (pedidoId, statusField, newValue) => {
      console.log(`📊 Status ${statusField} atualizado para ${newValue} no pedido ${pedidoId}`);
    },
    onSyncError: (error) => {
      console.error('❌ Erro de sincronização:', error);
    },
  });

  // Função para atualizar status de um pedido
  const handleStatusChange = async (pedidoId, field) => {
    try {
      const pedido = pedidos.find(p => p.id === pedidoId);
      if (!pedido) return;

      const newValue = !pedido[field];
      
      await updatePedido(pedidoId, {
        [field]: newValue
      });
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      alert('Erro ao atualizar status. Tente novamente.');
    }
  };

  // Renderizar detalhes de um pedido
  const renderPedidoDetails = (pedido) => (
    <div className="pedido-card" key={pedido.id}>
      <div className="pedido-header">
        <h3>Pedido #{pedido.numero}</h3>
        <span className={`pedido-status status-${pedido.status}`}>
          {pedido.status}
        </span>
      </div>
      
      <div className="pedido-info">
        <p><strong>Cliente:</strong> {pedido.cliente}</p>
        <p><strong>Data Entrada:</strong> {pedido.data_entrada}</p>
        <p><strong>Data Entrega:</strong> {pedido.data_entrega}</p>
        <p><strong>Valor Total:</strong> R$ {pedido.valor_total}</p>
      </div>

      <div className="pedido-status-checks">
        <h4>Status de Produção:</h4>
        <div className="status-checks-grid">
          {['financeiro', 'conferencia', 'sublimacao', 'costura', 'expedicao'].map(field => (
            <label key={field} className="status-checkbox">
              <input
                type="checkbox"
                checked={pedido[field] || false}
                onChange={() => handleStatusChange(pedido.id, field)}
              />
              <span>{field.charAt(0).toUpperCase() + field.slice(1)}</span>
            </label>
          ))}
        </div>
      </div>

      <button 
        className="btn-details"
        onClick={() => setSelectedPedido(pedido)}
      >
        Ver Detalhes
      </button>
    </div>
  );

  // Renderizar logs de sincronização
  const renderSyncLogs = () => (
    <div className="sync-logs">
      <div className="sync-logs-header">
        <h3>Logs de Sincronização</h3>
        <button 
          className="btn-close"
          onClick={() => setShowLogs(false)}
        >
          ✕
        </button>
      </div>
      
      <div className="sync-logs-list">
        {syncLog.length === 0 ? (
          <p className="sync-logs-empty">Nenhum log ainda</p>
        ) : (
          syncLog.map((log, index) => (
            <div key={index} className={`sync-log-item sync-log-${log.type}`}>
              <span className="sync-log-time">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
              <span className="sync-log-type">[{log.type}]</span>
              <span className="sync-log-message">{log.message}</span>
              {log.data && (
                <span className="sync-log-data">{JSON.stringify(log.data)}</span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="pedidos-sync-example">
      <div className="page-header">
        <h1>📦 Pedidos em Tempo Real</h1>
        <p>Sincronização automática via WebSocket</p>
      </div>

      {/* Indicador de status da sincronização */}
      <SyncStatusIndicator
        isConnected={wsConnected}
        connectionState={wsState}
        lastSync={lastSync}
        reconnectAttempt={reconnectAttempt}
        onReconnect={wsReconnect}
      />

      {/* Ações */}
      <div className="actions-bar">
        <button 
          className="btn-primary"
          onClick={fetchPedidos}
          disabled={isLoading}
        >
          {isLoading ? '⏳ Carregando...' : '🔄 Recarregar Pedidos'}
        </button>
        
        <button 
          className="btn-secondary"
          onClick={() => setShowLogs(!showLogs)}
        >
          📋 {showLogs ? 'Esconder' : 'Ver'} Logs ({syncLog.length})
        </button>
      </div>

      {/* Logs de sincronização */}
      {showLogs && renderSyncLogs()}

      {/* Lista de pedidos */}
      <div className="pedidos-container">
        {error && (
          <div className="error-message">
            ❌ Erro ao carregar pedidos: {error.message}
          </div>
        )}

        {isLoading && pedidos.length === 0 ? (
          <div className="loading-message">
            ⏳ Carregando pedidos...
          </div>
        ) : pedidos.length === 0 ? (
          <div className="empty-message">
            📭 Nenhum pedido encontrado
          </div>
        ) : (
          <div className="pedidos-grid">
            {pedidos.map(renderPedidoDetails)}
          </div>
        )}
      </div>

      {/* Modal de detalhes (simplificado) */}
      {selectedPedido && (
        <div className="modal-overlay" onClick={() => setSelectedPedido(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Detalhes do Pedido #{selectedPedido.numero}</h2>
              <button 
                className="btn-close"
                onClick={() => setSelectedPedido(null)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <pre>{JSON.stringify(selectedPedido, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PedidosSyncExample;

