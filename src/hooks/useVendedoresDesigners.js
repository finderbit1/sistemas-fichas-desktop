import { useState, useEffect } from 'react';
import { getAllVendedores, getAllDesigners } from '../services/api';
import cacheManager from '../utils/cacheManager';

/**
 * Hook para buscar vendedores e designers com CACHE automático
 * Reduz requisições desnecessárias à API
 */
export const useVendedoresDesigners = () => {
  const [vendedores, setVendedores] = useState([]);
  const [designers, setDesigners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Tentar buscar do cache primeiro
      const cachedVendedores = cacheManager.get('vendedores');
      const cachedDesigners = cacheManager.get('designers');

      if (cachedVendedores && cachedDesigners) {
        // Cache HIT - usar dados cacheados
        setVendedores(cachedVendedores);
        setDesigners(cachedDesigners);
        setLoading(false);
        
        if (import.meta.env.DEV) {
          console.log('⚡ Vendedores e Designers carregados do CACHE');
        }
        return;
      }

      // Cache MISS - buscar da API
      if (import.meta.env.DEV) {
        console.log('🌐 Buscando Vendedores e Designers da API...');
      }

      const [vendedoresResponse, designersResponse] = await Promise.all([
        getAllVendedores().catch(err => {
          console.warn('⚠️ Erro ao carregar vendedores:', err);
          return { data: [] };
        }),
        getAllDesigners().catch(err => {
          console.warn('⚠️ Erro ao carregar designers:', err);
          return { data: [] };
        })
      ]);

      const vendedoresData = vendedoresResponse.data || [];
      const designersData = designersResponse.data || [];

      // Salvar no cache
      cacheManager.set('vendedores', vendedoresData);
      cacheManager.set('designers', designersData);

      setVendedores(vendedoresData);
      setDesigners(designersData);

    } catch (err) {
      console.error('❌ Erro ao carregar dados:', err);
      setError('Erro ao carregar vendedores e designers');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Força reload da API (ignora cache)
   */
  const refreshData = () => {
    cacheManager.invalidate('vendedores');
    cacheManager.invalidate('designers');
    loadData();
  };

  return {
    vendedores,
    designers,
    loading,
    error,
    refreshData
  };
};









