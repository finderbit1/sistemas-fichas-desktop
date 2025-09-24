/**
 * Serviço de Atualização Automática - SGP
 * Sistema completo de detecção, download e instalação de atualizações
 */

use serde::{Deserialize, Serialize};
use tauri::{command, AppHandle, Emitter, Manager};

// ===== ESTRUTURAS DE DADOS =====

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct UpdateInfo {
    pub version: String,
    pub date: String,
    pub body: String,
    pub download_url: String,
    pub signature: String,
    pub size: u64,
    pub changelog: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct UpdateStatus {
    pub available: bool,
    pub current_version: String,
    pub latest_version: Option<String>,
    pub update_info: Option<UpdateInfo>,
    pub download_progress: Option<f64>,
    pub install_progress: Option<f64>,
    pub error: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct UpdateSettings {
    pub auto_check: bool,
    pub auto_download: bool,
    pub auto_install: bool,
    pub check_interval_hours: u32,
    pub beta_updates: bool,
    pub last_check: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct UpdateState {
    pub status: UpdateStatus,
    pub settings: UpdateSettings,
    pub is_checking: bool,
    pub is_downloading: bool,
    pub is_installing: bool,
}

impl Default for UpdateStatus {
    fn default() -> Self {
        Self {
            available: false,
            current_version: env!("CARGO_PKG_VERSION").to_string(),
            latest_version: None,
            update_info: None,
            download_progress: None,
            install_progress: None,
            error: None,
        }
    }
}

impl Default for UpdateSettings {
    fn default() -> Self {
        Self {
            auto_check: true,
            auto_download: false,
            auto_install: false,
            check_interval_hours: 24,
            beta_updates: false,
            last_check: None,
        }
    }
}

// ===== COMANDOS TAURI =====

/// Verifica se há atualizações disponíveis
#[command]
pub async fn check_for_updates(app: AppHandle) -> Result<UpdateStatus, String> {
    let updater = app.updater();
    
    match updater.check().await {
        Ok(update_result) => {
            match update_result {
                tauri_plugin_updater::UpdaterEvent::UpdateAvailable { body, date, version } => {
                    let status = UpdateStatus {
                        available: true,
                        current_version: env!("CARGO_PKG_VERSION").to_string(),
                        latest_version: Some(version.clone()),
                        update_info: Some(UpdateInfo {
                            version,
                            date: date.unwrap_or_else(|| chrono::Utc::now().to_rfc3339()),
                            body: body.unwrap_or_default(),
                            download_url: String::new(),
                            signature: String::new(),
                            size: 0,
                            changelog: Vec::new(),
                        }),
                        download_progress: None,
                        install_progress: None,
                        error: None,
                    };
                    
                    let _ = app.emit("update-available", &status);
                    Ok(status)
                }
                tauri_plugin_updater::UpdaterEvent::UpToDate => {
                    let status = UpdateStatus {
                        available: false,
                        current_version: env!("CARGO_PKG_VERSION").to_string(),
                        latest_version: None,
                        update_info: None,
                        download_progress: None,
                        install_progress: None,
                        error: Some("Aplicativo está atualizado".to_string()),
                    };
                    
                    let _ = app.emit("update-checked", &status);
                    Ok(status)
                }
                _ => {
                    let status = UpdateStatus {
                        available: false,
                        current_version: env!("CARGO_PKG_VERSION").to_string(),
                        latest_version: None,
                        update_info: None,
                        download_progress: None,
                        install_progress: None,
                        error: Some("Erro desconhecido na verificação".to_string()),
                    };
                    Ok(status)
                }
            }
        }
        Err(e) => {
            let status = UpdateStatus {
                available: false,
                current_version: env!("CARGO_PKG_VERSION").to_string(),
                latest_version: None,
                update_info: None,
                download_progress: None,
                install_progress: None,
                error: Some(format!("Erro ao verificar atualizações: {}", e)),
            };
            
            let _ = app.emit("update-error", &status);
            Ok(status)
        }
    }
}

/// Baixa e instala a atualização disponível
#[command]
pub async fn download_and_install_update(app: AppHandle) -> Result<(), String> {
    let updater = app.updater();
    
    let _ = app.emit("update-downloading", UpdateStatus::default());
    
    match updater.download_and_install().await {
        Ok(_) => {
            let _ = app.emit("update-installed", UpdateStatus::default());
            app.restart();
            Ok(())
        }
        Err(e) => {
            let status = UpdateStatus {
                available: false,
                current_version: env!("CARGO_PKG_VERSION").to_string(),
                latest_version: None,
                update_info: None,
                download_progress: None,
                install_progress: None,
                error: Some(format!("Erro no download/instalação: {}", e)),
            };
            
            let _ = app.emit("update-error", &status);
            Err(format!("Erro no download/instalação: {}", e))
        }
    }
}

/// Obtém o status atual das atualizações
#[command]
pub async fn get_update_status() -> Result<UpdateStatus, String> {
    Ok(UpdateStatus::default())
}

/// Obtém as configurações de atualização
#[command]
pub async fn get_update_settings() -> Result<UpdateSettings, String> {
    Ok(UpdateSettings::default())
}

/// Atualiza as configurações de atualização
#[command]
pub async fn update_settings(_settings: UpdateSettings) -> Result<(), String> {
    // Implementar persistência das configurações se necessário
    Ok(())
}

/// Força uma verificação de atualizações
#[command]
pub async fn force_check_updates(app: AppHandle) -> Result<UpdateStatus, String> {
    check_for_updates(app).await
}

/// Inicializa o serviço de atualização
pub async fn init_update_service(app: &AppHandle) -> Result<(), String> {
    // Implementar lógica de inicialização se necessário
    Ok(())
}