// src/utils/localStorageHelper.js

const CHAVE_PEDIDOS = 'pedidos';
const CHAVE_PEDIDOS_PENDENTES = 'pedidos_pendentes';

/**
 * Verifica se um pedido está concluído (todos os setores finalizados)
 */
export function isPedidoConcluido(pedido) {
  const setores = ['financeiro', 'conferencia', 'sublimacao', 'costura', 'expedicao'];
  return setores.every(setor => pedido[setor] === true) && 
         (pedido.status === 'Pronto' || pedido.status === 'pronto');
}

export function obterPedidos() {
  const pedidos = localStorage.getItem(CHAVE_PEDIDOS);
  return pedidos ? JSON.parse(pedidos) : [];
}

export function salvarPedido(pedido) {
  const pedidos = obterPedidos();
  pedidos.push(pedido);
  localStorage.setItem(CHAVE_PEDIDOS, JSON.stringify(pedidos));
}

export function atualizarPedido(pedidoId, pedidoAtualizado) {
  const pedidos = obterPedidos();
  const indice = pedidos.findIndex(p => p.id === pedidoId);
  if (indice !== -1) {
    pedidos[indice] = pedidoAtualizado;
    localStorage.setItem(CHAVE_PEDIDOS, JSON.stringify(pedidos));
  }
}

export function excluirPedido(pedidoId) {
  const pedidos = obterPedidos();
  const pedidosFiltrados = pedidos.filter(p => p.id !== pedidoId);
  localStorage.setItem(CHAVE_PEDIDOS, JSON.stringify(pedidosFiltrados));
}

// ===== FUNCIONALIDADES PARA PEDIDOS PENDENTES =====

/**
 * Obtém todos os pedidos pendentes (não concluídos) do localStorage
 */
export function obterPedidosPendentes() {
  try {
    const pedidos = localStorage.getItem(CHAVE_PEDIDOS_PENDENTES);
    return pedidos ? JSON.parse(pedidos) : [];
  } catch (error) {
    console.error('Erro ao obter pedidos pendentes:', error);
    return [];
  }
}

/**
 * Salva um pedido pendente no localStorage
 * Só salva se o pedido não estiver concluído
 */
export function salvarPedidoPendente(pedido) {
  if (isPedidoConcluido(pedido)) {
    console.log(`Pedido ${pedido.numeroPedido || pedido.id} está concluído, não será salvo como pendente`);
    return;
  }

  try {
    const pedidosPendentes = obterPedidosPendentes();
    
    // Verifica se já existe e atualiza, ou adiciona novo
    const indiceExistente = pedidosPendentes.findIndex(p => p.id === pedido.id);
    
    if (indiceExistente !== -1) {
      pedidosPendentes[indiceExistente] = pedido;
    } else {
      pedidosPendentes.push(pedido);
    }
    
    localStorage.setItem(CHAVE_PEDIDOS_PENDENTES, JSON.stringify(pedidosPendentes));
    console.log(`Pedido ${pedido.numeroPedido || pedido.id} salvo como pendente`);
  } catch (error) {
    console.error('Erro ao salvar pedido pendente:', error);
  }
}

/**
 * Atualiza um pedido pendente no localStorage
 * Se o pedido ficar concluído, remove do localStorage
 */
export function atualizarPedidoPendente(pedidoId, pedidoAtualizado) {
  try {
    const pedidosPendentes = obterPedidosPendentes();
    const indice = pedidosPendentes.findIndex(p => p.id === pedidoId);
    
    if (indice !== -1) {
      // Se o pedido ficou concluído, remove do localStorage
      if (isPedidoConcluido(pedidoAtualizado)) {
        pedidosPendentes.splice(indice, 1);
        console.log(`Pedido ${pedidoAtualizado.numeroPedido || pedidoId} concluído, removido do localStorage`);
      } else {
        // Atualiza o pedido
        pedidosPendentes[indice] = pedidoAtualizado;
        console.log(`Pedido ${pedidoAtualizado.numeroPedido || pedidoId} atualizado no localStorage`);
      }
      
      localStorage.setItem(CHAVE_PEDIDOS_PENDENTES, JSON.stringify(pedidosPendentes));
    }
  } catch (error) {
    console.error('Erro ao atualizar pedido pendente:', error);
  }
}

/**
 * Remove um pedido pendente do localStorage
 */
