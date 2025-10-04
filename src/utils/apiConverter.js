/**
 * Utilitário para converter dados do frontend para o formato da API Python
 */

// Converter dados do formulário para o formato da API
const parseBRLMoney = (value) => {
  if (typeof value === 'number') return value.toFixed ? value.toFixed(2) : value;
  if (!value) return '0';
  
  const v = String(value);
  // Se já está no formato correto (ex: "90.00"), usar diretamente
  if (/^\d+\.\d{2}$/.test(v)) return String(parseFloat(v));
  
  // Se está no formato brasileiro (ex: "90,00" ou "1.234,56"), converter
  const normalized = v.replace(/\./g, '').replace(',', '.');
  const num = parseFloat(normalized);
  return isNaN(num) ? '0' : String(num);
};
// Converter para o formato da API Python (mantido para compatibilidade)
export const convertFormDataToApiPedido = (formData) => {
  // Converter items para o formato da API
  const items = formData.items.map(item => ({
    tipo_producao: item.tipoProducao || item.tipo || 'painel',
    descricao: item.descricao || '',
    largura: item.largura || '0',
    altura: item.altura || '0',
    metro_quadrado: item.metro_quadrado || item.metroQuadrado || '0',
    vendedor: item.vendedor || '',
    designer: item.designer || '',
    tecido: item.tecido || '',
    acabamento: {
      overloque: item.acabamento?.overloque || false,
      elastico: item.acabamento?.elastico || false,
      ilhos: item.acabamento?.ilhos || false
    },
    emenda: item.emenda || 'sem-emenda',
    observacao: item.observacao || null,
    valor_unitario: parseBRLMoney(item.valor),
    imagem: item.imagem || null,
    // Campos específicos para totem
    ilhos_qtd: item.ilhos_qtd || null,
    ilhos_valor_unitario: item.ilhos_valor_unitario || null,
    ilhos_distancia: item.ilhos_distancia || null
  }));

  // Converter prioridade
  const prioridade = formData.prioridade === '2' ? 'ALTA' : 'NORMAL';

  // Converter status usando a função de conversão
  const status = convertStatusToApi(formData.status || 'Pendente');

  // Calcular valor total dos itens
  const valorItens = items.reduce((total, item) => {
    const valor = parseFloat(item.valor_unitario?.replace(',', '.') || '0');
    return total + valor;
  }, 0).toFixed(2);

  return {
    numero: formData.numeroPedido || '',
    data_entrada: formData.dataEntrada || '',
    data_entrega: formData.dataEntrega || '',
    observacao: formData.observacao || null,
    prioridade: prioridade,
    status: status,
    
    // Dados do cliente
    cliente: formData.nomeCliente || '',
    telefone_cliente: formData.telefoneCliente || '',
    cidade_cliente: formData.cidadeCliente || '',
    
    // Valores
    valor_total: parseBRLMoney(formData.valorTotal),
    valor_frete: parseBRLMoney(formData.valorFrete),
    valor_itens: valorItens,
    tipo_pagamento: formData.tipoPagamentoNome || formData.tipoPagamento || formData.formaSelecionada?.name || '',
    obs_pagamento: formData.obsPagamento || null,
    
    // Envio
    forma_envio: formData.formaEnvio || formData.formaSelecionada?.name || '',
    forma_envio_id: formData.formaEnvioId || formData.formaSelecionada?.id || 1,
    
    // Status de produção
    financeiro: formData.financeiro || false,
    conferencia: formData.conferencia || false,
    sublimacao: formData.sublimacao || false,
    costura: formData.costura || false,
    expedicao: formData.expedicao || false,
    
    // Items
    items: items
  };
};

// Converter para o formato da API Rust/Tauri
export const convertFormDataToRustPedido = (formData) => {
  // Converter items para JSON string
  const items = formData.items.map(item => ({
    tipo_producao: item.tipoProducao || item.tipo || 'painel',
    descricao: item.descricao || '',
    largura: parseFloat(item.largura || '0'),
    altura: parseFloat(item.altura || '0'),
    metro_quadrado: parseFloat(item.metro_quadrado || item.metroQuadrado || '0'),
    vendedor: item.vendedor || '',
    designer: item.designer || '',
    tecido: item.tecido || '',
    acabamento: {
      overloque: item.acabamento?.overloque || false,
      elastico: item.acabamento?.elastico || false,
      ilhos: item.acabamento?.ilhos || false
    },
    emenda: item.emenda || 'sem-emenda',
    observacao: item.observacao || null,
    valor_unitario: parseFloat(parseBRLMoney(item.valor)),
    imagem: item.imagem || null,
    // Campos específicos para totem
    ilhos_qtd: item.ilhos_qtd ? parseInt(item.ilhos_qtd) : null,
    ilhos_valor_unitario: item.ilhos_valor_unitario ? parseFloat(item.ilhos_valor_unitario) : null,
    ilhos_distancia: item.ilhos_distancia ? parseFloat(item.ilhos_distancia) : null
  }));

  // Converter datas
  const dataPedido = formData.dataEntrada ? new Date(formData.dataEntrada) : new Date();
  const dataEntrega = formData.dataEntrega ? new Date(formData.dataEntrega) : null;

  return {
    cliente_id: formData.clienteId || 1, // ID do cliente selecionado
    data_pedido: dataPedido.toISOString(),
    data_entrega: dataEntrega ? dataEntrega.toISOString() : null,
    status: convertStatusToApi(formData.status || 'Pendente'),
    valor_total: parseFloat(parseBRLMoney(formData.valorTotal)),
    observacoes: formData.observacao || null,
    vendedor_id: formData.vendedorId || (formData.items && formData.items[0]?.vendedor ? parseInt(formData.items[0].vendedor) : null),
    designer_id: formData.designerId || (formData.items && formData.items[0]?.designer ? parseInt(formData.items[0].designer) : null),
    forma_pagamento_id: formData.formaPagamentoId || null,
    forma_envio_id: formData.formaEnvioId || null,
    desconto_id: formData.descontoId || null,
    items: JSON.stringify(items)
  };
};

