/**
 * Hook para gerenciar Lock (Trava) de Pedidos
 * 
 * Verifica se um pedido está travado e fornece informações
 * sobre o lock para a interface
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';

export function usePedidoLock(pedidoId) {
  const [isLocked, setIsLocked] = useState(false);
  const [lockInfo, setLockInfo] = useState(null);
  const [canEdit, setCanEdit] = useState(true);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef(null);

  /**
   * Verifica o status de lock do pedido
   */
  const checkLock = useCallback(async () => {
    if (!pedidoId) return;

    try {
      const { data } = await api.get(`/pedidos/${pedidoId}/lock`);

      if (data.locked) {
        setIsLocked(true);
        setLockInfo(data);
        setCanEdit(false);
      } else {
        setIsLocked(false);
        setLockInfo(null);
        setCanEdit(true);
      }
    } catch (error) {
      console.error('Erro ao verificar lock:', error);
      // Em caso de erro, permitir edição
      setCanEdit(true);
    }
  }, [pedidoId]);

  /**
   * Remove o lock manualmente
   */
  const removeLock = useCallback(async () => {
    if (!pedidoId) return false;

    setLoading(true);
    try {
      await api.delete(`/pedidos/${pedidoId}/lock`);
      await checkLock();
      return true;
    } catch (error) {
      console.error('Erro ao remover lock:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [pedidoId, checkLock]);

  /**
   * Force remove lock (admin)
   */
  const forceRemoveLock = useCallback(async () => {
    if (!pedidoId) return false;

    setLoading(true);
    try {
      await api.post(`/pedidos/${pedidoId}/lock/force`);
      await checkLock();
      return true;
    } catch (error) {
      console.error('Erro ao forçar remoção de lock:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [pedidoId, checkLock]);

  // Verificar lock ao montar e quando pedidoId mudar
  useEffect(() => {
    checkLock();

    // Verificar a cada 5 segundos
    intervalRef.current = setInterval(checkLock, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [checkLock]);

  return {
    isLocked,
    lockInfo,
    canEdit,
    loading,
    checkLock,
    removeLock,
    forceRemoveLock
  };
}

export default usePedidoLock;

