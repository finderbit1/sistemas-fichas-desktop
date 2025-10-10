/**
 * Hook customizado para gerenciar conexões WebSocket com reconexão automática
 * e sincronização em tempo real de pedidos.
 */

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook para gerenciar conexão WebSocket com reconexão automática
 * 
 * @param {string} url - URL do WebSocket (ex: 'ws://localhost:8000/ws/pedidos')
 * @param {object} options - Opções de configuração
 * @param {boolean} options.autoReconnect - Se deve reconectar automaticamente (padrão: true)
 * @param {number} options.reconnectInterval - Intervalo entre tentativas de reconexão em ms (padrão: 3000)
 * @param {number} options.maxReconnectAttempts - Máximo de tentativas de reconexão (padrão: Infinity)
 * @param {function} options.onMessage - Callback quando recebe mensagem
 * @param {function} options.onConnect - Callback quando conecta
 * @param {function} options.onDisconnect - Callback quando desconecta
 * @param {function} options.onError - Callback quando ocorre erro
 * @param {boolean} options.heartbeat - Se deve enviar ping periódico (padrão: true)
 * @param {number} options.heartbeatInterval - Intervalo do heartbeat em ms (padrão: 30000)
 * 
 * @returns {object} - Objeto com estado e funções de controle
 */
