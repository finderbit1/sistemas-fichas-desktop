# 📚 Documentação Completa do Sistema de Fichas Desktop

## 🎯 Visão Geral

Sistema desktop desenvolvido com **Tauri + React + Vite** para gerenciamento de pedidos, clientes e relatórios. Interface moderna com modo escuro/claro, autenticação por roles e sistema de configuração de servidor.

## 🏗️ Arquitetura do Sistema

### Stack Tecnológico
- **Frontend:** React 18 + Vite
- **Desktop:** Tauri (Rust)
- **UI:** React Bootstrap + CSS Customizado
- **Ícones:** React Bootstrap Icons
- **Roteamento:** React Router v6
- **Estado:** Context API (Auth, Theme, ServerConfig)
- **Armazenamento:** LocalStorage

### Estrutura de Pastas
```
src/
├── components/          # Componentes reutilizáveis
│   ├── prouctions/     # Formulários de produção
│   ├── ThemeToggle.jsx # Toggle de tema
│   ├── ServerConfig.jsx # Configuração do servidor
│   └── ...
├── contexts/           # Contextos React
│   ├── AuthContext.jsx
│   ├── ThemeContext.jsx
│   └── ServerConfigContext.jsx
├── pages/             # Páginas da aplicação
├── services/          # Serviços e APIs
├── styles/           # Arquivos CSS
└── utils/            # Utilitários
```

## 🔐 Sistema de Autenticação

### AuthContext
```jsx
// src/contexts/AuthContext.jsx
const AuthContext = createContext();

// Estados disponíveis
const { 
  user,           // Usuário logado
  isAuthenticated, // Status de autenticação
  login,          // Função de login
  logout,         // Função de logout
  loading         // Estado de carregamento
} = useAuth();
```

### Roles de Usuário
- **admin:** Acesso completo (incluindo página admin)
- **user:** Acesso limitado (sem página admin)

### Mock de Usuários
```javascript
const mockUsers = [
  { id: 1, username: 'admin', password: 'admin123', role: 'admin' },
  { id: 2, username: 'user', password: 'user123', role: 'user' }
];
```

## 🎨 Sistema de Temas

### ThemeContext
```jsx
// src/contexts/ThemeContext.jsx
const { 
  theme,        // 'light' | 'dark'
  toggleTheme,  // Função para alternar tema
  isDark        // Boolean para verificar se é escuro
} = useTheme();
```

### Variáveis CSS
```css
/* Modo Claro */
:root {
  --color-primary: #667eea;
  --color-neutral-50: #f9fafb;
  --color-neutral-100: #f3f4f6;
  --text-primary: #111827;
  --bg-primary: #ffffff;
}

/* Modo Escuro */
[data-theme="dark"] {
  --color-primary: #818cf8;
  --color-neutral-50: #1f2937;
  --color-neutral-100: #374151;
  --text-primary: #f9fafb;
  --bg-primary: #111827;
}
```

## ⚙️ Configuração do Servidor

### ServerConfigContext
```jsx
// src/contexts/ServerConfigContext.jsx
const { 
  serverConfig,      // Configuração atual
  updateServerConfig, // Atualizar configuração
  resetServerConfig   // Resetar para padrão
} = useServerConfig();

// Estrutura da configuração
const serverConfig = {
  url: 'http://localhost:3001/api',
  timeout: 5000,
  retries: 3
};
```

## 📱 Componentes Principais

### 1. Sidebar
**Arquivo:** `src/components/Sidebar.jsx`
- Navegação principal
- Tooltips quando colapsada
- Controle de roles (admin/user)

### 2. ThemeToggle
**Arquivo:** `src/components/ThemeToggle.jsx`
- Alternância entre temas
- Ícones dinâmicos
- Persistência no localStorage

### 3. ServerConfig
**Arquivo:** `src/components/ServerConfig.jsx`
- Configuração de URL do servidor
- Teste de conectividade
- Timeout e retry settings

### 4. ProtectedRoute
**Arquivo:** `src/components/ProtectedRoute.jsx`
- Proteção de rotas por autenticação
- Redirecionamento para login
- Controle de roles

## 📄 Páginas da Aplicação

### 1. Login (`/login`)
- Formulário de autenticação
- Validação de credenciais
- Redirecionamento pós-login

### 2. Home (`/`)
- Dashboard principal
- Cards de estatísticas
- Tabela de pedidos recentes

