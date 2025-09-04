# 🏢 Sistema de Fichas Desktop

Sistema desktop moderno para gerenciamento de pedidos, clientes e relatórios, desenvolvido com **Tauri + React + Vite**.

## ✨ Características Principais

- 🎨 **Interface Moderna** com modo claro/escuro
- 🔐 **Autenticação** com controle de roles (admin/user)
- ⚙️ **Configuração de Servidor** dinâmica
- 📊 **Dashboard** com estatísticas em tempo real
- 👥 **Gestão de Clientes** completa
- 📈 **Relatórios** avançados
- 📱 **Responsivo** e otimizado
- 🚀 **Performance** otimizada

## 🚀 Início Rápido

### Pré-requisitos
- Node.js 18+
- Rust 1.70+
- pnpm

### Instalação
```bash
# Clonar repositório
git clone <repository-url>
cd sistemas-fichas-desktop

# Instalar dependências
pnpm install

# Iniciar desenvolvimento
pnpm tauri dev
```

### Build para Produção
```bash
# Build completo
pnpm tauri build

# Build para plataforma específica
pnpm tauri build --target x86_64-pc-windows-msvc
```

## 📚 Documentação

### 📖 Guias Principais
- **[Documentação Completa](DOCUMENTACAO_SISTEMA.md)** - Visão geral e arquitetura
- **[Guia de Integração API](GUIA_INTEGRACAO_API.md)** - Integração com backend
- **[Guia de Temas](GUIA_TEMAS_CONFIGURACOES.md)** - Sistema de temas e configurações
- **[Guia de Desenvolvimento](GUIA_DESENVOLVIMENTO.md)** - Desenvolvimento e manutenção

### 🏗️ Arquitetura
```
src/
├── components/          # Componentes reutilizáveis
├── contexts/           # Contextos React (Auth, Theme, ServerConfig)
├── pages/             # Páginas da aplicação
├── services/          # Serviços e APIs
├── styles/           # Arquivos CSS
└── utils/            # Utilitários
```

### 🔧 Tecnologias
- **Frontend:** React 18 + Vite
- **Desktop:** Tauri (Rust)
- **UI:** React Bootstrap + CSS Customizado
- **Ícones:** React Bootstrap Icons
- **Roteamento:** React Router v6
- **Estado:** Context API

## 🎯 Funcionalidades

### 🔐 Autenticação
- Login com username/password
- Controle de roles (admin/user)
- Sessão persistente
- Logout automático

### 🎨 Temas
- Modo claro/escuro
- Persistência de preferência
- Detecção automática do sistema
- Transições suaves

### ⚙️ Configurações
- URL do servidor configurável
- Timeout e retry settings
- Teste de conectividade
- Configurações de aparência

### 📊 Dashboard
- Estatísticas em tempo real
- Cards informativos
- Tabela de pedidos recentes
- Animações otimizadas

### 👥 Gestão de Clientes
- Listagem completa
- Cadastro e edição
- Busca e filtros
- Validação de dados

### 📈 Relatórios
- Relatório de fechamentos
- Filtros por período
- Exportação de dados
- Gráficos e métricas

## 🔌 Integração com API

### Endpoints Principais
```
POST /api/auth/login          # Autenticação
GET  /api/pedidos            # Listar pedidos
POST /api/pedidos            # Criar pedido
GET  /api/clientes           # Listar clientes
POST /api/clientes           # Criar cliente
GET  /api/relatorios         # Gerar relatório
```

### Configuração
```javascript
// Configuração padrão
const serverConfig = {
  url: 'http://localhost:3001/api',
  timeout: 5000,
  retries: 3
};
```

## 🎨 Sistema de Design

### Cores
- **Primária:** #667eea
- **Sucesso:** #48bb78
- **Aviso:** #ed8936
- **Erro:** #f56565

### Tipografia
- **Fonte:** Inter, -apple-system, BlinkMacSystemFont
- **Tamanhos:** 12px - 24px
- **Pesos:** 400, 500, 600, 700

### Espaçamentos
- **Unidade base:** 4px
- **Escala:** 4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px

## 🧪 Testes

```bash
# Executar testes
pnpm test

# Testes com UI
pnpm test:ui

# Cobertura de testes
pnpm test:coverage
```

## 📦 Scripts Disponíveis

```bash
pnpm dev              # Desenvolvimento
pnpm build            # Build do frontend
pnpm tauri:dev        # Desenvolvimento Tauri
pnpm tauri:build      # Build Tauri
pnpm lint             # Linting
pnpm format           # Formatação
pnpm test             # Testes
```

## 🚀 Deploy

### Build de Produção
```bash
# Build completo
pnpm tauri build

# Build para Windows
pnpm tauri build --target x86_64-pc-windows-msvc

# Build para macOS
pnpm tauri build --target x86_64-apple-darwin

# Build para Linux
pnpm tauri build --target x86_64-unknown-linux-gnu
```

### Configuração de Produção
```bash
# Variáveis de ambiente
VITE_API_BASE_URL=https://api.exemplo.com
VITE_APP_NAME=Sistema de Fichas
VITE_APP_VERSION=1.0.0
```

## 🔧 Manutenção

### Atualizações
```bash
# Verificar dependências
pnpm outdated

# Atualizar dependências
pnpm update

# Limpar cache
pnpm store prune
```

### Debugging
- React Developer Tools
- Redux DevTools
- Lighthouse para performance
- Console logs em desenvolvimento

## 📞 Suporte

### Contatos
- **Desenvolvedor:** [Seu Nome]
- **Email:** [seu-email@exemplo.com]
- **GitHub:** [seu-github]

### Troubleshooting
1. **Erro de conexão:** Verificar configuração do servidor
2. **Tema não aplica:** Limpar localStorage
3. **Build falha:** Verificar dependências Rust
4. **Performance lenta:** Verificar otimizações

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📈 Roadmap

### Próximas Funcionalidades
- [ ] Integração real com API backend
- [ ] Sistema de notificações push
- [ ] Backup automático
- [ ] Relatórios avançados
- [ ] Sistema de permissões granular
- [ ] Modo offline
- [ ] Sincronização em tempo real

### Melhorias Técnicas
- [ ] Testes unitários completos
- [ ] Testes de integração
- [ ] CI/CD pipeline
- [ ] Monitoramento de performance
- [ ] Logs centralizados
- [ ] Documentação da API

---

**Versão:** 1.0.0  
**Última atualização:** Janeiro 2024  
**Status:** Em desenvolvimento ativo

## 🎉 Agradecimentos

- [React](https://react.dev/) - Biblioteca de UI
- [Tauri](https://tauri.app/) - Framework desktop
- [React Bootstrap](https://react-bootstrap.github.io/) - Componentes UI
- [Vite](https://vitejs.dev/) - Build tool
- [Rust](https://www.rust-lang.org/) - Linguagem de sistema