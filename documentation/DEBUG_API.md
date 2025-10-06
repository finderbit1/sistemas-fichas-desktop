# Debug da API - Guia de Solução de Problemas

## 🔍 **Problema Identificado:**
- Erro ao buscar dados da API
- Sistema não consegue conectar com o backend

## 🛠️ **Melhorias Implementadas para Debug:**

### 1. **Logs Detalhados na Console**
- ✅ Logs de requisição e resposta
- ✅ Detalhes completos de erros
- ✅ Status da API em tempo real

### 2. **Tratamento de Erro Melhorado**
- ✅ Diferenciação entre tipos de erro
- ✅ Mensagens de erro mais claras
- ✅ Timeout configurado para 10 segundos

### 3. **Botão de Teste de Conexão**
- ✅ Teste manual da conexão com a API
- ✅ Verificação de status em tempo real
- ✅ Feedback visual do resultado

## 🚀 **Como Usar o Debug:**

### **1. Abra o Console do Navegador:**
- **Chrome/Edge**: F12 → Console
- **Firefox**: F12 → Console
- **Safari**: Desenvolvedor → Console

### **2. Recarregue a Página:**
- Observe os logs de inicialização
- Verifique se há erros de conexão

### **3. Use o Botão de Teste:**
- Clique em "🔌 Testar Conexão API"
- Observe o resultado no toast
- Verifique os logs no console

## 📋 **Possíveis Problemas e Soluções:**

### **Problema 1: API Não Está Rodando**
```
❌ Erro: ERR_NETWORK
✅ Solução: Iniciar o servidor da API
```

### **Problema 2: IP/Porta Incorretos**
```
❌ Erro: ECONNREFUSED
✅ Solução: Verificar IP e porta no arquivo api.js
```

### **Problema 3: CORS (Cross-Origin)**
```
❌ Erro: CORS policy
✅ Solução: Configurar CORS no backend
```

### **Problema 4: Timeout**
```
❌ Erro: ECONNABORTED
✅ Solução: Aumentar timeout ou verificar rede
```

## 🔧 **Configuração da API:**

### **Arquivo: `src/services/api.js`**
```javascript
const API_LOCAL = "http://192.168.15.8:8000";  // IP atual
// const API_LOCAL = "http://127.0.0.1:8000";  // IP local
```

### **Verificar:**
1. **IP correto** do servidor
2. **Porta correta** (8000)
3. **Protocolo** (http/https)
4. **Servidor rodando** na máquina

## 📱 **Teste de Conexão:**

### **Endpoint de Teste:**
- **URL**: `http://192.168.15.8:8000/`
- **Método**: GET
- **Timeout**: 10 segundos

### **Resposta Esperada:**
```json
{
  "status": "online",
  "message": "API funcionando"
}
```

## 🚨 **Logs para Observar:**

### **Requisição Bem-sucedida:**
```
🚀 Requisição para: /pedidos
✅ Resposta recebida: 200 /pedidos
📋 Pedidos formatados: [...]
```

### **Erro de Conexão:**
```
❌ Erro na resposta: {
  url: "/pedidos",
  method: "get",
  status: undefined,
  message: "Network Error"
}
```

## 🔍 **Passos para Debug:**

### **1. Verificar Servidor:**
```bash
# No servidor da API
curl http://192.168.15.8:8000/
# ou
wget http://192.168.15.8:8000/
```

### **2. Verificar Rede:**
```bash
# Ping para o servidor
ping 192.168.15.8

# Teste de porta
telnet 192.168.15.8 8000
```

### **3. Verificar Firewall:**
- Porta 8000 liberada
- Regras de CORS configuradas
- Acesso de rede permitido

## 📞 **Soluções Rápidas:**

### **Solução 1: Mudar IP para Local**
```javascript
const API_LOCAL = "http://127.0.0.1:8000";
```

### **Solução 2: Aumentar Timeout**
```javascript
timeout: 30000, // 30 segundos
```

### **Solução 3: Desabilitar Validação de Status**
```javascript
validateStatus: function (status) {
  return true; // Aceita qualquer status
}
```

## 🎯 **Próximos Passos:**

1. **Teste a conexão** com o botão
2. **Verifique os logs** no console
3. **Identifique o tipo de erro**
4. **Aplique a solução** correspondente
5. **Teste novamente**

## 📋 **Checklist de Verificação:**

- [ ] Servidor da API está rodando?
- [ ] IP e porta estão corretos?
- [ ] Rede permite conexão?
- [ ] Firewall libera a porta?
- [ ] CORS está configurado?
- [ ] Timeout é suficiente?

Use o botão de teste e os logs para identificar o problema específico! 🔍✨