export const useWebSocket = (url, options = {}) => {
  const {
    autoReconnect = true,
    reconnectInterval = 3000,
    maxReconnectAttempts = Infinity,
    onMessage = null,
    onConnect = null,
    onDisconnect = null,
    onError = null,
    heartbeat = true,
    heartbeatInterval = 30000,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState('disconnected'); // disconnected, connecting, connected, error
  const [lastMessage, setLastMessage] = useState(null);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);
  
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const heartbeatIntervalRef = useRef(null);
  const shouldReconnectRef = useRef(autoReconnect);
  const messageQueueRef = useRef([]);

  /**
   * Envia um ping para manter a conexão viva
   */
  const sendHeartbeat = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify({ type: 'ping' }));
        console.log('💓 Heartbeat enviado');
      } catch (error) {
        console.error('❌ Erro ao enviar heartbeat:', error);
      }
    }
  }, []);

  /**
   * Inicia o heartbeat periódico
   */
  const startHeartbeat = useCallback(() => {
    if (heartbeat) {
      heartbeatIntervalRef.current = setInterval(sendHeartbeat, heartbeatInterval);
      console.log('💓 Heartbeat iniciado');
    }
  }, [heartbeat, heartbeatInterval, sendHeartbeat]);

  /**
   * Para o heartbeat
   */
  const stopHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
      console.log('💓 Heartbeat parado');
    }
  }, []);

  /**
   * Conecta ao WebSocket
   */
  const connect = useCallback(() => {
    // Não conectar se já estiver conectado ou conectando
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      console.log('⚠️ WebSocket já está conectado ou conectando');
      return;
    }

    try {
      console.log('🔌 Conectando ao WebSocket:', url);
      setConnectionState('connecting');
      
      wsRef.current = new WebSocket(url);

      wsRef.current.onopen = () => {
        console.log('✅ WebSocket conectado');
        setIsConnected(true);
        setConnectionState('connected');
        setReconnectAttempt(0);
        
        // Iniciar heartbeat
        startHeartbeat();
        
        // Processar fila de mensagens pendentes
        if (messageQueueRef.current.length > 0) {
          console.log(`📤 Processando ${messageQueueRef.current.length} mensagens na fila`);
          messageQueueRef.current.forEach(msg => {
            wsRef.current.send(JSON.stringify(msg));
          });
          messageQueueRef.current = [];
        }
        
        // Callback de conexão
        if (onConnect) {
          onConnect();
        }
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📨 Mensagem recebida:', data.type);
          
          setLastMessage(data);
          
          // Callback de mensagem
          if (onMessage) {
            onMessage(data);
          }
        } catch (error) {
          console.error('❌ Erro ao processar mensagem:', error);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('❌ Erro no WebSocket:', error);
        setConnectionState('error');
        
        // Callback de erro
        if (onError) {
          onError(error);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log('🔌 WebSocket desconectado', event.code, event.reason);
        setIsConnected(false);
        setConnectionState('disconnected');
        
        // Parar heartbeat
        stopHeartbeat();
        
        // Callback de desconexão
        if (onDisconnect) {
          onDisconnect(event);
        }

        // Tentar reconectar se configurado
        if (shouldReconnectRef.current && reconnectAttempt < maxReconnectAttempts) {
          const nextAttempt = reconnectAttempt + 1;
          setReconnectAttempt(nextAttempt);
          
          console.log(`🔄 Tentando reconectar em ${reconnectInterval}ms (tentativa ${nextAttempt}/${maxReconnectAttempts === Infinity ? '∞' : maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        } else if (reconnectAttempt >= maxReconnectAttempts) {
          console.error('❌ Máximo de tentativas de reconexão atingido');
          setConnectionState('error');
        }
      };

    } catch (error) {
      console.error('❌ Erro ao criar WebSocket:', error);
      setConnectionState('error');
      
      if (onError) {
        onError(error);
      }
    }
  }, [url, reconnectAttempt, maxReconnectAttempts, reconnectInterval, onMessage, onConnect, onDisconnect, onError, startHeartbeat, stopHeartbeat]);

  /**
   * Desconecta do WebSocket
   */
  const disconnect = useCallback(() => {
    console.log('🔌 Desconectando WebSocket');
    shouldReconnectRef.current = false;
    
    // Limpar timeouts
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    // Parar heartbeat
    stopHeartbeat();
    
    // Fechar conexão
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setIsConnected(false);
    setConnectionState('disconnected');
  }, [stopHeartbeat]);

  /**
   * Envia mensagem pelo WebSocket
   * @param {object} message - Mensagem a ser enviada (será convertida para JSON)
   * @param {boolean} queueIfDisconnected - Se deve enfileirar a mensagem se desconectado
   */
  const sendMessage = useCallback((message, queueIfDisconnected = true) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify(message));
        console.log('📤 Mensagem enviada:', message.type);
        return true;
      } catch (error) {
        console.error('❌ Erro ao enviar mensagem:', error);
        return false;
      }
    } else {
      console.warn('⚠️ WebSocket não está conectado');
      
      // Enfileirar mensagem se configurado
      if (queueIfDisconnected) {
        messageQueueRef.current.push(message);
        console.log('📝 Mensagem enfileirada para envio posterior');
      }
      
      return false;
    }
  }, []);

  /**
   * Força reconexão imediata
   */
  const reconnect = useCallback(() => {
    console.log('🔄 Forçando reconexão...');
    setReconnectAttempt(0);
    disconnect();
    
    // Aguardar um pouco antes de reconectar
    setTimeout(() => {
      shouldReconnectRef.current = autoReconnect;
      connect();
    }, 100);
  }, [disconnect, connect, autoReconnect]);

  /**
   * Solicita refresh dos dados do servidor
   */
  const requestRefresh = useCallback(() => {
    sendMessage({ type: 'get_pedidos' });
  }, [sendMessage]);

  // Efeito para conectar quando o componente monta
  useEffect(() => {
    connect();

    // Cleanup ao desmontar
    return () => {
      shouldReconnectRef.current = false;
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      stopHeartbeat();
      
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [url]); // Reconectar se a URL mudar

  return {
    // Estado
    isConnected,
    connectionState,
    lastMessage,
    reconnectAttempt,
    
    // Funções
    sendMessage,
    disconnect,
    reconnect,
    requestRefresh,
    
    // Referência ao WebSocket (use com cuidado)
    ws: wsRef.current,
  };
};

export default useWebSocket;

