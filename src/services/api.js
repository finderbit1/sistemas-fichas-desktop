import axios from 'axios';

// const API_LOCAL = "http://192.168.15.24:8080";  // IP do servidor na rede
const API_LOCAL = "http://localhost:8000";  // IP do servidor na rede
// const API_LOCAL = "http://127.0.0.1:8000";  // IP do servidor na rede

const api = axios.create({
  baseURL: API_LOCAL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000
});

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Erro na API:', error);
    return Promise.reject(error);
  }
);

// ===== PEDIDOS =====
export const getAllPedidos = () => api.get('/pedidos');
export const getPedidoById = (id) => api.get(`/pedidos/${id}`);
export const createPedido = (pedido) => api.post('/pedidos', pedido);
export const updatePedido = (id, pedido) => api.patch(`/pedidos/${id}`, pedido);
export const deletePedido = (id) => api.delete(`/pedidos/${id}`);
export const getPedidosByStatus = (status) => api.get(`/pedidos/status/${status}`);

// ===== CLIENTES =====
export const getAllClientes = () => api.get('/clientes');
export const getClienteById = (id) => api.get(`/clientes/${id}`);
export const createCliente = (cliente) => api.post('/clientes', cliente);
export const updateCliente = (id, cliente) => api.put(`/clientes/${id}`, cliente);
export const deleteCliente = (id) => api.delete(`/clientes/${id}`);

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
