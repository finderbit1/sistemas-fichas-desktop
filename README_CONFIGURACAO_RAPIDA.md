# ⚡ Configuração Rápida - Arquivo de Configuração

## 🎯 Como Funciona

O sistema agora **lê automaticamente** um arquivo de configuração ao iniciar!

```
🖥️ Cliente inicia
     ↓
📄 Lê: public/config/api-config.json
     ↓
✅ Configura API automaticamente
     ↓
🚀 Pronto para usar!
```

---

## 📝 Passo a Passo (3 Minutos)

### 1. Editar o Arquivo de Configuração

Arquivo: `public/config/api-config.json`

```json
{
  "apiURL": "http://192.168.1.100:8000",
  "wsURL": "ws://192.168.1.100:8000",
  "timeout": 10000,
  "retries": 3
}
```

⚠️ **Trocar `192.168.1.100` pelo IP do seu servidor!**

### 2. Distribuir para os 20 Clientes

**Opção A - Cópia Simples:**
- Copiar a pasta do sistema
- Arquivo de config já vai junto!

**Opção B - Compartilhamento de Rede:**
- Servidor compartilha a pasta
- Clientes acessam via rede
- **UM arquivo**, **20 clientes!** ⭐

### 3. Pronto!

Abra o sistema em qualquer cliente e ele vai **automaticamente**:
- ✅ Ler o arquivo
- ✅ Configurar a API
- ✅ Conectar ao servidor
- ✅ Sincronizar em tempo real

---

## 🔄 Mudou o IP do Servidor?

**SUPER SIMPLES:**

1. Editar **UM arquivo:**
   ```
   public/config/api-config.json
   ```

2. Mudar o IP:
   ```json
   {
     "apiURL": "http://192.168.1.200:8000"  ← NOVO IP
   }
   ```

3. **Pronto!** Recarregar o sistema nos clientes 🎉

---

## 🌐 Cenário de Uso Real

### Sua Empresa:

```
🏢 Servidor Windows Server 2012
   IP: 192.168.1.100
   Pasta compartilhada: \\SERVIDOR\SistemaFichas\
        ↓
   config/api-config.json → { "apiURL": "http://192.168.1.100:8000" }
        ↓
   20 clientes leem o mesmo arquivo
        ↓
   TODOS conectam no servidor certo automaticamente!
```

### Vantagens:

✅ **Configuração única** - Edita 1 vez, funciona em 20  
✅ **Fácil manutenção** - Mudou IP? 1 arquivo apenas  
✅ **Sem intervenção** - Clientes leem automaticamente  
✅ **Fallback inteligente** - Se arquivo faltar, usa localhost  
✅ **Testado antes de usar** - Sistema testa conexão primeiro  

---

## 🛠️ Estrutura de Arquivos

```
seu-sistema/
├── public/
│   └── config/
│       ├── api-config.json          ← PRINCIPAL (configurar este)
│       └── api-config.example.json  ← Exemplo
│
├── src/
│   ├── utils/
│   │   └── configLoader.js         ← Sistema que lê o arquivo
│   ├── services/
│   │   └── api.js                  ← API usa a configuração
│   └── main.jsx                    ← Carrega ao iniciar
│
└── dist/                           ← Após build
    └── config/
        └── api-config.json         ← Copiar para cada cliente
```

---

## 🧪 Testar se Está Funcionando

### No navegador (F12 → Console):

```javascript
// Ver configuração atual
showConfigInfo()

// Deve mostrar:
// 📋 Configuração carregada (fonte: arquivo)
//    ├─ API URL: http://192.168.1.100:8000
//    └─ WebSocket URL: ws://192.168.1.100:8000
```

### Mensagens esperadas ao iniciar:

```
🚀 Sistema de Fichas - Iniciando...

🔍 Carregando configuração de: /config/api-config.json
✅ Configuração carregada do arquivo

📋 Configuração carregada (fonte: arquivo):
   ├─ API URL: http://192.168.1.100:8000
   ├─ WebSocket URL: ws://192.168.1.100:8000
   ├─ Timeout: 10000 ms
   └─ Retries: 3

🧪 Testando conexão com: http://192.168.1.100:8000
✅ Conexão com API bem-sucedida!

✅ Configuração carregada com sucesso!
🎨 Renderizando aplicação...
```

---

## ❓ FAQ

### **P: E se o arquivo não existir?**
R: Sistema usa `localhost:8000` como padrão.

### **P: Posso configurar manualmente via código?**
R: Sim! Console:
```javascript
updateApiConfig({
  apiURL: 'http://192.168.1.100:8000',
  wsURL: 'ws://192.168.1.100:8000'
})
```

### **P: Como limpar a configuração?**
R: Console:
```javascript
clearConfig()  // Volta ao padrão
```

### **P: Preciso reconfigurar se servidor mudar de IP?**
R: **NÃO!** Apenas edite o arquivo `config/api-config.json` e recarregue.

### **P: Funciona offline?**
R: O arquivo é lido localmente, mas precisa do servidor para funcionar.

### **P: Suporta domínio ao invés de IP?**
R: Sim! Use `http://api.empresa.local:8000`

---

## 📚 Documentação Completa

- **Instalação Detalhada:** `GUIA_INSTALACAO_CLIENTES.md`
- **Scripts de Instalação:** `SCRIPT_INSTALACAO.md`
- **Sistema de Sincronização:** `documentation/SISTEMA_SINCRONIZACAO_TEMPO_REAL.md`

---

## ✅ Checklist Final

Antes de colocar em produção:

```
Servidor:
  [ ] IP fixo configurado
  [ ] Arquivo config/api-config.json com IP correto
  [ ] API rodando na porta 8000
  [ ] Firewall liberado

Cada Cliente:
  [ ] Sistema instalado
  [ ] Arquivo config/api-config.json presente
  [ ] Console mostra "✅ Configuração carregada do arquivo"
  [ ] Conexão com API bem-sucedida

Teste Final:
  [ ] Criar pedido em 1 cliente
  [ ] Ver aparecer instantaneamente nos outros 19
  [ ] ✅ Sistema 100% sincronizado!
```

---

## 🎉 Resultado Final

Com essa configuração:

- ✅ **1 servidor** rodando a API
- ✅ **1 arquivo** de configuração
- ✅ **20 clientes** conectados e sincronizados
- ✅ **Mudou IP?** Edita 1 arquivo, funciona em todos
- ✅ **Zero configuração manual** nos clientes
- ✅ **100% automático** ao iniciar

**Sistema enterprise-grade pronto para produção!** 🚀

---

*Atualizado em: 13/10/2025*  
*Sistema testado e funcionando!*

