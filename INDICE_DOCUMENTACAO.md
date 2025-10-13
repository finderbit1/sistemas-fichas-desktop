# 📚 Índice da Documentação - Sistema de Fichas

## 🎯 Navegação Rápida

Este documento organiza **TODA** a documentação do sistema para você encontrar rapidamente o que precisa.

---

## 🚀 Para Começar Agora

Se você quer **começar imediatamente**, leia estes 3 documentos:

1. **[README_CONFIGURACAO_RAPIDA.md](README_CONFIGURACAO_RAPIDA.md)** ⭐ COMECE AQUI
   - Guia de 3 minutos
   - Como funciona o sistema
   - Configuração básica

2. **[GUIA_INSTALACAO_CLIENTES.md](GUIA_INSTALACAO_CLIENTES.md)**
   - Instalação passo a passo
   - Configuração do servidor
   - Instalação nos 20 clientes

3. **[SCRIPT_INSTALACAO.md](SCRIPT_INSTALACAO.md)**
   - Scripts PowerShell prontos
   - Instalação automática
   - GPO e automação

---

## 📂 Documentação por Categoria

### 🔧 **Configuração e Instalação**

| Documento | Descrição | Quando Usar |
|-----------|-----------|-------------|
| **README_CONFIGURACAO_RAPIDA.md** | Guia rápido de configuração | Primeira vez configurando |
| **GUIA_INSTALACAO_CLIENTES.md** | Instalação completa detalhada | Instalação em produção |
| **SCRIPT_INSTALACAO.md** | Scripts automáticos de instalação | Instalar em múltiplos PCs |
| **RESUMO_SISTEMA_CONFIGURACAO.md** | Resumo técnico do sistema | Entender como funciona |

---

### 🌐 **Rede e Sincronização**

| Documento | Descrição | Quando Usar |
|-----------|-----------|-------------|
| **GUIA_RAPIDO_REDE.md** | Configuração de rede rápida | Conectar múltiplos PCs |
| **GUIA_RAPIDO_SINCRONIZACAO.md** | Sincronização em tempo real | Entender WebSocket |
| **RESUMO_SINCRONIZACAO_IMPLEMENTADA.md** | Sistema de sincronização | Referência técnica |
| **DIAGRAMA_FLUXO_SINCRONIZACAO.md** | Diagramas e fluxos | Visual do sistema |
| **TESTE_SINCRONIZACAO.md** | Testes de sincronização | Testar o sistema |

---

### 📖 **Documentação Completa** (Pasta `documentation/`)

| Documento | Descrição | Quando Usar |
|-----------|-----------|-------------|
| **SISTEMA_SINCRONIZACAO_TEMPO_REAL.md** | Documentação completa WebSocket | Referência detalhada |
| **CONFIGURACAO_REDE_MULTIPLOS_COMPUTADORES.md** | Configuração de rede avançada | Redes complexas |
| **DOCUMENTACAO_SISTEMA.md** | Documentação geral | Visão geral do sistema |
| **GUIA_DESENVOLVIMENTO.md** | Guia para desenvolvedores | Modificar o código |

---

### 🧪 **Testes**

| Documento | Descrição | Quando Usar |
|-----------|-----------|-------------|
| **TESTE_SINCRONIZACAO.md** | Testes de sincronização | Validar sincronização |
| **test_websocket.py** | Script de teste WebSocket | Testar conexão |
| **test_20_clientes.py** | Simulação de 20 clientes | Teste de carga |

---

### 📝 **Checklists e Procedimentos**

| Documento | Descrição | Quando Usar |
|-----------|-----------|-------------|
| **CHECKLIST_IMPLEMENTACAO.md** | Checklist de implementação | Acompanhar progresso |
| **INDICE_SINCRONIZACAO.md** | Índice de sincronização | Navegação rápida sync |

---

## 🎓 Guias por Perfil de Usuário

### 👨‍💼 **Administrador de TI**

**Primeira instalação:**
1. [README_CONFIGURACAO_RAPIDA.md](README_CONFIGURACAO_RAPIDA.md)
2. [GUIA_INSTALACAO_CLIENTES.md](GUIA_INSTALACAO_CLIENTES.md)
3. [SCRIPT_INSTALACAO.md](SCRIPT_INSTALACAO.md)

**Configuração de rede:**
1. [GUIA_RAPIDO_REDE.md](GUIA_RAPIDO_REDE.md)
2. [documentation/CONFIGURACAO_REDE_MULTIPLOS_COMPUTADORES.md](documentation/CONFIGURACAO_REDE_MULTIPLOS_COMPUTADORES.md)

