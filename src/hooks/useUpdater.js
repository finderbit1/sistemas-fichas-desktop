/**
 * Hook React para Sistema de Atualização Automática
 * Gerencia verificação, download e instalação de atualizações
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';

// ===== ESTRUTURAS DE DADOS =====

/**
 * Informações da atualização
 * @typedef {Object} UpdateInfo
 * @property {string} version - Versão da atualização
 * @property {string} date - Data da release
 * @property {string} body - Descrição da atualização
 * @property {string} download_url - URL de download
 * @property {string} signature - Assinatura digital
 * @property {number} size - Tamanho do arquivo em bytes
 * @property {string[]} changelog - Lista de mudanças
 */

/**
 * Status da atualização
 * @typedef {Object} UpdateStatus
 * @property {boolean} available - Se há atualização disponível
 * @property {string} current_version - Versão atual
 * @property {string|null} latest_version - Versão mais recente
 * @property {UpdateInfo|null} update_info - Informações da atualização
 * @property {number|null} download_progress - Progresso do download (0-100)
 * @property {number|null} install_progress - Progresso da instalação (0-100)
 * @property {string|null} error - Mensagem de erro
 */

/**
 * Configurações de atualização
 * @typedef {Object} UpdateSettings
 * @property {boolean} auto_check - Verificação automática
 * @property {boolean} auto_download - Download automático
 * @property {boolean} auto_install - Instalação automática
 * @property {number} check_interval_hours - Intervalo de verificação em horas
 * @property {boolean} beta_updates - Atualizações beta
 * @property {string|null} last_check - Última verificação
 */

/**
 * Hook principal para gerenciar atualizações
 */
