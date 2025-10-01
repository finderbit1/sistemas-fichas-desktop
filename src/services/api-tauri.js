import { invoke } from '@tauri-apps/api/core';

// ===== PEDIDOS =====
export const getAllPedidos = async () => {
  try {
    const pedidos = await invoke('get_all_pedidos');
    return { data: pedidos };
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    throw error;
  }
};

export const getPedidoById = async (id) => {
  try {
    const pedido = await invoke('get_pedido_by_id', { id });
    return { data: pedido };
  } catch (error) {
    console.error('Erro ao buscar pedido:', error);
    throw error;
  }
};

export const createPedido = async (pedido) => {
  try {
    const novoPedido = await invoke('create_pedido', { pedido });
    return { data: novoPedido };
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    throw error;
  }
};

export const updatePedido = async (id, pedido) => {
  try {
    const pedidoAtualizado = await invoke('update_pedido', { id, pedido });
    return { data: pedidoAtualizado };
  } catch (error) {
    console.error('Erro ao atualizar pedido:', error);
    throw error;
  }
};

export const getProximoNumeroPedido = async () => {
  try {
    const numero = await invoke('get_proximo_numero_pedido');
    return { data: { proximo_numero: numero } };
  } catch (error) {
    console.error('Erro ao buscar próximo número:', error);
    throw error;
  }
};

export const deletePedido = async (id) => {
  try {
    await invoke('delete_pedido', { id });
    return { data: { success: true } };
  } catch (error) {
    console.error('Erro ao deletar pedido:', error);
    throw error;
  }
};

export const getPedidosByStatus = async (status) => {
  try {
    // Como não temos um comando específico para status, vamos buscar todos e filtrar
    const todosPedidos = await invoke('get_all_pedidos');
    const pedidosFiltrados = todosPedidos.filter(pedido => pedido.status === status);
    return { data: pedidosFiltrados };
  } catch (error) {
    console.error('Erro ao buscar pedidos por status:', error);
    throw error;
  }
};

// Alias para compatibilidade
export const postPedido = createPedido;

// ===== CLIENTES =====
export const getAllClientes = async () => {
  try {
    const clientes = await invoke('get_all_clientes');
    return { data: clientes };
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    throw error;
  }
};

export const getClienteById = async (id) => {
  try {
    const cliente = await invoke('get_cliente_by_id', { id });
    return { data: cliente };
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    throw error;
  }
};

export const createCliente = async (cliente) => {
  try {
    console.log('=== DEBUG createCliente (Tauri) ===');
    console.log('Cliente recebido:', cliente);
    console.log('Tipo do cliente:', typeof cliente);
    
    const novoCliente = await invoke('create_cliente', { cliente });
    console.log('Cliente criado com sucesso:', novoCliente);
    return { data: novoCliente };
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    console.error('Tipo do erro:', typeof error);
    console.error('Stack do erro:', error.stack);
    throw error;
  }
};

export const updateCliente = async (id, cliente) => {
  try {
    const clienteAtualizado = await invoke('update_cliente', { id, cliente });
    return { data: clienteAtualizado };
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    throw error;
  }
};

export const deleteCliente = async (id) => {
  try {
    await invoke('delete_cliente', { id });
    return { data: { success: true } };
  } catch (error) {
    console.error('Erro ao deletar cliente:', error);
    throw error;
  }
};

export const importClientesCSV = async (csvContent) => {
  try {
    const count = await invoke('import_clientes_csv', { csvContent });
    return { data: { count } };
  } catch (error) {
    console.error('Erro ao importar clientes:', error);
    throw error;
  }
};

// Alias para compatibilidade
export const postCliente = createCliente;

// ===== PAGAMENTOS =====
export const getAllPagamentos = async () => {
  try {
    const pagamentos = await invoke('get_all_pagamentos');
    return { data: pagamentos };
  } catch (error) {
    console.error('Erro ao buscar pagamentos:', error);
    throw error;
  }
};