export function removerPedidoPendente(pedidoId) {
  try {
    const pedidosPendentes = obterPedidosPendentes();
    const pedidosFiltrados = pedidosPendentes.filter(p => p.id !== pedidoId);
    localStorage.setItem(CHAVE_PEDIDOS_PENDENTES, JSON.stringify(pedidosFiltrados));
    console.log(`Pedido ${pedidoId} removido do localStorage`);
  } catch (error) {
    console.error('Erro ao remover pedido pendente:', error);
  }
}

/**
 * Limpa todos os pedidos pendentes do localStorage
 */
export function limparPedidosPendentes() {
  try {
    localStorage.removeItem(CHAVE_PEDIDOS_PENDENTES);
    console.log('Todos os pedidos pendentes foram removidos do localStorage');
  } catch (error) {
    console.error('Erro ao limpar pedidos pendentes:', error);
  }
}

/**
 * Sincroniza pedidos pendentes com o cache atual
 * Remove pedidos que já foram concluídos
 */
export function sincronizarPedidosPendentes() {
  try {
    const pedidosPendentes = obterPedidosPendentes();
    const pedidosNaoConcluidos = pedidosPendentes.filter(pedido => !isPedidoConcluido(pedido));
    
    if (pedidosNaoConcluidos.length !== pedidosPendentes.length) {
      localStorage.setItem(CHAVE_PEDIDOS_PENDENTES, JSON.stringify(pedidosNaoConcluidos));
      console.log(`Sincronização concluída: ${pedidosPendentes.length - pedidosNaoConcluidos.length} pedidos concluídos removidos`);
    }
    
    return pedidosNaoConcluidos;
  } catch (error) {
    console.error('Erro ao sincronizar pedidos pendentes:', error);
    return [];
  }
}

// ===== SISTEMA DE PROTEÇÃO CONTRA PERDA DE DADOS =====

/**
 * Mescla pedidos da API com pedidos pendentes do localStorage
 * Protege pedidos não concluídos de serem perdidos em recarregamentos
 */
export function mesclarPedidosComProtecao(pedidosDaAPI = []) {
  try {
    const pedidosPendentes = obterPedidosPendentes();
    const pedidosNaoConcluidos = pedidosPendentes.filter(p => !isPedidoConcluido(p));
    
    console.log(`🔒 Proteção ativa: ${pedidosNaoConcluidos.length} pedidos pendentes protegidos`);
    
    // Criar mapa dos pedidos da API para busca rápida (por ID e por numeroPedido)
    const apiMapById = new Map();
    const apiMapByNumero = new Map();
    pedidosDaAPI.forEach(pedido => {
      apiMapById.set(pedido.id, pedido);
      if (pedido.numeroPedido) {
        apiMapByNumero.set(String(pedido.numeroPedido), pedido);
      }
    });
    
    // Mesclar pedidos pendentes que não estão na API ou estão diferentes
    const pedidosProtegidos = [...pedidosDaAPI];
    
    pedidosNaoConcluidos.forEach(pedidoPendente => {
      // Buscar por ID ou por número do pedido
      const pedidoNaAPI = apiMapById.get(pedidoPendente.id) || 
                          apiMapByNumero.get(String(pedidoPendente.numeroPedido));
      
      if (!pedidoNaAPI) {
        // Pedido não existe na API, adicionar aos protegidos
        console.log(`🛡️ Pedido ${pedidoPendente.numeroPedido || pedidoPendente.id} não encontrado na API, protegendo...`);
        pedidosProtegidos.push(pedidoPendente);
      } else if (!isPedidoConcluido(pedidoNaAPI) && !isPedidoConcluido(pedidoPendente)) {
        // Ambos não estão concluídos, manter o mais recente
        const dataAPI = new Date(pedidoNaAPI.ultimaAtualizacao || pedidoNaAPI.dataCriacao);
        const dataPendente = new Date(pedidoPendente.ultimaAtualizacao || pedidoPendente.dataCriacao);
        
        const pedidoMaisRecente = dataPendente > dataAPI ? pedidoPendente : pedidoNaAPI;
        
        // Substituir na lista se for diferente
        const indice = pedidosProtegidos.findIndex(p => p.id === pedidoNaAPI.id);
        if (indice !== -1 && pedidoMaisRecente !== pedidoNaAPI) {
          pedidosProtegidos[indice] = pedidoMaisRecente;
          console.log(`🔄 Pedido ${pedidoPendente.numeroPedido || pedidoPendente.id} mesclado com dados mais recentes`);
        }
      } else if (pedidoNaAPI && isPedidoConcluido(pedidoNaAPI)) {
        // Pedido foi concluído na API, remover do localStorage pendente
        console.log(`✅ Pedido ${pedidoPendente.numeroPedido || pedidoPendente.id} concluído na API, removendo da proteção`);
        removerPedidoPendente(pedidoPendente.id);
      }
    });
    
    console.log(`✅ Mesclagem concluída: ${pedidosProtegidos.length} pedidos (${pedidosDaAPI.length} da API + ${pedidosNaoConcluidos.length - (pedidosDaAPI.length - pedidosProtegidos.length)} protegidos)`);
    
    return pedidosProtegidos;
    
  } catch (error) {
    console.error('❌ Erro ao mesclar pedidos com proteção:', error);
    return pedidosDaAPI;
  }
}

