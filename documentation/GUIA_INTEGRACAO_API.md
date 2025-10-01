# 🔌 Guia de Integração com API

## 📋 Visão Geral

Este guia detalha como integrar o sistema frontend com uma API backend, incluindo configuração, endpoints, autenticação e tratamento de erros.

## ⚙️ Configuração Inicial

### 1. Configuração do Servidor
```javascript
// src/contexts/ServerConfigContext.jsx
const defaultConfig = {
  url: 'http://localhost:3001/api',
  timeout: 5000,
  retries: 3
};
```

### 2. Variáveis de Ambiente
```bash
# .env.local
VITE_API_BASE_URL=http://localhost:3001/api
VITE_API_TIMEOUT=5000
VITE_API_RETRIES=3
```

## 🔐 Sistema de Autenticação

### Estrutura de Login
```javascript
// Endpoint: POST /api/auth/login
const loginData = {
  username: 'admin',
  password: 'admin123'
};

// Resposta esperada
const loginResponse = {
  success: true,
  user: {
    id: 1,
    username: 'admin',
    role: 'admin',
    email: 'admin@exemplo.com'
  },
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  refreshToken: 'refresh_token_aqui',
  expiresIn: 3600
};
```

### Implementação no Frontend
```javascript
// src/services/api.js
export const authAPI = {
  async login(credentials) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
      });
      
      if (!response.ok) {
        throw new Error('Credenciais inválidas');
      }
      
      const data = await response.json();
      
      // Salvar no localStorage
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      
      return data;
    } catch (error) {
      throw new Error(`Erro no login: ${error.message}`);
    }
  },

  async logout() {
    try {
      const token = localStorage.getItem('token');
      
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Limpar localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      
      return { success: true };
    } catch (error) {
      // Mesmo com erro, limpar dados locais
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      throw error;
    }
  },

  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken })
      });
      
      if (!response.ok) {
        throw new Error('Token inválido');
      }
      
      const data = await response.json();
      localStorage.setItem('token', data.token);
      
      return data;
    } catch (error) {
      // Redirecionar para login se refresh falhar
      localStorage.clear();
      window.location.href = '/login';
      throw error;
    }
  }
};
```

## 📊 Gestão de Pedidos

### Estrutura de Dados
```javascript
// Modelo de Pedido
const pedidoModel = {
  id: 1,
  numero: 'PED-2024-001',
  cliente: {
    id: 1,
    nome: 'João Silva',
    email: 'joao@exemplo.com',
    telefone: '(11) 99999-9999'
  },
  produtos: [
    {
      id: 1,
      nome: 'Banner 1x1m',
      quantidade: 2,
      preco: 50.00,
      total: 100.00
    }
  ],
  status: 'pendente', // pendente, em_producao, concluido, cancelado
  total: 100.00,
  dataCriacao: '2024-01-15T10:30:00Z',
  dataAtualizacao: '2024-01-15T10:30:00Z',
  observacoes: 'Urgente para entrega'
};
```