export const getAllFormasPagamentos = async () => {
  try {
    const pagamentos = await invoke('get_all_pagamentos');
    
    // Converter dados do Rust para o formato esperado pelo frontend
    const pagamentosConvertidos = pagamentos.map(pagamento => ({
      id: pagamento.id,
      name: pagamento.nome,  // nome -> name
      value: pagamento.descricao ? parseFloat(pagamento.descricao) : null,  // descricao -> value
      ativo: pagamento.ativo,
      created_at: pagamento.created_at,
      updated_at: pagamento.updated_at
    }));
    
    console.log('=== DEBUG getAllFormasPagamentos (Tauri) ===');
    console.log('Dados do Rust:', pagamentos);
    console.log('Dados convertidos:', pagamentosConvertidos);
    
    return { data: pagamentosConvertidos };
  } catch (error) {
    console.error('Erro ao buscar formas de pagamento:', error);
    throw error;
  }
};

export const getFormaPagamentoById = async (id) => {
  try {
    const pagamentos = await invoke('get_all_pagamentos');
    const pagamento = pagamentos.find(p => p.id === id);
    return { data: pagamento };
  } catch (error) {
    console.error('Erro ao buscar forma de pagamento:', error);
    throw error;
  }
};

export const createPagamento = async (pagamento) => {
  try {
    const novoPagamento = await invoke('create_pagamento', { pagamento });
    return { data: novoPagamento };
  } catch (error) {
    console.error('Erro ao criar pagamento:', error);
    throw error;
  }
};

export const createFormaPagamento = async (forma) => {
  try {
    // Converter dados do frontend para o formato esperado pelo Rust
    const pagamentoData = {
      nome: forma.name || forma.nome,
      descricao: forma.value ? forma.value.toString() : forma.descricao,
      ativo: forma.ativo !== undefined ? forma.ativo : true
    };
    
    console.log('=== DEBUG createFormaPagamento (Tauri) ===');
    console.log('Dados recebidos:', forma);
    console.log('Dados convertidos:', pagamentoData);
    
    const novaForma = await invoke('create_pagamento', { pagamento: pagamentoData });
    console.log('Forma de pagamento criada:', novaForma);
    
    // Converter dados do Rust para o formato esperado pelo frontend
    const formaConvertida = {
      id: novaForma.id,
      name: novaForma.nome,  // nome -> name
      value: novaForma.descricao ? parseFloat(novaForma.descricao) : null,  // descricao -> value
      ativo: novaForma.ativo,
      created_at: novaForma.created_at,
      updated_at: novaForma.updated_at
    };
    
    return { data: formaConvertida };
  } catch (error) {
    console.error('Erro ao criar forma de pagamento:', error);
    console.error('Tipo do erro:', typeof error);
    console.error('Stack do erro:', error.stack);
    throw error;
  }
};

export const updateFormaPagamento = async (id, forma) => {
  try {
    // Converter dados do frontend para o formato esperado pelo Rust
    const pagamentoData = {
      nome: forma.name || forma.nome,
      descricao: forma.value ? forma.value.toString() : forma.descricao,
      ativo: forma.ativo !== undefined ? forma.ativo : true
    };
    
    console.log('=== DEBUG updateFormaPagamento (Tauri) ===');
    console.log('ID:', id);
    console.log('Dados recebidos:', forma);
    console.log('Dados convertidos:', pagamentoData);
    
    const formaAtualizada = await invoke('update_pagamento', { id, pagamento: pagamentoData });
    console.log('Forma de pagamento atualizada:', formaAtualizada);
    
    // Converter dados do Rust para o formato esperado pelo frontend
    const formaConvertida = {
      id: formaAtualizada.id,
      name: formaAtualizada.nome,  // nome -> name
      value: formaAtualizada.descricao ? parseFloat(formaAtualizada.descricao) : null,  // descricao -> value
      ativo: formaAtualizada.ativo,
      created_at: formaAtualizada.created_at,
      updated_at: formaAtualizada.updated_at
    };
    
    return { data: formaConvertida };
  } catch (error) {
    console.error('Erro ao atualizar forma de pagamento:', error);
    throw error;
  }
};

