import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Hook para gerenciar estado de forma otimizada
 * Reduz re-renderizações desnecessárias usando refs quando possível
 */
export const useOptimizedState = (initialState) => {
  const [state, setState] = useState(initialState);
  const stateRef = useRef(initialState);

  // Atualizar ref sempre que o estado muda
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const setOptimizedState = useCallback((newState) => {
    if (typeof newState === 'function') {
      setState(prevState => {
        const updatedState = newState(prevState);
        stateRef.current = updatedState;
        return updatedState;
      });
    } else {
      setState(newState);
      stateRef.current = newState;
    }
  }, []);

  const getCurrentState = useCallback(() => stateRef.current, []);

  return [state, setOptimizedState, getCurrentState];
};

/**
 * Hook para gerenciar múltiplos estados de forma otimizada
 * Útil para formulários complexos
 */
export const useOptimizedStates = (initialStates) => {
  const [states, setStates] = useState(initialStates);
  const statesRef = useRef(initialStates);

  useEffect(() => {
    statesRef.current = states;
  }, [states]);

  const updateState = useCallback((key, value) => {
    setStates(prevStates => {
      const newStates = { ...prevStates, [key]: value };
      statesRef.current = newStates;
      return newStates;
    });
  }, []);

  const updateMultipleStates = useCallback((updates) => {
    setStates(prevStates => {
      const newStates = { ...prevStates, ...updates };
      statesRef.current = newStates;
      return newStates;
    });
  }, []);

  const resetStates = useCallback(() => {
    setStates(initialStates);
    statesRef.current = initialStates;
  }, [initialStates]);

  const getCurrentStates = useCallback(() => statesRef.current, []);

  return {
    states,
    updateState,
    updateMultipleStates,
    resetStates,
    getCurrentStates
  };
};

/**
 * Hook para debounce de estado
 * Útil para campos de busca e formulários
 */
export const useDebouncedState = (initialValue, delay) => {
  const [value, setValue] = useState(initialValue);
  const [debouncedValue, setDebouncedValue] = useState(initialValue);
  const timeoutRef = useRef(null);

  const setDebounced = useCallback((newValue) => {
    setValue(newValue);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(newValue);
    }, delay);
  }, [delay]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return [value, debouncedValue, setDebounced];
};

/**
 * Hook para estado com validação
 * Combina estado com validação em tempo real
 */
export const useValidatedState = (initialValue, validator, options = {}) => {
  const { validateOnChange = true, validateOnBlur = true } = options;
  
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState(null);
  const [isValid, setIsValid] = useState(true);
  const [touched, setTouched] = useState(false);

  const validate = useCallback((val) => {
    try {
      const result = validator(val);
      if (typeof result === 'string') {
        setError(result);
        setIsValid(false);
        return false;
      } else if (result === false) {
        setError('Valor inválido');
        setIsValid(false);
        return false;
      } else {
        setError(null);
        setIsValid(true);
        return true;
      }
    } catch (err) {
      setError(err.message || 'Erro de validação');
      setIsValid(false);
      return false;
    }
  }, [validator]);

  const setValidatedValue = useCallback((newValue) => {
    setValue(newValue);
    if (validateOnChange) {
      validate(newValue);
    }
  }, [validateOnChange, validate]);

  const handleBlur = useCallback(() => {
    setTouched(true);
    if (validateOnBlur) {
      validate(value);
    }
  }, [validateOnBlur, validate, value]);

  const reset = useCallback(() => {
    setValue(initialValue);
    setError(null);
    setIsValid(true);
    setTouched(false);
  }, [initialValue]);

  return {
    value,
    setValue: setValidatedValue,
    error,
    isValid,
    touched,
    handleBlur,
    reset,
    validate: () => validate(value)
  };
};

/**
 * Hook para estado com histórico
 * Permite desfazer/refazer mudanças
 */
export const useStateWithHistory = (initialValue, maxHistory = 50) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [history, setHistory] = useState([initialValue]);

  const currentValue = history[currentIndex];

  const setValue = useCallback((newValue) => {
    const value = typeof newValue === 'function' ? newValue(currentValue) : newValue;
    
    setHistory(prevHistory => {
      const newHistory = prevHistory.slice(0, currentIndex + 1);
      newHistory.push(value);
      
      // Limitar histórico
      if (newHistory.length > maxHistory) {
        newHistory.shift();
        return newHistory;
      }
      
      return newHistory;
    });
    
    setCurrentIndex(prevIndex => Math.min(prevIndex + 1, maxHistory - 1));
  }, [currentValue, currentIndex, maxHistory]);

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prevIndex => prevIndex - 1);
    }
  }, [currentIndex]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(prevIndex => prevIndex + 1);
    }
  }, [currentIndex, history.length]);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  return {
    value: currentValue,
    setValue,
    undo,
    redo,
    canUndo,
    canRedo,
    historyLength: history.length
  };
};

export default useOptimizedState;
