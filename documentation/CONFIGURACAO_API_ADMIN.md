# Configuração da API - Painel Administrativo

## 🎯 **Funcionalidade Implementada:**

### ✅ **Configuração Dinâmica da API**
- **IP configurável** através do painel admin
- **Porta configurável** para diferentes ambientes
- **Protocolo selecionável** (HTTP/HTTPS)
- **Salvamento automático** no localStorage
- **Aplicação em tempo real** sem recarregar a página

## 🚀 **Como Acessar:**

### **1. Navegar para Admin:**
- Acesse a rota `/admin` no sistema
- Ou clique no menu "Admin" na sidebar

### **2. Seção de Configuração:**
- Localizada no topo da página admin
- Interface intuitiva com campos organizados
- Botões de teste e aplicação

## 🔧 **Campos de Configuração:**

### **Protocolo:**
- **HTTP**: Para desenvolvimento e redes locais
- **HTTPS**: Para produção com SSL/TLS

### **IP do Servidor:**
- **Exemplos válidos:**
  - `192.168.1.100` (Rede local)
  - `127.0.0.1` (Localhost)
  - `10.0.0.50` (Rede corporativa)
  - `172.16.0.25` (Rede Docker)

### **Porta:**
- **Portas comuns:**
  - `8000` (Desenvolvimento)
  - `3000` (Node.js/Express)
  - `8080` (Alternativa)
  - `5000` (Flask/Python)

## 📱 **Interface da Configuração:**

### **Layout Responsivo:**
```
┌─────────────────────────────────────────────────────────┐
│ 🔧 Configuração da API                                 │
├─────────────────────────────────────────────────────────┤
│ Protocolo │ IP do Servidor │ Porta │ Ações            │
│ [HTTP ▼]  │ [192.168.1.100]│ [8000]│ [🔌] [💾]        │
├─────────────────────────────────────────────────────────┤
│ URL da API: http://192.168.1.100:8000 [📋]            │
├─────────────────────────────────────────────────────────┤
│ Resultado do teste de conexão                          │
├─────────────────────────────────────────────────────────┤
│ Informações de ajuda                                   │
└─────────────────────────────────────────────────────────┘
```

### **Botões de Ação:**
- **🔌 Testar Conexão**: Verifica se a API está acessível
- **💾 Salvar**: Salva a configuração no localStorage
- **📋 Copiar**: Copia a URL completa para a área de transferência

## 🧪 **Teste de Conexão:**

### **Como Funciona:**
1. **Clique em "🔌 Testar Conexão"**
2. **Sistema faz uma requisição** para a URL configurada
3. **Resultado é exibido** com status e detalhes
4. **Logs são mostrados** no console do navegador

### **Possíveis Resultados:**
- ✅ **Sucesso**: API conectada e funcionando
- ❌ **Timeout**: Conexão muito lenta
- ❌ **Offline**: API não está rodando
- ❌ **Erro**: Problema específico (CORS, firewall, etc.)

## 💾 **Sistema de Salvamento:**

### **LocalStorage:**
```javascript
{
  "baseURL": "http://192.168.1.100:8000",
  "ip": "192.168.1.100",
  "port": "8000",
  "protocol": "http"
}
```

### **Persistência:**
- ✅ **Configuração salva** automaticamente
- ✅ **Carregada** ao iniciar o sistema
- ✅ **Aplicada** em todas as requisições
- ✅ **Sobrescreve** configuração padrão

## 🔄 **Aplicação da Configuração:**

### **Tempo Real:**
- ✅ **Sem recarregar** a página
- ✅ **Interceptors** do Axios atualizados
- ✅ **Nova URL** aplicada imediatamente
- ✅ **Logs** mostram mudanças

### **Recarregamento:**
- **Opcional** para garantir sincronização
- **Recomendado** após mudanças importantes
- **Automático** após aplicar configuração

## 📋 **Exemplos de Configuração:**