export const deletePagamento = async (id) => {
  try {
    await invoke('delete_pagamento', { id });
    return { data: { success: true } };
  } catch (error) {
    console.error('Erro ao deletar pagamento:', error);
    throw error;
  }
};

export const deleteFormaPagamento = async (id) => {
  try {
    await invoke('delete_pagamento', { id });
    return { data: { success: true } };
  } catch (error) {
    console.error('Erro ao deletar forma de pagamento:', error);
    throw error;
  }
};

// ===== ENVIOS =====
export const getAllEnvios = async () => {
  try {
    const envios = await invoke('get_all_envios');
    return { data: envios };
  } catch (error) {
    console.error('Erro ao buscar envios:', error);
    throw error;
  }
};

export const getAllFormasEnvios = async () => {
  try {
    const envios = await invoke('get_all_envios');
    
    // Converter dados do Rust para o formato esperado pelo frontend
    const enviosConvertidos = envios.map(envio => ({
      id: envio.id,
      name: envio.nome,  // nome -> name
      value: envio.valor,  // valor -> value
      ativo: envio.ativo,
      created_at: envio.created_at,
      updated_at: envio.updated_at
    }));
    
    console.log('=== DEBUG getAllFormasEnvios (Tauri) ===');
    console.log('Dados do Rust:', envios);
    console.log('Dados convertidos:', enviosConvertidos);
    
    return { data: enviosConvertidos };
  } catch (error) {
    console.error('Erro ao buscar formas de envio:', error);
    throw error;
  }
};

export const getFormaEnvioById = async (id) => {
  try {
    const envios = await invoke('get_all_envios');
    const envio = envios.find(e => e.id === id);
    return { data: envio };
  } catch (error) {
    console.error('Erro ao buscar forma de envio:', error);
    throw error;
  }
};

export const createEnvio = async (envio) => {
  try {
    const novoEnvio = await invoke('create_envio', { envio });
    return { data: novoEnvio };
  } catch (error) {
    console.error('Erro ao criar envio:', error);
    throw error;
  }
};

export const createFormaEnvio = async (forma) => {
  try {
    // Converter dados do frontend para o formato esperado pelo Rust
    const envioData = {
      nome: forma.name || forma.nome,
      descricao: forma.descricao,
      valor: forma.value || forma.valor || 0.0,
      ativo: forma.ativo !== undefined ? forma.ativo : true
    };
    
    console.log('=== DEBUG createFormaEnvio (Tauri) ===');
    console.log('Dados recebidos:', forma);
    console.log('Dados convertidos:', envioData);
    
    const novaForma = await invoke('create_envio', { envio: envioData });
    console.log('Forma de envio criada:', novaForma);
    
    // Converter dados do Rust para o formato esperado pelo frontend
    const formaConvertida = {
      id: novaForma.id,
      name: novaForma.nome,  // nome -> name
      value: novaForma.valor,  // valor -> value
      ativo: novaForma.ativo,
      created_at: novaForma.created_at,
      updated_at: novaForma.updated_at
    };
    
    return { data: formaConvertida };
  } catch (error) {
    console.error('Erro ao criar forma de envio:', error);
    throw error;
  }
};

