/**
 * Sistema de Cache DESABILITADO
 * 
 * Cache foi removido - sistema SEMPRE busca dados diretamente da API
 * Garante dados sempre atualizados e sincronizados entre todos os clientes
 */

class CacheManager {
  /**
   * CACHE DESABILITADO - Não salva nada
   */
  set(key, data, customTTL = null) {
    return false;
  }

  /**
   * CACHE DESABILITADO - Sempre retorna null para forçar busca da API
   */
  get(key) {
    return null;
  }

  /**
   * CACHE DESABILITADO
   */
  invalidate(key) {
    return true;
  }

  /**
   * CACHE DESABILITADO
   */
  clearAll() {
    console.log('✅ Cache desabilitado - sistema sempre busca da API');
    return true;
  }

  /**
   * CACHE DESABILITADO
   */
  showStats() {
    console.log('\nℹ️  SISTEMA DE CACHE DESABILITADO');
    console.log('📡 Todos os dados são buscados diretamente da API');
    console.log('⚡ Sem cache = Sempre dados atualizados!');
    console.log('🔄 Sincronização em tempo real via WebSocket\n');
  }

  /**
   * CACHE DESABILITADO
   */
  clearExpired() {
    return 0;
  }

  /**
   * CACHE DESABILITADO
   */
  has(key) {
    return false;
  }

  /**
   * CACHE DESABILITADO
   */
  getAll() {
    return {};
  }
}

// Exportar instância única
const cacheManager = new CacheManager();

// Disponibilizar globalmente para debug
if (typeof window !== 'undefined') {
  window.cacheManager = cacheManager;
}

export default cacheManager;
