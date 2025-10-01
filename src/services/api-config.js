// Configuração simplificada para usar API Tauri
import * as apiTauri from './api-tauri.js';

// Detectar se estamos rodando no Tauri
const isTauri = () => {
  return typeof window !== 'undefined' && window.__TAURI__;
};

// Usar sempre a API Tauri quando disponível
const USE_TAURI_API = isTauri();

console.log(USE_TAURI_API ? '🚀 Usando API Rust (Tauri)' : '⚠️ Tauri não disponível');

// Exportar todas as funções da API Tauri
export const {
  // Pedidos
  getAllPedidos,
  getPedidoById,
  createPedido,
  updatePedido,
  getProximoNumeroPedido,
  deletePedido,
  
  // Clientes
  getAllClientes,
  getClienteById,
  createCliente,
  updateCliente,
  deleteCliente,
  importClientesCSV,
  
  // Pagamentos
  getAllPagamentos,
  createPagamento,
  deletePagamento,
  
  // Envios
  getAllEnvios,
  createEnvio,
  deleteEnvio,
  
  // Descontos
  getAllDescontos,
  calcularDesconto,
  createDesconto,
  deleteDesconto,
  
  // Produções
  getAllTiposProducao,
  createTipoProducao,
  deleteTipoProducao,
  
  // Tecidos
  getAllTecidos,
  createTecido,
  deleteTecido,
  
  // Designers
  getAllDesigners,
  createDesigner,
  deleteDesigner,
  
  // Vendedores
  getAllVendedores,
  createVendedor,
  deleteVendedor,
  
  // Relatórios
  gerarRelatorioDiario,
  gerarRelatorioSemanal,
  gerarRelatorioMensal,
  obterRankingProdutos,
  gerarRelatorioMatriz,
} = apiTauri;

// Exportar configuração
export { USE_TAURI_API, isTauri };