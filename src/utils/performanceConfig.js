/**
 * Configurações de performance para o sistema
 * Centraliza todas as configurações relacionadas à performance
 */

export const PERFORMANCE_CONFIG = {
  // Configurações de cache
  CACHE: {
    // Cache da API
    API: {
      maxSize: 100,
      ttl: 2 * 60 * 1000, // 2 minutos
      staleTime: 30 * 1000, // 30 segundos
      retryCount: 3,
      retryDelay: 1000
    },
    
    // Cache de componentes
    COMPONENTS: {
      maxSize: 200,
      ttl: 10 * 60 * 1000, // 10 minutos
    },
    
    // Cache de dados gerais
    DATA: {
      maxSize: 1000,
      ttl: 15 * 60 * 1000, // 15 minutos
    }
  },

  // Configurações de debounce
  DEBOUNCE: {
    SEARCH: 300, // 300ms para busca
    INPUT: 500, // 500ms para inputs
    API_CALLS: 1000, // 1s para chamadas de API
    SCROLL: 100 // 100ms para scroll
  },

  // Configurações de lazy loading
  LAZY_LOADING: {
    THRESHOLD: 0.1, // 10% do elemento visível
    ROOT_MARGIN: '50px',
    TRIGGER_ONCE: true,
    RETRY_COUNT: 3,
    RETRY_DELAY: 1000
  },

  // Configurações de virtualização
  VIRTUALIZATION: {
    ITEM_HEIGHT: 50,
    CONTAINER_HEIGHT: 400,
    OVERSCAN: 5,
    GRID_ITEM_WIDTH: 200,
    GRID_ITEM_HEIGHT: 200,
    GRID_GAP: 10
  },

  // Configurações de paginação
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
    CACHE_PAGES: 5 // Número de páginas para manter em cache
  },

  // Configurações de memória
  MEMORY: {
    MAX_COMPONENTS_IN_MEMORY: 100,
    CLEANUP_INTERVAL: 5 * 60 * 1000, // 5 minutos
    WARNING_THRESHOLD: 80, // 80% de uso de memória
    CRITICAL_THRESHOLD: 95 // 95% de uso de memória
  },

  // Configurações de renderização
  RENDERING: {
    BATCH_UPDATES: true,
    CONCURRENT_MODE: true,
    PRIORITY_THRESHOLD: 16, // 16ms para 60fps
    MAX_RENDER_TIME: 100 // 100ms máximo por render
  },

  // Configurações de rede
  NETWORK: {
    TIMEOUT: 10000, // 10 segundos
    RETRY_COUNT: 3,
    RETRY_DELAY: 1000,
    CONCURRENT_REQUESTS: 5,
    REQUEST_PRIORITY: {
      HIGH: 1,
      NORMAL: 2,
      LOW: 3
    }
  },

  // Configurações de monitoramento
  MONITORING: {
    ENABLED: true,
    SAMPLE_RATE: 0.1, // 10% das operações
    METRICS_INTERVAL: 30 * 1000, // 30 segundos
    LOG_LEVEL: 'info', // debug, info, warn, error
    PERFORMANCE_BUDGET: {
      FCP: 1800, // First Contentful Paint
      LCP: 2500, // Largest Contentful Paint
      FID: 100, // First Input Delay
      CLS: 0.1 // Cumulative Layout Shift
    }
  }
};

/**
 * Configurações específicas por ambiente
 */
export const ENVIRONMENT_CONFIG = {
  development: {
    ...PERFORMANCE_CONFIG,
    CACHE: {
      ...PERFORMANCE_CONFIG.CACHE,
      API: {
        ...PERFORMANCE_CONFIG.CACHE.API,
        ttl: 30 * 1000, // 30 segundos em desenvolvimento
      }
    },
    MONITORING: {
      ...PERFORMANCE_CONFIG.MONITORING,
      ENABLED: true,
      LOG_LEVEL: 'debug'
    }
  },
  
  production: {
    ...PERFORMANCE_CONFIG,
    MONITORING: {
      ...PERFORMANCE_CONFIG.MONITORING,
      SAMPLE_RATE: 0.01, // 1% em produção
      LOG_LEVEL: 'warn'
    }
  }
};

