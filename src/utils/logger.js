/**
 * Sistema de Logs para o Sistema de Fichas
 * Gerencia logs de todas as ações do sistema
 */

class Logger {
  constructor() {
    this.logs = [];
    this.maxLogs = 1000; // Limite máximo de logs em memória
  }

  /**
   * Adiciona um novo log
   * @param {string} action - Ação realizada
   * @param {Object} data - Dados relacionados à ação
   * @param {string} level - Nível do log (info, warning, error, success)
   */
  log(action, data = {}, level = 'info') {
    const logEntry = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      action,
      level,
      data,
      user: this.getCurrentUser(),
      session: this.getSessionId()
    };

    this.logs.unshift(logEntry); // Adiciona no início do array

    // Limita o número de logs em memória
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Salva no localStorage
    this.saveToStorage();

    // Exibe no console para debug
    this.logToConsole(logEntry);

    return logEntry;
  }

  /**
   * Log de criação de pedido
   */
  logPedidoCreated(pedido) {
    return this.log('PEDIDO_CREATED', {
      pedidoId: pedido.id,
      numeroPedido: pedido.numeroPedido,
      cliente: pedido.nomeCliente,
      valorTotal: pedido.valorTotal,
      prioridade: pedido.prioridade
    }, 'success');
  }

  /**
   * Log de edição de pedido
   */
  logPedidoUpdated(pedidoId, changes, oldData, newData) {
    return this.log('PEDIDO_UPDATED', {
      pedidoId,
      numeroPedido: newData.numeroPedido,
      changes,
      oldData,
      newData
    }, 'info');
  }

  /**
   * Log de exclusão de pedido
   */
  logPedidoDeleted(pedidoId, pedidoData) {
    return this.log('PEDIDO_DELETED', {
      pedidoId,
      numeroPedido: pedidoData.numeroPedido,
      cliente: pedidoData.nomeCliente,
      valorTotal: pedidoData.valorTotal
    }, 'warning');
  }

  /**
   * Log de alteração de setor
   */
  logSetorChanged(pedidoId, setor, action, oldValue, newValue) {
    return this.log('SETOR_CHANGED', {
      pedidoId,
      setor,
      action, // 'checked' ou 'unchecked'
      oldValue,
      newValue,
      timestamp: new Date().toISOString()
    }, 'info');
  }

  /**
   * Log de impressão
   */
  logPrint(pedidoIds, type = 'individual') {
    return this.log('PRINT', {
      pedidoIds: Array.isArray(pedidoIds) ? pedidoIds : [pedidoIds],
      type,
      count: Array.isArray(pedidoIds) ? pedidoIds.length : 1
    }, 'info');
  }

  /**
   * Log de erro
   */
  logError(action, error, context = {}) {
    return this.log('ERROR', {
      action,
      error: error.message || error,
      stack: error.stack,
      context
    }, 'error');
  }

  /**
   * Log de API
   */
  logApiCall(endpoint, method, success, response = null, error = null) {
    return this.log('API_CALL', {
      endpoint,
      method,
      success,
      response: success ? response : null,
      error: success ? null : error
    }, success ? 'info' : 'error');
  }

  /**
   * Obtém todos os logs
   */
  getAllLogs() {
    return [...this.logs];
  }

  /**
   * Obtém logs por ação
   */
  getLogsByAction(action) {
    return this.logs.filter(log => log.action === action);
  }

  /**
   * Obtém logs por nível
   */
  getLogsByLevel(level) {
    return this.logs.filter(log => log.level === level);
  }

  /**
   * Obtém logs por período
   */
  getLogsByPeriod(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return this.logs.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate >= start && logDate <= end;
    });
  }

  /**
   * Limpa todos os logs
   */
  clearLogs() {
    this.logs = [];
    this.saveToStorage();
  }

  /**
   * Exporta logs para JSON
   */
  exportLogs() {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Exporta logs para CSV
   */
  exportLogsCSV() {
    if (this.logs.length === 0) return '';

    const headers = ['Timestamp', 'Action', 'Level', 'User', 'Data'];
    const rows = this.logs.map(log => [
      log.timestamp,
      log.action,
      log.level,
      log.user,
      JSON.stringify(log.data)
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  /**
   * Salva logs no localStorage
   */
  saveToStorage() {
    try {
      localStorage.setItem('system_logs', JSON.stringify(this.logs));
    } catch (error) {
      console.error('Erro ao salvar logs no localStorage:', error);
    }
  }

  /**
   * Carrega logs do localStorage
   */
  loadFromStorage() {
    try {
      const stored = localStorage.getItem('system_logs');
      if (stored) {
        this.logs = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Erro ao carregar logs do localStorage:', error);
      this.logs = [];
    }
  }

  /**
   * Obtém usuário atual (placeholder)
   */
  getCurrentUser() {
    // Em um sistema real, viria do contexto de autenticação
    return 'Sistema';
  }

  /**
   * Obtém ID da sessão (placeholder)
   */
  getSessionId() {
    // Em um sistema real, viria do contexto de sessão
    return Date.now().toString();
  }

  /**
   * Exibe log no console
   */
  logToConsole(logEntry) {
    const emoji = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    };

    console.log(
      `${emoji[logEntry.level]} [${logEntry.timestamp}] ${logEntry.action}`,
      logEntry.data
    );
  }
}

// Instância singleton do logger
const logger = new Logger();

// Carrega logs salvos na inicialização
logger.loadFromStorage();

export default logger;

