# Configuração para uvicorn/FastAPI

## 🚀 **Seu Ambiente de API:**

### **Comando de Execução:**
```bash
uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### **Configuração Padrão:**
- **Protocolo**: HTTP
- **Host**: 0.0.0.0 (aceita conexões de qualquer IP)
- **Porta**: 8000
- **URL Base**: http://0.0.0.0:8000

## 🔧 **Configuração no Sistema:**

### **1. Acesse o Admin:**
```
Menu → Admin → Configuração da API
```

### **2. Configure os Campos:**
```
Protocolo: [HTTP]
IP: [0.0.0.0]
Porta: [8000]
```

### **3. Teste a Conexão:**
```
Clique em 🔌 Testar Conexão
```

### **4. Salve a Configuração:**
```
Clique em 💾 Salvar
```

## 📋 **Exemplos de Configuração:**

### **✅ Configuração Recomendada (Sua Atual):**
```
Protocolo: HTTP
IP: 0.0.0.0
Porta: 8000
URL: http://0.0.0.0:8000
```

### **🔄 Para Desenvolvimento Local:**
```
Protocolo: HTTP
IP: 127.0.0.1
Porta: 8000
URL: http://127.0.0.1:8000
```

### **🌐 Para Rede Local:**
```
Protocolo: HTTP
IP: 192.168.1.100
Porta: 8000
URL: http://192.168.1.100:8000
```

## 🧪 **Teste de Conexão:**

### **1. Verifique se a API está rodando:**
```bash
# No terminal onde roda a API
uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### **2. Teste no navegador:**
```
http://0.0.0.0:8000/
```

### **3. Teste no sistema:**
- Clique em "🔌 Testar Conexão"
- Observe o resultado
- Verifique os logs no console

## 🚨 **Possíveis Problemas e Soluções:**

### **Problema 1: API não conecta**
```
❌ Erro: ERR_NETWORK
✅ Solução: Verificar se uvicorn está rodando
```

### **Problema 2: CORS (Cross-Origin)**
```
❌ Erro: CORS policy
✅ Solução: Configurar CORS no FastAPI
```

### **Problema 3: Porta bloqueada**
```
❌ Erro: ECONNREFUSED
✅ Solução: Verificar firewall e porta 8000
```

## 🔍 **Debug da API:**

### **1. Logs do uvicorn:**
```bash
# Observe os logs no terminal
uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### **2. Logs do Sistema:**
- Abra o console do navegador (F12)
- Observe os logs de requisição
- Verifique erros de conexão

### **3. Teste de Conectividade:**
```bash
# Teste se a porta está aberta
telnet 0.0.0.0 8000

# Teste se a API responde
curl http://0.0.0.0:8000/
```

## 📱 **Interface de Configuração:**

### **Campos Disponíveis:**
- **Protocolo**: HTTP/HTTPS
- **IP**: 0.0.0.0 (padrão para uvicorn)
- **Porta**: 8000 (padrão para uvicorn)
- **URL**: Gerada automaticamente

### **Botões de Ação:**
- **🔌 Testar**: Verifica conectividade
- **💾 Salvar**: Persiste configuração
- **📋 Copiar**: Copia URL para clipboard

## 🎯 **Configuração Automática:**

### **Sistema Inteligente:**
- ✅ **Carrega configuração** salva automaticamente
- ✅ **Aplica mudanças** em tempo real
- ✅ **Persiste dados** entre sessões
- ✅ **Valida conexão** antes de salvar

### **Integração com Axios:**
- ✅ **Interceptors** atualizados automaticamente
- ✅ **BaseURL** configurada dinamicamente
- ✅ **Logs** mostram mudanças em tempo real
- ✅ **Timeout** configurável (10 segundos)

## 🚀 **Como Usar:**

### **1. Inicie sua API:**
```bash
uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### **2. Acesse o Sistema:**
```
http://localhost:3000 (ou porta do frontend)
```

### **3. Configure a API:**
```
Admin → Configuração da API
Protocolo: HTTP
IP: 0.0.0.0
Porta: 8000
```

### **4. Teste a Conexão:**
```
Clique em 🔌 Testar Conexão
```

### **5. Salve e Use:**
```
Clique em 💾 Salvar
Sistema está configurado!
```

## 🎉 **Benefícios:**

### **Para Desenvolvimento:**
- ✅ **Mudança rápida** entre ambientes
- ✅ **Configuração visual** sem editar código
- ✅ **Teste integrado** de conectividade
- ✅ **Debug facilitado** com logs estruturados

### **Para Produção:**
- ✅ **Configuração flexível** para diferentes servidores
- ✅ **Mudança de ambiente** sem recarregar
- ✅ **Validação** de conectividade
- ✅ **Persistência** das configurações

---

## 🎯 **Resumo:**

Agora você pode **configurar facilmente** sua API uvicorn através do painel administrativo!

### **✅ Configuração Padrão:**
- **Protocolo**: HTTP
- **Host**: 0.0.0.0
- **Porta**: 8000
- **URL**: http://0.0.0.0:8000

### **🚀 Comando da sua API:**
```bash
uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Sistema configurado e pronto para uso!** 🎉✨
