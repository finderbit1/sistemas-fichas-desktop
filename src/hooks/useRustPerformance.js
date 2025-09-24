/**
 * Hook React para usar o engine de performance Rust/WASM
 * Integração transparente com componentes React
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import performanceEngine from '../../rust-performance/pkg/sgp_performance.js';

export const useRustPerformance = () => {
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const cacheRef = useRef(new Map());

  // Inicializar engine
  useEffect(() => {
    let mounted = true;
    
    const initEngine = async () => {
      try {
        setLoading(true);
        setError(null);
        
        await performanceEngine.init();
        
        if (mounted) {
          setInitialized(true);
          setStats(performanceEngine.getStats());
          console.log('✅ Hook Rust Performance inicializado');
        }
      } catch (err) {
        console.error('❌ Erro ao inicializar Rust Performance:', err);
        if (mounted) {
          setError(err.message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initEngine();

    return () => {
      mounted = false;
    };
  }, []);

  // Atualizar stats periodicamente
  useEffect(() => {
    if (!initialized) return;

    const interval = setInterval(() => {
      setStats(performanceEngine.getStats());
    }, 5000);

    return () => clearInterval(interval);
  }, [initialized]);

  // Funções de cálculo com cache local
  const calculateArea = useCallback((width, height) => {
    if (!initialized) {
      throw new Error('Engine não inicializado');
    }

    const cacheKey = `area_${width}_${height}`;
    
    if (cacheRef.current.has(cacheKey)) {
      return cacheRef.current.get(cacheKey);
    }

    const result = performanceEngine.calculateArea(width, height);
    cacheRef.current.set(cacheKey, result);
    
    return result;
  }, [initialized]);

  const parseBrazilianMoney = useCallback((input) => {
    if (!initialized) {
      throw new Error('Engine não inicializado');
    }

    return performanceEngine.parseBrazilianMoney(input);
  }, [initialized]);

  const formatBrazilianMoney = useCallback((value) => {
    if (!initialized) {
      throw new Error('Engine não inicializado');
    }

    return performanceEngine.formatBrazilianMoney(value);
  }, [initialized]);

  const calculateTotalMoney = useCallback((values) => {
    if (!initialized) {
      throw new Error('Engine não inicializado');
    }

    return performanceEngine.calculateTotalMoney(values);
  }, [initialized]);

  const validateDimensions = useCallback((width, height) => {
    if (!initialized) {
      throw new Error('Engine não inicializado');
    }

    return performanceEngine.validateDimensions(width, height);
  }, [initialized]);

  const validateMoneyValue = useCallback((value) => {
    if (!initialized) {
      throw new Error('Engine não inicializado');
    }

    return performanceEngine.validateMoneyValue(value);
  }, [initialized]);

  const validateIlhosConfig = useCallback((quantidade, valorUnitario, distancia) => {
    if (!initialized) {
      throw new Error('Engine não inicializado');
    }

    return performanceEngine.validateIlhosConfig(quantidade, valorUnitario, distancia);
  }, [initialized]);

  const processProductionBatch = useCallback((items) => {
    if (!initialized) {
      throw new Error('Engine não inicializado');
    }

    return performanceEngine.processProductionBatch(items);
  }, [initialized]);

  const isValidEmail = useCallback((email) => {
    if (!initialized) {
      throw new Error('Engine não inicializado');
    }

    return performanceEngine.isValidEmail(email);
  }, [initialized]);

  const isValidCPF = useCallback((cpf) => {
    if (!initialized) {
      throw new Error('Engine não inicializado');
    }

    return performanceEngine.isValidCPF(cpf);
  }, [initialized]);

  const parseNumberSafe = useCallback((input) => {
    if (!initialized) {
      throw new Error('Engine não inicializado');
    }

    return performanceEngine.parseNumberSafe(input);
  }, [initialized]);

  const runBenchmark = useCallback((iterations = 10000) => {
    if (!initialized) {
      throw new Error('Engine não inicializado');
    }

    return performanceEngine.runBenchmark(iterations);
  }, [initialized]);

  const clearCache = useCallback(() => {
    performanceEngine.clearCache();
    cacheRef.current.clear();
    setStats(performanceEngine.getStats());
  }, []);

  return {
    // Estado
    initialized,
    loading,
    error,
    stats,
    
    // Funções de cálculo
    calculateArea,
    parseBrazilianMoney,
    formatBrazilianMoney,
    calculateTotalMoney,
    
    // Validações
    validateDimensions,
    validateMoneyValue,
    validateIlhosConfig,
    isValidEmail,
    isValidCPF,
    
    // Processamento
    processProductionBatch,
    parseNumberSafe,
    
    // Utilitários
    runBenchmark,
    clearCache,
  };
};

// Hook específico para cálculos de área
export const useAreaCalculator = () => {
  const { initialized, loading, error, calculateArea, validateDimensions } = useRustPerformance();
  const [results, setResults] = useState({});

  const calculateAreaWithValidation = useCallback((width, height) => {
    if (!initialized) return null;

    // Validar primeiro
    const validation = validateDimensions(width, height);
    if (!validation.valid) {
      return {
        area: 0,
        formatted_area: '0,00',
        width,
        height,
        validation
      };
    }

    // Calcular área
    const areaResult = calculateArea(width, height);
    
    setResults(prev => ({
      ...prev,
      [`${width}x${height}`]: areaResult
    }));

    return {
      ...areaResult,
      validation
    };
  }, [initialized, calculateArea, validateDimensions]);

  const clearResults = useCallback(() => {
    setResults({});
  }, []);

  return {
    initialized,
    loading,
    error,
    calculateArea: calculateAreaWithValidation,
    results,
    clearResults
  };
};

// Hook específico para processamento de valores monetários
export const useMoneyProcessor = () => {
  const { 
    initialized, 
    loading, 
    error, 
    parseBrazilianMoney, 
    formatBrazilianMoney, 
    calculateTotalMoney,
    validateMoneyValue 
  } = useRustPerformance();
  
  const [processedValues, setProcessedValues] = useState({});

  const parseMoneyWithValidation = useCallback((input) => {
    if (!initialized) return null;

    const parsed = parseBrazilianMoney(input);
    const validation = validateMoneyValue(parsed.raw_value);

    const result = {
      ...parsed,
      validation
    };

    setProcessedValues(prev => ({
      ...prev,
      [input]: result
    }));

    return result;
  }, [initialized, parseBrazilianMoney, validateMoneyValue]);

  const calculateTotalWithValidation = useCallback((values) => {
    if (!initialized) return null;

    const total = calculateTotalMoney(values);
    const validation = validateMoneyValue(total.raw_value);

    return {
      ...total,
      validation
    };
  }, [initialized, calculateTotalMoney, validateMoneyValue]);

  const clearProcessedValues = useCallback(() => {
    setProcessedValues({});
  }, []);

  return {
    initialized,
    loading,
    error,
    parseMoney: parseMoneyWithValidation,
    formatMoney: formatBrazilianMoney,
    calculateTotal: calculateTotalWithValidation,
    processedValues,
    clearProcessedValues
  };
};

// Hook para processamento em lote
export const useBatchProcessor = () => {
  const { initialized, loading, error, processProductionBatch } = useRustPerformance();
  const [batchResults, setBatchResults] = useState(null);
  const [processing, setProcessing] = useState(false);

  const processBatch = useCallback(async (items) => {
    if (!initialized) return null;

    setProcessing(true);
    try {
      const result = processProductionBatch(items);
      setBatchResults(result);
      return result;
    } catch (err) {
      console.error('Erro no processamento em lote:', err);
      throw err;
    } finally {
      setProcessing(false);
    }
  }, [initialized, processProductionBatch]);

  const clearBatchResults = useCallback(() => {
    setBatchResults(null);
  }, []);

  return {
    initialized,
    loading,
    error,
    processBatch,
    batchResults,
    processing,
    clearBatchResults
  };
};

export default useRustPerformance;
