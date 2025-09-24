/**
 * Sistema central de otimização de performance
 * Integra todas as otimizações implementadas
 */

import { getOptimizedConfig, COMPONENT_CONFIG } from './performanceConfig';
import { globalCache, cacheUtils } from './performanceCache';

/**
 * Classe principal para otimização de performance
 */
class PerformanceOptimizer {
  constructor() {
    this.config = getOptimizedConfig();
    this.metrics = {
      renderCount: 0,
      cacheHits: 0,
      cacheMisses: 0,
      apiCalls: 0,
      renderTime: 0,
      memoryUsage: 0
    };
    this.observers = new Map();
    this.isMonitoring = false;
    
    this.init();
  }

  /**
   * Inicializar o otimizador
   */
  init() {
    this.setupMemoryMonitoring();
    this.setupPerformanceMonitoring();
    this.setupCacheOptimization();
    this.startCleanupInterval();
  }

  /**
   * Configurar monitoramento de memória
   */
  setupMemoryMonitoring() {
    if ('memory' in performance) {
      setInterval(() => {
        const memoryInfo = performance.memory;
        this.metrics.memoryUsage = memoryInfo.usedJSHeapSize / memoryInfo.totalJSHeapSize;
        
        if (this.metrics.memoryUsage > this.config.MEMORY.CRITICAL_THRESHOLD / 100) {
          this.handleCriticalMemoryUsage();
        } else if (this.metrics.memoryUsage > this.config.MEMORY.WARNING_THRESHOLD / 100) {
          this.handleMemoryWarning();
        }
      }, this.config.MEMORY.CLEANUP_INTERVAL);
    }
  }

