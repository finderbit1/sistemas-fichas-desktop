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