// Converter para o formato de atualização da API Rust/Tauri (PedidoUpdate)
export const convertFormDataToRustPedidoUpdate = (formData) => {
  // Converter items para JSON string
  const items = (formData.items || []).map(item => ({
    tipo_producao: item.tipoProducao || item.tipo || 'painel',
    descricao: item.descricao || '',
    largura: parseFloat(item.largura || '0'),
    altura: parseFloat(item.altura || '0'),
    metro_quadrado: parseFloat(item.metro_quadrado || item.metroQuadrado || '0'),
    vendedor: item.vendedor || '',
    designer: item.designer || '',
    tecido: item.tecido || '',
    acabamento: {
      overloque: item.acabamento?.overloque || false,
      elastico: item.acabamento?.elastico || false,
      ilhos: item.acabamento?.ilhos || false
    },
    emenda: item.emenda || 'sem-emenda',
    observacao: item.observacao || null,
    valor_unitario: parseFloat(parseBRLMoney(item.valor)),
    imagem: item.imagem || null,
    // Campos específicos para totem
    ilhos_qtd: item.ilhos_qtd ? parseInt(item.ilhos_qtd) : null,
    ilhos_valor_unitario: item.ilhos_valor_unitario ? parseFloat(item.ilhos_valor_unitario) : null,
    ilhos_distancia: item.ilhos_distancia ? parseFloat(item.ilhos_distancia) : null
  }));

  // Converter datas de forma mais segura
  let dataPedido = null;
  let dataEntrega = null;
  
  if (formData.dataEntrada) {
    try {
      const date = new Date(formData.dataEntrada);
      if (!isNaN(date.getTime())) {
        dataPedido = date.toISOString();
      }
    } catch (e) {
      console.warn('Erro ao converter data de entrada:', e);
    }
  }
  
  if (formData.dataEntrega) {
    try {
      const date = new Date(formData.dataEntrega);
      if (!isNaN(date.getTime())) {
        dataEntrega = date.toISOString();
      }
    } catch (e) {
      console.warn('Erro ao converter data de entrega:', e);
    }
  }

  // Converter status de forma mais segura
  let status = null;
  if (formData.status) {
    try {
      status = convertStatusToApi(formData.status);
    } catch (e) {
      console.warn('Erro ao converter status:', e);
      status = 'pendente';
    }
  }

  // Converter valor total de forma mais segura
  let valorTotal = null;
  if (formData.valorTotal) {
    try {
      valorTotal = parseFloat(parseBRLMoney(formData.valorTotal));
      if (isNaN(valorTotal)) {
        valorTotal = null;
      }
    } catch (e) {
      console.warn('Erro ao converter valor total:', e);
    }
  }

  // Converter IDs de forma mais segura
  const clienteId = formData.clienteId ? parseInt(formData.clienteId) : null;
  const vendedorId = formData.vendedorId ? parseInt(formData.vendedorId) : null;
  const designerId = formData.designerId ? parseInt(formData.designerId) : null;
  const formaPagamentoId = formData.formaPagamentoId ? parseInt(formData.formaPagamentoId) : null;
  const formaEnvioId = formData.formaEnvioId ? parseInt(formData.formaEnvioId) : null;
  const descontoId = formData.descontoId ? parseInt(formData.descontoId) : null;

  const result = {
    cliente_id: clienteId,
    data_pedido: dataPedido,
    data_entrega: dataEntrega,
    status: status,
    valor_total: valorTotal,
    observacoes: formData.observacao || null,
    vendedor_id: vendedorId,
    designer_id: designerId,
    forma_pagamento_id: formaPagamentoId,
    forma_envio_id: formaEnvioId,
    desconto_id: descontoId,
    items: JSON.stringify(items)
  };

  // Remover campos null/undefined para evitar problemas de serialização
  Object.keys(result).forEach(key => {
    if (result[key] === null || result[key] === undefined) {
      delete result[key];
    }
  });

  return result;
};

