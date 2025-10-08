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
import { 
  salvarPedidoPendente, 
  atualizarPedidoPendente, 
  removerPedidoPendente,
  isPedidoConcluido,
  sincronizarPedidosPendentes,
  mesclarPedidosComProtecao,
  forcarBackupPedidosPendentes,
  verificarPedidosPerdidos
} from './localStorageHelper';

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
      const pedidosDaAPI = convertApiPedidosToList(response.data);
      console.log('Pedidos convertidos:', pedidosDaAPI);
      
      // 🔒 PROTEÇÃO: Mesclar com pedidos pendentes do localStorage
      const pedidosProtegidos = mesclarPedidosComProtecao(pedidosDaAPI);
      
      // Atualiza cache com pedidos protegidos
      this.cache = {
        pedidos: pedidosProtegidos.slice(-CACHE_LIMIT), // Mantém apenas os últimos 100
        lastSync: Date.now(),
        totalCount: pedidosProtegidos.length
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
    
    // Salva no localStorage se não estiver concluído
    salvarPedidoPendente(pedido);
    
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
    
    // Atualiza no localStorage - remove se concluído
    const pedidoAtualizado = pedidos.find(p => p.id === pedidoId);
    if (pedidoAtualizado) {
      atualizarPedidoPendente(pedidoId, pedidoAtualizado);
    }
    
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
    
    // Remove do localStorage também
    removerPedidoPendente(pedidoId);
    
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

  /**
   * Sincroniza pedidos pendentes do localStorage
   * Remove pedidos que já foram concluídos
   */
  syncPendingPedidos() {
    console.log('Sincronizando pedidos pendentes...');
    return sincronizarPedidosPendentes();
  }

  /**
   * Obtém estatísticas dos pedidos pendentes
   */
  getPendingPedidosStats() {
    try {
      const pedidosPendentes = JSON.parse(localStorage.getItem('pedidos_pendentes') || '[]');
      const pedidosConcluidos = pedidosPendentes.filter(p => isPedidoConcluido(p));
      const pedidosNaoConcluidos = pedidosPendentes.filter(p => !isPedidoConcluido(p));
      
      return {
        total: pedidosPendentes.length,
        concluidos: pedidosConcluidos.length,
        naoConcluidos: pedidosNaoConcluidos.length,
        precisaSincronizacao: pedidosConcluidos.length > 0
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas dos pedidos pendentes:', error);
      return {
        total: 0,
        concluidos: 0,
        naoConcluidos: 0,
        precisaSincronizacao: false
      };
    }
  }

  /**
   * 🔒 Força backup de todos os pedidos não concluídos
   * Usado antes de operações que podem causar perda de dados
   */
  forcarBackupProtecao() {
    console.log('🔒 Forçando backup de proteção...');
    const pedidosAtuais = this.cache.pedidos || [];
    return forcarBackupPedidosPendentes(pedidosAtuais);
  }

  /**
   * 🔍 Verifica se há pedidos perdidos que precisam ser recuperados
   */
  verificarPedidosPerdidos() {
    console.log('🔍 Verificando pedidos perdidos...');
    const pedidosAtuais = this.cache.pedidos || [];
    return verificarPedidosPerdidos(pedidosAtuais);
  }

  /**
   * 🛡️ Recupera pedidos perdidos e os adiciona ao cache
   */
  recuperarPedidosPerdidos() {
    try {
      const pedidosPerdidos = this.verificarPedidosPerdidos();
      
      if (pedidosPerdidos.length > 0) {
        console.log(`🔄 Recuperando ${pedidosPerdidos.length} pedidos perdidos...`);
        
        // Adicionar pedidos perdidos ao cache
        const cacheAtual = this.cache.pedidos || [];
        const cacheAtualizado = [...cacheAtual];
        
        pedidosPerdidos.forEach(pedidoPerdido => {
          const jaExiste = cacheAtualizado.some(p => p.id === pedidoPerdido.id);
          if (!jaExiste) {
            cacheAtualizado.push(pedidoPerdido);
            console.log(`✅ Pedido ${pedidoPerdido.numeroPedido || pedidoPerdido.id} recuperado`);
          }
        });
        
        // Atualizar cache
        this.cache = {
          ...this.cache,
          pedidos: cacheAtualizado.slice(-CACHE_LIMIT),
          totalCount: cacheAtualizado.length
        };
        
        this.saveCache();
        
        console.log(`🎉 Recuperação concluída: ${pedidosPerdidos.length} pedidos adicionados ao cache`);
        
        return pedidosPerdidos;
      }
      
      return [];
    } catch (error) {
      console.error('❌ Erro ao recuperar pedidos perdidos:', error);
      return [];
    }
  }

  /**
   * 🔒 Carrega pedidos com proteção total contra perda de dados
   */
  async getPedidosComProtecao(forceRefresh = false) {
    console.log('🔒 Carregando pedidos com proteção total...');
    
    // Primeiro, fazer backup dos pedidos atuais
    this.forcarBackupProtecao();
    
    // Carregar pedidos normalmente
    const pedidos = await this.getPedidos(forceRefresh);
    
    // Verificar e recuperar pedidos perdidos
    this.recuperarPedidosPerdidos();
    
    return pedidos;
  }
}

// Instância singleton
const pedidosCache = new PedidosCache();

export default pedidosCache;
