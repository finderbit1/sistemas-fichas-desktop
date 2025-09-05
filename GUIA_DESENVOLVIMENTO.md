# 🚀 Guia de Desenvolvimento e Manutenção

## 📋 Visão Geral

Este guia fornece instruções completas para desenvolvimento, manutenção e deploy do sistema, incluindo padrões de código, testes, debugging e otimizações.

## 🛠️ Ambiente de Desenvolvimento

### Pré-requisitos
```bash
# Node.js 18+ (recomendado: 20.x)
node --version

# Rust 1.70+ (para Tauri)
rustc --version

# pnpm (gerenciador de pacotes)
npm install -g pnpm

# Git
git --version
```

### Instalação Inicial
```bash
# 1. Clonar repositório
git clone <repository-url>
cd sistemas-fichas-desktop

# 2. Instalar dependências
pnpm install

# 3. Configurar variáveis de ambiente
cp .env.example .env.local

# 4. Iniciar desenvolvimento
pnpm tauri dev
```

### Estrutura de Comandos
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "tauri": "tauri",
    "tauri:dev": "tauri dev",
    "tauri:build": "tauri build",
    "lint": "eslint src --ext .js,.jsx,.ts,.tsx",
    "lint:fix": "eslint src --ext .js,.jsx,.ts,.tsx --fix",
    "format": "prettier --write src/**/*.{js,jsx,ts,tsx,css,md}",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

## 📁 Estrutura de Arquivos

### Organização de Componentes
```
src/components/
├── ui/                    # Componentes de interface
│   ├── Button.jsx
│   ├── Input.jsx
│   ├── Modal.jsx
│   └── Tooltip.jsx
├── forms/                 # Componentes de formulário
│   ├── FormPedido.jsx
│   ├── FormCliente.jsx
│   └── FormRelatorio.jsx
├── layout/                # Componentes de layout
│   ├── Sidebar.jsx
│   ├── Header.jsx
│   └── Footer.jsx
├── business/              # Componentes de negócio
│   ├── PedidoCard.jsx
│   ├── ClienteList.jsx
│   └── RelatorioChart.jsx
└── shared/                # Componentes compartilhados
    ├── LoadingSpinner.jsx
    ├── ErrorBoundary.jsx
    └── ToastNotification.jsx
```

### Organização de Hooks
```
src/hooks/
├── useAuth.jsx           # Autenticação
├── useTheme.jsx          # Temas
├── useAPI.jsx            # Requisições
├── useLocalStorage.jsx   # Armazenamento local
├── useDebounce.jsx       # Debounce
├── useMediaQuery.jsx     # Media queries
└── useKeyboard.jsx       # Teclado
```

### Organização de Utilitários
```
src/utils/
├── api.js                # Configuração da API
├── validators.js         # Validações
├── formatters.js         # Formatadores
├── constants.js          # Constantes
├── helpers.js            # Funções auxiliares
└── storage.js            # Armazenamento
```

## 🎨 Padrões de Código

### Convenções de Nomenclatura
```javascript
// Componentes: PascalCase
const UserProfile = () => {};

// Hooks: camelCase com prefixo 'use'
const useUserData = () => {};

// Funções: camelCase
const formatCurrency = (value) => {};

// Constantes: UPPER_SNAKE_CASE
const API_BASE_URL = 'http://localhost:3001/api';

// Variáveis: camelCase
const userData = {};

// Arquivos: kebab-case
// user-profile.jsx
// api-service.js
```

### Estrutura de Componentes
```javascript
// src/components/ExampleComponent.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button, Card } from 'react-bootstrap';
import { useAuth } from '../hooks/useAuth';
import { formatCurrency } from '../utils/formatters';
import './ExampleComponent.css';

const ExampleComponent = ({ 
  title, 
  data, 
  onAction, 
  className = '',
  ...props 
}) => {
  // 1. Hooks
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 2. Effects
  useEffect(() => {
    // Lógica de efeito
  }, [data]);

  // 3. Handlers
  const handleAction = async () => {
    try {
      setLoading(true);
      setError(null);
      await onAction();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 4. Render
  if (error) {
    return <div className="error">Erro: {error}</div>;
  }

  return (
    <Card className={`example-component ${className}`} {...props}>
      <Card.Header>
        <h3>{title}</h3>
      </Card.Header>
      <Card.Body>
        <p>Dados: {formatCurrency(data)}</p>
        <Button 
          onClick={handleAction}
          disabled={loading}
        >
          {loading ? 'Carregando...' : 'Ação'}
        </Button>
      </Card.Body>
    </Card>
  );
};

// 5. PropTypes
ExampleComponent.propTypes = {
  title: PropTypes.string.isRequired,
  data: PropTypes.number.isRequired,
  onAction: PropTypes.func.isRequired,
  className: PropTypes.string
};

// 6. Default Props
ExampleComponent.defaultProps = {
  className: ''
};

export default ExampleComponent;
```

