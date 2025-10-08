import axios from 'axios';

// Função para obter a URL base da API (prioriza configuração salva)
const getApiBaseURL = () => {
  // Tentar buscar configuração salva no localStorage
  const savedConfig = localStorage.getItem('serverConfig');
  if (savedConfig) {
    try {
      const config = JSON.parse(savedConfig);
      return config.baseURL;
    } catch (error) {
      console.warn('Erro ao ler configuração do servidor:', error);
    }
  }
  
  // Fallback: usar IP da rede (ALTERE AQUI para o IP do seu servidor)
  return "http://192.168.15.6:8000";  // IP do servidor na rede
};

// Criar instância do axios com configuração dinâmica
const createApiInstance = () => {
  const baseURL = getApiBaseURL();
  
  return axios.create({
    baseURL: baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 10000
  });
};

let api = createApiInstance();

// Função para recarregar a configuração da API (útil quando muda o servidor)
export const reloadApiConfig = () => {
  api = createApiInstance();
  console.log('🔄 Configuração da API recarregada:', api.defaults.baseURL);
  
  // Reconfigurar interceptors
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error('Erro na API:', error);
      return Promise.reject(error);
    }
  );
  
  return api;
};

// Listener para detectar mudanças na configuração do servidor
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === 'serverConfig') {
      console.log('🔄 Configuração do servidor alterada, recarregando...');
      reloadApiConfig();
      
      // Limpar cache para forçar buscar dados atualizados
      if (window.cacheManager) {
        window.cacheManager.clearAll();
        console.log('🧹 Cache limpo após mudança de servidor');
      }
    }
  });
}

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Erro na API:', error);
    return Promise.reject(error);
  }
);

// ===== PEDIDOS =====
export const getAllPedidos = () => api.get('/pedidos/');
export const getPedidoById = (id) => api.get(`/pedidos/${id}/`);
export const createPedido = (pedido) => api.post('/pedidos/', pedido);
export const updatePedido = (id, pedido) => api.patch(`/pedidos/${id}/`, pedido);
export const getProximoNumeroPedido = () => api.get('/pedidos/proximo-numero/');
export const deletePedido = (id) => api.delete(`/pedidos/${id}/`);
export const getPedidosByStatus = (status) => api.get(`/pedidos/status/${status}/`);

// ===== CLIENTES =====
export const getAllClientes = () => api.get('/clientes');
export const getClienteById = (id) => api.get(`/clientes/${id}`);
export const createCliente = (cliente) => api.post('/clientes', cliente);
export const updateCliente = (id, cliente) => api.put(`/clientes/${id}`, cliente);
export const deleteCliente = (id) => api.delete(`/clientes/${id}`);
export const importClientesCSV = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/clientes/import-csv', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// ===== FORMAS DE PAGAMENTO =====
export const getAllFormasPagamentos = () => api.get('/pagamentos');
export const getFormaPagamentoById = (id) => api.get(`/pagamentos/${id}`);
export const createFormaPagamento = (forma) => api.post('/pagamentos', forma);
export const updateFormaPagamento = (id, forma) => api.put(`/pagamentos/${id}`, forma);
export const deleteFormaPagamento = (id) => api.delete(`/pagamentos/${id}`);

// ===== FORMAS DE ENVIO =====
export const getAllFormasEnvios = () => api.get('/envios');
export const getFormaEnvioById = (id) => api.get(`/envios/${id}`);
export const createFormaEnvio = (forma) => api.post('/envios', forma);
export const updateFormaEnvio = (id, forma) => api.patch(`/envios/${id}`, forma);
export const deleteFormaEnvio = (id) => api.delete(`/envios/${id}`);

// ===== DESIGNERS =====
export const getAllDesigners = () => api.get('/designers');
export const getDesignerById = (id) => api.get(`/designers/${id}`);
export const createDesigner = (designer) => api.post('/designers', designer);
export const updateDesigner = (id, designer) => api.patch(`/designers/${id}`, designer);
export const deleteDesigner = (id) => api.delete(`/designers/${id}`);

// ===== VENDEDORES =====
export const getAllVendedores = () => api.get('/vendedores');
export const getVendedorById = (id) => api.get(`/vendedores/${id}`);
export const createVendedor = (vendedor) => api.post('/vendedores', vendedor);
export const updateVendedor = (id, vendedor) => api.patch(`/vendedores/${id}`, vendedor);
export const deleteVendedor = (id) => api.delete(`/vendedores/${id}`);

