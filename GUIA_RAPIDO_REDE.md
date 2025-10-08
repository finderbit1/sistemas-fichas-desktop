# 🚀 Guia Rápido - Configuração em Rede

> **Problema resolvido**: Sistema agora sincroniza pedidos entre múltiplos computadores

## ⚡ Início Rápido (3 passos)

### 1️⃣ No Computador Servidor (onde roda a API)

```bash
# Execute o assistente de configuração
./scripts/network-config-helper.sh
```

O script irá:
- ✅ Detectar o IP automaticamente
- ✅ Verificar se a API está rodando
- ✅ Mostrar instruções para os outros computadores
- ✅ Configurar o firewall (se necessário)

### 2️⃣ Inicie a API (se ainda não estiver rodando)

```bash
cd src-api-python/api-sgp
./start.sh
# Escolha opção 1 (API Simples) ou 2 (Produção)
```

### 3️⃣ Nos Outros Computadores

**Opção A - Interface Gráfica** (Mais Fácil):
1. Abra o sistema
2. Vá em **Admin → Configurações do Sistema**
3. Digite o IP do servidor: `http://192.168.15.6:8000`
4. Clique em **Testar Conexão**
5. Clique em **Salvar Configuração**
6. ✅ Pronto!

**Opção B - Console do Navegador** (Mais Rápido):
1. Pressione `F12`
2. Vá na aba **Console**
3. Cole e execute:

```javascript
localStorage.setItem('serverConfig', JSON.stringify({
  baseURL: 'http://192.168.15.6:8000',  // ← ALTERE para o IP do seu servidor
  timeout: 10000,
  retries: 3
}));
location.reload();
```

---

## 🔍 Verificar se Está Funcionando

### No Navegador:

1. Pressione `F12` → Console
2. Digite:

```javascript
// Ver configuração atual
JSON.parse(localStorage.getItem('serverConfig'))

// Ver informações do cache
cacheManager.showStats()
```

### Na Rede (Console/Terminal):

```bash
# Teste de outro computador
curl http://192.168.15.6:8000/health

# Deve retornar: {"status":"healthy","version":"1.0.0"}
```

---

## 🛠️ Comandos Úteis

### Descobrir IP do Servidor:
```bash
ip addr show | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | cut -d/ -f1
```

### Verificar Porta Aberta:
```bash
sudo ufw status
sudo ufw allow 8000  # Se precisar abrir
```

### Limpar Cache (Console do Navegador):
```javascript
cacheManager.clearAll()
```

### Recarregar Configuração da API:
```javascript
import { reloadApiConfig } from './services/api';
reloadApiConfig();
```

---

## 📊 Como Funciona

### Antes (Problema):
```
Computador 1 (servidor) → localhost:8000 ✅
Computador 2           → localhost:8000 ❌ (não existe)
Computador 3           → localhost:8000 ❌ (não existe)

→ Computadores 2 e 3 usam cache desatualizado (até 2h de atraso)
```

### Agora (Solução):
```
Computador 1 (servidor) → 192.168.15.6:8000 ✅
Computador 2           → 192.168.15.6:8000 ✅
Computador 3           → 192.168.15.6:8000 ✅

→ Todos conectam ao mesmo servidor central
→ Dados sempre sincronizados
→ Cache limpo automaticamente ao trocar servidor
```

---

## 🔧 Troubleshooting

### Problema: Pedidos ainda desatualizados

```javascript
// Console do navegador:
cacheManager.clearAll()          // Limpa tudo
location.reload()                // Recarrega página
```

### Problema: Erro de conexão

1. Verifique se API está rodando:
```bash
curl http://192.168.15.6:8000/health
```

2. Verifique a configuração:
```javascript
JSON.parse(localStorage.getItem('serverConfig'))
```

3. Teste firewall:
```bash
sudo ufw allow 8000
```

### Problema: IP mudou

Execute novamente:
```bash
./scripts/network-config-helper.sh
```

Ou atualize manualmente via interface gráfica.

---

## 📝 Arquivos Importantes

| Arquivo | Descrição |
|---------|-----------|
| `scripts/network-config-helper.sh` | Assistente de configuração |
| `src/services/api.js` | API com configuração dinâmica |
| `src/contexts/ServerConfigContext.jsx` | Gerenciador de configuração |
| `src/components/ServerConfig.jsx` | Interface de configuração |
| `documentation/CONFIGURACAO_REDE_MULTIPLOS_COMPUTADORES.md` | Documentação completa |

---

## ✨ Recursos Implementados

- ✅ **Configuração dinâmica** via localStorage
- ✅ **Auto-reload** ao mudar configuração
- ✅ **Limpeza automática de cache**
- ✅ **Sincronização entre abas** do navegador
- ✅ **Fallback inteligente** para IP da rede
- ✅ **Interface gráfica** de configuração
- ✅ **Teste de conexão** integrado
- ✅ **Script auxiliar** para facilitar setup

---

## 🎯 Resumo de 30 Segundos

**No Servidor:**
```bash
./scripts/network-config-helper.sh
```

**Nos Clientes:**
1. Admin → Configurações
2. Digite IP: `http://192.168.15.6:8000`
3. Salvar

**✅ Pronto!** Sistema sincronizado em rede.

---

**Última atualização**: 08/10/2025  
**Versão**: 1.0.0

