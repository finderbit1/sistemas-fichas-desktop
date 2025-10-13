/**
 * 🔧 Carregador de Configuração da API
 * 
 * Sistema que carrega configuração da API a partir de arquivo local.
 * Suporta múltiplas fontes e fallbacks automáticos.
 * 
 * Prioridade de carregamento:
 * 1. Arquivo config/api-config.json (local)
 * 2. LocalStorage (última configuração válida)
 * 3. Configuração padrão (localhost)
 */

const CONFIG_FILE_PATH = '/config/api-config.json';
const STORAGE_KEY = 'api_config';
const DEFAULT_CONFIG = {
  apiURL: 'http://192.168.15.3:8000',
  wsURL: 'ws://192.168.15.3:8000',
  timeout: 10000,
  retries: 3
};

/**
 * Carrega configuração do arquivo config/api-config.json
 */
async function loadConfigFromFile() {
  try {
    console.log('🔍 Carregando configuração de:', CONFIG_FILE_PATH);
    
    const response = await fetch(CONFIG_FILE_PATH);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const config = await response.json();
    
    // Validar configuração
    if (!config.apiURL || !config.wsURL) {
      throw new Error('Configuração inválida: apiURL e wsURL são obrigatórios');
    }
    
    console.log('✅ Configuração carregada do arquivo:', config);
    return config;
    
  } catch (error) {
    console.warn('⚠️ Não foi possível carregar config/api-config.json:', error.message);
    return null;
  }
}

/**
 * Carrega configuração do localStorage
 */
function loadConfigFromStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    
    if (!stored) {
      return null;
    }
    
    const config = JSON.parse(stored);
    console.log('📦 Configuração carregada do localStorage:', config);
    return config;
    
  } catch (error) {
    console.warn('⚠️ Erro ao ler localStorage:', error.message);
    return null;
  }
}

/**
 * Salva configuração no localStorage
 */
function saveConfigToStorage(config) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    localStorage.setItem(STORAGE_KEY + '_timestamp', new Date().toISOString());
    console.log('💾 Configuração salva no localStorage');
  } catch (error) {
    console.error('❌ Erro ao salvar configuração:', error);
  }
}

/**
 * Testa se a configuração está funcionando
 */
async function testConfig(config) {
  try {
    console.log('🧪 Testando conexão com:', config.apiURL);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`${config.apiURL}/health`, {
      signal: controller.abortSignal
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      console.log('✅ Conexão com API bem-sucedida!');
      return true;
    }
    
    console.warn('⚠️ API respondeu com status:', response.status);
    return false;
    
  } catch (error) {
    if (error.name === 'AbortError') {
      console.warn('⏰ Timeout ao conectar na API');
    } else {
      console.warn('❌ Erro ao testar conexão:', error.message);
    }
    return false;
  }
}

/**
 * Carrega configuração com sistema de fallback
 */
export async function loadApiConfig() {
  console.log('🚀 Iniciando carregamento de configuração da API...\n');
  
  let config = null;
  let source = null;
  
  // 1. Tentar carregar do arquivo
  config = await loadConfigFromFile();
  if (config) {
    source = 'arquivo';
  }
  
  // 2. Se não achou, tentar localStorage
  if (!config) {
    console.log('📦 Tentando carregar do localStorage...');
    config = loadConfigFromStorage();
    if (config) {
      source = 'localStorage';
    }
  }
  
  // 3. Se não achou, usar padrão
  if (!config) {
    console.log('⚙️ Usando configuração padrão...');
    config = { ...DEFAULT_CONFIG };
    source = 'padrão';
  }
  
  console.log(`\n📋 Configuração carregada (fonte: ${source}):`);
  console.log('   ├─ API URL:', config.apiURL);
  console.log('   ├─ WebSocket URL:', config.wsURL);
  console.log('   ├─ Timeout:', config.timeout, 'ms');
  console.log('   └─ Retries:', config.retries);
  
  // Testar conexão (não bloqueante)
  testConfig(config).then(isWorking => {
    if (isWorking) {
      // Se funciona e não veio do arquivo, salvar no storage
      if (source !== 'arquivo') {
        saveConfigToStorage(config);
      }
    } else {
      console.warn('\n⚠️ ATENÇÃO: Não foi possível conectar na API!');
      console.warn('   Verifique se o servidor está rodando.');
      console.warn('   O sistema tentará usar cache local quando possível.\n');
    }
  });
  
  return config;
}

/**
 * Atualiza configuração manualmente (via interface admin)
 */
export function updateApiConfig(newConfig) {
  console.log('🔄 Atualizando configuração da API...');
  
  // Validar
  if (!newConfig.apiURL || !newConfig.wsURL) {
    throw new Error('apiURL e wsURL são obrigatórios');
  }
  
  // Garantir valores padrão
  const config = {
    ...DEFAULT_CONFIG,
    ...newConfig,
    updated: new Date().toISOString()
  };
  
  // Salvar
  saveConfigToStorage(config);
  
  console.log('✅ Configuração atualizada:', config);
  
  return config;
}

/**
 * Retorna configuração atual do localStorage
 */
export function getCurrentConfig() {
  const stored = loadConfigFromStorage();
  if (stored) {
    return stored;
  }
  
  // Se não tem no storage, retornar padrão
  return { ...DEFAULT_CONFIG };
}

/**
 * Limpa configuração salva (volta para padrão)
 */
export function clearConfig() {
  console.log('🗑️ Limpando configuração salva...');
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(STORAGE_KEY + '_timestamp');
  console.log('✅ Configuração limpa. Será usada a configuração padrão.');
}

/**
 * Mostra informações de debug
 */
export function showConfigInfo() {
  console.log('\n📊 INFORMAÇÕES DE CONFIGURAÇÃO\n');
  console.log('Configuração atual:');
  console.table(getCurrentConfig());
  
  const timestamp = localStorage.getItem(STORAGE_KEY + '_timestamp');
  if (timestamp) {
    console.log('\nÚltima atualização:', new Date(timestamp).toLocaleString('pt-BR'));
  }
  
  console.log('\nFonte:', localStorage.getItem(STORAGE_KEY) ? 'localStorage' : 'padrão');
  console.log('\nPara atualizar via console:');
  console.log('  updateApiConfig({ apiURL: "http://192.168.1.100:8000", wsURL: "ws://192.168.1.100:8000" })');
  console.log('\nPara limpar:');
  console.log('  clearConfig()');
  console.log('');
}

// Exportar para uso global (debug no console)
if (typeof window !== 'undefined') {
  window.showConfigInfo = showConfigInfo;
  window.updateApiConfig = updateApiConfig;
  window.clearConfig = clearConfig;
}

export default {
  loadApiConfig,
  updateApiConfig,
  getCurrentConfig,
  clearConfig,
  showConfigInfo
};
