/**
 * Hook personalizado para validação em tempo real
 * Gerencia estados de validação e feedback visual
 */

import { useState, useCallback, useRef } from 'react';
import { validateField, validateProducao } from '../utils/validators/producaoValidator';

export const useValidation = (tipoProducao) => {
  const [fieldErrors, setFieldErrors] = useState({});
  const [fieldWarnings, setFieldWarnings] = useState({});
  const [isValidating, setIsValidating] = useState(false);
  const validationTimeoutRef = useRef(null);

  /**
   * Valida um campo específico em tempo real
   * @param {string} fieldName - Nome do campo
   * @param {any} value - Valor do campo
   * @param {number} delay - Delay em ms para debounce
   */
  const validateFieldRealTime = useCallback((fieldName, value, delay = 500) => {
    // Limpar timeout anterior
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }

    // Limpar erro anterior imediatamente se o campo está vazio
    if (!value || !String(value).trim()) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
      return;
    }

    // Debounce da validação
    validationTimeoutRef.current = setTimeout(() => {
      setIsValidating(true);
      
      try {
        const result = validateField(fieldName, value, tipoProducao);
        
        setFieldErrors(prev => {
          const newErrors = { ...prev };
          if (result.valid) {
            delete newErrors[fieldName];
          } else {
            newErrors[fieldName] = result.message;
          }
          return newErrors;
        });

        setFieldWarnings(prev => {
          const newWarnings = { ...prev };
          if (result.warning) {
            newWarnings[fieldName] = result.warning;
          } else {
            delete newWarnings[fieldName];
          }
          return newWarnings;
        });
      } catch (error) {
        console.error('Erro na validação:', error);
        setFieldErrors(prev => ({
          ...prev,
          [fieldName]: 'Erro interno na validação'
        }));
      } finally {
        setIsValidating(false);
      }
    }, delay);
  }, [tipoProducao]);

  /**
   * Valida todo o formulário
   * @param {object} formData - Dados do formulário
   * @returns {object} Resultado da validação completa
   */
  const validateForm = useCallback((formData) => {
    setIsValidating(true);
    
    try {
      const result = validateProducao(formData, tipoProducao);
      
      // Atualizar estados de erro e warning
      const errorsObj = {};
      const warningsObj = {};
      
      result.errors.forEach((error, index) => {
        // Tentar mapear erro para campo específico
        const fieldName = mapErrorToField(error);
        if (fieldName) {
          errorsObj[fieldName] = error;
        } else {
          errorsObj[`general_${index}`] = error;
        }
      });
      
      result.warnings.forEach((warning, index) => {
        warningsObj[`warning_${index}`] = warning;
      });
      
      setFieldErrors(errorsObj);
      setFieldWarnings(warningsObj);
      
      return result;
    } catch (error) {
      console.error('Erro na validação do formulário:', error);
      return {
        valid: false,
        errors: ['Erro interno na validação'],
        warnings: []
      };
    } finally {
      setIsValidating(false);
    }
  }, [tipoProducao]);

  /**
   * Limpa erros de um campo específico
   * @param {string} fieldName - Nome do campo
   */
  const clearFieldError = useCallback((fieldName) => {
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
    
    setFieldWarnings(prev => {
      const newWarnings = { ...prev };
      delete newWarnings[fieldName];
      return newWarnings;
    });
  }, []);

  /**
   * Limpa todos os erros e warnings
   */
  const clearAllErrors = useCallback(() => {
    setFieldErrors({});
    setFieldWarnings({});
  }, []);

  /**
   * Verifica se um campo tem erro
   * @param {string} fieldName - Nome do campo
   * @returns {boolean} True se tem erro
   */
  const hasFieldError = useCallback((fieldName) => {
    return !!fieldErrors[fieldName];
  }, [fieldErrors]);

  /**
   * Verifica se um campo tem warning
   * @param {string} fieldName - Nome do campo
   * @returns {boolean} True se tem warning
   */
  const hasFieldWarning = useCallback((fieldName) => {
    return !!fieldWarnings[fieldName];
  }, [fieldWarnings]);

  /**
   * Retorna a mensagem de erro de um campo
   * @param {string} fieldName - Nome do campo
   * @returns {string|null} Mensagem de erro ou null
   */
  const getFieldError = useCallback((fieldName) => {
    return fieldErrors[fieldName] || null;
  }, [fieldErrors]);

  /**
   * Retorna a mensagem de warning de um campo
   * @param {string} fieldName - Nome do campo
   * @returns {string|null} Mensagem de warning ou null
   */
  const getFieldWarning = useCallback((fieldName) => {
    return fieldWarnings[fieldName] || null;
  }, [fieldWarnings]);

  /**
   * Verifica se o formulário tem erros
   * @returns {boolean} True se tem erros
   */
  const hasErrors = useCallback(() => {
    return Object.keys(fieldErrors).length > 0;
  }, [fieldErrors]);

  /**
   * Retorna classes CSS para styling baseado no estado de validação
   * @param {string} fieldName - Nome do campo
   * @returns {string} Classes CSS
   */
  const getFieldClasses = useCallback((fieldName) => {
    const baseClasses = 'form-control';
    
    if (hasFieldError(fieldName)) {
      return `${baseClasses} is-invalid`;
    }
    
    if (hasFieldWarning(fieldName)) {
      return `${baseClasses} is-warning`;
    }
    
    // Se o campo tem valor e não tem erro, é válido
    return baseClasses;
  }, [hasFieldError, hasFieldWarning]);

  return {
    // Estados
    fieldErrors,
    fieldWarnings,
    isValidating,
    
    // Funções de validação
    validateFieldRealTime,
    validateForm,
    
    // Funções de limpeza
    clearFieldError,
    clearAllErrors,
    
    // Funções de verificação
    hasFieldError,
    hasFieldWarning,
    hasErrors,
    
    // Funções de obtenção de dados
    getFieldError,
    getFieldWarning,
    getFieldClasses
  };
};

/**
 * Mapeia mensagens de erro para campos específicos
 * @param {string} errorMessage - Mensagem de erro
 * @returns {string|null} Nome do campo ou null
 */
const mapErrorToField = (errorMessage) => {
  const fieldMapping = {
    'Descrição': 'descricao',
    'Largura': 'largura',
    'Altura': 'altura',
    'Vendedor': 'vendedor',
    'Designer': 'designer',
    'Tecido': 'tecido',
    'Material': 'material',
    'Valor do Painel': 'valorPainel',
    'Valor do Totem': 'valorTotem',
    'Valor da Lona': 'valorLona',
    'Valor da Bolsinha': 'valorBolsinha',
    'Acabamento': 'comPe',
    'Tipo': 'tipo',
    'Quantidade de Ilhós': 'ilhosQtd',
    'Valor Unitário dos Ilhós': 'ilhosValorUnitario',
    'Distância dos Ilhós': 'ilhosDistancia'
  };
  
  // Procurar por padrões na mensagem de erro
  for (const [label, field] of Object.entries(fieldMapping)) {
    if (errorMessage.includes(label)) {
      return field;
    }
  }
  
  return null;
};

export default useValidation;
