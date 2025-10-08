/**
 * Sistema de Cache Inteligente para o Navegador
 * 
 * Cacheia dados importantes no localStorage com TTL (Time To Live)
 * Reduz requisições desnecessárias à API
 */

const CACHE_PREFIX = 'sgp_cache_';
const DEFAULT_TTL = 1000 * 60 * 30; // 30 minutos padrão

/**
 * Tempos de expiração personalizados para cada tipo de dado
 */
const CACHE_TTL = {
  designers: 1000 * 60 * 60,      // 1 hora (muda pouco)
  vendedores: 1000 * 60 * 60,     // 1 hora (muda pouco)
  tecidos: 1000 * 60 * 30,        // 30 minutos
  materiais: 1000 * 60 * 30,      // 30 minutos
  formasPagamento: 1000 * 60 * 60 * 2, // 2 horas (quase nunca muda)
  formasEnvio: 1000 * 60 * 60 * 2,     // 2 horas (quase nunca muda)
  descontos: 1000 * 60 * 15,      // 15 minutos (pode mudar)
  pedidosPendentes: 1000 * 15,    // 15 segundos (atualização rápida para sincronização em rede)
  pedidos: 1000 * 15,             // 15 segundos (atualização rápida)
  clientes: 1000 * 60 * 10,       // 10 minutos
};

