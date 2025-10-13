/**
 * 🧹 Controle de Cache - Sistema de Fichas
 * 
 * Funções para gerenciar e limpar cache quando necessário
 */

/**
 * Limpa TODO o cache do sistema
 */
export function clearAllCache() {
  console.log('🧹 Limpando TODO o cache do sistema...');
  
  // 1. LocalStorage
  const keysToKeep = ['api_config']; // Manter configuração da API
  const allKeys = Object.keys(localStorage);
  
  allKeys.forEach(key => {
    if (!keysToKeep.includes(key)) {
      localStorage.removeItem(key);
      console.log(`   ✓ Removido: ${key}`);
    }
  });
  
  // 2. SessionStorage
  sessionStorage.clear();
  console.log('   ✓ SessionStorage limpo');
  
  // 3. Cache Manager (se existir)
  if (typeof window !== 'undefined' && window.cacheManager) {
    window.cacheManager.clearAll();
    console.log('   ✓ CacheManager limpo');
  }
  
  console.log('✅ Cache limpo com sucesso!');
  console.log('💡 Recarregue a página para buscar dados frescos da API');
  
  return true;
}

/**
 * Limpa apenas cache de dados (mantém config e auth)
 */
export function clearDataCache() {
  console.log('🧹 Limpando cache de dados...');
  
  const keysToKeep = ['api_config', 'api_config_timestamp', 'auth_token', 'user_data'];
  const allKeys = Object.keys(localStorage);
  
  allKeys.forEach(key => {
    if (!keysToKeep.includes(key)) {
      localStorage.removeItem(key);
    }
  });
  
  if (typeof window !== 'undefined' && window.cacheManager) {
    window.cacheManager.clearAll();
  }
  
  console.log('✅ Cache de dados limpo!');
  return true;
}

/**
 * Força reload de dados da API (invalida cache)
 */
export function forceReload() {
  console.log('🔄 Forçando reload de dados da API...');
  
  clearDataCache();
  
  // Recarregar página
  if (typeof window !== 'undefined') {
    window.location.reload();
  }
}

/**
 * Verifica se há cache desatualizado
 */
export function checkCacheHealth() {
  console.log('\n📊 DIAGNÓSTICO DE CACHE\n');
  
  const cacheKeys = Object.keys(localStorage).filter(key => 
    !['api_config', 'api_config_timestamp', 'auth_token', 'user_data'].includes(key)
  );
  
  console.log('Chaves de cache encontradas:', cacheKeys.length);
  
  cacheKeys.forEach(key => {
    const value = localStorage.getItem(key);
    let size = 0;
    
    try {
      size = new Blob([value]).size;
      console.log(`   • ${key}: ${(size / 1024).toFixed(2)} KB`);
    } catch (e) {
      console.log(`   • ${key}: (erro ao calcular)`);
    }
  });
  
  if (cacheKeys.length > 0) {
    console.log('\n💡 Para limpar o cache, execute:');
    console.log('   clearAllCache()');
    console.log('   // ou');
    console.log('   forceReload()');
  } else {
    console.log('\n✅ Cache limpo!');
  }
  
  console.log('');
}

/**
 * Limpa cache ao trocar de servidor
 */
export function clearCacheOnServerChange(newServerURL) {
  const currentConfig = localStorage.getItem('api_config');
  
  if (currentConfig) {
    try {
      const config = JSON.parse(currentConfig);
      
      // Se mudou o servidor, limpar cache
      if (config.apiURL !== newServerURL) {
        console.log('⚠️ Servidor mudou, limpando cache...');
        console.log(`   Antigo: ${config.apiURL}`);
        console.log(`   Novo: ${newServerURL}`);
        
        clearDataCache();
        return true;
      }
    } catch (e) {
      console.error('Erro ao verificar mudança de servidor:', e);
    }
  }
  
  return false;
}

/**
 * Mostra informações de debug
 */
export function showCacheInfo() {
  console.log('\n📋 INFORMAÇÕES DE CACHE\n');
  
  // Config da API
  const apiConfig = localStorage.getItem('api_config');
  if (apiConfig) {
    console.log('Configuração da API:');
    console.table(JSON.parse(apiConfig));
  }
  
  console.log('\n');
  checkCacheHealth();
}

// Exportar para uso global no console
if (typeof window !== 'undefined') {
  window.clearAllCache = clearAllCache;
  window.clearDataCache = clearDataCache;
  window.forceReload = forceReload;
  window.checkCacheHealth = checkCacheHealth;
  window.showCacheInfo = showCacheInfo;
  
  console.log('\n💡 Comandos de cache disponíveis:');
  console.log('   • clearAllCache()    - Limpa TODO o cache');
  console.log('   • clearDataCache()   - Limpa dados (mantém config)');
  console.log('   • forceReload()      - Limpa e recarrega');
  console.log('   • checkCacheHealth() - Diagnóstico de cache');
  console.log('   • showCacheInfo()    - Informações detalhadas\n');
}

export default {
  clearAllCache,
  clearDataCache,
  forceReload,
  checkCacheHealth,
  showCacheInfo,
  clearCacheOnServerChange
};

