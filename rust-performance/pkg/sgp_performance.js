/**
 * SGP Performance - Wrapper JavaScript para Rust/WASM
 * Interface de alta performance para cálculos e validações
 */

import init, * as wasm from './sgp_performance.js';

// Estado de inicialização
let wasmInitialized = false;
let initPromise = null;

/**
 * Inicializa o módulo WASM
 */
async function initializeWasm() {
  if (wasmInitialized) {
    return;
  }
  
  if (initPromise) {
    return initPromise;
  }
  
  initPromise = init();
  await initPromise;
  wasmInitialized = true;
  
  console.log('🚀 WASM Performance Engine inicializado!');
}

/**
 * Classe principal para operações de alta performance
 */
class SGPPerformanceEngine {
  constructor() {
    this.cache = new Map();
    this.initialized = false;
  }

  /**
   * Inicializa o engine
   */
  async init() {
    if (this.initialized) return;
    
    await initializeWasm();
    this.initialized = true;
    
    console.log('✅ SGP Performance Engine pronto!');
  }

  /**
   * Calcula área com alta precisão
   */
  calculateArea(width, height) {
    if (!this.initialized) {
      throw new Error('Engine não inicializado. Chame init() primeiro.');
    }
    
    // Verificar cache primeiro
    const cacheKey = `area_${width}_${height}`;
    const cached = wasm.get_cached_calculation(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
    
    const result = wasm.calculate_area(width, height);
    
    // Cachear resultado
    wasm.set_cached_calculation(cacheKey, JSON.stringify(result));
    
    return result;
  }

  /**
   * Calcula áreas em lote para melhor performance
   */
  calculateBatchAreas(dimensions) {
    if (!this.initialized) {
      throw new Error('Engine não inicializado. Chame init() primeiro.');
    }
    
    const start = performance.now();
    const results = wasm.calculate_batch_areas(dimensions);
    const end = performance.now();
    
    console.log(`📊 Calculadas ${dimensions.length} áreas em ${(end - start).toFixed(2)}ms`);
    
    return results;
  }

  /**
   * Processa valores monetários brasileiros
   */
  parseBrazilianMoney(input) {
    if (!this.initialized) {
      throw new Error('Engine não inicializado. Chame init() primeiro.');
    }
    
    return wasm.parse_brazilian_money(input);
  }

  /**
   * Formata valores para moeda brasileira
   */
  formatBrazilianMoney(value) {
    if (!this.initialized) {
      throw new Error('Engine não inicializado. Chame init() primeiro.');
    }
    
    return wasm.format_brazilian_money(value);
  }

  /**
   * Calcula total de valores monetários
   */
  calculateTotalMoney(values) {
    if (!this.initialized) {
      throw new Error('Engine não inicializado. Chame init() primeiro.');
    }
    
    const start = performance.now();
    const result = wasm.calculate_total_money(values);
    const end = performance.now();
    
    console.log(`💰 Calculado total de ${values.length} valores em ${(end - start).toFixed(2)}ms`);
    
    return result;
  }

  /**
   * Valida dimensões
   */
  validateDimensions(width, height) {
    if (!this.initialized) {
      throw new Error('Engine não inicializado. Chame init() primeiro.');
    }
    
    return wasm.validate_dimensions(width, height);
  }

  /**
   * Valida valor monetário
   */
  validateMoneyValue(value) {
    if (!this.initialized) {
      throw new Error('Engine não inicializado. Chame init() primeiro.');
    }
    
    return wasm.validate_money_value(value);
  }

  /**
   * Valida configuração de ilhós
   */
  validateIlhosConfig(quantidade, valorUnitario, distancia) {
    if (!this.initialized) {
      throw new Error('Engine não inicializado. Chame init() primeiro.');
    }
    
    return wasm.validate_ilhos_config(quantidade, valorUnitario, distancia);
  }

  /**
   * Processa lote de itens de produção
   */
  processProductionBatch(items) {
    if (!this.initialized) {
      throw new Error('Engine não inicializado. Chame init() primeiro.');
    }
    
    const start = performance.now();
    const result = wasm.process_production_batch(items);
    const end = performance.now();
    
    console.log(`🏭 Processados ${items.length} itens em ${(end - start).toFixed(2)}ms`);
    
    return result;
  }

  /**
   * Valida email
   */
  isValidEmail(email) {
    if (!this.initialized) {
      throw new Error('Engine não inicializado. Chame init() primeiro.');
    }
    
    return wasm.is_valid_email(email);
  }

  /**
   * Valida CPF
   */
  isValidCPF(cpf) {
    if (!this.initialized) {
      throw new Error('Engine não inicializado. Chame init() primeiro.');
    }
    
    return wasm.is_valid_cpf(cpf);
  }

  /**
   * Converte string para número com segurança
   */
  parseNumberSafe(input) {
    if (!this.initialized) {
      throw new Error('Engine não inicializado. Chame init() primeiro.');
    }
    
    return wasm.parse_number_safe(input);
  }

  /**
   * Executa benchmark de performance
   */
  runBenchmark(iterations = 10000) {
    if (!this.initialized) {
      throw new Error('Engine não inicializado. Chame init() primeiro.');
    }
    
    const result = wasm.run_performance_benchmark(iterations);
    console.log('🏁 Benchmark executado:', result);
    
    return result;
  }

  /**
   * Limpa cache de cálculos
   */
  clearCache() {
    if (!this.initialized) {
      throw new Error('Engine não inicializado. Chame init() primeiro.');
    }
    
    wasm.clear_calculation_cache();
    this.cache.clear();
    
    console.log('🗑️ Cache limpo');
  }

  /**
   * Obtém estatísticas do engine
   */
  getStats() {
    return {
      initialized: this.initialized,
      cacheSize: this.cache.size,
      wasmInitialized: wasmInitialized
    };
  }
}

// Instância singleton
const performanceEngine = new SGPPerformanceEngine();

// Funções de conveniência para uso direto
export const calculateArea = (width, height) => performanceEngine.calculateArea(width, height);
export const calculateBatchAreas = (dimensions) => performanceEngine.calculateBatchAreas(dimensions);
export const parseBrazilianMoney = (input) => performanceEngine.parseBrazilianMoney(input);
export const formatBrazilianMoney = (value) => performanceEngine.formatBrazilianMoney(value);
export const calculateTotalMoney = (values) => performanceEngine.calculateTotalMoney(values);
export const validateDimensions = (width, height) => performanceEngine.validateDimensions(width, height);
export const validateMoneyValue = (value) => performanceEngine.validateMoneyValue(value);
export const validateIlhosConfig = (quantidade, valorUnitario, distancia) => 
  performanceEngine.validateIlhosConfig(quantidade, valorUnitario, distancia);
export const processProductionBatch = (items) => performanceEngine.processProductionBatch(items);
export const isValidEmail = (email) => performanceEngine.isValidEmail(email);
export const isValidCPF = (cpf) => performanceEngine.isValidCPF(cpf);
export const parseNumberSafe = (input) => performanceEngine.parseNumberSafe(input);
export const runBenchmark = (iterations) => performanceEngine.runBenchmark(iterations);
export const clearCache = () => performanceEngine.clearCache();
export const getStats = () => performanceEngine.getStats();

// Exportar engine principal
export default performanceEngine;

// Inicialização automática
initializeWasm().catch(console.error);
