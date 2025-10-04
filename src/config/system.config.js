// Configuração do sistema - APENAS Rust (Tauri)
export const SYSTEM_CONFIG = {
  // Configuração atual do sistema
  CURRENT_MODE: 'rust', // SEMPRE 'rust'
  
  // URLs e configurações
  RUST_DATABASE_PATH: 'data/clientes.db',
  
  // Configurações de desenvolvimento
  DEV_MODE: process.env.NODE_ENV === 'development',
  DEBUG_LOGS: process.env.NODE_ENV === 'development',
  
  // Configurações de performance
  CACHE_ENABLED: true,
  CACHE_TTL: 300000, // 5 minutos
  
  // Otimizações de performance
  LAZY_LOADING: true,
  VIRTUAL_SCROLLING: true,
  MEMOIZATION: true,
  DEBOUNCE_DELAY: 300,
  THROTTLE_DELAY: 100,
  
  // Configurações de backup
  AUTO_BACKUP: true,
  BACKUP_INTERVAL: 3600000, // 1 hora
  
  // Configurações de relatórios
  REPORT_CACHE_SIZE: 100,
  REPORT_AUTO_REFRESH: false,
  
  // Configurações de UI
  THEME: 'light', // 'light' ou 'dark'
  LANGUAGE: 'pt-BR',
  
  // Configurações de notificações
  NOTIFICATIONS_ENABLED: true,
  SOUND_ENABLED: false,
};

// Função para obter modo atual - SEMPRE Rust
export const getCurrentMode = () => {
  return 'rust';
};

// Função para verificar se está usando Rust - SEMPRE true
export const isUsingRust = () => {
  return true;
};

// Função para verificar se está usando Python - SEMPRE false
export const isUsingPython = () => {
  return false;
};

// Função para obter configuração da API - SEMPRE Rust
export const getApiConfig = () => {
  return {
    type: 'rust',
    baseURL: null,
    timeout: 30000,
    retries: 3,
  };
};

// Função para obter configuração do banco - SEMPRE Rust
export const getDatabaseConfig = () => {
  return {
    type: 'sqlite',
    path: SYSTEM_CONFIG.RUST_DATABASE_PATH,
    connectionLimit: 1,
  };
};

// Função para inicializar configurações
export const initializeConfig = () => {
  const savedMode = localStorage.getItem('system_mode');
  if (savedMode) {
    SYSTEM_CONFIG.CURRENT_MODE = savedMode;
  }
  
  // Carregar outras configurações salvas
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    SYSTEM_CONFIG.THEME = savedTheme;
  }
  
  const savedLanguage = localStorage.getItem('language');
  if (savedLanguage) {
    SYSTEM_CONFIG.LANGUAGE = savedLanguage;
  }
  
  console.log(`🚀 Sistema inicializado no modo: ${SYSTEM_CONFIG.CURRENT_MODE}`);
};

// Função para salvar configurações
export const saveConfig = () => {
  localStorage.setItem('system_mode', SYSTEM_CONFIG.CURRENT_MODE);
  localStorage.setItem('theme', SYSTEM_CONFIG.THEME);
  localStorage.setItem('language', SYSTEM_CONFIG.LANGUAGE);
  console.log('💾 Configurações salvas');
};

// Função para resetar configurações
export const resetConfig = () => {
  localStorage.removeItem('system_mode');
  localStorage.removeItem('theme');
  localStorage.removeItem('language');
  SYSTEM_CONFIG.CURRENT_MODE = 'rust';
  SYSTEM_CONFIG.THEME = 'light';
  SYSTEM_CONFIG.LANGUAGE = 'pt-BR';
  console.log('🔄 Configurações resetadas');
};

// Função para obter informações do sistema
export const getSystemInfo = () => {
  return {
    mode: getCurrentMode(),
    apiConfig: getApiConfig(),
    databaseConfig: getDatabaseConfig(),
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    platform: navigator.platform,
  };
};

export default SYSTEM_CONFIG;