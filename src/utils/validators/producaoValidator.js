/**
 * Sistema de Validação Robusto para Produções
 * Validações centralizadas para todos os tipos de produção
 */

// ===== CONSTANTES DE VALIDAÇÃO =====
export const VALIDATION_RULES = {
  // Dimensões mínimas e máximas (em cm)
  DIMENSIONS: {
    MIN: 1,
    MAX: 1000,
    DECIMAL_PLACES: 2
  },
  
  // Valores monetários
  MONEY: {
    MIN: 0.01,
    MAX: 999999.99,
    DECIMAL_PLACES: 2
  },
  
  // Textos
  TEXT: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 255
  },
  
  // Campos obrigatórios por tipo de produção
  REQUIRED_FIELDS: {
    painel: ['descricao', 'largura', 'altura', 'vendedor', 'designer', 'tecido', 'valorPainel'],
    totem: ['descricao', 'altura', 'largura', 'vendedor', 'designer', 'material', 'comPe', 'valorTotem'],
    lona: ['descricao', 'largura', 'altura', 'vendedor', 'designer', 'material', 'valorLona'],
    bolsinha: ['descricao', 'tipo', 'vendedor', 'designer', 'tecido', 'valorBolsinha']
  },
  
  // Validações específicas por tipo
  TYPE_SPECIFIC: {
    painel: {
      ilhos: ['ilhosQtd', 'ilhosValorUnitario', 'ilhosDistancia']
    }
  }
};

// ===== FUNÇÕES AUXILIARES =====

/**
 * Converte valor brasileiro para número
 * @param {string|number} value - Valor em formato brasileiro
 * @returns {number} Valor numérico
 */
export const parseBRToNumber = (value) => {
  if (!value) return 0;
  if (typeof value === 'number') return value;
  
  const normalized = String(value).replace(/\./g, '').replace(',', '.');
  const num = parseFloat(normalized);
  return isNaN(num) ? 0 : num;
};

/**
 * Valida se um número está dentro dos limites
 * @param {number} value - Valor a ser validado
 * @param {number} min - Valor mínimo
 * @param {number} max - Valor máximo
 * @returns {boolean} True se válido
 */
export const isWithinRange = (value, min, max) => {
  return value >= min && value <= max;
};

/**
 * Valida formato de texto
 * @param {string} text - Texto a ser validado
 * @param {number} minLength - Tamanho mínimo
 * @param {number} maxLength - Tamanho máximo
 * @returns {boolean} True se válido
 */
export const isValidText = (text, minLength = VALIDATION_RULES.TEXT.MIN_LENGTH, maxLength = VALIDATION_RULES.TEXT.MAX_LENGTH) => {
  if (!text || typeof text !== 'string') return false;
  const trimmed = text.trim();
  return trimmed.length >= minLength && trimmed.length <= maxLength;
};

/**
 * Valida dimensões (largura, altura)
 * @param {string|number} value - Dimensão a ser validada
 * @returns {object} Resultado da validação
 */
export const validateDimension = (value) => {
  const numValue = parseBRToNumber(value);
  
  if (numValue <= 0) {
    return { valid: false, message: 'Dimensão deve ser maior que zero' };
  }
  
  if (!isWithinRange(numValue, VALIDATION_RULES.DIMENSIONS.MIN, VALIDATION_RULES.DIMENSIONS.MAX)) {
    return { 
      valid: false, 
      message: `Dimensão deve estar entre ${VALIDATION_RULES.DIMENSIONS.MIN} e ${VALIDATION_RULES.DIMENSIONS.MAX} cm` 
    };
  }
  
  return { valid: true };
};

/**
 * Valida valores monetários
 * @param {string|number} value - Valor monetário
 * @returns {object} Resultado da validação
 */
export const validateMoney = (value) => {
  const numValue = parseBRToNumber(value);
  
  if (numValue <= 0) {
    return { valid: false, message: 'Valor deve ser maior que zero' };
  }
  
  if (!isWithinRange(numValue, VALIDATION_RULES.MONEY.MIN, VALIDATION_RULES.MONEY.MAX)) {
    return { 
      valid: false, 
      message: `Valor deve estar entre R$ ${VALIDATION_RULES.MONEY.MIN} e R$ ${VALIDATION_RULES.MONEY.MAX}` 
    };
  }
  
  return { valid: true };
};

// ===== VALIDADORES POR TIPO DE PRODUÇÃO =====

/**
 * Valida formulário de Painel
 * @param {object} formData - Dados do formulário
 * @returns {object} Resultado da validação
 */