// ===== DESCONTOS =====
export const getAllDescontos = () => api.get('/descontos');
export const getDescontoById = (id) => api.get(`/descontos/${id}`);
export const createDesconto = (desconto) => api.post('/descontos', desconto);
export const updateDesconto = (id, desconto) => api.patch(`/descontos/${id}`, desconto);
export const deleteDesconto = (id) => api.delete(`/descontos/${id}`);
export const calcularDesconto = (valorTotal) => api.get(`/descontos/calcular/${valorTotal}`);

// ===== RELATÓRIOS =====
export const gerarRelatorioDiario = (data, filtroTipo = null, filtroNome = null) => {
  const params = { data: data };
  if (filtroTipo) params.filtro_tipo = filtroTipo;
  if (filtroNome) params.filtro_nome = filtroNome;
  
  return api.post('/relatorios/diario', null, { params });
};

export const gerarRelatorioSemanal = (dataInicio) => {
  return api.post('/relatorios/semanal', null, {
    params: { data_inicio: dataInicio }
  });
};

export const gerarRelatorioMensal = (mes, ano) => {
  return api.post('/relatorios/mensal', null, {
    params: { mes, ano }
  });
};

export const obterRankingProdutos = (limite = 20) => {
  return api.get('/relatorios/ranking-produtos', {
    params: { limite }
  });
};

export const obterRelatorioCancelamentos = () => {
  return api.get('/relatorios/cancelamentos');
};

// ===== PRODUÇÕES (Tipos) =====
export const getAllTiposProducao = () => api.get('/producoes/tipos');
export const getTipoProducaoById = (id) => api.get(`/producoes/tipos/${id}`);
export const createTipoProducao = (data) => api.post('/producoes/tipos', data);
export const updateTipoProducao = (id, data) => api.patch(`/producoes/tipos/${id}`, data);
export const deleteTipoProducao = (id) => api.delete(`/producoes/tipos/${id}`);

// ===== TECIDOS =====
export const getAllTecidos = () => api.get('/tecidos');
export const getTecidoById = (id) => api.get(`/tecidos/${id}`);
export const createTecido = (data) => api.post('/tecidos', data);
export const updateTecido = (id, data) => api.patch(`/tecidos/${id}`, data);
export const deleteTecido = (id) => api.delete(`/tecidos/${id}`);

// ===== MATERIAIS =====
export const getAllMateriais = () => api.get('/materiais');
export const getMateriaisPorTipo = (tipo) => api.get(`/materiais/tipo/${tipo}`);
export const getMaterialById = (id) => api.get(`/materiais/${id}`);
export const createMaterial = (data) => api.post('/materiais', data);
export const updateMaterial = (id, data) => api.patch(`/materiais/${id}`, data);
export const deleteMaterial = (id) => api.delete(`/materiais/${id}`);

// Relatórios por Cliente, Vendedor e Designer
export const gerarRelatorioCliente = (nomeCliente) => {
  return api.post('/relatorios/cliente', null, {
    params: { nome_cliente: nomeCliente }
  });
};

export const gerarRelatorioVendedor = (nomeVendedor) => {
  return api.post('/relatorios/vendedor', null, {
    params: { nome_vendedor: nomeVendedor }
  });
};

export const gerarRelatorioDesigner = (nomeDesigner) => {
  return api.post('/relatorios/designer', null, {
    params: { nome_designer: nomeDesigner }
  });
};

export const obterListaClientes = () => {
  return api.get('/relatorios/clientes-lista');
};

export const obterListaVendedores = () => {
  return api.get('/relatorios/vendedores-lista');
};

export const obterListaDesigners = () => {
  return api.get('/relatorios/designers-lista');
};

// ===== RELATÓRIOS DINÂMICOS =====
export const gerarRelatorioMatriz = (payload) => {
  return api.post('/relatorios/matriz', payload);
};

export const gerarRelatorioSintetico = (payload) => {
  return api.post('/relatorios/sintetico', payload);
};

export const gerarRelatorioMatrizPDF = (payload) => {
  return api.post('/relatorios/matriz/pdf', payload, { responseType: 'blob' });
};

// ===== RELATÓRIOS DE ENVIOS =====
export const gerarRelatorioEnvios = (filtros) => {
  return api.post('/relatorios/envios', filtros);
};

// ===== FUNÇÕES DE COMPATIBILIDADE (mantidas para não quebrar código existente) =====
export const postPedido = createPedido;
export const postCliente = createCliente;

// ===== FUNÇÕES LEGADAS (manter por compatibilidade) =====
export const getUserById = (id) => api.get(`/users/${id}`);
export const createUser = (data) => api.post('/users', data);
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/users/${id}`);
export const deleteUserById = () => api.delete('user');

export default api;
