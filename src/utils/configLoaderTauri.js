/**
 * 🔧 Carregador de Configuração da API - Versão TAURI
 * 
 * Sistema adaptado para funcionar com Tauri Desktop App.
 * Usa APIs nativas do Tauri para ler arquivos do sistema.
 * 
 * Prioridade de carregamento:
 * 1. Arquivo no diretório de recursos (Tauri resourceDir)
 * 2. Arquivo no diretório de dados da app (Tauri appDataDir)
 * 3. LocalStorage (última configuração válida)
 * 4. Configuração padrão (localhost)
 */

const STORAGE_KEY = 'api_config';
const CONFIG_FILENAME = 'api-config.json';
const DEFAULT_CONFIG = {
  apiURL: 'http://localhost:8000',
  wsURL: 'ws://localhost:8000',
  timeout: 10000,
  retries: 3
};

/**
 * Detecta se está rodando em Tauri
 */
function isTauri() {
  return typeof window !== 'undefined' && window.__TAURI__ !== undefined;
}

/**
 * Carrega configuração usando Tauri FS API
 */
async function loadConfigFromTauriFS() {
  if (!isTauri()) {
    console.log('⚠️ Não está rodando em Tauri, pulando FS API');
    return null;
  }

  try {
    const { readTextFile, BaseDirectory } = window.__TAURI__.fs;
    const { resourceDir, appDataDir } = window.__TAURI__.path;
    
    // Tentar ler do diretório de recursos primeiro
    try {
      console.log('🔍 Tentando ler de resourceDir...');
      const resourcePath = await resourceDir();
      console.log('📁 Resource path:', resourcePath);
      
      const configText = await readTextFile(CONFIG_FILENAME, {
        baseDir: BaseDirectory.Resource
      });
      
      const config = JSON.parse(configText);
      console.log('✅ Configuração carregada de resourceDir');
      return config;
    } catch (resourceError) {
      console.log('⚠️ Não encontrado em resourceDir:', resourceError.message);
    }
    
    // Tentar ler do diretório de dados da app
    try {
      console.log('🔍 Tentando ler de appDataDir...');
      const appDataPath = await appDataDir();
      console.log('📁 AppData path:', appDataPath);
      
      const configText = await readTextFile(CONFIG_FILENAME, {
        baseDir: BaseDirectory.AppData
      });
      
      const config = JSON.parse(configText);
      console.log('✅ Configuração carregada de appDataDir');
      return config;
    } catch (appDataError) {
      console.log('⚠️ Não encontrado em appDataDir:', appDataError.message);
    }
    
    return null;
    
  } catch (error) {
    console.warn('⚠️ Erro ao usar Tauri FS:', error);
    return null;
  }
}

/**
 * Carrega configuração via fetch (fallback para web)
 */
async function loadConfigFromWeb() {
  try {
    console.log('🔍 Tentando carregar via fetch (modo web)...');
    
    const response = await fetch('/config/api-config.json');
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const config = await response.json();
    console.log('✅ Configuração carregada via web (fetch)');
    return config;
    
  } catch (error) {
    console.warn('⚠️ Não foi possível carregar via fetch:', error.message);
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
    console.log('📦 Configuração carregada do localStorage');
    return config;
    
  } catch (error) {
    console.warn('⚠️ Erro ao ler localStorage:', error);
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
 * Salva configuração usando Tauri FS API
 */
async function saveConfigToTauriFS(config) {
  if (!isTauri()) {
    console.log('⚠️ Não está em Tauri, pulando salvamento em FS');
    return false;
  }

  try {
    const { writeTextFile, BaseDirectory } = window.__TAURI__.fs;
    
    const configText = JSON.stringify(config, null, 2);
    
    await writeTextFile(CONFIG_FILENAME, configText, {
      baseDir: BaseDirectory.AppData
    });
    
    console.log('💾 Configuração salva em appDataDir');
    return true;
    
  } catch (error) {
    console.error('❌ Erro ao salvar em Tauri FS:', error);
    return false;
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
  console.log('🚀 Iniciando carregamento de configuração da API...');
  console.log('🖥️ Ambiente:', isTauri() ? 'Tauri Desktop' : 'Web Browser');
  console.log('');
  
  let config = null;
  let source = null;
  
  // 1. Tentar carregar do Tauri FS (se estiver em Tauri)
  if (isTauri()) {
    config = await loadConfigFromTauriFS();
    if (config) {
      source = 'Tauri FS';
    }
  }
  
  // 2. Se não achou, tentar via fetch (web ou dev)
  if (!config) {
    config = await loadConfigFromWeb();
    if (config) {
      source = 'Web (fetch)';
    }
  }
  
  // 3. Se não achou, tentar localStorage
  if (!config) {
    console.log('📦 Tentando carregar do localStorage...');
    config = loadConfigFromStorage();
    if (config) {
      source = 'localStorage';
    }
  }
  
  // 4. Se não achou, usar padrão
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
      // Salvar no storage como backup
      saveConfigToStorage(config);
      
      // Se está em Tauri e config não veio do FS, salvar lá também
      if (isTauri() && source !== 'Tauri FS') {
        saveConfigToTauriFS(config);
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
 * Atualiza configuração manualmente
 */
export async function updateApiConfig(newConfig) {
  console.log('🔄 Atualizando configuração da API...');
  
  // Validar
  if (!newConfig.apiURL || !newConfig.wsURL) {
    throw new Error('apiURL e wsURL são obrigatórios');
  }
  
  const config = {
    ...DEFAULT_CONFIG,
    ...newConfig,
    updated: new Date().toISOString()
  };
  
  // Salvar no localStorage
  saveConfigToStorage(config);
  
  // Salvar no Tauri FS se disponível
  if (isTauri()) {
    await saveConfigToTauriFS(config);
  }
  
  console.log('✅ Configuração atualizada:', config);
  
  return config;
}

/**
 * Retorna configuração atual
 */
export function getCurrentConfig() {
  const stored = loadConfigFromStorage();
  if (stored) {
    return stored;
  }
  
  return { ...DEFAULT_CONFIG };
}

/**
 * Limpa configuração salva
 */
export function clearConfig() {
  console.log('🗑️ Limpando configuração salva...');
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(STORAGE_KEY + '_timestamp');
  console.log('✅ Configuração limpa');
}

/**
 * Mostra informações de debug
 */
export function showConfigInfo() {
  console.log('\n📊 INFORMAÇÕES DE CONFIGURAÇÃO\n');
  console.log('Ambiente:', isTauri() ? '🖥️ Tauri Desktop' : '🌐 Web Browser');
  console.log('\nConfiguração atual:');
  console.table(getCurrentConfig());
  
  const timestamp = localStorage.getItem(STORAGE_KEY + '_timestamp');
  if (timestamp) {
    console.log('\nÚltima atualização:', new Date(timestamp).toLocaleString('pt-BR'));
  }
  
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
  window.isTauri = isTauri;
}

export default {
  loadApiConfig,
  updateApiConfig,
  getCurrentConfig,
  clearConfig,
  showConfigInfo,
  isTauri
};