export const validatePainel = (formData) => {
  const errors = [];
  const warnings = [];
  
  // Campos obrigatórios
  const requiredFields = VALIDATION_RULES.REQUIRED_FIELDS.painel;
  requiredFields.forEach(field => {
    if (!formData[field] || !String(formData[field]).trim()) {
      errors.push(`${getFieldLabel(field)} é obrigatório`);
    }
  });
  
  // Validações de texto
  if (formData.descricao && !isValidText(formData.descricao, 3, 255)) {
    errors.push('Descrição deve ter entre 3 e 255 caracteres');
  }
  
  if (formData.observacao && !isValidText(formData.observacao, 0, 500)) {
    warnings.push('Observação muito longa (máximo 500 caracteres)');
  }
  
  // Validações de dimensões
  if (formData.largura) {
    const larguraValidation = validateDimension(formData.largura);
    if (!larguraValidation.valid) {
      errors.push(`Largura: ${larguraValidation.message}`);
    }
  }
  
  if (formData.altura) {
    const alturaValidation = validateDimension(formData.altura);
    if (!alturaValidation.valid) {
      errors.push(`Altura: ${alturaValidation.message}`);
    }
  }
  
  // Validação de valor
  if (formData.valorPainel) {
    const valorValidation = validateMoney(formData.valorPainel);
    if (!valorValidation.valid) {
      errors.push(`Valor do Painel: ${valorValidation.message}`);
    }
  }
  
  // Validação específica para ilhós
  if (formData.acabamento?.ilhos) {
    const ilhosFields = VALIDATION_RULES.TYPE_SPECIFIC.painel.ilhos;
    ilhosFields.forEach(field => {
      if (!formData[field] || !String(formData[field]).trim()) {
        errors.push(`${getFieldLabel(field)} é obrigatório quando ilhós estão selecionados`);
      }
    });
    
    // Validações específicas dos ilhós
    if (formData.ilhosQtd) {
      const qtd = parseInt(formData.ilhosQtd);
      if (isNaN(qtd) || qtd <= 0 || qtd > 100) {
        errors.push('Quantidade de ilhós deve ser um número entre 1 e 100');
      }
    }
    
    if (formData.ilhosValorUnitario) {
      const valorValidation = validateMoney(formData.ilhosValorUnitario);
      if (!valorValidation.valid) {
        errors.push(`Valor unitário dos ilhós: ${valorValidation.message}`);
      }
    }
    
    if (formData.ilhosDistancia) {
      const distanciaValidation = validateDimension(formData.ilhosDistancia);
      if (!distanciaValidation.valid) {
        errors.push(`Distância dos ilhós: ${distanciaValidation.message}`);
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Valida formulário de Totem
 * @param {object} formData - Dados do formulário
 * @returns {object} Resultado da validação
 */
export const validateTotem = (formData) => {
  const errors = [];
  const warnings = [];
  
  // Campos obrigatórios
  const requiredFields = VALIDATION_RULES.REQUIRED_FIELDS.totem;
  requiredFields.forEach(field => {
    if (!formData[field] || !String(formData[field]).trim()) {
      errors.push(`${getFieldLabel(field)} é obrigatório`);
    }
  });
  
  // Validações de texto
  if (formData.descricao && !isValidText(formData.descricao, 3, 255)) {
    errors.push('Descrição deve ter entre 3 e 255 caracteres');
  }
  
  // Validações de dimensões
  if (formData.largura) {
    const larguraValidation = validateDimension(formData.largura);
    if (!larguraValidation.valid) {
      errors.push(`Largura: ${larguraValidation.message}`);
    }
  }
  
  if (formData.altura) {
    const alturaValidation = validateDimension(formData.altura);
    if (!alturaValidation.valid) {
      errors.push(`Altura: ${alturaValidation.message}`);
    }
  }
  
  // Validação de valor
  if (formData.valorTotem) {
    const valorValidation = validateMoney(formData.valorTotem);
    if (!valorValidation.valid) {
      errors.push(`Valor do Totem: ${valorValidation.message}`);
    }
  }
  
  // Validação de acabamento
  if (!formData.comPe) {
    errors.push('Selecione um tipo de acabamento');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Valida formulário de Lona
 * @param {object} formData - Dados do formulário
 * @returns {object} Resultado da validação
 */
export const validateLona = (formData) => {
  const errors = [];
  const warnings = [];
  
  // Campos obrigatórios
  const requiredFields = VALIDATION_RULES.REQUIRED_FIELDS.lona;
  requiredFields.forEach(field => {
    if (!formData[field] || !String(formData[field]).trim()) {
      errors.push(`${getFieldLabel(field)} é obrigatório`);
    }
  });
  
  // Validações de texto
  if (formData.descricao && !isValidText(formData.descricao, 3, 255)) {
    errors.push('Descrição deve ter entre 3 e 255 caracteres');
  }
  
  // Validações de dimensões
  if (formData.largura) {
    const larguraValidation = validateDimension(formData.largura);
    if (!larguraValidation.valid) {
      errors.push(`Largura: ${larguraValidation.message}`);
    }
  }
  
  if (formData.altura) {
    const alturaValidation = validateDimension(formData.altura);
    if (!alturaValidation.valid) {
      errors.push(`Altura: ${alturaValidation.message}`);
    }
  }
  
  // Validação de valor
  if (formData.valorLona) {
    const valorValidation = validateMoney(formData.valorLona);
    if (!valorValidation.valid) {
      errors.push(`Valor da Lona: ${valorValidation.message}`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Valida formulário de Bolsinha
 * @param {object} formData - Dados do formulário
 * @returns {object} Resultado da validação
 */
export const validateBolsinha = (formData) => {
  const errors = [];
  const warnings = [];
  
  // Campos obrigatórios
  const requiredFields = VALIDATION_RULES.REQUIRED_FIELDS.bolsinha;
  requiredFields.forEach(field => {
    if (!formData[field] || !String(formData[field]).trim()) {
      errors.push(`${getFieldLabel(field)} é obrigatório`);
    }
  });
  
  // Validações de texto
  if (formData.descricao && !isValidText(formData.descricao, 3, 255)) {
    errors.push('Descrição deve ter entre 3 e 255 caracteres');
  }
  
  // Validação de valor
  if (formData.valorBolsinha) {
    const valorValidation = validateMoney(formData.valorBolsinha);
    if (!valorValidation.valid) {
      errors.push(`Valor da Bolsinha: ${valorValidation.message}`);
    }
  }
  
  // Validação de tamanho se fornecido
  if (formData.tamanho && !isValidText(formData.tamanho, 1, 50)) {
    warnings.push('Tamanho muito longo (máximo 50 caracteres)');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
};

// ===== VALIDADOR PRINCIPAL =====

/**
 * Valida formulário de produção baseado no tipo
 * @param {object} formData - Dados do formulário
 * @param {string} tipoProducao - Tipo de produção (painel, totem, lona, bolsinha)
 * @returns {object} Resultado da validação
 */
export const validateProducao = (formData, tipoProducao) => {
  if (!tipoProducao) {
    return {
      valid: false,
      errors: ['Tipo de produção não especificado'],
      warnings: []
    };
  }
  
  switch (tipoProducao.toLowerCase()) {
    case 'painel':
      return validatePainel(formData);
    case 'totem':
      return validateTotem(formData);
    case 'lona':
      return validateLona(formData);
    case 'bolsinha':
      return validateBolsinha(formData);
    default:
      return {
        valid: false,
        errors: [`Tipo de produção '${tipoProducao}' não suportado`],
        warnings: []
      };
  }
};

// ===== FUNÇÕES AUXILIARES =====

/**
 * Retorna o label amigável de um campo
 * @param {string} fieldName - Nome do campo
 * @returns {string} Label amigável
 */
const getFieldLabel = (fieldName) => {
  const labels = {
    descricao: 'Descrição',
    largura: 'Largura',
    altura: 'Altura',
    vendedor: 'Vendedor',
    designer: 'Designer',
    tecido: 'Tecido',
    material: 'Material',
    valorPainel: 'Valor do Painel',
    valorTotem: 'Valor do Totem',
    valorLona: 'Valor da Lona',
    valorBolsinha: 'Valor da Bolsinha',
    comPe: 'Acabamento',
    tipo: 'Tipo',
    ilhosQtd: 'Quantidade de Ilhós',
    ilhosValorUnitario: 'Valor Unitário dos Ilhós',
    ilhosDistancia: 'Distância dos Ilhós'
  };
  
  return labels[fieldName] || fieldName;
};

/**
 * Validação em tempo real para um campo específico
 * @param {string} fieldName - Nome do campo
 * @param {any} value - Valor do campo
 * @param {string} tipoProducao - Tipo de produção
 * @returns {object} Resultado da validação
 */
export const validateField = (fieldName, value, tipoProducao) => {
  // Validações gerais por tipo de campo
  if (fieldName.includes('largura') || fieldName.includes('altura') || fieldName.includes('Distancia')) {
    return validateDimension(value);
  }
  
  if (fieldName.includes('valor') || fieldName.includes('Valor')) {
    return validateMoney(value);
  }
  
  if (fieldName === 'descricao') {
    if (!value || !String(value).trim()) {
      return { valid: false, message: 'Descrição é obrigatória' };
    }
    return isValidText(value, 3, 255) 
      ? { valid: true } 
      : { valid: false, message: 'Descrição deve ter entre 3 e 255 caracteres' };
  }
  
  if (fieldName === 'ilhosQtd') {
    const qtd = parseInt(value);
    if (!value || isNaN(qtd) || qtd <= 0) {
      return { valid: false, message: 'Quantidade deve ser um número maior que zero' };
    }
    if (qtd > 100) {
      return { valid: false, message: 'Quantidade máxima de ilhós é 100' };
    }
    return { valid: true };
  }
  
  // Validação genérica para campos obrigatórios
  if (!value || !String(value).trim()) {
    return { valid: false, message: `${getFieldLabel(fieldName)} é obrigatório` };
  }
  
  return { valid: true };
};

export default {
  validateProducao,
  validateField,
  validatePainel,
  validateTotem,
  validateLona,
  validateBolsinha,
  VALIDATION_RULES,
  parseBRToNumber,
  validateDimension,
  validateMoney,
  isValidText
};
