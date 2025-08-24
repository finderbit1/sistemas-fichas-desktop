// ===== CONFIGURAÇÃO CENTRALIZADA DO SISTEMA SGP =====

export const SYSTEM_CONFIG = {
  // ===== CONFIGURAÇÕES GERAIS =====
  APP_NAME: 'Sistema de Gestão de Pedidos',
  APP_VERSION: '1.0.0',
  APP_DESCRIPTION: 'Sistema moderno para gestão de pedidos e clientes',
  
  // ===== CONFIGURAÇÕES DA API =====
  API: {
    DEFAULT_BASE_URL: 'http://localhost:8000/api/v1',
    TIMEOUT: 15000,
    RETRY_ATTEMPTS: 3,
    ENDPOINTS: {
      AUTH: '/auth',
      CLIENTES: '/clientes',
      PEDIDOS: '/pedidos',
      PAGAMENTOS: '/tipos-pagamentos',
      ENVIOS: '/tipos-envios',
      ADMIN: '/admin/users',
      HEALTH: '/health',
      STATUS: '/status'
    }
  },
  
  // ===== CONFIGURAÇÕES DE AUTENTICAÇÃO =====
  AUTH: {
    SESSION_KEY: 'sgp_user_session',
    TOKEN_KEY: 'sgp_auth_token',
    REFRESH_INTERVAL: 5 * 60 * 1000, // 5 minutos
    AUTO_LOGOUT: 30 * 60 * 1000, // 30 minutos
    ROLES: {
      ADMIN: 'admin',
      MANAGER: 'manager',
      USER: 'user'
    }
  },
  
  // ===== CONFIGURAÇÕES DE UI =====
  UI: {
    THEME: {
      PRIMARY: '#3B82F6',
      SECONDARY: '#64748B',
      SUCCESS: '#22C55E',
      WARNING: '#F59E0B',
      ERROR: '#EF4444'
    },
    ANIMATIONS: {
      ENABLED: true,
      DURATION: {
        FAST: 150,
        NORMAL: 250,
        SLOW: 350
      }
    },
    SIDEBAR: {
      EXPANDED_WIDTH: 280,
      COLLAPSED_WIDTH: 80,
      ANIMATION_DURATION: 250
    }
  },
  
  // ===== CONFIGURAÇÕES DE NOTIFICAÇÕES =====
  NOTIFICATIONS: {
    AUTO_HIDE: true,
    DEFAULT_DURATION: 5000,
    POSITION: 'top-right',
    TYPES: ['success', 'error', 'warning', 'info']
  },
  
  // ===== CONFIGURAÇÕES DE VALIDAÇÃO =====
  VALIDATION: {
    PASSWORD_MIN_LENGTH: 6,
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE_REGEX: /^\(?([0-9]{2})\)?[-. ]?([0-9]{4,5})[-. ]?([0-9]{4})$/,
    CPF_REGEX: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/
  },
  
  // ===== CONFIGURAÇÕES DE PAGINAÇÃO =====
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [5, 10, 25, 50, 100],
    MAX_PAGE_SIZE: 100
  },
  
  // ===== CONFIGURAÇÕES DE ARQUIVOS =====
  FILES: {
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
    UPLOAD_PATH: '/uploads'
  },
  
  // ===== CONFIGURAÇÕES DE LOGGING =====
  LOGGING: {
    LEVEL: process.env.NODE_ENV === 'production' ? 'error' : 'debug',
    ENABLE_CONSOLE: process.env.NODE_ENV !== 'production',
    ENABLE_FILE: false,
    MAX_FILE_SIZE: 5 * 1024 * 1024 // 5MB
  },
  
  // ===== CONFIGURAÇÕES DE PERFORMANCE =====
  PERFORMANCE: {
    DEBOUNCE_DELAY: 300,
    THROTTLE_DELAY: 100,
    LAZY_LOADING: true,
    VIRTUALIZATION_THRESHOLD: 100
  },
  
  // ===== CONFIGURAÇÕES DE SEGURANÇA =====
  SECURITY: {
    CSRF_PROTECTION: true,
    XSS_PROTECTION: true,
    CONTENT_SECURITY_POLICY: true,
    RATE_LIMITING: {
      ENABLED: true,
      MAX_REQUESTS: 100,
      WINDOW_MS: 15 * 60 * 1000 // 15 minutos
    }
  }
};

// ===== FUNÇÕES DE CONFIGURAÇÃO =====

/**
 * Obtém configuração específica do sistema
 * @param {string} path - Caminho da configuração (ex: 'API.TIMEOUT')
 * @param {any} defaultValue - Valor padrão se não encontrado
 * @returns {any} Valor da configuração
 */
export const getConfig = (path, defaultValue = null) => {
  try {
    const keys = path.split('.');
    let value = SYSTEM_CONFIG;
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return defaultValue;
      }
    }
    
    return value;
  } catch (error) {
    console.warn(`Erro ao obter configuração: ${path}`, error);
    return defaultValue;
  }
};

/**
 * Define uma configuração específica do sistema
 * @param {string} path - Caminho da configuração
 * @param {any} value - Valor a ser definido
 * @returns {boolean} Sucesso da operação
 */
export const setConfig = (path, value) => {
  try {
    const keys = path.split('.');
    const lastKey = keys.pop();
    let current = SYSTEM_CONFIG;
    
    for (const key of keys) {
      if (!(key in current) || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }
    
    current[lastKey] = value;
    return true;
  } catch (error) {
    console.error(`Erro ao definir configuração: ${path}`, error);
    return false;
  }
};

/**
 * Obtém configuração da API
 * @returns {object} Configurações da API
 */
export const getApiConfig = () => SYSTEM_CONFIG.API;

/**
 * Obtém configuração de autenticação
 * @returns {object} Configurações de autenticação
 */
export const getAuthConfig = () => SYSTEM_CONFIG.AUTH;

/**
 * Obtém configuração de UI
 * @returns {object} Configurações de UI
 */
export const getUIConfig = () => SYSTEM_CONFIG.UI;

/**
 * Verifica se o ambiente é de produção
 * @returns {boolean} True se for produção
 */
export const isProduction = () => process.env.NODE_ENV === 'production';

/**
 * Obtém configuração baseada no ambiente
 * @param {string} path - Caminho da configuração
 * @param {any} devValue - Valor para desenvolvimento
 * @param {any} prodValue - Valor para produção
 * @returns {any} Valor da configuração
 */
export const getEnvConfig = (path, devValue, prodValue) => {
  return isProduction() ? prodValue : devValue;
};

export default SYSTEM_CONFIG;