### 3. Admin (`/admin`)
- **Aba Sistema:** Configuração do servidor, aparência
- **Aba Monitoramento:** Estatísticas, logs, backup
- **Aba Gestão:** Usuários, pagamentos, envios, descontos

### 4. Clientes (`/clientes`)
- Listagem de clientes
- Formulário de cadastro
- Edição e exclusão

### 5. Relatórios (`/relatorios`)
- Relatório de fechamentos
- Filtros por período
- Exportação de dados

## 🔌 Integração com API

### Estrutura de Serviços
```javascript
// src/services/api.js
const API_BASE_URL = 'http://localhost:3001/api';

// Configuração de timeout e retry
const apiConfig = {
  timeout: 5000,
  retries: 3
};

// Funções principais
export const api = {
  // Autenticação
  login: (credentials) => { /* ... */ },
  logout: () => { /* ... */ },
  
  // Pedidos
  getPedidos: () => { /* ... */ },
  createPedido: (pedido) => { /* ... */ },
  updatePedido: (id, pedido) => { /* ... */ },
  deletePedido: (id) => { /* ... */ },
  
  // Clientes
  getClientes: () => { /* ... */ },
  createCliente: (cliente) => { /* ... */ },
  updateCliente: (id, cliente) => { /* ... */ },
  deleteCliente: (id) => { /* ... */ },
  
  // Relatórios
  getRelatorios: (filtros) => { /* ... */ },
  exportRelatorio: (formato) => { /* ... */ }
};
```

### Endpoints Esperados

#### Autenticação
```
POST /api/auth/login
Body: { username: string, password: string }
Response: { user: object, token: string }

POST /api/auth/logout
Headers: { Authorization: "Bearer <token>" }
Response: { success: boolean }
```

#### Pedidos
```
GET /api/pedidos
Response: { pedidos: array }

POST /api/pedidos
Body: { cliente: object, produtos: array, total: number }
Response: { pedido: object }

PUT /api/pedidos/:id
Body: { cliente: object, produtos: array, total: number }
Response: { pedido: object }

DELETE /api/pedidos/:id
Response: { success: boolean }
```

#### Clientes
```
GET /api/clientes
Response: { clientes: array }

POST /api/clientes
Body: { nome: string, email: string, telefone: string }
Response: { cliente: object }

PUT /api/clientes/:id
Body: { nome: string, email: string, telefone: string }
Response: { cliente: object }

DELETE /api/clientes/:id
Response: { success: boolean }
```

#### Relatórios
```
GET /api/relatorios?inicio=date&fim=date
Response: { relatorios: array }

GET /api/relatorios/export?formato=csv&inicio=date&fim=date
Response: { file: blob }
```

## 🎨 Sistema de Design

### Cores Principais
```css
/* Primárias */
--color-primary: #667eea
--color-primary-dark: #5a67d8
--color-primary-light: #a5b4fc

/* Neutras */
--color-neutral-50: #f9fafb
--color-neutral-100: #f3f4f6
--color-neutral-200: #e5e7eb
--color-neutral-300: #d1d5db
--color-neutral-400: #9ca3af
--color-neutral-500: #6b7280
--color-neutral-600: #4b5563
--color-neutral-700: #374151
--color-neutral-800: #1f2937
--color-neutral-900: #111827

/* Estados */
--color-success: #48bb78
--color-warning: #ed8936
--color-error: #f56565
--color-info: #4299e1
```

### Tipografia
```css
/* Famílias */
--font-family-primary: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif
--font-family-mono: 'JetBrains Mono', 'Fira Code', monospace

/* Tamanhos */
--font-size-xs: 0.75rem    /* 12px */
--font-size-sm: 0.875rem   /* 14px */
--font-size-base: 1rem     /* 16px */
--font-size-lg: 1.125rem   /* 18px */
--font-size-xl: 1.25rem    /* 20px */
--font-size-2xl: 1.5rem    /* 24px */

/* Pesos */
--font-weight-normal: 400
--font-weight-medium: 500
--font-weight-semibold: 600
--font-weight-bold: 700
```

### Espaçamentos
```css
--spacing-1: 0.25rem   /* 4px */
--spacing-2: 0.5rem    /* 8px */
--spacing-3: 0.75rem   /* 12px */
--spacing-4: 1rem      /* 16px */
--spacing-5: 1.25rem   /* 20px */
--spacing-6: 1.5rem    /* 24px */
--spacing-8: 2rem      /* 32px */
--spacing-10: 2.5rem   /* 40px */
--spacing-12: 3rem     /* 48px */
```