### **Desenvolvimento com uvicorn (Recomendado):**
```
Protocolo: HTTP
IP: 0.0.0.0
Porta: 8000
URL: http://0.0.0.0:8000
Comando: uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### **Desenvolvimento Local:**
```
Protocolo: HTTP
IP: 127.0.0.1
Porta: 8000
URL: http://127.0.0.1:8000
Comando: uv run uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

### **Rede Local:**
```
Protocolo: HTTP
IP: 192.168.1.100
Porta: 8000
URL: http://192.168.1.100:8000
Comando: uv run uvicorn main:app --reload --host 192.168.1.100 --port 8000
```

### **Produção:**
```
Protocolo: HTTPS
IP: api.seudominio.com
Porta: 443
URL: https://api.seudominio.com
Comando: uvicorn main:app --host 0.0.0.0 --port 443
```

## 🚨 **Troubleshooting:**

### **Problema 1: Configuração não salva**
- ✅ Verificar permissões do localStorage
- ✅ Limpar cache do navegador
- ✅ Verificar console para erros

### **Problema 2: API não conecta após mudança**
- ✅ Verificar se o IP está correto
- ✅ Testar conectividade (ping)
- ✅ Verificar firewall e CORS

### **Problema 3: Configuração não persiste**
- ✅ Verificar se o navegador suporta localStorage
- ✅ Limpar dados do site
- ✅ Verificar modo privado/incógnito

## 🎯 **Casos de Uso:**

### **1. Desenvolvimento:**
- Mudar entre diferentes ambientes
- Testar APIs locais e remotas
- Configurar diferentes portas

### **2. Produção:**
- Migrar entre servidores
- Configurar load balancers
- Ajustar para diferentes domínios

### **3. Manutenção:**
- Trocar servidor temporariamente
- Testar conectividade
- Debug de problemas de rede

## 🚀 **Próximas Melhorias (Opcionais):**

### **Funcionalidades Futuras:**
- **Múltiplos ambientes** (dev, staging, prod)
- **Configurações por usuário** (perfis)
- **Backup/restore** de configurações
- **Validação** de IPs e portas
- **Histórico** de mudanças

## 📝 **Como Usar:**

### **1. Acesse o Admin:**
```
Menu → Admin → Configuração da API
```

### **2. Configure os Campos:**
```
Protocolo: [HTTP]
IP: [192.168.1.100]
Porta: [8000]
```

### **3. Teste a Conexão:**
```
Clique em 🔌 Testar Conexão
```

### **4. Salve e Aplique:**
```
Clique em 💾 Salvar
Clique em 💾 Aplicar (opcional)
```

### **5. Verifique o Resultado:**
```
Console do navegador mostra logs
Toast mostra status da operação
```

Agora você pode **configurar facilmente** o IP da API através do painel administrativo! 🎉✨

## 🔧 **Configuração da API:**

### **Arquivo: `src/services/api.js`**
```javascript
// Configuração padrão para uvicorn/FastAPI
const API_LOCAL = "http://0.0.0.0:8000";  // IP atual
// const API_LOCAL = "http://127.0.0.1:8000";  // IP local para desenvolvimento
```

### **Verificar:**
1. **IP correto** do servidor (use `0.0.0.0` para uvicorn)
2. **Porta correta** (8000 para uvicorn)
3. **Protocolo** (http/https)
4. **Servidor rodando** com uvicorn

## 📱 **Teste de Conexão:**

### **Endpoint de Teste:**
- **URL**: `http://0.0.0.0:8000/`
- **Método**: GET
- **Timeout**: 10 segundos

### **Resposta Esperada:**
```json
{
  "status": "online",
  "message": "API funcionando"
}
```

## 🔍 **Passos para Debug:**

### **1. Verificar Servidor uvicorn:**
```bash
# No servidor da API
uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Testar conexão
curl http://0.0.0.0:8000/
# ou
wget http://0.0.0.0:8000/
```

### **2. Verificar Rede:**
```bash
# Ping para o servidor
ping 0.0.0.0

# Teste de porta
telnet 0.0.0.0 8000
```

### **3. Verificar Firewall:**
- Porta 8000 liberada
- Regras de CORS configuradas
- Acesso de rede permitido
