import { useState, useEffect } from 'react';
import { getAllVendedores, getAllDesigners } from '../services/api';

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

      // Carregar vendedores e designers em paralelo
      const [vendedoresResponse, designersResponse] = await Promise.all([
        getAllVendedores().catch(err => {
          console.warn('Erro ao carregar vendedores:', err);
          return { data: [] };
        }),
        getAllDesigners().catch(err => {
          console.warn('Erro ao carregar designers:', err);
          return { data: [] };
        })
      ]);

      setVendedores(vendedoresResponse.data || []);
      setDesigners(designersResponse.data || []);

    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar vendedores e designers');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
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