class CacheManager {
  /**
   * Salva dados no cache com timestamp
   */
  set(key, data, customTTL = null) {
    try {
      const ttl = customTTL || CACHE_TTL[key] || DEFAULT_TTL;
      const cacheData = {
        data: data,
        timestamp: Date.now(),
        expiresAt: Date.now() + ttl,
        ttl: ttl
      };
      
      localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(cacheData));
      
      // Log só em desenvolvimento
      if (import.meta.env.DEV) {
        console.log(`💾 Cache salvo: ${key} (expira em ${ttl/1000/60}min)`);
      }
      
      return true;
    } catch (error) {
      console.error('❌ Erro ao salvar cache:', error);
      return false;
    }
  }

  /**
   * Busca dados do cache
   * Retorna null se não existir ou expirado
   */
  get(key) {
    try {
      const cached = localStorage.getItem(CACHE_PREFIX + key);
      
      if (!cached) {
        return null;
      }
      
      const cacheData = JSON.parse(cached);
      const now = Date.now();
      
      // Verificar se expirou
      if (now > cacheData.expiresAt) {
        this.delete(key);
        if (import.meta.env.DEV) {
          console.log(`⏱️ Cache expirado: ${key}`);
        }
        return null;
      }
      
      // Log só em desenvolvimento
      if (import.meta.env.DEV) {
        const tempoRestante = Math.round((cacheData.expiresAt - now) / 1000 / 60);
        console.log(`✅ Cache hit: ${key} (expira em ${tempoRestante}min)`);
      }
      
      return cacheData.data;
    } catch (error) {
      console.error('❌ Erro ao ler cache:', error);
      this.delete(key);
      return null;
    }
  }

  /**
   * Deleta um item específico do cache
   */
  delete(key) {
    try {
      localStorage.removeItem(CACHE_PREFIX + key);
      if (import.meta.env.DEV) {
        console.log(`🗑️ Cache removido: ${key}`);
      }
      return true;
    } catch (error) {
      console.error('❌ Erro ao deletar cache:', error);
      return false;
    }
  }

  /**
   * Limpa todo o cache do sistema
   */
  clearAll() {
    try {
      const keys = Object.keys(localStorage);
      let count = 0;
      
      keys.forEach(key => {
        if (key.startsWith(CACHE_PREFIX)) {
          localStorage.removeItem(key);
          count++;
        }
      });
      
      console.log(`🧹 Cache limpo: ${count} itens removidos`);
      return count;
    } catch (error) {
      console.error('❌ Erro ao limpar cache:', error);
      return 0;
    }
  }

  /**
   * Invalida cache específico (força recarregar)
   */
  invalidate(key) {
    this.delete(key);
    console.log(`♻️ Cache invalidado: ${key} - Próxima chamada buscará da API`);
  }

  /**
   * Verifica se o cache existe e está válido
   */
  isValid(key) {
    const cached = localStorage.getItem(CACHE_PREFIX + key);
    if (!cached) return false;
    
    try {
      const cacheData = JSON.parse(cached);
      return Date.now() <= cacheData.expiresAt;
    } catch {
      return false;
    }
  }

  /**
   * Obtém informações sobre um cache específico
   */
  getInfo(key) {
    const cached = localStorage.getItem(CACHE_PREFIX + key);
    if (!cached) {
      return { exists: false };
    }
    
    try {
      const cacheData = JSON.parse(cached);
      const now = Date.now();
      const tempoRestante = Math.max(0, cacheData.expiresAt - now);
      
      return {
        exists: true,
        isValid: now <= cacheData.expiresAt,
        timestamp: new Date(cacheData.timestamp),
        expiresAt: new Date(cacheData.expiresAt),
        tempoRestanteMs: tempoRestante,
        tempoRestanteMin: Math.round(tempoRestante / 1000 / 60),
        ttl: cacheData.ttl,
        dataSize: JSON.stringify(cacheData.data).length
      };
    } catch {
      return { exists: true, error: true };
    }
  }

  /**
   * Lista todos os caches ativos
   */
  listAll() {
    const keys = Object.keys(localStorage);
    const caches = [];
    
    keys.forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        const cleanKey = key.replace(CACHE_PREFIX, '');
        const info = this.getInfo(cleanKey);
        caches.push({
          key: cleanKey,
          ...info
        });
      }
    });
    
    return caches;
  }

  /**
   * Obtém tamanho total do cache
   */
  getTotalSize() {
    const keys = Object.keys(localStorage);
    let totalSize = 0;
    
    keys.forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        const value = localStorage.getItem(key);
        totalSize += value ? value.length : 0;
      }
    });
    
    return {
      bytes: totalSize,
      kb: (totalSize / 1024).toFixed(2),
      mb: (totalSize / 1024 / 1024).toFixed(2)
    };
  }

  /**
   * Limpa caches expirados
   */
  cleanExpired() {
    const keys = Object.keys(localStorage);
    let count = 0;
    
    keys.forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        const cleanKey = key.replace(CACHE_PREFIX, '');
        if (!this.isValid(cleanKey)) {
          this.delete(cleanKey);
          count++;
        }
      }
    });
    
    if (count > 0) {
      console.log(`🧹 ${count} cache(s) expirado(s) removido(s)`);
    }
    
    return count;
  }

  /**
   * Estatísticas do cache
   */
  getStats() {
    const caches = this.listAll();
    const size = this.getTotalSize();
    
    return {
      total: caches.length,
      validos: caches.filter(c => c.isValid).length,
      expirados: caches.filter(c => !c.isValid).length,
      tamanho: size,
      caches: caches
    };
  }

  /**
   * Exibe estatísticas no console
   */
  showStats() {
    const stats = this.getStats();
    
    console.group('📊 Estatísticas do Cache');
    console.log(`Total de caches: ${stats.total}`);
    console.log(`Válidos: ${stats.validos}`);
    console.log(`Expirados: ${stats.expirados}`);
    console.log(`Tamanho total: ${stats.tamanho.kb} KB`);
    console.log('\nDetalhes:');
    
    stats.caches.forEach(cache => {
      const status = cache.isValid ? '✅' : '❌';
      const tempo = cache.isValid ? `(${cache.tempoRestanteMin}min restante)` : '(expirado)';
      console.log(`  ${status} ${cache.key}: ${tempo}`);
    });
    
    console.groupEnd();
  }
}

// Instância única (singleton)
const cacheManager = new CacheManager();

// Limpar caches expirados ao carregar
cacheManager.cleanExpired();

// Exportar
export default cacheManager;

// Disponibilizar globalmente para debug
if (import.meta.env.DEV) {
  window.cacheManager = cacheManager;
  console.log('💡 Use window.cacheManager no console para debug do cache');
}