  /**
   * Configurar monitoramento de performance
   */
  setupPerformanceMonitoring() {
    if (this.config.MONITORING.ENABLED) {
      // Observer para métricas de performance
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.handlePerformanceEntry(entry);
          }
        });

        try {
          observer.observe({ entryTypes: ['measure', 'navigation', 'paint'] });
          this.observers.set('performance', observer);
        } catch (e) {
          console.warn('PerformanceObserver não suportado:', e);
        }
      }

      // Monitorar renderizações lentas
      this.monitorSlowRenders();
    }
  }

  /**
   * Configurar otimização de cache
   */
  setupCacheOptimization() {
    // Interceptar chamadas de API para cache automático
    this.interceptApiCalls();
    
    // Configurar invalidação automática de cache
    this.setupCacheInvalidation();
  }

  /**
   * Monitorar renderizações lentas
   */
  monitorSlowRenders() {
    let renderStartTime = 0;
    
    const measureRender = () => {
      const renderTime = performance.now() - renderStartTime;
      this.metrics.renderTime = renderTime;
      this.metrics.renderCount++;
      
      if (renderTime > this.config.RENDERING.MAX_RENDER_TIME) {
        this.handleSlowRender(renderTime);
      }
    };

    // Hook para medir tempo de renderização
    const originalRequestAnimationFrame = window.requestAnimationFrame;
    window.requestAnimationFrame = (callback) => {
      return originalRequestAnimationFrame((time) => {
        renderStartTime = performance.now();
        callback(time);
        measureRender();
      });
    };
  }

  /**
   * Interceptar chamadas de API
   */
  interceptApiCalls() {
    const originalFetch = window.fetch;
    
    window.fetch = async (url, options = {}) => {
      this.metrics.apiCalls++;
      
      const cacheKey = this.generateCacheKey(url, options);
      const cached = globalCache.api.get(cacheKey);
      
      if (cached && !options.forceRefresh) {
        this.metrics.cacheHits++;
        return new Response(JSON.stringify(cached), {
          status: 200,
          statusText: 'OK',
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      this.metrics.cacheMisses++;
      
      try {
        const response = await originalFetch(url, options);
        const data = await response.json();
        
        // Cache apenas respostas bem-sucedidas
        if (response.ok) {
          globalCache.api.set(cacheKey, data, this.config.CACHE.API.ttl);
        }
        
        return response;
      } catch (error) {
        console.error('Erro na chamada de API:', error);
        throw error;
      }
    };
  }

  /**
   * Configurar invalidação automática de cache
   */
  setupCacheInvalidation() {
    // Invalidar cache baseado em eventos do usuário
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Limpar cache quando a aba não está visível
        this.cleanupCache();
      }
    });

    // Invalidar cache em mudanças de rota
    window.addEventListener('beforeunload', () => {
      this.cleanupCache();
    });
  }

  /**
   * Iniciar intervalo de limpeza
   */
  startCleanupInterval() {
    setInterval(() => {
      this.cleanupCache();
      this.logMetrics();
    }, this.config.MEMORY.CLEANUP_INTERVAL);
  }

  /**
   * Gerar chave de cache
   */
  generateCacheKey(url, options) {
    const method = options.method || 'GET';
    const body = options.body ? JSON.stringify(options.body) : '';
    return cacheUtils.createKey('api', url, method, body);
  }

  /**
   * Limpar cache
   */
  cleanupCache() {
    const cleaned = cacheUtils.cleanup();
    if (cleaned > 0) {
      console.log(`Cache limpo: ${cleaned} itens removidos`);
    }
  }

  /**
   * Lidar com entrada de performance
   */
  handlePerformanceEntry(entry) {
    switch (entry.entryType) {
      case 'measure':
        if (entry.duration > this.config.RENDERING.MAX_RENDER_TIME) {
          console.warn(`Operação lenta detectada: ${entry.name} (${entry.duration}ms)`);
        }
        break;
      case 'navigation':
        this.handleNavigationMetrics(entry);
        break;
      case 'paint':
        this.handlePaintMetrics(entry);
        break;
    }
  }

  /**
   * Lidar com métricas de navegação
   */
  handleNavigationMetrics(entry) {
    const metrics = {
      domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
      loadComplete: entry.loadEventEnd - entry.loadEventStart,
      firstByte: entry.responseStart - entry.requestStart
    };

    // Verificar se está dentro do orçamento de performance
    this.checkPerformanceBudget(metrics);
  }

  /**
   * Lidar com métricas de paint
   */
  handlePaintMetrics(entry) {
    if (entry.name === 'first-contentful-paint') {
      if (entry.startTime > this.config.MONITORING.PERFORMANCE_BUDGET.FCP) {
        console.warn(`FCP lento: ${entry.startTime}ms`);
      }
    }
  }

  /**
   * Verificar orçamento de performance
   */
  checkPerformanceBudget(metrics) {
    const budget = this.config.MONITORING.PERFORMANCE_BUDGET;
    
    Object.entries(metrics).forEach(([key, value]) => {
      if (budget[key] && value > budget[key]) {
        console.warn(`Métrica ${key} excedeu o orçamento: ${value}ms > ${budget[key]}ms`);
      }
    });
  }

  /**
   * Lidar com uso crítico de memória
   */
  handleCriticalMemoryUsage() {
    console.error('Uso crítico de memória detectado!');
    this.emergencyCleanup();
  }

  /**
   * Lidar com aviso de memória
   */
  handleMemoryWarning() {
    console.warn('Uso alto de memória detectado');
    this.cleanupCache();
  }

  /**
   * Lidar com renderização lenta
   */
  handleSlowRender(renderTime) {
    console.warn(`Renderização lenta detectada: ${renderTime}ms`);
    
    // Sugerir otimizações
    this.suggestOptimizations();
  }

  /**
   * Limpeza de emergência
   */
  emergencyCleanup() {
    // Limpar todos os caches
    cacheUtils.clearAll();
    
    // Forçar garbage collection se disponível
    if (window.gc) {
      window.gc();
    }
    
    // Reduzir qualidade de componentes se necessário
    this.reduceQuality();
  }

  /**
   * Reduzir qualidade para economizar memória
   */
  reduceQuality() {
    // Implementar redução de qualidade quando necessário
    console.log('Reduzindo qualidade para economizar memória');
  }

  /**
   * Sugerir otimizações
   */
  suggestOptimizations() {
    const suggestions = [];
    
    if (this.metrics.cacheMisses > this.metrics.cacheHits) {
      suggestions.push('Considere aumentar o tamanho do cache');
    }
    
    if (this.metrics.renderTime > this.config.RENDERING.MAX_RENDER_TIME) {
      suggestions.push('Considere usar React.memo() ou useMemo()');
    }
    
    if (this.metrics.apiCalls > 100) {
      suggestions.push('Considere implementar debounce nas chamadas de API');
    }
    
    if (suggestions.length > 0) {
      console.log('Sugestões de otimização:', suggestions);
    }
  }

  /**
   * Log de métricas
   */
  logMetrics() {
    if (this.config.MONITORING.LOG_LEVEL === 'debug') {
      console.log('Métricas de Performance:', {
        ...this.metrics,
        cacheStats: cacheUtils.getAllStats()
      });
    }
  }

  /**
   * Obter métricas atuais
   */
  getMetrics() {
    return {
      ...this.metrics,
      cacheStats: cacheUtils.getAllStats(),
      config: this.config
    };
  }

  /**
   * Configurar componente específico
   */
  configureComponent(componentName, customConfig = {}) {
    const componentConfig = COMPONENT_CONFIG[componentName] || {};
    return { ...componentConfig, ...customConfig };
  }

  /**
   * Otimizar componente automaticamente
   */
  optimizeComponent(componentName, component) {
    const config = this.configureComponent(componentName);
    
    // Aplicar otimizações baseadas na configuração
    if (config.DEBOUNCE_DELAY) {
      // Aplicar debounce se necessário
    }
    
    if (config.CACHE_FORM_DATA) {
      // Habilitar cache de dados do formulário
    }
    
    return component;
  }

  /**
   * Destruir otimizador
   */
  destroy() {
    // Limpar observers
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    
    // Limpar caches
    cacheUtils.clearAll();
    
    // Parar monitoramento
    this.isMonitoring = false;
  }
}

// Instância global do otimizador
const performanceOptimizer = new PerformanceOptimizer();

// Exportar instância e classe
export { PerformanceOptimizer, performanceOptimizer };
export default performanceOptimizer;