**Testes:**
1. [TESTE_SINCRONIZACAO.md](TESTE_SINCRONIZACAO.md)
2. `test_websocket.py` e `test_20_clientes.py`

---

### 👨‍💻 **Desenvolvedor**

**Entender o código:**
1. [RESUMO_SISTEMA_CONFIGURACAO.md](RESUMO_SISTEMA_CONFIGURACAO.md)
2. [RESUMO_SINCRONIZACAO_IMPLEMENTADA.md](RESUMO_SINCRONIZACAO_IMPLEMENTADA.md)
3. [documentation/GUIA_DESENVOLVIMENTO.md](documentation/GUIA_DESENVOLVIMENTO.md)

**Sincronização:**
1. [documentation/SISTEMA_SINCRONIZACAO_TEMPO_REAL.md](documentation/SISTEMA_SINCRONIZACAO_TEMPO_REAL.md)
2. [DIAGRAMA_FLUXO_SINCRONIZACAO.md](DIAGRAMA_FLUXO_SINCRONIZACAO.md)

**Arquivos do código:**
- `src/utils/configLoader.js` - Carregamento de config
- `src/services/api.js` - API configurada
- `src/hooks/useWebSocket.js` - Hook WebSocket
- `src/hooks/usePedidosSync.js` - Sincronização de pedidos

---

### 👤 **Usuário Final**

**Usar o sistema:**
- Sistema é automático, não precisa configurar nada!
- Apenas clicar no atalho "Sistema de Fichas"

**Problemas?**
- Chamar o administrador
- Ou consultar seção de troubleshooting em qualquer guia

---

## 🔍 Busca Rápida por Tópico

### **Configuração**
- Como configurar IP do servidor: [README_CONFIGURACAO_RAPIDA.md](README_CONFIGURACAO_RAPIDA.md)
- Arquivo de configuração: [RESUMO_SISTEMA_CONFIGURACAO.md](RESUMO_SISTEMA_CONFIGURACAO.md)

### **Instalação**
- Instalar em 1 cliente: [GUIA_INSTALACAO_CLIENTES.md](GUIA_INSTALACAO_CLIENTES.md)
- Instalar em 20 clientes: [SCRIPT_INSTALACAO.md](SCRIPT_INSTALACAO.md)
- Scripts automáticos: [SCRIPT_INSTALACAO.md](SCRIPT_INSTALACAO.md)

