/**
 * Sistema de cache inteligente para melhorar performance
 * Implementa estratégias de cache como LRU, TTL e invalidação automática
 */

class PerformanceCache {
  constructor(options = {}) {
    this.maxSize = options.maxSize || 100;
    this.ttl = options.ttl || 5 * 60 * 1000; // 5 minutos
    this.cache = new Map();
    this.accessTimes = new Map();
    this.expirationTimes = new Map();
    this.hitCount = 0;
    this.missCount = 0;
  }

  /**
   * Obter valor do cache
   */
  get(key) {
    const now = Date.now();
    
    // Verificar se a chave existe
    if (!this.cache.has(key)) {
      this.missCount++;
      return null;
    }

    // Verificar se expirou
    const expirationTime = this.expirationTimes.get(key);
    if (expirationTime && now > expirationTime) {
      this.delete(key);
      this.missCount++;
      return null;
    }

    // Atualizar tempo de acesso
    this.accessTimes.set(key, now);
    this.hitCount++;
    
    return this.cache.get(key);
  }

  /**
   * Definir valor no cache
   */
  set(key, value, customTtl = null) {
    const now = Date.now();
    const ttl = customTtl || this.ttl;

    // Se o cache está cheio, remover o item menos usado
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictLRU();
    }

    this.cache.set(key, value);
    this.accessTimes.set(key, now);
    this.expirationTimes.set(key, now + ttl);
  }

  /**
   * Remover item do cache
   */
  delete(key) {
    this.cache.delete(key);
    this.accessTimes.delete(key);
    this.expirationTimes.delete(key);
  }

  /**
   * Limpar todo o cache
   */
  clear() {
    this.cache.clear();
    this.accessTimes.clear();
    this.expirationTimes.clear();
    this.hitCount = 0;
    this.missCount = 0;
  }

  /**
   * Remover item menos usado recentemente (LRU)
   */
  evictLRU() {
    let oldestKey = null;
    let oldestTime = Infinity;

    for (const [key, time] of this.accessTimes) {
      if (time < oldestTime) {
        oldestTime = time;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.delete(oldestKey);
    }
  }

  /**
   * Verificar se uma chave existe no cache
   */
  has(key) {
    return this.get(key) !== null;
  }

  /**
   * Obter estatísticas do cache
   */
  getStats() {
    const totalRequests = this.hitCount + this.missCount;
    const hitRate = totalRequests > 0 ? (this.hitCount / totalRequests) * 100 : 0;

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitCount: this.hitCount,
      missCount: this.missCount,
      hitRate: Math.round(hitRate * 100) / 100,
      ttl: this.ttl
    };
  }

  /**
   * Limpar itens expirados
   */
  cleanup() {
    const now = Date.now();
    const expiredKeys = [];

    for (const [key, expirationTime] of this.expirationTimes) {
      if (now > expirationTime) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => this.delete(key));
    return expiredKeys.length;
  }

  /**
   * Obter todas as chaves do cache
   */
  keys() {
    return Array.from(this.cache.keys());
  }

  /**
   * Obter todos os valores do cache
   */
  values() {
    return Array.from(this.cache.values());
  }

  /**
   * Obter todas as entradas do cache
   */
  entries() {
    return Array.from(this.cache.entries());
  }
}

/**
 * Cache específico para dados da API
 */
class ApiCache extends PerformanceCache {
  constructor(options = {}) {
    super({
      maxSize: options.maxSize || 50,
      ttl: options.ttl || 2 * 60 * 1000, // 2 minutos para APIs
      ...options
    });
    
    this.requestPromises = new Map(); // Evitar requisições duplicadas
  }

  /**
   * Obter dados da API com cache
   */
  async getOrFetch(key, fetchFunction, options = {}) {
    // Verificar cache primeiro
    const cached = this.get(key);
    if (cached !== null) {
      return cached;
    }

    // Verificar se já existe uma requisição em andamento
    if (this.requestPromises.has(key)) {
      return this.requestPromises.get(key);
    }

    // Fazer nova requisição
    const promise = fetchFunction()
      .then(data => {
        this.set(key, data, options.ttl);
        this.requestPromises.delete(key);
        return data;
      })
      .catch(error => {
        this.requestPromises.delete(key);
        throw error;
      });

    this.requestPromises.set(key, promise);
    return promise;
  }

  /**
   * Invalidar cache por padrão
   */
  invalidatePattern(pattern) {
    const regex = new RegExp(pattern);
    const keysToDelete = this.keys().filter(key => regex.test(key));
    keysToDelete.forEach(key => this.delete(key));
    return keysToDelete.length;
  }

  /**
   * Pré-carregar dados
   */
  async preload(key, fetchFunction, ttl = null) {
    try {
      const data = await fetchFunction();
      this.set(key, data, ttl);
      return data;
    } catch (error) {
      console.warn(`Falha ao pré-carregar ${key}:`, error);
      return null;
    }
  }
}

/**
 * Cache para componentes React
 */
class ComponentCache extends PerformanceCache {
  constructor(options = {}) {
    super({
      maxSize: options.maxSize || 200,
      ttl: options.ttl || 10 * 60 * 1000, // 10 minutos para componentes
      ...options
    });
  }

  /**
   * Cache de resultados de computação pesada
   */
  memoize(key, computeFunction, dependencies = []) {
    const cacheKey = `${key}_${JSON.stringify(dependencies)}`;
    
    const cached = this.get(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const result = computeFunction();
    this.set(cacheKey, result);
    return result;
  }

  /**
   * Cache de componentes renderizados
   */
  cacheComponent(key, component, props = {}) {
    const cacheKey = `${key}_${JSON.stringify(props)}`;
    
    const cached = this.get(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const rendered = component(props);
    this.set(cacheKey, rendered);
    return rendered;
  }
}

/**
 * Cache global para a aplicação
 */
const globalCache = {
  api: new ApiCache(),
  components: new ComponentCache(),
  data: new PerformanceCache({ maxSize: 1000, ttl: 15 * 60 * 1000 })
};

/**
 * Utilitários para cache
 */
export const cacheUtils = {
  /**
   * Criar chave de cache baseada em parâmetros
   */
  createKey: (prefix, ...params) => {
    return `${prefix}_${params.map(p => 
      typeof p === 'object' ? JSON.stringify(p) : String(p)
    ).join('_')}`;
  },

  /**
   * Limpar todos os caches
   */
  clearAll: () => {
    Object.values(globalCache).forEach(cache => cache.clear());
  },

  /**
   * Obter estatísticas de todos os caches
   */
  getAllStats: () => {
    return Object.entries(globalCache).reduce((stats, [name, cache]) => {
      stats[name] = cache.getStats();
      return stats;
    }, {});
  },

  /**
   * Limpeza automática de caches expirados
   */
  cleanup: () => {
    return Object.values(globalCache).reduce((total, cache) => {
      return total + cache.cleanup();
    }, 0);
  }
};

// Limpeza automática a cada 5 minutos
setInterval(() => {
  cacheUtils.cleanup();
}, 5 * 60 * 1000);

export { PerformanceCache, ApiCache, ComponentCache, globalCache };
export default globalCache;
