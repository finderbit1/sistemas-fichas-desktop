import { useState, useEffect, useCallback } from 'react';

/**
 * Hook para cache de dados da API
 * Evita chamadas desnecessárias e melhora performance
 */
export const useApiCache = (key, fetchFunction, options = {}) => {
  const {
    cacheTime = 5 * 60 * 1000, // 5 minutos por padrão
    staleTime = 1 * 60 * 1000, // 1 minuto por padrão
    enabled = true,
    onError = () => {},
    onSuccess = () => {}
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);

  const isStale = useCallback(() => {
    if (!lastFetch) return true;
    return Date.now() - lastFetch > staleTime;
  }, [lastFetch, staleTime]);

  const isExpired = useCallback(() => {
    if (!lastFetch) return true;
    return Date.now() - lastFetch > cacheTime;
  }, [lastFetch, cacheTime]);

  const fetchData = useCallback(async (force = false) => {
    if (!enabled) return;

    // Se não for forçado e os dados não estão expirados, usar cache
    if (!force && data && !isExpired()) {
      return data;
    }

    // Se não for forçado e os dados não estão stale, usar cache
    if (!force && data && !isStale()) {
      return data;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await fetchFunction();
      setData(result);
      setLastFetch(Date.now());
      onSuccess(result);
      return result;
    } catch (err) {
      setError(err);
      onError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [enabled, data, isExpired, isStale, fetchFunction, onSuccess, onError]);

  const invalidate = useCallback(() => {
    setData(null);
    setLastFetch(null);
    setError(null);
  }, []);

  const refresh = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  // Carregar dados automaticamente quando o hook é montado
  useEffect(() => {
    if (enabled) {
      fetchData();
    }
  }, [enabled, fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    refresh,
    invalidate,
    isStale: isStale(),
    isExpired: isExpired()
  };
};

/**
 * Hook para cache múltiplo de APIs
 * Útil quando você precisa carregar vários endpoints
 */
export const useMultipleApiCache = (queries) => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState({});
  const [errors, setErrors] = useState({});

  const fetchAll = useCallback(async () => {
    const promises = Object.entries(queries).map(async ([key, config]) => {
      try {
        setLoading(prev => ({ ...prev, [key]: true }));
        setErrors(prev => ({ ...prev, [key]: null }));
        
        const result = await config.fetchFunction();
        
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
      
      const result = await config.fetchFunction();
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
      setResults({});
      setErrors({});
    }
  }, []);

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

export default useApiCache;