/**
 * Função para obter configuração baseada no ambiente
 */
export const getPerformanceConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  return ENVIRONMENT_CONFIG[env] || PERFORMANCE_CONFIG;
};

/**
 * Configurações específicas para componentes
 */
export const COMPONENT_CONFIG = {
  // CreateOrder
  CREATE_ORDER: {
    DEBOUNCE_DELAY: 300,
    CACHE_FORM_DATA: true,
    AUTO_SAVE_INTERVAL: 30 * 1000, // 30 segundos
    VALIDATION_DEBOUNCE: 500
  },

  // KanbanBoard
  KANBAN_BOARD: {
    VIRTUALIZATION_THRESHOLD: 50, // Virtualizar se mais de 50 itens
    DRAG_DEBOUNCE: 100,
    UPDATE_DEBOUNCE: 200
  },

  // Listas
  LISTS: {
    VIRTUALIZATION_THRESHOLD: 100,
    SEARCH_DEBOUNCE: 300,
    INFINITE_SCROLL_THRESHOLD: 0.8
  },

  // Modais
  MODALS: {
    LAZY_LOAD: true,
    PRELOAD_ADJACENT: true,
    ANIMATION_DURATION: 300
  },

  // Formulários
  FORMS: {
    VALIDATION_DEBOUNCE: 500,
    AUTO_SAVE_INTERVAL: 60 * 1000, // 1 minuto
    FIELD_DEBOUNCE: 300
  }
};

/**
 * Configurações de otimização por tipo de dispositivo
 */
export const DEVICE_CONFIG = {
  mobile: {
    VIRTUALIZATION_THRESHOLD: 20,
    CACHE_SIZE_MULTIPLIER: 0.5,
    DEBOUNCE_MULTIPLIER: 1.5,
    LAZY_LOADING_THRESHOLD: 0.2
  },
  
  tablet: {
    VIRTUALIZATION_THRESHOLD: 50,
    CACHE_SIZE_MULTIPLIER: 0.8,
    DEBOUNCE_MULTIPLIER: 1.2,
    LAZY_LOADING_THRESHOLD: 0.15
  },
  
  desktop: {
    VIRTUALIZATION_THRESHOLD: 100,
    CACHE_SIZE_MULTIPLIER: 1.0,
    DEBOUNCE_MULTIPLIER: 1.0,
    LAZY_LOADING_THRESHOLD: 0.1
  }
};

/**
 * Função para detectar tipo de dispositivo
 */
export const getDeviceType = () => {
  const width = window.innerWidth;
  
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
};

/**
 * Função para obter configuração otimizada para o dispositivo atual
 */
export const getOptimizedConfig = () => {
  const deviceType = getDeviceType();
  const baseConfig = getPerformanceConfig();
  const deviceConfig = DEVICE_CONFIG[deviceType];
  
  return {
    ...baseConfig,
    VIRTUALIZATION: {
      ...baseConfig.VIRTUALIZATION,
      THRESHOLD: deviceConfig.VIRTUALIZATION_THRESHOLD
    },
    CACHE: {
      ...baseConfig.CACHE,
      API: {
        ...baseConfig.CACHE.API,
        maxSize: Math.floor(baseConfig.CACHE.API.maxSize * deviceConfig.CACHE_SIZE_MULTIPLIER)
      }
    },
    DEBOUNCE: {
      ...baseConfig.DEBOUNCE,
      SEARCH: Math.floor(baseConfig.DEBOUNCE.SEARCH * deviceConfig.DEBOUNCE_MULTIPLIER),
      INPUT: Math.floor(baseConfig.DEBOUNCE.INPUT * deviceConfig.DEBOUNCE_MULTIPLIER)
    },
    LAZY_LOADING: {
      ...baseConfig.LAZY_LOADING,
      THRESHOLD: deviceConfig.LAZY_LOADING_THRESHOLD
    }
  };
};

export default PERFORMANCE_CONFIG;
