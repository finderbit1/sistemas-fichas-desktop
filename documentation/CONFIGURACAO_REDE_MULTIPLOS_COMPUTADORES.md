# 🌐 Configuração para Múltiplos Computadores na Rede

## 📋 Problema Identificado

Quando o sistema roda em múltiplos computadores na mesma rede, os pedidos ficam desatualizados nos computadores que não estão rodando o servidor da API.

### Causa do Problema:
- O sistema estava configurado para usar `localhost` (127.0.0.1)
- Cada computador tentava conectar ao seu próprio localhost (que não tem servidor)
- Os computadores sem servidor usavam dados do **cache local desatualizado**
- Cache pode ter até 2 horas de vida, causando dados antigos

---

## ✅ Solução Implementada

### Mudanças Realizadas:

1. **API dinâmica com configuração salva**: O sistema agora lê a configuração do servidor do localStorage
2. **Fallback para IP da rede**: Se não houver configuração, usa o IP do servidor (192.168.15.6)
3. **Auto-reload da API**: Quando a configuração muda, a API é recarregada automaticamente
4. **Limpeza automática de cache**: Ao mudar o servidor, o cache é limpo para forçar dados atualizados

---

## 🚀 Como Configurar

### **Passo 1: Descobrir o IP do Servidor**

No computador onde a API está rodando, execute:

```bash
ip addr show | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | cut -d/ -f1
```

Você verá algo como:
```
192.168.15.6    <- Este é o IP da sua rede
172.19.0.1      <- Docker (ignore)
172.18.0.1      <- Docker (ignore)
```

Use o primeiro IP (192.168.15.x)

### **Passo 2: Iniciar a API no Servidor**

No computador principal, inicie a API:

```bash
cd src-api-python/api-sgp
./start.sh
```

Escolha a opção **1** (API Simples) ou **2** (Sistema de Produção)

A API estará disponível em: `http://192.168.15.6:8000`

### **Passo 3: Configurar os Computadores Clientes**

Em cada computador que irá usar o sistema:

#### **Opção A - Interface Gráfica (Recomendado)**

1. Abra o sistema
2. Vá para **Admin > Configurações do Sistema** ou acesse o componente `ServerConfig`
3. No campo **"URL do Servidor"**, digite: `http://192.168.15.6:8000` (use o IP do seu servidor)
4. Clique em **"Testar Conexão"** para verificar
5. Clique em **"Salvar Configuração"**
6. ✅ Pronto! O sistema agora está conectado ao servidor central

#### **Opção B - Console do Navegador (Rápido)**

1. Abra o sistema
2. Pressione `F12` para abrir o DevTools
3. Vá na aba **Console**
4. Digite e execute:

```javascript
localStorage.setItem('serverConfig', JSON.stringify({
  baseURL: 'http://192.168.15.6:8000',  // ALTERE para o IP do seu servidor
  timeout: 10000,
  retries: 3
}));
```

5. Recarregue a página (`F5`)
6. ✅ Pronto!

---

## 🔍 Verificar se está Funcionando

### No Console do Navegador:

```javascript
// Ver configuração atual
JSON.parse(localStorage.getItem('serverConfig'))

// Ver status do cache
cacheManager.showStats()

// Limpar cache manualmente (se necessário)
cacheManager.clearAll()
```

### Verificar Conexão:

1. Abra o DevTools (F12)
2. Vá em **Network**
3. Crie um pedido ou atualize a página
4. Veja se as requisições estão indo para o IP correto (não para localhost)

---

## 📝 Configuração Padrão

### Arquivo `api.js` agora tem:

```javascript
// Fallback padrão (se não houver configuração salva)
return "http://192.168.15.6:8000";
```

**IMPORTANTE**: Se o IP do servidor mudar, você pode:
1. Atualizar via interface gráfica (melhor opção)
2. Atualizar via console
3. Ou editar o fallback no arquivo `/src/services/api.js` (linha 17)

---

## 🔧 Configurações de Firewall

Certifique-se de que:

1. **No servidor (onde roda a API)**:
   - Porta 8000 está aberta
   - Firewall permite conexões na porta 8000