### **Rede**
- Configurar rede local: [GUIA_RAPIDO_REDE.md](GUIA_RAPIDO_REDE.md)
- IP fixo: [GUIA_INSTALACAO_CLIENTES.md](GUIA_INSTALACAO_CLIENTES.md#passo-1-preparar-o-servidor-central)
- DNS local: [GUIA_INSTALACAO_CLIENTES.md](GUIA_INSTALACAO_CLIENTES.md)

### **Sincronização**
- Como funciona: [RESUMO_SINCRONIZACAO_IMPLEMENTADA.md](RESUMO_SINCRONIZACAO_IMPLEMENTADA.md)
- WebSocket: [documentation/SISTEMA_SINCRONIZACAO_TEMPO_REAL.md](documentation/SISTEMA_SINCRONIZACAO_TEMPO_REAL.md)
- Testar sincronização: [TESTE_SINCRONIZACAO.md](TESTE_SINCRONIZACAO.md)

### **Troubleshooting**
- Problemas de conexão: Seção "Problemas Comuns" em qualquer guia
- Testes de diagnóstico: [TESTE_SINCRONIZACAO.md](TESTE_SINCRONIZACAO.md)
- Debug: [README_CONFIGURACAO_RAPIDA.md](README_CONFIGURACAO_RAPIDA.md#debug-via-console)

### **Desenvolvimento**
- Arquitetura: [RESUMO_SISTEMA_CONFIGURACAO.md](RESUMO_SISTEMA_CONFIGURACAO.md)
- API: `src/services/api.js`
- Hooks: `src/hooks/useWebSocket.js`, `src/hooks/usePedidosSync.js`
- Config: `src/utils/configLoader.js`

---

## 📊 Arquivos Importantes

### **Configuração:**
```
public/config/api-config.json        ← Arquivo principal de configuração
public/config/api-config.example.json ← Exemplo de configuração
```

### **Código:**
```
src/utils/configLoader.js            ← Sistema de carregamento
src/services/api.js                  ← API configurada
src/hooks/useWebSocket.js            ← Hook WebSocket
src/hooks/usePedidosSync.js          ← Sincronização
src/main.jsx                         ← Inicialização
```

### **Testes:**
```
src-api-python/api-sgp/test_websocket.py     ← Teste WebSocket
src-api-python/api-sgp/test_20_clientes.py   ← Teste de carga
```

---

## 🎯 Cenários de Uso

### **"Preciso instalar o sistema pela primeira vez"**
→ [GUIA_INSTALACAO_CLIENTES.md](GUIA_INSTALACAO_CLIENTES.md)

### **"Tenho 20 clientes para instalar"**
→ [SCRIPT_INSTALACAO.md](SCRIPT_INSTALACAO.md)

### **"O IP do servidor mudou"**
→ [README_CONFIGURACAO_RAPIDA.md](README_CONFIGURACAO_RAPIDA.md#mudou-o-ip-do-servidor)

### **"Como testar se está funcionando?"**
→ [TESTE_SINCRONIZACAO.md](TESTE_SINCRONIZACAO.md)

### **"Sincronização não está funcionando"**
→ [TESTE_SINCRONIZACAO.md](TESTE_SINCRONIZACAO.md) + Console do navegador (F12)

### **"Preciso entender o código"**
→ [RESUMO_SISTEMA_CONFIGURACAO.md](RESUMO_SISTEMA_CONFIGURACAO.md)

### **"Como modificar/melhorar o sistema?"**
→ [documentation/GUIA_DESENVOLVIMENTO.md](documentation/GUIA_DESENVOLVIMENTO.md)

---

## ✅ Checklist Completo

### **Instalação:**
- [ ] Ler [README_CONFIGURACAO_RAPIDA.md](README_CONFIGURACAO_RAPIDA.md)
- [ ] Seguir [GUIA_INSTALACAO_CLIENTES.md](GUIA_INSTALACAO_CLIENTES.md)
- [ ] Usar scripts de [SCRIPT_INSTALACAO.md](SCRIPT_INSTALACAO.md)

### **Configuração:**
- [ ] IP fixo no servidor
- [ ] Arquivo `config/api-config.json` editado
- [ ] Firewall configurado

### **Testes:**
- [ ] Executar testes de [TESTE_SINCRONIZACAO.md](TESTE_SINCRONIZACAO.md)
- [ ] Verificar sincronização entre clientes
- [ ] Validar conexões WebSocket

### **Produção:**
- [ ] 20 clientes instalados
- [ ] Todos conectando no servidor
- [ ] Sincronização funcionando
- [ ] Sistema em uso! 🎉

---

## 📞 Ajuda Rápida

### **Comandos de Debug (Console do navegador F12):**

```javascript
// Ver configuração atual
showConfigInfo()

// Atualizar configuração
updateApiConfig({
  apiURL: 'http://192.168.1.100:8000',
  wsURL: 'ws://192.168.1.100:8000'
})

// Limpar configuração
clearConfig()

// Recarregar API
reloadApiConfig()

// Ver estado do cache
cacheManager.showStats()
```

---

## 🎉 Resumo

### **Documentação Essencial (Leia primeiro):**
1. [README_CONFIGURACAO_RAPIDA.md](README_CONFIGURACAO_RAPIDA.md)
2. [GUIA_INSTALACAO_CLIENTES.md](GUIA_INSTALACAO_CLIENTES.md)
3. [SCRIPT_INSTALACAO.md](SCRIPT_INSTALACAO.md)

### **Referência Técnica:**
1. [RESUMO_SISTEMA_CONFIGURACAO.md](RESUMO_SISTEMA_CONFIGURACAO.md)
2. [RESUMO_SINCRONIZACAO_IMPLEMENTADA.md](RESUMO_SINCRONIZACAO_IMPLEMENTADA.md)
3. [documentation/SISTEMA_SINCRONIZACAO_TEMPO_REAL.md](documentation/SISTEMA_SINCRONIZACAO_TEMPO_REAL.md)

### **Testes:**
1. [TESTE_SINCRONIZACAO.md](TESTE_SINCRONIZACAO.md)
2. `test_websocket.py`
3. `test_20_clientes.py`

---

**Sistema 100% documentado e pronto para produção!** 🚀

*Atualizado em: 13/10/2025*  
*Versão: 1.0.0*