export const updateFormaEnvio = async (id, forma) => {
  try {
    // Converter dados do frontend para o formato esperado pelo Rust
    const envioData = {
      nome: forma.name || forma.nome,
      descricao: forma.descricao,
      valor: forma.value || forma.valor || 0.0,
      ativo: forma.ativo !== undefined ? forma.ativo : true
    };
    
    console.log('=== DEBUG updateFormaEnvio (Tauri) ===');
    console.log('ID:', id);
    console.log('Dados recebidos:', forma);
    console.log('Dados convertidos:', envioData);
    
    const formaAtualizada = await invoke('update_envio', { id, envio: envioData });
    console.log('Forma de envio atualizada:', formaAtualizada);
    
    // Converter dados do Rust para o formato esperado pelo frontend
    const formaConvertida = {
      id: formaAtualizada.id,
      name: formaAtualizada.nome,  // nome -> name
      value: formaAtualizada.valor,  // valor -> value
      ativo: formaAtualizada.ativo,
      created_at: formaAtualizada.created_at,
      updated_at: formaAtualizada.updated_at
    };
    
    return { data: formaConvertida };
  } catch (error) {
    console.error('Erro ao atualizar forma de envio:', error);
    throw error;
  }
};

export const deleteEnvio = async (id) => {
  try {
    await invoke('delete_envio', { id });
    return { data: { success: true } };
  } catch (error) {
    console.error('Erro ao deletar envio:', error);
    throw error;
  }
};

export const deleteFormaEnvio = async (id) => {
  try {
    await invoke('delete_envio', { id });
    return { data: { success: true } };
  } catch (error) {
    console.error('Erro ao deletar forma de envio:', error);
    throw error;
  }
};

// ===== DESCONTOS =====
export const getAllDescontos = async () => {
  try {
    const descontos = await invoke('get_all_descontos');
    return { data: descontos };
  } catch (error) {
    console.error('Erro ao buscar descontos:', error);
    throw error;
  }
};

export const calcularDesconto = async (valorTotal) => {
  try {
    const descontos = await invoke('calcular_desconto', { valorTotal });
    return { data: descontos };
  } catch (error) {
    console.error('Erro ao calcular desconto:', error);
    throw error;
  }
};

export const createDesconto = async (desconto) => {
  try {
    const novoDesconto = await invoke('create_desconto', { desconto });
    return { data: novoDesconto };
  } catch (error) {
    console.error('Erro ao criar desconto:', error);
    throw error;
  }
};

export const updateDesconto = async (id, desconto) => {
  try {
    // Como não temos comando específico de update, vamos simular
    const descontos = await invoke('get_all_descontos');
    const descontoAtualizado = descontos.find(d => d.id === id);
    if (descontoAtualizado) {
      Object.assign(descontoAtualizado, desconto);
    }
    return { data: descontoAtualizado };
  } catch (error) {
    console.error('Erro ao atualizar desconto:', error);
    throw error;
  }
};

export const deleteDesconto = async (id) => {
  try {
    await invoke('delete_desconto', { id });
    return { data: { success: true } };
  } catch (error) {
    console.error('Erro ao deletar desconto:', error);
    throw error;
  }
};

// ===== PRODUÇÕES =====
export const getAllTiposProducao = async () => {
  try {
    const producoes = await invoke('get_all_tipos_producao');
    return { data: producoes };
  } catch (error) {
    console.error('Erro ao buscar produções:', error);
    throw error;
  }
};

export const createTipoProducao = async (producao) => {
  try {
    const novaProducao = await invoke('create_tipo_producao', { producao });
    return { data: novaProducao };
  } catch (error) {
    console.error('Erro ao criar produção:', error);
    throw error;
  }
};

export const updateTipoProducao = async (id, data) => {
  try {
    // Como não temos comando específico de update, vamos simular
    const producoes = await invoke('get_all_tipos_producao');
    const producaoAtualizada = producoes.find(p => p.id === id);
    if (producaoAtualizada) {
      Object.assign(producaoAtualizada, data);
    }
    return { data: producaoAtualizada };
  } catch (error) {
    console.error('Erro ao atualizar produção:', error);
    throw error;
  }
};

export const deleteTipoProducao = async (id) => {
  try {
    await invoke('delete_tipo_producao', { id });
    return { data: { success: true } };
  } catch (error) {
    console.error('Erro ao deletar produção:', error);
    throw error;
  }
};

// ===== TECIDOS =====
export const getAllTecidos = async () => {
  try {
    const tecidos = await invoke('get_all_tecidos');
    return { data: tecidos };
  } catch (error) {
    console.error('Erro ao buscar tecidos:', error);
    throw error;
  }
};

