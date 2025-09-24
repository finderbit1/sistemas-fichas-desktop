import { useState, useEffect, useCallback, useRef } from 'react';
import { globalCache, cacheUtils } from '../utils/performanceCache';

/**
 * Hook otimizado para chamadas de API com cache inteligente
 */
export const useOptimizedApi = (apiFunction, options = {}) => {
  const {
    cacheKey = null,
    enabled = true,
    staleTime = 1 * 60 * 1000, // 1 minuto
    cacheTime = 5 * 60 * 1000, // 5 minutos
    retryCount = 3,
    retryDelay = 1000,
    onSuccess = () => {},
    onError = () => {},
    dependencies = []
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isStale, setIsStale] = useState(false);
  
  const retryCountRef = useRef(0);
  const abortControllerRef = useRef(null);

  // Criar chave de cache baseada na função e dependências
  const finalCacheKey = useCallback(() => {
    if (cacheKey) return cacheKey;
    return cacheUtils.createKey(
      apiFunction.name || 'api_call',
      ...dependencies
    );
  }, [cacheKey, apiFunction.name, dependencies]);

  // Função para fazer a requisição com retry
  const fetchData = useCallback(async (forceRefresh = false) => {
    if (!enabled) return;

    const key = finalCacheKey();
    
    // Verificar cache primeiro (se não for refresh forçado)
    if (!forceRefresh) {
      const cached = globalCache.api.get(key);
      if (cached !== null) {
        setData(cached);
        setIsStale(false);
        onSuccess(cached);
        return cached;
      }
    }

    // Cancelar requisição anterior se existir
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const result = await apiFunction(abortControllerRef.current.signal);
      
      // Salvar no cache
      globalCache.api.set(key, result, cacheTime);
      
      setData(result);
      setIsStale(false);
      retryCountRef.current = 0;
      onSuccess(result);
      
      return result;
    } catch (err) {
      if (err.name === 'AbortError') {
        return; // Requisição foi cancelada
      }

      setError(err);
      onError(err);

      // Tentar novamente se não excedeu o limite
      if (retryCountRef.current < retryCount) {
        retryCountRef.current++;
        setTimeout(() => {
          fetchData(forceRefresh);
        }, retryDelay * retryCountRef.current);
      } else {
        retryCountRef.current = 0;
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [
    enabled,
    finalCacheKey,
    apiFunction,
    cacheTime,
    retryCount,
    retryDelay,
    onSuccess,
    onError
  ]);

  // Verificar se os dados estão stale
  const checkStaleness = useCallback(() => {
    const key = finalCacheKey();
    const cached = globalCache.api.get(key);
    
    if (cached !== null) {
      // Verificar se está stale baseado no tempo de acesso
      const accessTime = globalCache.api.accessTimes.get(key);
      const now = Date.now();
      
      if (accessTime && (now - accessTime) > staleTime) {
        setIsStale(true);
      } else {
        setIsStale(false);
      }
    }
  }, [finalCacheKey, staleTime]);

  // Carregar dados automaticamente
  useEffect(() => {
    if (enabled) {
      fetchData();
    }
  }, [enabled, fetchData]);

  // Verificar staleness periodicamente
  useEffect(() => {
    const interval = setInterval(checkStaleness, 30000); // A cada 30 segundos
    return () => clearInterval(interval);
  }, [checkStaleness]);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const refetch = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  const invalidate = useCallback(() => {
    const key = finalCacheKey();
    globalCache.api.delete(key);
    setData(null);
    setIsStale(false);
  }, [finalCacheKey]);

  return {
    data,
    loading,
    error,
    isStale,
    refetch,
    invalidate
  };
};

/**
 * Hook para múltiplas chamadas de API otimizadas
 */
export const useOptimizedApiQueries = (queries) => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState({});
  const [errors, setErrors] = useState({});

  const fetchAll = useCallback(async () => {
    const promises = Object.entries(queries).map(async ([key, config]) => {
      try {
        setLoading(prev => ({ ...prev, [key]: true }));
        setErrors(prev => ({ ...prev, [key]: null }));
        
        const cacheKey = config.cacheKey || cacheUtils.createKey(key, ...(config.dependencies || []));
        
        // Verificar cache primeiro
        const cached = globalCache.api.get(cacheKey);
        if (cached !== null && !config.forceRefresh) {
          setResults(prev => ({ ...prev, [key]: cached }));
          setLoading(prev => ({ ...prev, [key]: false }));
          return { key, result: cached };
        }

        const result = await config.apiFunction();
        
        // Salvar no cache
        globalCache.api.set(cacheKey, result, config.cacheTime || 5 * 60 * 1000);
        
        setResults(prev => ({ ...prev, [key]: result }));
        return { key, result };
      } catch (error) {
        setErrors(prev => ({ ...prev, [key]: error }));
        return { key, error };
      } finally {
        setLoading(prev => ({ ...prev, [key]: false }));
      }
    });

    await Promise.all(promises);
  }, [queries]);

  const fetchOne = useCallback(async (key) => {
    const config = queries[key];
    if (!config) return;

    try {
      setLoading(prev => ({ ...prev, [key]: true }));
      setErrors(prev => ({ ...prev, [key]: null }));
      
      const cacheKey = config.cacheKey || cacheUtils.createKey(key, ...(config.dependencies || []));
      
      // Verificar cache primeiro
      const cached = globalCache.api.get(cacheKey);
      if (cached !== null && !config.forceRefresh) {
        setResults(prev => ({ ...prev, [key]: cached }));
        setLoading(prev => ({ ...prev, [key]: false }));
        return cached;
      }

      const result = await config.apiFunction();
      
      // Salvar no cache
      globalCache.api.set(cacheKey, result, config.cacheTime || 5 * 60 * 1000);
      
      setResults(prev => ({ ...prev, [key]: result }));
      return result;
    } catch (error) {
      setErrors(prev => ({ ...prev, [key]: error }));
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  }, [queries]);

  const invalidate = useCallback((key) => {
    if (key) {
      const config = queries[key];
      if (config) {
        const cacheKey = config.cacheKey || cacheUtils.createKey(key, ...(config.dependencies || []));
        globalCache.api.delete(cacheKey);
      }
      
      setResults(prev => {
        const newResults = { ...prev };
        delete newResults[key];
        return newResults;
      });
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    } else {
      // Invalidar todos
      Object.entries(queries).forEach(([key, config]) => {
        const cacheKey = config.cacheKey || cacheUtils.createKey(key, ...(config.dependencies || []));
        globalCache.api.delete(cacheKey);
      });
      
      setResults({});
      setErrors({});
    }
  }, [queries]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    data: results,
    loading,
    errors,
    refetch: fetchAll,
    refetchOne: fetchOne,
    invalidate
  };
};

/**
 * Hook para paginação otimizada
 */
export const useOptimizedPagination = (apiFunction, options = {}) => {
  const {
    pageSize = 20,
    initialPage = 1,
    cacheKey = 'pagination',
    ...apiOptions
  } = options;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [allData, setAllData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPage = useCallback(async (page) => {
    const key = `${cacheKey}_page_${page}`;
    
    // Verificar cache
    const cached = globalCache.api.get(key);
    if (cached !== null) {
      return cached;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await apiFunction({
        page,
        pageSize,
        signal: new AbortController().signal
      });

      // Salvar no cache
      globalCache.api.set(key, result, 2 * 60 * 1000); // 2 minutos

      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction, pageSize, cacheKey]);

  const loadPage = useCallback(async (page) => {
    try {
      const result = await fetchPage(page);
      
      setAllData(prev => {
        const newData = [...prev];
        newData[page - 1] = result.data;
        return newData;
      });
      
      setTotalCount(result.totalCount || result.total || 0);
      setCurrentPage(page);
      
      return result;
    } catch (err) {
      console.error('Erro ao carregar página:', err);
    }
  }, [fetchPage]);

  const goToPage = useCallback((page) => {
    if (page >= 1 && page <= Math.ceil(totalCount / pageSize)) {
      loadPage(page);
    }
  }, [loadPage, totalCount, pageSize]);

  const nextPage = useCallback(() => {
    const next = currentPage + 1;
    if (next <= Math.ceil(totalCount / pageSize)) {
      goToPage(next);
    }
  }, [currentPage, totalCount, pageSize, goToPage]);

  const prevPage = useCallback(() => {
    const prev = currentPage - 1;
    if (prev >= 1) {
      goToPage(prev);
    }
  }, [currentPage, goToPage]);

  // Carregar página inicial
  useEffect(() => {
    loadPage(initialPage);
  }, [loadPage, initialPage]);

  const totalPages = Math.ceil(totalCount / pageSize);
  const currentData = allData[currentPage - 1] || [];

  return {
    data: currentData,
    allData,
    currentPage,
    totalPages,
    totalCount,
    loading,
    error,
    goToPage,
    nextPage,
    prevPage,
    loadPage
  };
};

export default useOptimizedApi;