### Estrutura de Hooks
```javascript
// src/hooks/useAPI.jsx
import { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';
import { ErrorHandler } from '../utils/errorHandler';

export const useAPI = (endpoint, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await api.get(endpoint, options);
      setData(result);
    } catch (err) {
      const errorMessage = ErrorHandler.handle(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [endpoint, JSON.stringify(options)]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
};
```

## 🧪 Testes

### Configuração do Vitest
```javascript
// vitest.config.js
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.config.js'
      ]
    }
  }
});
```

### Setup de Testes
```javascript
// src/test/setup.js
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Estender expect com matchers do jest-dom
expect.extend(matchers);

// Limpar após cada teste
afterEach(() => {
  cleanup();
});
```

### Exemplo de Teste de Componente
```javascript
// src/components/__tests__/Button.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import Button from '../Button';

describe('Button', () => {
  it('renderiza com texto correto', () => {
    render(<Button>Clique aqui</Button>);
    expect(screen.getByText('Clique aqui')).toBeInTheDocument();
  });

  it('chama onClick quando clicado', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Clique aqui</Button>);
    
    fireEvent.click(screen.getByText('Clique aqui'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('desabilita quando disabled', () => {
    render(<Button disabled>Clique aqui</Button>);
    expect(screen.getByText('Clique aqui')).toBeDisabled();
  });
});
```

### Exemplo de Teste de Hook
```javascript
// src/hooks/__tests__/useAPI.test.jsx
import { renderHook, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { useAPI } from '../useAPI';
import { api } from '../../utils/api';

// Mock da API
vi.mock('../../utils/api', () => ({
  api: {
    get: vi.fn()
  }
}));

describe('useAPI', () => {
  it('carrega dados com sucesso', async () => {
    const mockData = { id: 1, name: 'Test' };
    api.get.mockResolvedValue(mockData);

    const { result } = renderHook(() => useAPI('/test'));

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBe(null);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toEqual(mockData);
      expect(result.current.error).toBe(null);
    });
  });

  it('manipula erros corretamente', async () => {
    const mockError = new Error('API Error');
    api.get.mockRejectedValue(mockError);

    const { result } = renderHook(() => useAPI('/test'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe('API Error');
      expect(result.current.data).toBe(null);
    });
  });
});
```

## 🔍 Debugging

### Ferramentas de Debug
```javascript
// src/utils/debug.js
export const debug = {
  log: (message, data) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] ${message}`, data);
    }
  },

  error: (message, error) => {
    if (process.env.NODE_ENV === 'development') {
      console.error(`[ERROR] ${message}`, error);
    }
  },

  warn: (message, data) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[WARN] ${message}`, data);
    }
  },

  group: (label, fn) => {
    if (process.env.NODE_ENV === 'development') {
      console.group(label);
      fn();
      console.groupEnd();
    }
  }
};
```

### Error Boundary
```javascript
// src/components/ErrorBoundary.jsx
import React from 'react';
import { Alert, Button } from 'react-bootstrap';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Enviar erro para serviço de monitoramento
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert variant="danger" className="m-4">
          <Alert.Heading>Algo deu errado!</Alert.Heading>
          <p>
            Ocorreu um erro inesperado. Por favor, recarregue a página ou 
            entre em contato com o suporte.
          </p>
          <hr />
          <div className="d-flex justify-content-end">
            <Button 
              variant="outline-danger" 
              onClick={() => window.location.reload()}
            >
              Recarregar Página
            </Button>
          </div>
        </Alert>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

### Debug de Performance
```javascript
// src/utils/performance.js
export const performance = {
  measure: (name, fn) => {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    
    console.log(`${name} took ${end - start} milliseconds`);
    return result;
  },

  measureAsync: async (name, fn) => {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    
    console.log(`${name} took ${end - start} milliseconds`);
    return result;
  }
};
```

## 🚀 Otimizações

### Lazy Loading
```javascript
// src/pages/LazyPages.jsx
import { lazy, Suspense } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';

