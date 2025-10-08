/**
 * 🔄 Sistema de Sincronização em Tempo Real
 * 
 * Sincroniza pedidos entre múltiplos clientes/abas automaticamente
 * usando Broadcast Channel API e eventos de storage
 */

class SyncManager {
  constructor() {
    this.listeners = new Map();
    this.channel = null;
    this.lastSyncTime = Date.now();
    
    // Tentar criar Broadcast Channel (funciona entre abas do mesmo navegador)
    if (typeof BroadcastChannel !== 'undefined') {
      this.channel = new BroadcastChannel('sgp-sync-channel');
      this.setupBroadcastChannel();
      console.log('✅ Broadcast Channel ativo - sincronização instantânea entre abas!');
    } else {
      console.warn('⚠️ Broadcast Channel não suportado - usando fallback');
    }
    
    // Listener para mudanças no localStorage (detecta mudanças de outros clientes)
    this.setupStorageListener();
  }

  /**
   * Configurar Broadcast Channel para sincronização entre abas
   */
  setupBroadcastChannel() {
    if (!this.channel) return;
    
    this.channel.onmessage = (event) => {
      const { type, data, timestamp } = event.data;
      
      // Evitar processar mensagens antigas
      if (timestamp && timestamp < this.lastSyncTime) {
        return;
      }
      
      if (import.meta.env.DEV) {
        console.log('📡 Broadcast recebido:', type, data);
      }
      
      // Notificar listeners
      this.notifyListeners(type, data);
    };
  }

  /**
   * Configurar listener de localStorage para sincronização entre clientes
   */
  setupStorageListener() {
    if (typeof window === 'undefined') return;
    
    window.addEventListener('storage', (event) => {
      // Apenas processar mudanças no sync key
      if (event.key === 'sgp_last_sync') {
        try {
          const syncData = JSON.parse(event.newValue || '{}');
          
          if (import.meta.env.DEV) {
            console.log('💾 Storage sync detectado:', syncData);
          }
          
          // Notificar listeners
          if (syncData.type) {
            this.notifyListeners(syncData.type, syncData.data);
          }
        } catch (error) {
          console.error('Erro ao processar sync do storage:', error);
        }
      }
    });
  }

  /**
   * Notificar que houve uma mudança (envia para outras abas/clientes)
   */
  notify(type, data = {}) {
    const timestamp = Date.now();
    const syncMessage = { type, data, timestamp };
    
    // Broadcast para outras abas (mesmo navegador)
    if (this.channel) {
      this.channel.postMessage(syncMessage);
      if (import.meta.env.DEV) {
        console.log('📤 Broadcast enviado:', type);
      }
    }
    
    // Salvar no localStorage para outros clientes
    try {
      localStorage.setItem('sgp_last_sync', JSON.stringify(syncMessage));
      this.lastSyncTime = timestamp;
    } catch (error) {
      console.error('Erro ao salvar sync no storage:', error);
    }
  }

  /**
   * Registrar listener para tipo específico de evento
   */
  on(type, callback) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    
    this.listeners.get(type).push(callback);
    
    if (import.meta.env.DEV) {
      console.log(`👂 Listener registrado para: ${type}`);
    }
    
    // Retornar função para remover listener
    return () => {
      const callbacks = this.listeners.get(type);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  /**
   * Notificar todos os listeners de um tipo específico
   */
  notifyListeners(type, data) {
    const callbacks = this.listeners.get(type);
    if (callbacks && callbacks.length > 0) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Erro no listener ${type}:`, error);
        }
      });
    }
  }

  /**
   * Remover todos os listeners
   */
  destroy() {
    if (this.channel) {
      this.channel.close();
    }
    this.listeners.clear();
    console.log('🔌 SyncManager destruído');
  }
}

// Instância única (singleton)
const syncManager = new SyncManager();

// Disponibilizar globalmente para debug
if (import.meta.env.DEV) {
  window.syncManager = syncManager;
  console.log('💡 Use window.syncManager no console para debug de sincronização');
}

export default syncManager;

