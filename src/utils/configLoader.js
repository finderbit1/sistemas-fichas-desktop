/**
 * 📁 Config Loader - Carrega configuração do arquivo rede.conf
 * 
 * Lê o arquivo rede.conf e retorna as configurações
 */

// Cache da configuração carregada
let cachedConfig = null;

/**
 * Parser simples para arquivo .conf
 * Formato: CHAVE=valor
 */
const parseConfFile = (content) => {
  const config = {};
  const lines = content.split('\n');
  
  for (const line of lines) {
    // Ignorar comentários e linhas vazias
    const trimmed = line.trim();
    if (trimmed === '' || trimmed.startsWith('#')) {
      continue;
    }
    
    // Parse CHAVE=VALOR
    const match = trimmed.match(/^([A-Z_]+)=(.+)$/);
    if (match) {
      const [, key, value] = match;
      config[key] = value.trim();
    }
  }
  
  return config;
};

/**
 * Carregar configuração do arquivo rede.conf
 */
export const loadNetworkConfig = async () => {
  // Retornar cache se já carregado
  if (cachedConfig) {
    return cachedConfig;
  }
  
  try {
    // Tentar carregar do arquivo público
    const response = await fetch('/rede.conf');
    
    if (!response.ok) {
      throw new Error('Arquivo rede.conf não encontrado');
    }
    
    const content = await response.text();
    const parsedConfig = parseConfFile(content);
    
    // Mapear para formato esperado
    const config = {
      baseURL: parsedConfig.API_URL || 'http://localhost:8000',
      timeout: parseInt(parsedConfig.API_TIMEOUT) || 10000,
      retries: parseInt(parsedConfig.API_RETRIES) || 3,
      source: 'rede.conf'
    };
    
    cachedConfig = config;
    console.log('✅ Configuração carregada de rede.conf:', config.baseURL);
    
    return config;
  } catch (error) {
    console.warn('⚠️ Não foi possível carregar rede.conf, usando fallback:', error.message);
    
    // Fallback: tentar localStorage
    const savedConfig = localStorage.getItem('serverConfig');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        config.source = 'localStorage (fallback)';
        cachedConfig = config;
        console.log('✅ Configuração carregada do localStorage:', config.baseURL);
        return config;
      } catch (e) {
        console.error('Erro ao ler localStorage:', e);
      }
    }
    
    // Fallback final: configuração padrão
    const defaultConfig = {
      baseURL: 'http://192.168.15.6:8000',
      timeout: 10000,
      retries: 3,
      source: 'padrão (fallback)'
    };
    
    console.log('✅ Usando configuração padrão:', defaultConfig.baseURL);
    cachedConfig = defaultConfig;
    return defaultConfig;
  }
};

/**
 * Recarregar configuração (limpa cache)
 */
export const reloadNetworkConfig = async () => {
  cachedConfig = null;
  const config = await loadNetworkConfig();
  
  // Atualizar localStorage também (para compatibilidade)
  try {
    localStorage.setItem('serverConfig', JSON.stringify({
      baseURL: config.baseURL,
      timeout: config.timeout,
      retries: config.retries
    }));
  } catch (e) {
    console.warn('Não foi possível atualizar localStorage:', e);
  }
  
  return config;
};

/**
 * Obter configuração atual (síncrono)
 * Retorna null se ainda não foi carregado
 */
export const getCurrentConfig = () => {
  return cachedConfig;
};

/**
 * Verificar se a configuração foi carregada
 */
export const isConfigLoaded = () => {
  return cachedConfig !== null;
};

// Disponibilizar globalmente para debug
if (import.meta.env.DEV) {
  window.networkConfig = {
    load: loadNetworkConfig,
    reload: reloadNetworkConfig,
    current: getCurrentConfig
  };
  console.log('💡 Use window.networkConfig no console para debug');
}

export default {
  loadNetworkConfig,
  reloadNetworkConfig,
  getCurrentConfig,
  isConfigLoaded
};