/**
 * Força backup de todos os pedidos não concluídos
 * Usado antes de operações que podem causar perda de dados
 */
export function forcarBackupPedidosPendentes(pedidosAtuais = []) {
  try {
    const pedidosNaoConcluidos = pedidosAtuais.filter(p => !isPedidoConcluido(p));
    
    if (pedidosNaoConcluidos.length > 0) {
      const pedidosExistentes = obterPedidosPendentes();
      const backupCompleto = [...pedidosExistentes];
      
      // Adicionar pedidos que não estão no backup
      pedidosNaoConcluidos.forEach(pedido => {
        const jaExiste = backupCompleto.some(p => p.id === pedido.id);
        if (!jaExiste) {
          backupCompleto.push(pedido);
        } else {
          // Atualizar se o pedido existente é mais antigo
          const indice = backupCompleto.findIndex(p => p.id === pedido.id);
          if (indice !== -1) {
            const dataAtual = new Date(pedido.ultimaAtualizacao || pedido.dataCriacao);
            const dataExistente = new Date(backupCompleto[indice].ultimaAtualizacao || backupCompleto[indice].dataCriacao);
            
            if (dataAtual > dataExistente) {
              backupCompleto[indice] = pedido;
            }
          }
        }
      });
      
      localStorage.setItem(CHAVE_PEDIDOS_PENDENTES, JSON.stringify(backupCompleto));
      console.log(`💾 Backup forçado: ${backupCompleto.length} pedidos pendentes salvos`);
      
      return backupCompleto;
    }
    
    return pedidosNaoConcluidos;
  } catch (error) {
    console.error('❌ Erro ao forçar backup dos pedidos pendentes:', error);
    return [];
  }
}

/**
 * Verifica se há pedidos pendentes que precisam ser recuperados
 */
export function verificarPedidosPerdidos(pedidosAtuais = []) {
  try {
    const pedidosPendentes = obterPedidosPendentes();
    const pedidosNaoConcluidos = pedidosPendentes.filter(p => !isPedidoConcluido(p));
    
    const idsAtuais = new Set(pedidosAtuais.map(p => p.id));
    const pedidosPerdidos = pedidosNaoConcluidos.filter(p => !idsAtuais.has(p.id));
    
    if (pedidosPerdidos.length > 0) {
      console.warn(`⚠️ ATENÇÃO: ${pedidosPerdidos.length} pedidos pendentes não estão na lista atual!`);
      pedidosPerdidos.forEach(pedido => {
        console.warn(`🔍 Pedido perdido: ${pedido.numeroPedido || pedido.id} - ${pedido.nomeCliente || pedido.cliente}`);
      });
      
      return pedidosPerdidos;
    }
    
    return [];
  } catch (error) {
    console.error('❌ Erro ao verificar pedidos perdidos:', error);
    return [];
  }
}

// Funções com nomes mais específicos para compatibilidade
export const salvarPedidoStorage = salvarPedido;
export const removerPedidoStorage = excluirPedido;

// ===== Filtros Persistentes (Home) =====
const CHAVE_FILTROS_HOME = 'home_pedidos_filters_v1';

export function salvarFiltrosHome(filtros) {
  try {
    localStorage.setItem(CHAVE_FILTROS_HOME, JSON.stringify(filtros));
  } catch (e) {}
}

export function obterFiltrosHome() {
  try {
    const raw = localStorage.getItem(CHAVE_FILTROS_HOME);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}