// Converter dados da API para o formato do frontend
export const convertApiPedidoToFormData = (apiPedido) => {
  // Converter items
  const items = apiPedido.items.map(item => ({
    tipo: item.tipo_producao || 'painel',
    tipoProducao: item.tipo_producao || 'painel',
    descricao: item.descricao || '',
    largura: item.largura || '0',
    altura: item.altura || '0',
    metro_quadrado: item.metro_quadrado || '0',
    metroQuadrado: item.metro_quadrado || '0',
    vendedor: item.vendedor || '',
    designer: item.designer || '',
    tecido: item.tecido || '',
    acabamento: {
      overloque: item.acabamento?.overloque || false,
      elastico: item.acabamento?.elastico || false,
      ilhos: item.acabamento?.ilhos || false
    },
    emenda: item.emenda || 'sem-emenda',
    observacao: item.observacao || '',
    valor: item.valor_unitario || '0',
    imagem: item.imagem || null,
    // Campos específicos para totem
    ilhos_qtd: item.ilhos_qtd || '',
    ilhos_valor_unitario: item.ilhos_valor_unitario || '',
    ilhos_distancia: item.ilhos_distancia || ''
  }));

  // Converter prioridade
  const prioridade = apiPedido.prioridade === 'ALTA' ? '2' : '1';

  return {
    id: apiPedido.id,
    numeroPedido: apiPedido.numero || '',
    dataEntrada: apiPedido.data_entrada || '',
    dataEntrega: apiPedido.data_entrega || '',
    observacao: apiPedido.observacao || '',
    prioridade: prioridade,
    status: convertStatusFromApi(apiPedido.status || 'pendente'),
    
    // Dados do cliente
    nomeCliente: apiPedido.cliente || '',
    telefoneCliente: apiPedido.telefone_cliente || '',
    cidadeCliente: apiPedido.cidade_cliente || '',
    
    // Valores
    valorTotal: apiPedido.valor_total || '0',
    valorFrete: apiPedido.valor_frete || '0',
    valorItens: apiPedido.valor_itens || '0',
    tipoPagamento: apiPedido.tipo_pagamento || '',
    obsPagamento: apiPedido.obs_pagamento || '',
    
    // Envio
    formaEnvio: apiPedido.forma_envio || '',
    formaEnvioId: apiPedido.forma_envio_id || 1,
    
    // Status de produção
    financeiro: apiPedido.financeiro || false,
    conferencia: apiPedido.conferencia || false,
    sublimacao: apiPedido.sublimacao || false,
    costura: apiPedido.costura || false,
    expedicao: apiPedido.expedicao || false,
    
    // Items
    items: items,
    
    // Metadados
    dataCriacao: apiPedido.data_criacao || new Date().toISOString(),
    ultimaAtualizacao: apiPedido.ultima_atualizacao || new Date().toISOString()
  };
};

// Converter lista de pedidos da API para o formato do frontend
export const convertApiPedidosToList = (apiPedidos) => {
  return apiPedidos.map(convertApiPedidoToFormData);
};

// Validar se os dados estão no formato correto para a API Python (mantido para compatibilidade)
export const validatePedidoForApi = (pedido) => {
  const errors = [];
  
  if (!pedido.numero) errors.push('Número do pedido é obrigatório');
  if (!pedido.data_entrada) errors.push('Data de entrada é obrigatória');
  if (!pedido.data_entrega) errors.push('Data de entrega é obrigatória');
  if (!pedido.cliente) errors.push('Nome do cliente é obrigatório');
  if (!pedido.telefone_cliente) errors.push('Telefone do cliente é obrigatório');
  if (!pedido.cidade_cliente) errors.push('Cidade do cliente é obrigatória');
  if (!pedido.items || pedido.items.length === 0) errors.push('Pelo menos um item é obrigatório');
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validar se os dados estão no formato correto para a API Rust
export const validateRustPedidoForApi = (pedido) => {
  const errors = [];
  
  if (!pedido.cliente_id) errors.push('ID do cliente é obrigatório');
  if (!pedido.data_pedido) errors.push('Data do pedido é obrigatória');
  if (!pedido.valor_total || pedido.valor_total <= 0) errors.push('Valor total deve ser maior que zero');
  if (!pedido.items || pedido.items === '[]') errors.push('Pelo menos um item é obrigatório');
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Converter status do frontend para API
export const convertStatusToApi = (status) => {
  const statusMap = {
    'Pendente': 'pendente',
    'Em Andamento': 'em_producao',
    'Pronto': 'pronto',
    'Entregue': 'entregue',
    'Cancelado': 'cancelado'
  };
  
  return statusMap[status] || 'pendente';
};

// Converter status da API para frontend
export const convertStatusFromApi = (status) => {
  const statusMap = {
    'pendente': 'Pendente',
    'em_producao': 'Em Andamento',
    'pronto': 'Pronto',
    'entregue': 'Entregue',
    'cancelado': 'Cancelado'
  };
  
  return statusMap[status] || 'Pendente';
};





