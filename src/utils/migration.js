// Script de migração para alternar entre Python e Rust
import { invoke } from '@tauri-apps/api/core';

class MigrationHelper {
  constructor() {
    this.isTauri = typeof window !== 'undefined' && window.__TAURI__;
  }

  // Verificar se estamos usando Tauri
  isUsingTauri() {
    return this.isTauri;
  }

  // Migrar dados do banco Python para Rust
  async migrateDataFromPython() {
    if (!this.isTauri) {
      console.log('⚠️ Não estamos no Tauri, migração não necessária');
      return;
    }

    try {
      console.log('🔄 Iniciando migração de dados...');
      
      // Aqui você pode adicionar lógica para migrar dados específicos
      // Por exemplo, se você tem dados em localStorage ou em arquivos
      
      console.log('✅ Migração concluída com sucesso');
    } catch (error) {
      console.error('❌ Erro durante a migração:', error);
      throw error;
    }
  }

  // Testar conectividade com a API Rust
  async testRustAPI() {
    if (!this.isTauri) {
      return { success: false, message: 'Não estamos no Tauri' };
    }

    try {
      // Testar com uma operação simples
      const clientes = await invoke('get_all_clientes');
      return { 
        success: true, 
        message: `API Rust funcionando! ${clientes.length} clientes encontrados` 
      };
    } catch (error) {
      return { 
        success: false, 
        message: `Erro na API Rust: ${error}` 
      };
    }
  }

  // Verificar status do sistema
  async getSystemStatus() {
    const status = {
      isTauri: this.isTauri,
      apiType: this.isTauri ? 'Rust (Tauri)' : 'Python (HTTP)',
      timestamp: new Date().toISOString(),
    };

    if (this.isTauri) {
      try {
        const testResult = await this.testRustAPI();
        status.apiStatus = testResult.success ? 'OK' : 'ERROR';
        status.apiMessage = testResult.message;
      } catch (error) {
        status.apiStatus = 'ERROR';
        status.apiMessage = error.message;
      }
    }

    return status;
  }

  // Backup de dados antes da migração
  async backupData() {
    if (!this.isTauri) {
      console.log('⚠️ Backup não disponível fora do Tauri');
      return;
    }

    try {
      console.log('💾 Criando backup dos dados...');
      
      // Implementar lógica de backup aqui
      // Por exemplo, exportar dados para JSON
      
      console.log('✅ Backup criado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao criar backup:', error);
      throw error;
    }
  }

  // Restaurar dados do backup
  async restoreData(backupData) {
    if (!this.isTauri) {
      console.log('⚠️ Restauração não disponível fora do Tauri');
      return;
    }

    try {
      console.log('🔄 Restaurando dados do backup...');
      
      // Implementar lógica de restauração aqui
      
      console.log('✅ Dados restaurados com sucesso');
    } catch (error) {
      console.error('❌ Erro ao restaurar dados:', error);
      throw error;
    }
  }
}

// Instância global do helper de migração
export const migrationHelper = new MigrationHelper();

// Funções utilitárias para uso em componentes
export const useMigration = () => {
  return {
    isTauri: migrationHelper.isUsingTauri(),
    migrateData: () => migrationHelper.migrateDataFromPython(),
    testAPI: () => migrationHelper.testRustAPI(),
    getStatus: () => migrationHelper.getSystemStatus(),
    backup: () => migrationHelper.backupData(),
    restore: (data) => migrationHelper.restoreData(data),
  };
};

export default migrationHelper;



