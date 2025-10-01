// API usando APENAS Tauri (invoke) - Comunicação direta com Rust
import * as apiTauri from './api-tauri.js';

// SEMPRE usar Tauri - sem axios
const api = apiTauri;

console.log('🚀 Usando APENAS API Rust (Tauri) - Sem Axios');

// Exportar todas as funções da API escolhida
export const {
  // Pedidos
  getAllPedidos,
  getPedidoById,
  createPedido,
  postPedido,
  updatePedido,
  getProximoNumeroPedido,
  deletePedido,
  getPedidosByStatus,
  
  // Clientes
  getAllClientes,
  getClienteById,
  createCliente,
  postCliente,
  updateCliente,
  deleteCliente,
  importClientesCSV,
  
  // Pagamentos
  getAllPagamentos,
  getAllFormasPagamentos,
  getFormaPagamentoById,
  createPagamento,
  createFormaPagamento,
  updateFormaPagamento,
  deletePagamento,
  deleteFormaPagamento,
  
  // Envios
  getAllEnvios,
  getAllFormasEnvios,
  getFormaEnvioById,
  createEnvio,
  createFormaEnvio,
  updateFormaEnvio,
  deleteEnvio,
  deleteFormaEnvio,
  
  // Descontos
  getAllDescontos,
  calcularDesconto,
  createDesconto,
  updateDesconto,
  deleteDesconto,
  
  // Produções
  getAllTiposProducao,
  createTipoProducao,
  updateTipoProducao,
  deleteTipoProducao,
  
  // Tecidos
  getAllTecidos,
  createTecido,
  updateTecido,
  deleteTecido,
  
  // Designers
  getAllDesigners,
  createDesigner,
  updateDesigner,
  deleteDesigner,
  
  // Vendedores
  getAllVendedores,
  createVendedor,
  updateVendedor,
  deleteVendedor,
  
  // Relatórios
  gerarRelatorioDiario,
  gerarRelatorioSemanal,
  gerarRelatorioMensal,
  obterRankingProdutos,
  gerarRelatorioMatriz,
  obterListaClientes,
  obterListaVendedores,
  obterListaDesigners,
  obterRelatorioCancelamentos,
} = api;

// Exportar API como padrão
export default api;
