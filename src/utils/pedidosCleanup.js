// Utilitário para apagar pedidos fakes gerados (prefixo PED-FAKE)
import { getAllPedidos, deletePedido } from '../services/api';

export async function limparPedidosFakes(onProgress) {
  const resp = await getAllPedidos();
  const lista = Array.isArray(resp?.data) ? resp.data : [];
  const fakes = lista.filter(p => String(p?.numero || '').startsWith('PED-FAKE'));

  const total = fakes.length;
  let sucesso = 0;
  let falhas = 0;

  for (let i = 0; i < fakes.length; i++) {
    const pedido = fakes[i];
    try {
      if (pedido?.id != null) {
        await deletePedido(pedido.id);
        sucesso += 1;
      } else {
        falhas += 1;
      }
    } catch (_) {
      falhas += 1;
    }
    if (typeof onProgress === 'function') {
      try { onProgress({ current: i + 1, total, sucesso, falhas }); } catch (_) {}
    }
    // Pequeno intervalo para aliviar o servidor
    await new Promise(r => setTimeout(r, 40));
  }

  return { total, sucesso, falhas };
}





