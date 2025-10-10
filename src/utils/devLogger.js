/**
 * Sistema de Logging Condicional
 * Logs só aparecem em modo de desenvolvimento
 */

const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';

const devLogger = {
  /**
   * Log normal - só em desenvolvimento
   */
  log: (...args) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },

  /**
   * Log de informação - só em desenvolvimento
   */
  info: (...args) => {
    if (isDevelopment) {
      console.info('ℹ️', ...args);
    }
  },

  /**
   * Log de sucesso - só em desenvolvimento
   */
  success: (...args) => {
    if (isDevelopment) {
      console.log('✅', ...args);
    }
  },

  /**
   * Log de aviso - sempre mostra (importante)
   */
  warn: (...args) => {
    console.warn('⚠️', ...args);
  },

  /**
   * Log de erro - sempre mostra (crítico)
   */
  error: (...args) => {
    console.error('❌', ...args);
  },

  /**
   * Log de debug - só em desenvolvimento e com flag
   */
  debug: (...args) => {
    if (isDevelopment && localStorage.getItem('debug') === 'true') {
      console.debug('🐛', ...args);
    }
  },

  /**
   * Log de performance - só em desenvolvimento
   */
  perf: (label, fn) => {
    if (isDevelopment) {
      console.time(label);
      const result = fn();
      console.timeEnd(label);
      return result;
    }
    return fn();
  },

  /**
   * Log de grupo - só em desenvolvimento
   */
  group: (label, fn) => {
    if (isDevelopment) {
      console.group(label);
      fn();
      console.groupEnd();
    }
  },

  /**
   * Habilitar debug mode
   */
  enableDebug: () => {
    localStorage.setItem('debug', 'true');
    console.log('🐛 Debug mode enabled');
  },

  /**
   * Desabilitar debug mode
   */
  disableDebug: () => {
    localStorage.removeItem('debug');
    console.log('🐛 Debug mode disabled');
  }
};

// Exportar como padrão e nomeado
export default devLogger;
export const { log, info, success, warn, error, debug, perf, group, enableDebug, disableDebug } = devLogger;