## 🚀 Guia de Desenvolvimento

### Pré-requisitos
```bash
# Node.js 18+
node --version

# Rust (para Tauri)
rustc --version

# pnpm (recomendado)
npm install -g pnpm
```

### Instalação
```bash
# Clonar repositório
git clone <repository-url>
cd sistemas-fichas-desktop

# Instalar dependências
pnpm install

# Desenvolvimento
pnpm tauri dev

# Build para produção
pnpm tauri build
```

### Estrutura de Commits
```
feat: nova funcionalidade
fix: correção de bug
docs: documentação
style: formatação
refactor: refatoração
test: testes
chore: manutenção
```

### Padrões de Código
- **Componentes:** PascalCase (`UserProfile.jsx`)
- **Hooks:** camelCase com prefixo `use` (`useAuth`)
- **Contextos:** PascalCase com sufixo `Context` (`AuthContext`)
- **CSS:** kebab-case (`.dashboard-card`)

## 🔧 Configuração do Ambiente

### Variáveis de Ambiente
```bash
# .env.local
VITE_API_BASE_URL=http://localhost:3001/api
VITE_APP_NAME=Sistema de Fichas
VITE_APP_VERSION=1.0.0
```

### Configuração do Tauri
```json
// src-tauri/tauri.conf.json
{
  "build": {
    "beforeDevCommand": "pnpm dev",
    "beforeBuildCommand": "pnpm build",
    "devPath": "http://localhost:1420",
    "distDir": "../dist"
  }
}
```

## 📊 Monitoramento e Logs

### Sistema de Logs
```javascript
// Logs do sistema (Admin > Monitoramento)
const systemLogs = [
  {
    timestamp: '2024-01-15 10:30:00',
    level: 'INFO',
    message: 'Usuário admin fez login',
    module: 'Auth'
  },
  {
    timestamp: '2024-01-15 10:31:00',
    level: 'ERROR',
    message: 'Falha ao conectar com API',
    module: 'API'
  }
];
```

### Métricas do Sistema
```javascript
// Estatísticas em tempo real
const systemStats = {
  cpu: 45.2,
  memory: 67.8,
  disk: 23.1,
  uptime: '2d 14h 30m',
  connections: 12,
  status: 'online'
};
```

## 🛡️ Segurança

### Autenticação
- Tokens JWT para sessões
- Refresh tokens para renovação
- Logout automático por inatividade

### Validação
- Validação client-side e server-side
- Sanitização de inputs
- Proteção contra XSS

### CORS
```javascript
// Configuração CORS esperada no backend
{
  "origin": ["http://localhost:1420", "tauri://localhost"],
  "methods": ["GET", "POST", "PUT", "DELETE"],
  "headers": ["Content-Type", "Authorization"]
}
```

## 📱 Responsividade

### Breakpoints
```css
/* Mobile */
@media (max-width: 768px) { /* ... */ }

/* Tablet */
@media (min-width: 769px) and (max-width: 1024px) { /* ... */ }

/* Desktop */
@media (min-width: 1025px) { /* ... */ }
```

### Componentes Responsivos
- Sidebar colapsável
- Tabelas com scroll horizontal
- Cards adaptáveis
- Formulários otimizados

## 🎯 Próximos Passos

### Funcionalidades Planejadas
- [ ] Integração real com API backend
- [ ] Sistema de notificações push
- [ ] Backup automático
- [ ] Relatórios avançados
- [ ] Sistema de permissões granular
- [ ] Modo offline
- [ ] Sincronização em tempo real

### Melhorias Técnicas
- [ ] Testes unitários
- [ ] Testes de integração
- [ ] CI/CD pipeline
- [ ] Monitoramento de performance
- [ ] Logs centralizados
- [ ] Documentação da API

## 📞 Suporte

### Contatos
- **Desenvolvedor:** [Seu Nome]
- **Email:** [seu-email@exemplo.com]
- **GitHub:** [seu-github]

### Troubleshooting
1. **Erro de conexão com API:** Verificar configuração do servidor
2. **Tema não aplica:** Limpar localStorage e recarregar
3. **Sidebar não funciona:** Verificar CSS e JavaScript
4. **Tabelas brancas no modo escuro:** Verificar estilos CSS

---

**Versão:** 1.0.0  
**Última atualização:** Janeiro 2024  
**Status:** Em desenvolvimento ativo














