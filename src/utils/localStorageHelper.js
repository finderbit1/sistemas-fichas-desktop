// src/utils/localStorageHelper.js

const CHAVE_PEDIDOS = 'pedidos';

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

// Funções com nomes mais específicos para compatibilidade
export const salvarPedidoStorage = salvarPedido;
export const removerPedidoStorage = excluirPedido;
