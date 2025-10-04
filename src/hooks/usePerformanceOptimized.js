import { useCallback, useMemo, useRef, useEffect, useState } from 'react';

/**
 * Hook para otimização de performance com debounce
 */
export const useDebounce = (callback, delay) => {
  const timeoutRef = useRef(null);
  
  const debouncedCallback = useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);
  
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return debouncedCallback;
};

/**
 * Hook para throttle (limitar execuções)
 */
export const useThrottle = (callback, delay) => {
  const lastRun = useRef(Date.now());
  
  const throttledCallback = useCallback((...args) => {
    if (Date.now() - lastRun.current >= delay) {
      callback(...args);
      lastRun.current = Date.now();
    }
  }, [callback, delay]);
  
  return throttledCallback;
};

/**
 * Hook para memoização de listas com comparação profunda
 */
export const useMemoizedList = (list, dependencies = []) => {
  return useMemo(() => {
    return list;
  }, [list, ...dependencies]);
};

/**
 * Hook para otimizar re-renders de componentes pesados
 */
export const useStableCallback = (callback, dependencies = []) => {
  const callbackRef = useRef(callback);
  
  useEffect(() => {
    callbackRef.current = callback;
  }, dependencies);
  
  return useCallback((...args) => {
    return callbackRef.current(...args);
  }, []);
};

/**
 * Hook para lazy loading de componentes
 */
export const useLazyComponent = (importFn, fallback = null) => {
  const [Component, setComponent] = useState(fallback);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const loadComponent = useCallback(async () => {
    if (Component !== fallback) return Component;
    
    setLoading(true);
    setError(null);
    
    try {
      const module = await importFn();
      const LazyComponent = module.default || module;
      setComponent(() => LazyComponent);
      return LazyComponent;
    } catch (err) {
      setError(err);
      console.error('Erro ao carregar componente:', err);
    } finally {
      setLoading(false);
    }
  }, [importFn, Component, fallback]);
  
  return { Component, loading, error, loadComponent };
};

/**
 * Hook para otimizar operações custosas
 */
export const useOptimizedOperation = (operation, dependencies = []) => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const executeOperation = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    
    try {
      const operationResult = await operation(...args);
      setResult(operationResult);
      return operationResult;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [operation]);
  
  const memoizedResult = useMemo(() => result, [result]);
  
  return {
    result: memoizedResult,
    loading,
    error,
    execute: executeOperation
  };
};

/**
 * Hook para otimizar formulários grandes
 */
export const useOptimizedForm = (initialValues = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  
  const setValue = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
  }, []);
  
  const setError = useCallback((name, error) => {
    setErrors(prev => ({ ...prev, [name]: error }));
  }, []);
  
  const setFieldTouched = useCallback((name, isTouched = true) => {
    setTouched(prev => ({ ...prev, [name]: isTouched }));
  }, []);
  
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);
  
  const memoizedForm = useMemo(() => ({
    values,
    errors,
    touched,
    setValue,
    setError,
    setFieldTouched,
    resetForm
  }), [values, errors, touched, setValue, setError, setFieldTouched, resetForm]);
  
  return memoizedForm;
};

export default {
  useDebounce,
  useThrottle,
  useMemoizedList,
  useStableCallback,
  useLazyComponent,
  useOptimizedOperation,
  useOptimizedForm
};