export const createTecido = async (tecido) => {
  try {
    const novoTecido = await invoke('create_tecido', { tecido });
    return { data: novoTecido };
  } catch (error) {
    console.error('Erro ao criar tecido:', error);
    throw error;
  }
};

export const updateTecido = async (id, data) => {
  try {
    // Como não temos comando específico de update, vamos simular
    const tecidos = await invoke('get_all_tecidos');
    const tecidoAtualizado = tecidos.find(t => t.id === id);
    if (tecidoAtualizado) {
      Object.assign(tecidoAtualizado, data);
    }
    return { data: tecidoAtualizado };
  } catch (error) {
    console.error('Erro ao atualizar tecido:', error);
    throw error;
  }
};

export const deleteTecido = async (id) => {
  try {
    await invoke('delete_tecido', { id });
    return { data: { success: true } };
  } catch (error) {
    console.error('Erro ao deletar tecido:', error);
    throw error;
  }
};

// ===== DESIGNERS =====
export const getAllDesigners = async () => {
  try {
    const designers = await invoke('get_all_designers');
    
    // Converter dados do Rust para o formato esperado pelo frontend
    const designersConvertidos = designers.map(designer => ({
      id: designer.id,
      name: designer.nome,  // nome -> name
      email: designer.email,
      telefone: designer.telefone,
      especialidade: designer.especialidade,
      ativo: designer.ativo,
      created_at: designer.created_at,
      updated_at: designer.updated_at
    }));
    
    console.log('=== DEBUG getAllDesigners (Tauri) ===');
    console.log('Dados do Rust:', designers);
    console.log('Dados convertidos:', designersConvertidos);
    
    return { data: designersConvertidos };
  } catch (error) {
    console.error('Erro ao buscar designers:', error);
    throw error;
  }
};

export const createDesigner = async (designer) => {
  try {
    // Converter dados do frontend para o formato esperado pelo Rust
    const designerData = {
      nome: designer.name || designer.nome,
      email: designer.email,
      telefone: designer.telefone,
      especialidade: designer.especialidade,
      ativo: designer.ativo !== undefined ? designer.ativo : true
    };
    
    console.log('=== DEBUG createDesigner (Tauri) ===');
    console.log('Dados recebidos:', designer);
    console.log('Dados convertidos:', designerData);
    
    const novoDesigner = await invoke('create_designer', { designer: designerData });
    console.log('Designer criado:', novoDesigner);
    
    // Converter dados do Rust para o formato esperado pelo frontend
    const designerConvertido = {
      id: novoDesigner.id,
      name: novoDesigner.nome,  // nome -> name
      email: novoDesigner.email,
      telefone: novoDesigner.telefone,
      especialidade: novoDesigner.especialidade,
      ativo: novoDesigner.ativo,
      created_at: novoDesigner.created_at,
      updated_at: novoDesigner.updated_at
    };
    
    return { data: designerConvertido };
  } catch (error) {
    console.error('Erro ao criar designer:', error);
    console.error('Tipo do erro:', typeof error);
    console.error('Stack do erro:', error.stack);
    throw error;
  }
};

export const updateDesigner = async (id, designer) => {
  try {
    // Como não temos comando específico de update, vamos simular
    const designers = await invoke('get_all_designers');
    const designerAtualizado = designers.find(d => d.id === id);
    if (designerAtualizado) {
      Object.assign(designerAtualizado, designer);
    }
    return { data: designerAtualizado };
  } catch (error) {
    console.error('Erro ao atualizar designer:', error);
    throw error;
  }
};

export const deleteDesigner = async (id) => {
  try {
    await invoke('delete_designer', { id });
    return { data: { success: true } };
  } catch (error) {
    console.error('Erro ao deletar designer:', error);
    throw error;
  }
};