```bash
# Verificar se a porta está aberta
sudo ufw status
sudo ufw allow 8000
```

2. **Testar acesso de outro computador**:

```bash
# De outro computador, teste:
curl http://192.168.15.6:8000/health
```

Deve retornar algo como:
```json
{
  "status": "healthy",
  "version": "1.0.0"
}
```

---

## 📊 Sistema de Cache

### Tempos de Expiração:

| Tipo de Dado | Tempo de Cache |
|--------------|---------------|
| Designers | 1 hora |
| Vendedores | 1 hora |
| Formas de Pagamento | 2 horas |
| Formas de Envio | 2 horas |
| Tecidos | 30 minutos |
| Materiais | 30 minutos |
| Descontos | 15 minutos |
| Pedidos | 5 minutos |
| Clientes | 10 minutos |

### Limpar Cache Manualmente:

```javascript
// Console do navegador
cacheManager.clearAll()
```

Ou use o botão **"Limpar Cache"** na interface de Admin.

---

## 🐛 Troubleshooting

### Problema: Pedidos ainda desatualizados

**Solução**:
1. Limpe o cache: `cacheManager.clearAll()`
2. Verifique a URL: `JSON.parse(localStorage.getItem('serverConfig'))`
3. Teste a conexão no componente ServerConfig
4. Recarregue a página

### Problema: Erro de conexão

**Solução**:
1. Verifique se a API está rodando no servidor
2. Teste o IP: `curl http://192.168.15.6:8000/health`
3. Verifique o firewall
4. Certifique-se de que ambos estão na mesma rede

### Problema: Dados antigos mesmo após limpar cache

**Solução**:
1. Verifique se a URL está correta
2. Recarregue a configuração da API:
```javascript
import { reloadApiConfig } from './services/api';
reloadApiConfig();
```
3. Force refresh: `Ctrl + Shift + R`

---

## 📱 Configuração para Diferentes Cenários

### Cenário 1: Desenvolvimento Local
```javascript
{
  baseURL: 'http://localhost:8000',
  timeout: 10000,
  retries: 3
}
```

### Cenário 2: Servidor na Rede Local
```javascript
{
  baseURL: 'http://192.168.15.6:8000',
  timeout: 10000,
  retries: 3
}
```

### Cenário 3: Servidor com Load Balancer
```javascript
{
  baseURL: 'http://192.168.15.6:9000',  // Porta do load balancer
  timeout: 15000,
  retries: 5
}
```

---

## ✨ Recursos Automáticos

### 1. Auto-reload ao Mudar Configuração
- Quando você salva uma nova configuração, a API é recarregada automaticamente
- O cache é limpo automaticamente
- Não precisa recarregar a página manualmente

### 2. Sincronização entre Abas
- Se você mudar a configuração em uma aba, outras abas detectam e atualizam
- Usa `storage` event do navegador

### 3. Fallback Inteligente
- Se a configuração salva estiver corrompida, usa o fallback (IP da rede)
- Se o fallback falhar, mostra erro claro no console

---

## 📚 Arquivos Modificados

1. `/src/services/api.js` - API dinâmica com configuração
2. `/src/contexts/ServerConfigContext.jsx` - Limpeza de cache ao mudar configuração
3. `/src/components/ServerConfig.jsx` - Interface de configuração

---

## 🎯 Resumo Rápido

### Para o Administrador:
1. Descubra o IP: `ip addr show | grep "inet "`
2. Inicie a API: `cd src-api-python/api-sgp && ./start.sh`
3. Compartilhe o IP com a equipe: `http://192.168.15.6:8000`

### Para os Usuários:
1. Abra o sistema
2. Vá em **Admin > Configurações do Sistema**
3. Digite o IP do servidor: `http://192.168.15.6:8000`
4. Teste e Salve
5. ✅ Pronto para usar!

---

## 🔐 Segurança

- Não exponha o servidor para a internet sem proteção
- Use apenas na rede local confiável
- Para acesso externo, configure VPN ou autenticação adequada
- O sistema já tem rate limiting (proteção contra abuso)

---

**Data da última atualização**: 08/10/2025
**Versão do documento**: 1.0.0

