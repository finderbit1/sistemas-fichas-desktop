import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook para atualização automática de dados
 * 
 * @param {Function} refreshFunction - Função a ser chamada para atualizar
 * @param {number} interval - Intervalo em milissegundos (padrão: 15000 = 15 segundos)
 * @param {boolean} enabled - Se o auto-refresh está habilitado (padrão: true)
 * 
 * @example
 * const { startPolling, stopPolling, isPolling } = useAutoRefresh(
 *   () => fetchPedidos(),
 *   15000, // 15 segundos
 *   true
 * );
 */
function useAutoRefresh(refreshFunction, interval = 15000, enabled = true) {
  const intervalRef = useRef(null);
  const isPollingRef = useRef(false);

  const startPolling = useCallback(() => {
    if (intervalRef.current || !enabled) return;
    
    isPollingRef.current = true;
    
    if (import.meta.env.DEV) {
      console.log(`🔄 Auto-refresh iniciado (intervalo: ${interval/1000}s)`);
    }
    
    intervalRef.current = setInterval(() => {
      if (import.meta.env.DEV) {
        console.log('🔄 Executando auto-refresh...');
      }
      refreshFunction();
    }, interval);
  }, [refreshFunction, interval, enabled]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      isPollingRef.current = false;
      
      if (import.meta.env.DEV) {
        console.log('⏸️ Auto-refresh pausado');
      }
    }
  }, []);

  // Iniciar polling quando o componente montar
  useEffect(() => {
    if (enabled) {
      startPolling();
    }

    // Limpar ao desmontar
    return () => {
      stopPolling();
    };
  }, [enabled, startPolling, stopPolling]);

  // Pausar polling quando a aba não está visível (economizar recursos)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling();
        if (import.meta.env.DEV) {
          console.log('👁️ Aba oculta - auto-refresh pausado');
        }
      } else {
        if (enabled) {
          startPolling();
          if (import.meta.env.DEV) {
            console.log('👁️ Aba visível - auto-refresh retomado');
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, startPolling, stopPolling]);

  return {
    startPolling,
    stopPolling,
    isPolling: isPollingRef.current
  };
}

export default useAutoRefresh;

