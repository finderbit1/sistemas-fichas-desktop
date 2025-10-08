import { useState, useEffect, useCallback } from 'react';
import cacheManager from '../utils/cacheManager';
import useAutoRefresh from './useAutoRefresh';

/**
 * Hook para buscar dados da API com cache automático
 * 
 * @param {string} cacheKey - Chave única do cache
 * @param {Function} apiFunction - Função da API a ser chamada
 * @param {Object} options - Opções do cache
 * @returns {Object} { data, loading, error, refresh, invalidate }
 * 
 * @example
 * const { data: designers, loading, error, refresh } = useCachedApi(
 *   'designers',
 *   getAllDesigners,
 *   { autoRefresh: true, autoRefreshInterval: 15000 }
 * );
 */
function useCachedApi(cacheKey, apiFunction, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const {
    enabled = true,           // Se deve buscar automaticamente
    filter = null,            // Função para filtrar dados
    transform = null,         // Função para transformar dados
    onSuccess = null,         // Callback de sucesso
    onError = null,           // Callback de erro
    forceRefresh = false,     // Força buscar da API ignorando cache
    autoRefresh = false,      // Ativa atualização automática
    autoRefreshInterval = 15000, // Intervalo de atualização (padrão: 15s)
  } = options;

  /**
   * Busca dados (cache ou API)
   */
  const fetchData = async (ignoreCache = false) => {
    try {
      setLoading(true);
      setError(null);

      // Tentar buscar do cache primeiro
      if (!ignoreCache && !forceRefresh) {
        const cachedData = cacheManager.get(cacheKey);
        
        if (cachedData) {
          let processedData = cachedData;
          
          // Aplicar filtro se fornecido
          if (filter && Array.isArray(cachedData)) {
            processedData = cachedData.filter(filter);
          }
          
          // Aplicar transformação se fornecida
          if (transform) {
            processedData = transform(processedData);
          }
          
          setData(processedData);
          setLoading(false);
          
          if (onSuccess) {
            onSuccess(processedData, true); // true = from cache
          }
          
          if (import.meta.env.DEV) {
            console.log(`⚡ Dados carregados do cache: ${cacheKey}`);
          }
          
          return processedData;
        }
      }

      // Cache miss ou refresh forçado - buscar da API
      if (import.meta.env.DEV) {
        console.log(`🌐 Buscando da API: ${cacheKey}`);
      }
      
      const response = await apiFunction();
      let apiData = response.data || response;
      
      // Aplicar filtro se fornecido
      if (filter && Array.isArray(apiData)) {
        apiData = apiData.filter(filter);
      }
      
      // Aplicar transformação se fornecida
      if (transform) {
        apiData = transform(apiData);
      }
      
      // Salvar no cache (antes do filtro/transform para ter dados completos)
      cacheManager.set(cacheKey, response.data || response);
      
      setData(apiData);
      setLoading(false);
      
      if (onSuccess) {
        onSuccess(apiData, false); // false = from API
      }
      
      return apiData;
      
    } catch (err) {
      console.error(`❌ Erro ao buscar ${cacheKey}:`, err);
      setError(err);
      setLoading(false);
      
      if (onError) {
        onError(err);
      }
      
      return null;
    }
  };

  /**
   * Recarrega dados da API (ignora cache)
   */
  const refresh = () => {
    return fetchData(true);
  };

  /**
   * Invalida o cache (próxima chamada busca da API)
   */
  const invalidate = () => {
    cacheManager.invalidate(cacheKey);
  };

  /**
   * Buscar dados automaticamente ao montar
   */
  useEffect(() => {
    if (enabled) {
      fetchData();
    }
  }, [cacheKey, enabled]);

  /**
   * Auto-refresh (polling) - busca dados periodicamente
   */
  const { startPolling, stopPolling, isPolling } = useAutoRefresh(
    () => fetchData(true), // Força buscar da API
    autoRefreshInterval,
    autoRefresh && enabled
  );

  return {
    data,
    loading,
    error,
    refresh,
    invalidate,
    isFromCache: !loading && data !== null && cacheManager.isValid(cacheKey),
    startPolling,
    stopPolling,
    isPolling
  };
}

export default useCachedApi;

