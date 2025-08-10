import axios from 'axios';

// const API_LOCAL = "http://192.168.15.24:8080";  // IP do servidor na rede
const API_LOCAL = "http://127.0.0.1:8000";  // IP do servidor na rede

const api = axios.create({
  baseURL: API_LOCAL, // coloque aqui a base da sua API
  headers: {
    'Content-Type': 'application/json',
    timeout: 3000// 5 segundos padrão

    // Authorization: `Bearer ${token}` // se precisar autenticação
  }
});

export const getUserById = (id) => api.get(`/users/${id}`);
export const createUser = (data) => api.post('/users', data);
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/users/${id}`);
export const getAllPedidos = () => api.get('/pedidos')
export const postPedido = (payload) => api.post('/pedidos',payload)
export const getAllClientes = () => api.get('/clientes');
export const postCliente = (payload) => api.post('/clientes',payload);
export const getAllFormasPagamentos = () => api.get('/tipos-pagamentos');
export const getAllFormasEnvios = () => api.get('/tipos-envios');
export default api;