// Lazy load das páginas
const Home = lazy(() => import('./PageHome'));
const Admin = lazy(() => import('./Admin'));
const Clientes = lazy(() => import('./PageCreateClient'));
const Relatorios = lazy(() => import('./PageRelatorioPedidos'));

const LazyPages = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      {/* Rotas aqui */}
    </Suspense>
  );
};
```

### Memoização
```javascript
// src/components/OptimizedComponent.jsx
import React, { memo, useMemo, useCallback } from 'react';

const OptimizedComponent = memo(({ data, onAction }) => {
  // Memoizar cálculos pesados
  const expensiveValue = useMemo(() => {
    return data.reduce((sum, item) => sum + item.value, 0);
  }, [data]);

  // Memoizar callbacks
  const handleAction = useCallback((id) => {
    onAction(id);
  }, [onAction]);

  return (
    <div>
      <p>Valor: {expensiveValue}</p>
      <button onClick={() => handleAction(1)}>Ação</button>
    </div>
  );
});

export default OptimizedComponent;
```

### Bundle Splitting
```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['react-bootstrap', 'react-bootstrap-icons'],
          utils: ['lodash', 'date-fns']
        }
      }
    }
  }
});
```

## 📦 Deploy

### Build de Produção
```bash
# Build do frontend
pnpm build

# Build do Tauri
pnpm tauri build

# Build para diferentes plataformas
pnpm tauri build --target x86_64-pc-windows-msvc
pnpm tauri build --target x86_64-apple-darwin
pnpm tauri build --target x86_64-unknown-linux-gnu
```

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
    enableLogs: false,
    enableAnalytics: true,
    enableErrorReporting: true
  },
  performance: {
    enableLazyLoading: true,
    enableMemoization: true,
    enableBundleSplitting: true
  }
};
```

### CI/CD Pipeline
```yaml
# .github/workflows/build.yml
name: Build and Test

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - uses: actions/setup-rust@v1
        with:
          rust-version: '1.70'
      - run: npm install -g pnpm
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm test
      - run: pnpm build

  build:
    needs: test
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [windows-latest, macos-latest, ubuntu-latest]
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - uses: actions/setup-rust@v1
        with:
          rust-version: '1.70'
      - run: npm install -g pnpm
      - run: pnpm install
      - run: pnpm tauri build
      - uses: actions/upload-artifact@v3
        with:
          name: app-${{ matrix.os }}
          path: src-tauri/target/release/bundle/
```

## 🔧 Manutenção

### Atualizações de Dependências
```bash
# Verificar dependências desatualizadas
pnpm outdated

# Atualizar dependências
pnpm update

# Atualizar dependências major
pnpm update --latest
```

### Limpeza de Código
```bash
# Remover dependências não utilizadas
pnpm prune

# Limpar cache
pnpm store prune

# Limpar build
rm -rf dist/
rm -rf src-tauri/target/
```

### Monitoramento
```javascript
// src/utils/monitoring.js
export const monitoring = {
  trackError: (error, context) => {
    // Enviar para serviço de monitoramento
    console.error('Error tracked:', error, context);
  },

  trackPerformance: (metric, value) => {
    // Enviar métricas de performance
    console.log('Performance tracked:', metric, value);
  },

  trackUserAction: (action, data) => {
    // Rastrear ações do usuário
    console.log('User action tracked:', action, data);
  }
};
```

## 📚 Recursos Adicionais

### Documentação de API
- [React Documentation](https://react.dev/)
- [Tauri Documentation](https://tauri.app/)
- [React Bootstrap](https://react-bootstrap.github.io/)
- [Vite Documentation](https://vitejs.dev/)

### Ferramentas de Desenvolvimento
- [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/)
- [Redux DevTools](https://chrome.google.com/webstore/detail/redux-devtools/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

### Boas Práticas
- [React Best Practices](https://react.dev/learn)
- [JavaScript Style Guide](https://github.com/airbnb/javascript)
- [CSS Best Practices](https://developer.mozilla.org/en-US/docs/Web/CSS)

---

**Versão:** 1.0.0  
**Última atualização:** Janeiro 2024  
**Status:** Sistema completo e documentado

