/**
 * Hook especializado para sincronização de pedidos em tempo real via WebSocket
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useWebSocket } from './useWebSocket';
import api from '../services/api';

/**
 * Hook para sincronizar pedidos em tempo real
 * 
 * @param {object} options - Opções de configuração
 * @param {boolean} options.autoFetch - Se deve buscar pedidos automaticamente ao conectar (padrão: true)
 * @param {function} options.onPedidoCreate - Callback quando um pedido é criado
 * @param {function} options.onPedidoUpdate - Callback quando um pedido é atualizado
 * @param {function} options.onPedidoDelete - Callback quando um pedido é deletado
 * @param {function} options.onStatusUpdate - Callback quando um status é atualizado
 * @param {function} options.onSyncError - Callback quando ocorre erro de sincronização
 * 
 * @returns {object} - Estado e funções de controle
 */
export const usePedidosSync = (options = {}) => {
  const {
    autoFetch = true,
    onPedidoCreate = null,
    onPedidoUpdate = null,
    onPedidoDelete = null,
    onStatusUpdate = null,
    onSyncError = null,
  } = options;

  const [pedidos, setPedidos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastSync, setLastSync] = useState(null);
  const [syncLog, setSyncLog] = useState([]);
  
  const isFetchingRef = useRef(false);
  const pedidosCacheRef = useRef(new Map());

  /**
   * Adiciona log de sincronização
   */
  const addSyncLog = useCallback((type, message, data = null) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type,
      message,
      data,
    };
    
    setSyncLog(prev => {
      const newLog = [logEntry, ...prev];
      // Manter apenas os últimos 50 logs
      return newLog.slice(0, 50);
    });
    
    console.log(`[Sync ${type}]`, message, data || '');
  }, []);

  /**
   * Busca todos os pedidos da API
   */
  const fetchPedidos = useCallback(async () => {
    if (isFetchingRef.current) {
      console.log('⚠️ Já está buscando pedidos, ignorando requisição duplicada');
      return;
    }

    try {
      isFetchingRef.current = true;
      setIsLoading(true);
      setError(null);
      
      addSyncLog('fetch', 'Buscando pedidos da API...');
      
      const response = await api.get('/api/v1/pedidos/');
      const pedidosData = response.data;
      
      // Atualizar cache
      pedidosCacheRef.current.clear();
      pedidosData.forEach(pedido => {
        pedidosCacheRef.current.set(pedido.id, pedido);
      });
      
      setPedidos(pedidosData);
      setLastSync(new Date());
      
      addSyncLog('success', `${pedidosData.length} pedidos carregados`);
      
      return pedidosData;
    } catch (err) {
      console.error('❌ Erro ao buscar pedidos:', err);
      setError(err);
      addSyncLog('error', 'Erro ao buscar pedidos', err.message);
      
      if (onSyncError) {
        onSyncError(err);
      }
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [addSyncLog, onSyncError]);

  /**
   * Atualiza um pedido localmente
   */
  const updatePedidoLocal = useCallback((pedidoId, updatedData) => {
    setPedidos(prev => {
      const index = prev.findIndex(p => p.id === pedidoId);
      
      if (index !== -1) {
        const newPedidos = [...prev];
        newPedidos[index] = { ...newPedidos[index], ...updatedData };
        
        // Atualizar cache
        pedidosCacheRef.current.set(pedidoId, newPedidos[index]);
        
        return newPedidos;
      }
      
      return prev;
    });
  }, []);

  /**
   * Adiciona um pedido localmente
   */
  const addPedidoLocal = useCallback((novoPedido) => {
    setPedidos(prev => {
      // Verificar se já existe
      if (prev.some(p => p.id === novoPedido.id)) {
        return prev;
      }
      
      // Adicionar ao cache
      pedidosCacheRef.current.set(novoPedido.id, novoPedido);
      
      return [novoPedido, ...prev];
    });
  }, []);

  /**
   * Remove um pedido localmente
   */
  const removePedidoLocal = useCallback((pedidoId) => {
    setPedidos(prev => prev.filter(p => p.id !== pedidoId));
    pedidosCacheRef.current.delete(pedidoId);
  }, []);

  /**
   * Callback quando recebe mensagem do WebSocket
   */
  const handleWebSocketMessage = useCallback((message) => {
    const { type, action, pedido_id, data, status_field, new_value } = message;

    if (type === 'pedido_update') {
      addSyncLog('websocket', `Pedido ${action}: ${pedido_id}`);
      
      switch (action) {
        case 'create':
          if (data) {
            addPedidoLocal(data);
            addSyncLog('create', `Novo pedido adicionado: ${pedido_id}`);
            
            if (onPedidoCreate) {
              onPedidoCreate(data);
            }
          }
          break;

        case 'update':
          if (data) {
            updatePedidoLocal(pedido_id, data);
            addSyncLog('update', `Pedido atualizado: ${pedido_id}`);
            
            if (onPedidoUpdate) {
              onPedidoUpdate(data);
            }
          } else {
            // Se não veio os dados completos, buscar do servidor
            fetchPedidoById(pedido_id);
          }
          break;

        case 'delete':
          removePedidoLocal(pedido_id);
          addSyncLog('delete', `Pedido removido: ${pedido_id}`);
          
          if (onPedidoDelete) {
            onPedidoDelete(pedido_id);
          }
          break;

        default:
          console.warn('⚠️ Ação desconhecida:', action);
      }
    } else if (type === 'status_update') {
      // Atualização de status específico
      updatePedidoLocal(pedido_id, { [status_field]: new_value });
      addSyncLog('status', `Status ${status_field} atualizado para ${new_value} no pedido ${pedido_id}`);
      
      if (onStatusUpdate) {
        onStatusUpdate(pedido_id, status_field, new_value);
      }
    } else if (type === 'refresh_required') {
      // Servidor solicitou refresh
      addSyncLog('refresh', 'Refresh solicitado pelo servidor');
      fetchPedidos();
    } else if (type === 'connection') {
      addSyncLog('connection', message.message);
    } else if (type === 'pong') {
      // Resposta do ping, ignorar
    }
  }, [addSyncLog, addPedidoLocal, updatePedidoLocal, removePedidoLocal, onPedidoCreate, onPedidoUpdate, onPedidoDelete, onStatusUpdate, fetchPedidos]);

  /**
   * Busca um pedido específico por ID
   */
  const fetchPedidoById = useCallback(async (pedidoId) => {
    try {
      const response = await api.get(`/api/v1/pedidos/${pedidoId}`);
      const pedido = response.data;
      
      updatePedidoLocal(pedidoId, pedido);
      addSyncLog('fetch', `Pedido ${pedidoId} atualizado do servidor`);
      
      return pedido;
    } catch (err) {
      console.error(`❌ Erro ao buscar pedido ${pedidoId}:`, err);
      addSyncLog('error', `Erro ao buscar pedido ${pedidoId}`, err.message);
    }
  }, [updatePedidoLocal, addSyncLog]);

  /**
   * Atualiza um pedido no servidor e aguarda confirmação
   */
  const updatePedido = useCallback(async (pedidoId, updateData) => {
    try {
      addSyncLog('update', `Enviando atualização do pedido ${pedidoId}...`);
      
      const response = await api.patch(`/api/v1/pedidos/${pedidoId}`, updateData);
      const updatedPedido = response.data;
      
      // Atualizar localmente com a resposta do servidor
      updatePedidoLocal(pedidoId, updatedPedido);
      addSyncLog('success', `Pedido ${pedidoId} atualizado com sucesso`);
      
      return updatedPedido;
    } catch (err) {
      console.error('❌ Erro ao atualizar pedido:', err);
      addSyncLog('error', `Erro ao atualizar pedido ${pedidoId}`, err.message);
      
      if (onSyncError) {
        onSyncError(err);
      }
      
      throw err;
    }
  }, [updatePedidoLocal, addSyncLog, onSyncError]);

  /**
   * Cria um novo pedido no servidor
   */
  const createPedido = useCallback(async (pedidoData) => {
    try {
      addSyncLog('create', 'Criando novo pedido...');
      
      const response = await api.post('/api/v1/pedidos/', pedidoData);
      const novoPedido = response.data;
      
      // Não precisa adicionar localmente, o WebSocket vai notificar
      addSyncLog('success', `Novo pedido criado: ${novoPedido.id}`);
      
      return novoPedido;
    } catch (err) {
      console.error('❌ Erro ao criar pedido:', err);
      addSyncLog('error', 'Erro ao criar pedido', err.message);
      
      if (onSyncError) {
        onSyncError(err);
      }
      
      throw err;
    }
  }, [addSyncLog, onSyncError]);

  /**
   * Deleta um pedido no servidor
   */
  const deletePedido = useCallback(async (pedidoId) => {
    try {
      addSyncLog('delete', `Deletando pedido ${pedidoId}...`);
      
      await api.delete(`/api/v1/pedidos/${pedidoId}`);
      
      // Não precisa remover localmente, o WebSocket vai notificar
      addSyncLog('success', `Pedido ${pedidoId} deletado`);
      
      return true;
    } catch (err) {
      console.error('❌ Erro ao deletar pedido:', err);
      addSyncLog('error', `Erro ao deletar pedido ${pedidoId}`, err.message);
      
      if (onSyncError) {
        onSyncError(err);
      }
      
      throw err;
    }
  }, [addSyncLog, onSyncError]);

  // Obter URL do WebSocket do ambiente ou usar padrão
  const getWebSocketUrl = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const wsUrl = apiUrl.replace(/^http/, 'ws');
    return `${wsUrl}/ws/pedidos`;
  };

  // Configurar WebSocket
  const {
    isConnected: wsConnected,
    connectionState: wsState,
    reconnectAttempt,
    sendMessage: wsSendMessage,
    reconnect: wsReconnect,
  } = useWebSocket(getWebSocketUrl(), {
    autoReconnect: true,
    reconnectInterval: 3000,
    maxReconnectAttempts: Infinity,
    heartbeat: true,
    heartbeatInterval: 30000,
    onMessage: handleWebSocketMessage,
    onConnect: () => {
      addSyncLog('connection', '✅ Conectado ao servidor WebSocket');
      
      // Buscar pedidos ao conectar se configurado
      if (autoFetch) {
        fetchPedidos();
      }
    },
    onDisconnect: () => {
      addSyncLog('connection', '🔌 Desconectado do servidor WebSocket');
    },
    onError: (error) => {
      addSyncLog('error', '❌ Erro no WebSocket', error.message);
    },
  });

  return {
    // Estado
    pedidos,
    isLoading,
    error,
    lastSync,
    syncLog,
    
    // Estado do WebSocket
    wsConnected,
    wsState,
    reconnectAttempt,
    
    // Funções
    fetchPedidos,
    fetchPedidoById,
    updatePedido,
    createPedido,
    deletePedido,
    wsReconnect,
    
    // Funções de manipulação local (use com cuidado)
    updatePedidoLocal,
    addPedidoLocal,
    removePedidoLocal,
  };
};

export default usePedidosSync;


