/**
 * Hooks específicos para dados cacheados
 * Facilita o uso do cache em componentes
 */

import useCachedApi from './useCachedApi';
import { 
  getAllClientes, 
  getAllFormasPagamentos, 
  getAllFormasEnvios, 
  getAllDescontos,
  getAllTecidos,
  getAllMateriais,
  getMateriaisPorTipo
} from '../services/api';

/**
 * Hook para buscar designers com cache
 */
export const useCachedDesigners = (options = {}) => {
  return useCachedApi('designers', async () => {
    const { default: api } = await import('../services/api');
    return api.getAllDesigners?.() || { data: [] };
  }, {
    filter: (item) => item.active !== false,
    ...options
  });
};

/**
 * Hook para buscar vendedores com cache
 */
export const useCachedVendedores = (options = {}) => {
  return useCachedApi('vendedores', async () => {
    const { default: api } = await import('../services/api');
    return api.getAllVendedores?.() || { data: [] };
  }, {
    filter: (item) => item.active !== false,
    ...options
  });
};

/**
 * Hook para buscar tecidos com cache
 */
export const useCachedTecidos = (options = {}) => {
  return useCachedApi('tecidos', getAllTecidos, {
    filter: (item) => item.active === true,
    ...options
  });
};

/**
 * Hook para buscar materiais com cache
 */
export const useCachedMateriais = (tipo = null, options = {}) => {
  const cacheKey = tipo ? `materiais_${tipo}` : 'materiais';
  const apiFunc = tipo ? () => getMateriaisPorTipo(tipo) : getAllMateriais;
  
  return useCachedApi(cacheKey, apiFunc, {
    filter: (item) => item.active === true,
    ...options
  });
};

/**
 * Hook para buscar formas de pagamento com cache
 */
export const useCachedFormasPagamento = (options = {}) => {
  return useCachedApi('formasPagamento', getAllFormasPagamentos, {
    filter: (item) => item.active !== false,
    ...options
  });
};

/**
 * Hook para buscar formas de envio com cache
 */
export const useCachedFormasEnvio = (options = {}) => {
  return useCachedApi('formasEnvio', getAllFormasEnvios, {
    filter: (item) => item.active !== false,
    ...options
  });
};

/**
 * Hook para buscar descontos com cache
 */
export const useCachedDescontos = (options = {}) => {
  return useCachedApi('descontos', getAllDescontos, {
    filter: (item) => item.active !== false,
    ...options
  });
};

/**
 * Hook para buscar clientes com cache
 */
export const useCachedClientes = (options = {}) => {
  return useCachedApi('clientes', getAllClientes, {
    ...options
  });
};

/**
 * Hook para buscar pedidos pendentes com cache
 */
export const useCachedPedidosPendentes = (options = {}) => {
  return useCachedApi('pedidosPendentes', async () => {
    // Buscar pedidos pendentes do localStorage ou API
    const pendentes = JSON.parse(localStorage.getItem('pedidosPendentes') || '[]');
    return { data: pendentes };
  }, {
    ...options
  });
};

/**
 * Hook combinado para vendedores e designers
 * (compatível com useVendedoresDesigners existente)
 */
export const useCachedVendedoresDesigners = (options = {}) => {
  const vendedores = useCachedVendedores(options);
  const designers = useCachedDesigners(options);

  return {
    vendedores: vendedores.data || [],
    designers: designers.data || [],
    loading: vendedores.loading || designers.loading,
    error: vendedores.error || designers.error,
    refreshVendedores: vendedores.refresh,
    refreshDesigners: designers.refresh,
    invalidateVendedores: vendedores.invalidate,
    invalidateDesigners: designers.invalidate,
  };
};