### Endpoints de Pedidos
```javascript
// src/services/pedidosAPI.js
export const pedidosAPI = {
  // Listar pedidos
  async getPedidos(filtros = {}) {
    const params = new URLSearchParams(filtros);
    const response = await fetch(`${API_BASE_URL}/pedidos?${params}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Erro ao buscar pedidos');
    }
    
    return await response.json();
  },

  // Criar pedido
  async createPedido(pedido) {
    const response = await fetch(`${API_BASE_URL}/pedidos`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(pedido)
    });
    
    if (!response.ok) {
      throw new Error('Erro ao criar pedido');
    }
    
    return await response.json();
  },

  // Atualizar pedido
  async updatePedido(id, pedido) {
    const response = await fetch(`${API_BASE_URL}/pedidos/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(pedido)
    });
    
    if (!response.ok) {
      throw new Error('Erro ao atualizar pedido');
    }
    
    return await response.json();
  },

  // Deletar pedido
  async deletePedido(id) {
    const response = await fetch(`${API_BASE_URL}/pedidos/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Erro ao deletar pedido');
    }
    
    return await response.json();
  },

  // Buscar pedido por ID
  async getPedidoById(id) {
    const response = await fetch(`${API_BASE_URL}/pedidos/${id}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Pedido não encontrado');
    }
    
    return await response.json();
  }
};
```

## 👥 Gestão de Clientes

### Estrutura de Dados
```javascript
// Modelo de Cliente
const clienteModel = {
  id: 1,
  nome: 'João Silva',
  email: 'joao@exemplo.com',
  telefone: '(11) 99999-9999',
  endereco: {
    rua: 'Rua das Flores, 123',
    bairro: 'Centro',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '01234-567'
  },
  dataCriacao: '2024-01-15T10:30:00Z',
  dataAtualizacao: '2024-01-15T10:30:00Z',
  status: 'ativo' // ativo, inativo
};
```

### Endpoints de Clientes
```javascript
// src/services/clientesAPI.js
export const clientesAPI = {
  // Listar clientes
  async getClientes(filtros = {}) {
    const params = new URLSearchParams(filtros);
    const response = await fetch(`${API_BASE_URL}/clientes?${params}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Erro ao buscar clientes');
    }
    
    return await response.json();
  },

  // Criar cliente
  async createCliente(cliente) {
    const response = await fetch(`${API_BASE_URL}/clientes`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(cliente)
    });
    
    if (!response.ok) {
      throw new Error('Erro ao criar cliente');
    }
    
    return await response.json();
  },

  // Atualizar cliente
  async updateCliente(id, cliente) {
    const response = await fetch(`${API_BASE_URL}/clientes/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(cliente)
    });
    
    if (!response.ok) {
      throw new Error('Erro ao atualizar cliente');
    }
    
    return await response.json();
  },

  // Deletar cliente
  async deleteCliente(id) {
    const response = await fetch(`${API_BASE_URL}/clientes/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Erro ao deletar cliente');
    }
    
    return await response.json();
  },

  // Buscar cliente por ID
  async getClienteById(id) {
    const response = await fetch(`${API_BASE_URL}/clientes/${id}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Cliente não encontrado');
    }
    
    return await response.json();
  },

  // Buscar CEP (ViaCEP)
  async buscarCEP(cep) {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    
    if (!response.ok) {
      throw new Error('CEP não encontrado');
    }
    
    const data = await response.json();
    
    if (data.erro) {
      throw new Error('CEP inválido');
    }
    
    return {
      rua: data.logradouro,
      bairro: data.bairro,
      cidade: data.localidade,
      estado: data.uf,
      cep: data.cep
    };
  }
};
```

## 📈 Relatórios e Estatísticas

### Estrutura de Relatórios
```javascript
// Modelo de Relatório
const relatorioModel = {
  periodo: {
    inicio: '2024-01-01',
    fim: '2024-01-31'
  },
  resumo: {
    totalPedidos: 150,
    totalVendas: 25000.00,
    ticketMedio: 166.67,
    clientesAtivos: 45
  },
  pedidos: [
    {
      id: 1,
      numero: 'PED-2024-001',
      cliente: 'João Silva',
      total: 100.00,
      status: 'concluido',
      data: '2024-01-15'
    }
  ],
  graficos: {
    vendasPorDia: [...],
    vendasPorCliente: [...],
    statusPedidos: [...]
  }
};
```

### Endpoints de Relatórios
```javascript
// src/services/relatoriosAPI.js
export const relatoriosAPI = {
  // Gerar relatório
  async getRelatorio(filtros) {
    const params = new URLSearchParams(filtros);
    const response = await fetch(`${API_BASE_URL}/relatorios?${params}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Erro ao gerar relatório');
    }
    
    return await response.json();
  },

  // Exportar relatório
  async exportRelatorio(formato, filtros) {
    const params = new URLSearchParams({ ...filtros, formato });
    const response = await fetch(`${API_BASE_URL}/relatorios/export?${params}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Erro ao exportar relatório');
    }
    
    // Para downloads de arquivo
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_${new Date().toISOString().split('T')[0]}.${formato}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  // Dashboard - estatísticas gerais
  async getDashboardStats() {
    const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Erro ao buscar estatísticas');
    }
    
    return await response.json();
  }
};
```

## 🛠️ Utilitários e Helpers

### Interceptor de Requisições
```javascript
// src/utils/apiInterceptor.js
class APIInterceptor {
  constructor() {
    this.baseURL = process.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
    this.timeout = 5000;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = localStorage.getItem('token');
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      timeout: this.timeout
    };

    const config = { ...defaultOptions, ...options };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 401) {
          // Token expirado, tentar refresh
          await this.refreshToken();
          // Retry da requisição original
          return this.request(endpoint, options);
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Timeout da requisição');
      }
      throw error;
    }
  }

  async refreshToken() {
    // Implementar refresh token
    const refreshToken = localStorage.getItem('refreshToken');
    // ... lógica de refresh
  }
}

export const api = new APIInterceptor();
```

### Tratamento de Erros
```javascript
// src/utils/errorHandler.js
export class ErrorHandler {
  static handle(error) {
    console.error('API Error:', error);

    if (error.message.includes('401')) {
      // Não autorizado
      localStorage.clear();
      window.location.href = '/login';
      return 'Sessão expirada. Faça login novamente.';
    }

    if (error.message.includes('403')) {
      return 'Você não tem permissão para esta ação.';
    }

    if (error.message.includes('404')) {
      return 'Recurso não encontrado.';
    }

    if (error.message.includes('500')) {
      return 'Erro interno do servidor. Tente novamente.';
    }

    if (error.message.includes('Timeout')) {
      return 'Tempo limite excedido. Verifique sua conexão.';
    }

    return error.message || 'Erro desconhecido.';
  }

  static showToast(message, type = 'error') {
    // Implementar sistema de toast
    console.log(`${type.toUpperCase()}: ${message}`);
  }
}
```

## 🔄 Estado e Cache

### Gerenciamento de Estado
```javascript
// src/hooks/useAPI.js
import { useState, useEffect, useCallback } from 'react';

export const useAPI = (apiFunction, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFunction();
      setData(result);
    } catch (err) {
      setError(ErrorHandler.handle(err));
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};
```

### Cache Local
```javascript
// src/utils/cache.js
class CacheManager {
  constructor() {
    this.cache = new Map();
    this.ttl = 5 * 60 * 1000; // 5 minutos
  }

  set(key, value, ttl = this.ttl) {
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key) {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  clear() {
    this.cache.clear();
  }

  delete(key) {
    this.cache.delete(key);
  }
}

export const cache = new CacheManager();
```

## 📱 Configuração do Backend

### Estrutura de Resposta Padrão
```javascript
// Resposta de sucesso
{
  "success": true,
  "data": { /* dados */ },
  "message": "Operação realizada com sucesso",
  "timestamp": "2024-01-15T10:30:00Z"
}

// Resposta de erro
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dados inválidos",
    "details": [
      {
        "field": "email",
        "message": "Email é obrigatório"
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Headers Necessários
```javascript
// CORS Headers
Access-Control-Allow-Origin: http://localhost:1420, tauri://localhost
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true

// Content-Type
Content-Type: application/json; charset=utf-8

// Rate Limiting
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642248000
```

## 🧪 Testes de Integração

### Teste de Conectividade
```javascript
// src/utils/connectionTest.js
export const testConnection = async (url) => {
  try {
    const startTime = Date.now();
    const response = await fetch(`${url}/health`, {
      method: 'GET',
      timeout: 5000
    });
    const endTime = Date.now();
    
    return {
      success: response.ok,
      status: response.status,
      responseTime: endTime - startTime,
      message: response.ok ? 'Conexão estabelecida' : 'Falha na conexão'
    };
  } catch (error) {
    return {
      success: false,
      status: 0,
      responseTime: 0,
      message: `Erro: ${error.message}`
    };
  }
};
```

### Validação de Dados
```javascript
// src/utils/validators.js
export const validators = {
  email: (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  },

  phone: (phone) => {
    const regex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
    return regex.test(phone);
  },

  cep: (cep) => {
    const regex = /^\d{5}-?\d{3}$/;
    return regex.test(cep);
  },

  required: (value) => {
    return value && value.toString().trim().length > 0;
  }
};
```

## 🚀 Deploy e Produção

### Configuração de Produção
```javascript
// src/config/production.js
export const productionConfig = {
  api: {
    baseURL: process.env.VITE_API_BASE_URL || 'https://api.exemplo.com',
    timeout: 10000,
    retries: 3
  },
  features: {
    enableLogs: true,
    enableAnalytics: true,
    enableErrorReporting: true
  }
};
```

### Monitoramento
```javascript
// src/utils/monitoring.js
export const monitoring = {
  trackEvent: (event, data) => {
    // Implementar tracking de eventos
    console.log('Event:', event, data);
  },

  trackError: (error, context) => {
    // Implementar tracking de erros
    console.error('Error:', error, context);
  },

  trackPerformance: (metric, value) => {
    // Implementar tracking de performance
    console.log('Performance:', metric, value);
  }
};
```

---

**Versão:** 1.0.0  
**Última atualização:** Janeiro 2024  
**Status:** Pronto para integração