// ===== VENDEDORES =====
export const getAllVendedores = async () => {
  try {
    const vendedores = await invoke('get_all_vendedores');
    return { data: vendedores };
  } catch (error) {
    console.error('Erro ao buscar vendedores:', error);
    throw error;
  }
};

export const createVendedor = async (vendedor) => {
  try {
    const novoVendedor = await invoke('create_vendedor', { vendedor });
    return { data: novoVendedor };
  } catch (error) {
    console.error('Erro ao criar vendedor:', error);
    throw error;
  }
};

export const updateVendedor = async (id, vendedor) => {
  try {
    // Como não temos comando específico de update, vamos simular
    const vendedores = await invoke('get_all_vendedores');
    const vendedorAtualizado = vendedores.find(v => v.id === id);
    if (vendedorAtualizado) {
      Object.assign(vendedorAtualizado, vendedor);
    }
    return { data: vendedorAtualizado };
  } catch (error) {
    console.error('Erro ao atualizar vendedor:', error);
    throw error;
  }
};

export const deleteVendedor = async (id) => {
  try {
    await invoke('delete_vendedor', { id });
    return { data: { success: true } };
  } catch (error) {
    console.error('Erro ao deletar vendedor:', error);
    throw error;
  }
};

// ===== RELATÓRIOS =====
export const gerarRelatorioDiario = async (data, filtroTipo, filtroNome) => {
  try {
    const relatorio = await invoke('gerar_relatorio_diario', { data, filtroTipo, filtroNome });
    return { data: relatorio };
  } catch (error) {
    console.error('Erro ao gerar relatório diário:', error);
    throw error;
  }
};

export const gerarRelatorioSemanal = async (dataInicio) => {
  try {
    const relatorio = await invoke('gerar_relatorio_semanal', { dataInicio });
    return { data: relatorio };
  } catch (error) {
    console.error('Erro ao gerar relatório semanal:', error);
    throw error;
  }
};

export const gerarRelatorioMensal = async (mes, ano) => {
  try {
    const relatorio = await invoke('gerar_relatorio_mensal', { mes, ano });
    return { data: relatorio };
  } catch (error) {
    console.error('Erro ao gerar relatório mensal:', error);
    throw error;
  }
};

export const obterRankingProdutos = async (limite) => {
  try {
    const ranking = await invoke('obter_ranking_produtos', { limite });
    return { data: ranking };
  } catch (error) {
    console.error('Erro ao obter ranking de produtos:', error);
    throw error;
  }
};

export const gerarRelatorioMatriz = async (filtros) => {
  try {
    const relatorio = await invoke('gerar_relatorio_matriz', { filtros });
    return { data: relatorio };
  } catch (error) {
    console.error('Erro ao gerar relatório matriz:', error);
    throw error;
  }
};

// ===== FUNÇÕES DE LISTA PARA RELATÓRIOS =====
export const obterListaClientes = async () => {
  try {
    const clientes = await invoke('get_all_clientes');
    return { data: clientes };
  } catch (error) {
    console.error('Erro ao obter lista de clientes:', error);
    throw error;
  }
};

export const obterListaVendedores = async () => {
  try {
    const vendedores = await invoke('get_all_vendedores');
    return { data: vendedores };
  } catch (error) {
    console.error('Erro ao obter lista de vendedores:', error);
    throw error;
  }
};

export const obterListaDesigners = async () => {
  try {
    const designers = await invoke('get_all_designers');
    return { data: designers };
  } catch (error) {
    console.error('Erro ao obter lista de designers:', error);
    throw error;
  }
};

export const obterRelatorioCancelamentos = async () => {
  try {
    // Como não temos comando específico, vamos buscar pedidos cancelados
    const todosPedidos = await invoke('get_all_pedidos');
    const pedidosCancelados = todosPedidos.filter(pedido => pedido.status === 'cancelado');
    return { data: pedidosCancelados };
  } catch (error) {
    console.error('Erro ao obter relatório de cancelamentos:', error);
    throw error;
  }
};