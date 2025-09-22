/**
 * Sistema de Cache Inteligente para Pedidos
 * 
 * Funcionalidades:
 * - Salva apenas na API
 * - Mantém cache local dos últimos 100 pedidos
 * - Economiza requisições desnecessárias
 * - Sincronização automática
 */

import { getAllPedidos } from '../services/api';
import { convertApiPedidosToList } from './apiConverter';

const CACHE_KEY = 'pedidos_cache';
const CACHE_LIMIT = 100;
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutos

class PedidosCache {
  constructor() {
    this.cache = this.loadCache();
    this.lastSync = this.cache.lastSync || 0;
    this.isLoading = false;
  }

  /**
   * Carrega o cache do localStorage
   */
  loadCache() {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        return {
          pedidos: parsed.pedidos || [],
          lastSync: parsed.lastSync || 0,
          totalCount: parsed.totalCount || 0
        };
      }
    } catch (error) {
      console.error('Erro ao carregar cache de pedidos:', error);
    }
    
    return {
      pedidos: [],
      lastSync: 0,
      totalCount: 0
    };
  }

  /**
   * Salva o cache no localStorage
   */
  saveCache() {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(this.cache));
    } catch (error) {
      console.error('Erro ao salvar cache de pedidos:', error);
    }
  }

  /**
   * Verifica se o cache está expirado
   */
  isCacheExpired() {
    return Date.now() - this.lastSync > CACHE_EXPIRY;
  }

  /**
   * Obtém pedidos do cache ou da API
   */
  async getPedidos(forceRefresh = false) {
    console.log('getPedidos chamado:', { forceRefresh, cacheExpired: this.isCacheExpired(), cacheLength: this.cache.pedidos.length });
    
    // Se não está expirado e não é refresh forçado, retorna cache
    if (!forceRefresh && !this.isCacheExpired() && this.cache.pedidos.length > 0) {
      console.log('Retornando pedidos do cache:', this.cache.pedidos.length);
      return this.cache.pedidos;
    }

    // Se já está carregando, aguarda
    if (this.isLoading) {
      console.log('Cache já está carregando, aguardando...');
      return new Promise((resolve) => {
        const checkLoading = () => {
          if (!this.isLoading) {
            resolve(this.cache.pedidos);
          } else {
            setTimeout(checkLoading, 100);
          }
        };
        checkLoading();
      });
    }

    // Carrega da API
    console.log('Cache expirado ou vazio, carregando da API...');
    return this.loadFromAPI();
  }

  /**
   * Carrega pedidos da API
   */
  async loadFromAPI() {
    console.log('loadFromAPI iniciado');
    this.isLoading = true;
    
    try {
      console.log('Carregando pedidos da API...');
      const response = await getAllPedidos();
      console.log('Resposta da API:', response);
      const pedidos = convertApiPedidosToList(response.data);
      console.log('Pedidos convertidos:', pedidos);
      
      // Atualiza cache
      this.cache = {
        pedidos: pedidos.slice(-CACHE_LIMIT), // Mantém apenas os últimos 100
        lastSync: Date.now(),
        totalCount: pedidos.length
      };
      
      this.lastSync = this.cache.lastSync;
      this.saveCache();
      
      console.log(`Cache atualizado: ${this.cache.pedidos.length} pedidos (total: ${this.cache.totalCount})`);
      
      return this.cache.pedidos;
      
    } catch (error) {
      console.error('Erro ao carregar pedidos da API:', error);
      
      // Em caso de erro, retorna cache existente se disponível
      if (this.cache.pedidos.length > 0) {
        console.log('Retornando cache existente devido ao erro da API');
        return this.cache.pedidos;
      }
      
      throw error;
      
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Adiciona um novo pedido ao cache
   */
  addPedido(pedido) {
    const pedidos = [...this.cache.pedidos, pedido];
    
    // Mantém apenas os últimos 100 pedidos
    if (pedidos.length > CACHE_LIMIT) {
      pedidos.splice(0, pedidos.length - CACHE_LIMIT);
    }
    
    this.cache = {
      ...this.cache,
      pedidos,
      totalCount: this.cache.totalCount + 1
    };
    
    this.saveCache();
    console.log('Pedido adicionado ao cache:', pedido.numeroPedido);
  }

  /**
   * Atualiza um pedido no cache
   */
  updatePedido(pedidoId, updates) {
    const pedidos = this.cache.pedidos.map(pedido => 
      pedido.id === pedidoId ? { ...pedido, ...updates } : pedido
    );
    
    this.cache = {
      ...this.cache,
      pedidos
    };
    
    this.saveCache();
    console.log('Pedido atualizado no cache:', pedidoId);
  }

  /**
   * Remove um pedido do cache
   */
  removePedido(pedidoId) {
    const pedidos = this.cache.pedidos.filter(pedido => pedido.id !== pedidoId);
    
    this.cache = {
      ...this.cache,
      pedidos,
      totalCount: Math.max(0, this.cache.totalCount - 1)
    };
    
    this.saveCache();
    console.log('Pedido removido do cache:', pedidoId);
  }

  /**
   * Limpa o cache
   */
  clearCache() {
    this.cache = {
      pedidos: [],
      lastSync: 0,
      totalCount: 0
    };
    
    this.lastSync = 0;
    this.saveCache();
    console.log('Cache de pedidos limpo');
  }

  /**
   * Obtém estatísticas do cache
   */
  getCacheStats() {
    return {
      pedidosEmCache: this.cache.pedidos.length,
      totalPedidos: this.cache.totalCount,
      ultimaSincronizacao: new Date(this.lastSync).toLocaleString(),
      cacheExpirado: this.isCacheExpired(),
      carregando: this.isLoading
    };
  }

  /**
   * Força sincronização com a API
   */
  async forceSync() {
    console.log('Forçando sincronização com a API...');
    return this.loadFromAPI();
  }
}

// Instância singleton
const pedidosCache = new PedidosCache();

export default pedidosCache;
