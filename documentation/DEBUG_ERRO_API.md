# Debug do Erro da API - Guia de Solução

## 🚨 **Problema Identificado:**
- Ainda está dando erro ao conectar com a API
- Sistema não consegue buscar dados

## 🔍 **Sistema de Debug Implementado:**

### **1. Logs Detalhados no Console:**
- ✅ **Configuração da API** carregada
- ✅ **Testes de conexão** com múltiplas abordagens
- ✅ **Erros detalhados** com códigos específicos
- ✅ **Status de cada teste** separadamente

### **2. Múltiplos Testes de Conexão:**
- ✅ **Teste 1**: Fetch nativo (mais simples)
- ✅ **Teste 2**: Axios com interceptors
- ✅ **Timeout configurável** (5 segundos)
- ✅ **Validação de status** flexível

## 🚀 **Como Debugar Agora:**

### **1. Abra o Console do Navegador:**
```
F12 → Console
```

### **2. Recarregue a Página:**
- Observe os logs de inicialização
- Verifique a configuração carregada

### **3. Use o Botão de Teste:**
- Vá para **Admin → Configuração da API**
- Clique em **"🔌 Testar Conexão"**
- Observe os logs detalhados

### **4. Verifique os Resultados:**
- **Toast** mostra o resultado
- **Console** mostra logs detalhados
- **Status** específico do erro

## 📋 **Possíveis Problemas e Soluções:**

### **Problema 1: API não está rodando**
```
❌ Erro: ERR_NETWORK ou offline
✅ Solução: 
1. Verificar se uvicorn está rodando
2. Comando: uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000
3. Verificar se não há erro no terminal
```

### **Problema 2: IP incorreto**
```
❌ Erro: ECONNREFUSED
✅ Solução:
1. Verificar IP da máquina: ip addr show
2. Usar IP correto (não 0.0.0.0 para conexão externa)
3. Tentar 127.0.0.1 para local
```

### **Problema 3: Porta bloqueada**
```
❌ Erro: ECONNREFUSED
✅ Solução:
1. Verificar se porta 8000 está aberta: netstat -tulpn | grep 8000
2. Verificar firewall: sudo ufw status
3. Liberar porta: sudo ufw allow 8000
```

### **Problema 4: CORS (Cross-Origin)**
```
❌ Erro: CORS policy
✅ Solução:
1. Configurar CORS no FastAPI
2. Adicionar middleware de CORS
3. Permitir origem do frontend
```

### **Problema 5: Rede não permite**
```
❌ Erro: Timeout ou ERR_NETWORK
✅ Solução:
1. Verificar se máquinas estão na mesma rede
2. Testar ping entre máquinas
3. Verificar configurações de rede
```

## 🔧 **Comandos para Verificar:**

### **1. Verificar se a API está rodando:**
```bash
# No terminal da API
ps aux | grep uvicorn
netstat -tulpn | grep 8000
```

### **2. Verificar IP da máquina:**
```bash
# IP da máquina
ip addr show
hostname -I
```

### **3. Testar conectividade:**
```bash
# Teste local
curl http://127.0.0.1:8000/
curl http://localhost:8000/

# Teste com IP específico
curl http://SEU_IP:8000/
```

### **4. Verificar firewall:**
```bash
# Status do firewall
sudo ufw status

# Liberar porta
sudo ufw allow 8000
```

## 🧪 **Testes para Fazer:**

### **Teste 1: API Local**
```
1. No terminal da API: uv run uvicorn main:app --reload --host 127.0.0.1 --port 8000
2. No sistema: IP = 127.0.0.1, Porta = 8000
3. Testar conexão
```

### **Teste 2: API Rede Local**
```
1. No terminal da API: uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000
2. No sistema: IP = SEU_IP_REAL, Porta = 8000
3. Testar conexão
```

### **Teste 3: Porta Diferente**
```
1. No terminal da API: uv run uvicorn main:app --reload --host 0.0.0.0 --port 3000
2. No sistema: IP = SEU_IP, Porta = 3000
3. Testar conexão
```

## 📱 **Interface de Debug:**

### **Campos para Verificar:**
- **Protocolo**: HTTP (correto para desenvolvimento)
- **IP**: Use IP real da máquina (não 0.0.0.0)
- **Porta**: 8000 (ou a porta que está usando)

### **Botões de Ação:**
- **🔌 Testar Conexão**: Executa testes múltiplos
- **💾 Salvar**: Persiste configuração
- **📋 Copiar**: Copia URL para debug

## 🎯 **Passos para Resolver:**

### **1. Identificar o Problema:**
- Use o botão de teste
- Observe os logs no console
- Identifique o tipo de erro

### **2. Aplicar a Solução:**
- Siga as soluções específicas
- Teste novamente
- Verifique se resolveu

### **3. Validar a Solução:**
- Teste a conexão
- Verifique se os dados carregam
- Confirme que está funcionando

## 🚀 **Próximos Passos:**

1. **Execute o sistema**: `npm run dev`
2. **Abra o console** (F12)
3. **Vá para Admin** → Configuração da API
4. **Teste a conexão** com o botão 🔌
5. **Observe os logs** detalhados
6. **Identifique o problema** específico
7. **Aplique a solução** correspondente

## 📞 **Se Ainda Não Funcionar:**

### **Informações para Debug:**
- **Logs do console** (F12)
- **Resultado do teste** de conexão
- **Comando usado** para rodar a API
- **IP e porta** configurados
- **Mensagem de erro** específica

### **Comandos para Executar:**
- Status da API
- Configuração de rede
- Teste de conectividade
- Verificação de firewall

**Use o sistema de debug implementado para identificar o problema específico!** 🔍✨