export const useUpdater = () => {
  const [status, setStatus] = useState({
    available: false,
    current_version: '0.1.0',
    latest_version: null,
    update_info: null,
    download_progress: null,
    install_progress: null,
    error: null,
  });

  const [settings, setSettings] = useState({
    auto_check: true,
    auto_download: false,
    auto_install: false,
    check_interval_hours: 24,
    beta_updates: false,
    last_check: null,
  });

  const [isChecking, setIsChecking] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const listenersRef = useRef([]);

  // ===== INICIALIZAÇÃO =====

  useEffect(() => {
    const initializeUpdater = async () => {
      try {
        // Carregar configurações
        const loadedSettings = await invoke('get_update_settings');
        setSettings(loadedSettings);

        // Carregar status atual
        const currentStatus = await invoke('get_update_status');
        setStatus(currentStatus);

        // Configurar listeners de eventos
        setupEventListeners();

        setIsInitialized(true);
        console.log('✅ Updater inicializado com sucesso');
      } catch (error) {
        console.error('❌ Erro ao inicializar updater:', error);
      }
    };

    initializeUpdater();

    // Cleanup dos listeners
    return () => {
      listenersRef.current.forEach(unlisten => {
        unlisten();
      });
    };
  }, []);

  // ===== LISTENERS DE EVENTOS =====

  const setupEventListeners = useCallback(() => {
    // Evento: Verificação iniciada
    const checkListener = listen('update-checking', (event) => {
      setIsChecking(true);
      setStatus(prev => ({ ...prev, error: null }));
    });

    // Evento: Verificação concluída
    const checkedListener = listen('update-checked', (event) => {
      setIsChecking(false);
      setStatus(event.payload);
    });

    // Evento: Download iniciado
    const downloadListener = listen('update-downloading', (event) => {
      setIsDownloading(true);
      setStatus(event.payload);
    });

    // Evento: Download concluído
    const downloadedListener = listen('update-downloaded', (event) => {
      setIsDownloading(false);
      setStatus(event.payload);
    });

    // Evento: Instalação iniciada
    const installListener = listen('update-installing', (event) => {
      setIsInstalling(true);
      setStatus(event.payload);
    });

    // Evento: Instalação concluída
    const installedListener = listen('update-installed', (event) => {
      setIsInstalling(false);
      setStatus(event.payload);
    });

    // Evento: Erro
    const errorListener = listen('update-error', (event) => {
      setIsChecking(false);
      setIsDownloading(false);
      setIsInstalling(false);
      setStatus(event.payload);
    });

    // Evento: Progresso do download
    const progressListener = listen('update-progress', (event) => {
      setStatus(event.payload);
    });

    // Evento: Progresso da instalação
    const installProgressListener = listen('update-install-progress', (event) => {
      setStatus(prev => ({ ...prev, install_progress: event.payload }));
    });

    // Armazenar listeners para cleanup
    listenersRef.current = [
      checkListener,
      checkedListener,
      downloadListener,
      downloadedListener,
      installListener,
      installedListener,
      errorListener,
      progressListener,
      installProgressListener,
    ];
  }, []);

  // ===== FUNÇÕES DE ATUALIZAÇÃO =====

  /**
   * Verifica se há atualizações disponíveis
   */
  const checkForUpdates = useCallback(async () => {
    if (isChecking) return;

    try {
      setIsChecking(true);
      const updateStatus = await invoke('check_for_updates');
      setStatus(updateStatus);
      return updateStatus;
    } catch (error) {
      console.error('Erro ao verificar atualizações:', error);
      setStatus(prev => ({ ...prev, error: error.toString() }));
      throw error;
    } finally {
      setIsChecking(false);
    }
  }, [isChecking]);

  /**
   * Força verificação de atualizações
   */
  const forceCheckUpdates = useCallback(async () => {
    try {
      setIsChecking(true);
      const updateStatus = await invoke('force_check_updates');
      setStatus(updateStatus);
      return updateStatus;
    } catch (error) {
      console.error('Erro ao forçar verificação:', error);
      setStatus(prev => ({ ...prev, error: error.toString() }));
      throw error;
    } finally {
      setIsChecking(false);
    }
  }, []);

  /**
   * Baixa a atualização disponível
   */
  const downloadAndInstallUpdate = useCallback(async () => {
    if (!status.available || isDownloading || isInstalling) return;

    try {
      setIsDownloading(true);
      setIsInstalling(true);
      await invoke('download_and_install_update');
      // O app será reiniciado automaticamente após a instalação
    } catch (error) {
      console.error('Erro ao baixar/instalar atualização:', error);
      setStatus(prev => ({ ...prev, error: error.toString() }));
      throw error;
    } finally {
      setIsDownloading(false);
      setIsInstalling(false);
    }
  }, [status.available, isDownloading, isInstalling]);

  // Manter compatibilidade com código existente
  const downloadUpdate = downloadAndInstallUpdate;

  /**
   * Instala a atualização baixada
   */
  // Manter compatibilidade com código existente
  const installUpdate = downloadAndInstallUpdate;

  /**
   * Atualiza as configurações
   */
  const updateSettings = useCallback(async (newSettings) => {
    try {
      await invoke('update_settings', { settings: newSettings });
      setSettings(newSettings);
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error);
      throw error;
    }
  }, []);

  // ===== FUNÇÕES DE UTILIDADE =====

  /**
   * Verifica se há uma atualização disponível
   */
  const hasUpdateAvailable = useCallback(() => {
    return status.available && status.latest_version && status.latest_version !== status.current_version;
  }, [status.available, status.latest_version, status.current_version]);

  /**
   * Obtém o progresso total (download + instalação)
   */
  const getTotalProgress = useCallback(() => {
    if (status.install_progress !== null) {
      return status.install_progress;
    }
    if (status.download_progress !== null) {
      return status.download_progress;
    }
    return null;
  }, [status.download_progress, status.install_progress]);

  /**
   * Obtém o status atual da operação
   */
  const getCurrentOperation = useCallback(() => {
    if (isInstalling) return 'installing';
    if (isDownloading) return 'downloading';
    if (isChecking) return 'checking';
    return 'idle';
  }, [isInstalling, isDownloading, isChecking]);

  /**
   * Formata o tamanho do arquivo
   */
  const formatFileSize = useCallback((bytes) => {
    if (!bytes) return 'Desconhecido';
    
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  }, []);

  /**
   * Formata a data da release
   */
  const formatReleaseDate = useCallback((dateString) => {
    if (!dateString) return 'Desconhecido';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      return 'Data inválida';
    }
  }, []);

  return {
    // Estado
    status,
    settings,
    isInitialized,
    isChecking,
    isDownloading,
    isInstalling,
    
    // Funções principais
    checkForUpdates,
    forceCheckUpdates,
    downloadUpdate,
    installUpdate,
    downloadAndInstallUpdate,
    updateSettings,
    
    // Funções de utilidade
    hasUpdateAvailable,
    getTotalProgress,
    getCurrentOperation,
    formatFileSize,
    formatReleaseDate,
  };
};

// ===== HOOKS ESPECÍFICOS =====

/**
 * Hook para monitorar atualizações em background
 */
export const useUpdateMonitor = (intervalMinutes = 60) => {
  const { checkForUpdates, settings, isInitialized } = useUpdater();
  const [lastCheck, setLastCheck] = useState(null);

  useEffect(() => {
    if (!isInitialized || !settings.auto_check) return;

    const interval = setInterval(async () => {
      try {
        await checkForUpdates();
        setLastCheck(new Date());
      } catch (error) {
        console.error('Erro no monitoramento automático:', error);
      }
    }, intervalMinutes * 60 * 1000);

    return () => clearInterval(interval);
  }, [isInitialized, settings.auto_check, intervalMinutes, checkForUpdates]);

  return { lastCheck };
};

/**
 * Hook para notificações de atualização
 */
export const useUpdateNotifications = () => {
  const { status, hasUpdateAvailable, isInitialized } = useUpdater();
  const [hasNotified, setHasNotified] = useState(false);

  useEffect(() => {
    if (!isInitialized || hasNotified) return;

    if (hasUpdateAvailable()) {
      // Aqui você pode implementar notificações
      // Por exemplo, mostrar um toast ou modal
      console.log('🔄 Nova atualização disponível:', status.latest_version);
      setHasNotified(true);
    }
  }, [isInitialized, hasUpdateAvailable, status.latest_version, hasNotified]);

  const resetNotification = useCallback(() => {
    setHasNotified(false);
  }, []);

  return { hasNotified, resetNotification };
};

export default useUpdater;
