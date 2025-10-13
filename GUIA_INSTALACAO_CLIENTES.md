# 📦 Guia de Instalação - Sistema de Fichas

## 🎯 Visão Geral

Este guia explica como instalar e configurar o Sistema de Fichas em **20 computadores clientes** conectados a um **servidor central Windows Server 2012**.

---

## 🏗️ Arquitetura do Sistema

```
        🖥️ SERVIDOR CENTRAL (Windows Server 2012)
              192.168.1.100:8000
                     │
        ┌────────────┴────────────┐
        │   Rede Local Empresa    │
        └────────────┬────────────┘
                     │
    ┌────────────────┼────────────────┐
    │                │                │
🖥️ Cliente 1    🖥️ Cliente 2    ... 🖥️ Cliente 20
  (Totem 1)      (Painel Admin)     (Totem N)
```

---

## 📋 Pré-requisitos

### No Servidor Central:
- ✅ Windows Server 2012
- ✅ Python 3.8+ instalado
- ✅ Porta 8000 liberada no firewall
- ✅ IP fixo configurado (ex: 192.168.1.100)

### Nos Clientes:
- ✅ Windows 7/10/11
- ✅ Acesso à rede local
- ✅ Navegador moderno (Chrome, Edge, Firefox)

---

## 🚀 Instalação

### Passo 1: Preparar o Servidor Central

#### 1.1. Configurar IP Fixo

No Windows Server:
1. Painel de Controle → Rede e Internet
2. Central de Rede e Compartilhamento
3. Alterar configurações do adaptador
4. Botão direito na placa de rede → Propriedades
5. IPv4 → Propriedades
6. Marcar: **"Usar o seguinte endereço IP"**
   ```
   IP:         192.168.1.100
   Máscara:    255.255.255.0
   Gateway:    192.168.1.1
   ```
7. Anotar o IP: `192.168.1.100` ← **IMPORTANTE!**

#### 1.2. Liberar Porta no Firewall

```powershell
# PowerShell como Administrador
New-NetFirewallRule -DisplayName "API Fichas" -Direction Inbound -LocalPort 8000 -Protocol TCP -Action Allow
```

#### 1.3. Iniciar a API

```bash
cd C:\sistemas-fichas-desktop\src-api-python\api-sgp
python main.py
```

Aguarde ver:
```
✅ Banco de dados inicializado
INFO: Uvicorn running on http://0.0.0.0:8000
```

---

### Passo 2: Preparar Arquivo de Configuração

#### 2.1. Criar o Arquivo de Configuração Principal

No servidor, edite o arquivo:
```
C:\sistemas-fichas-desktop\public\config\api-config.json
```

**Conteúdo:**
```json
{
  "apiURL": "http://192.168.1.100:8000",
  "wsURL": "ws://192.168.1.100:8000",
  "timeout": 10000,
  "retries": 3,
  "description": "Configuração da API Central - Sistema de Fichas",
  "version": "1.0.0",
  "updated": "2025-10-13T10:00:00Z"
}
```

⚠️ **IMPORTANTE:** Substitua `192.168.1.100` pelo IP real do seu servidor!

---

### Passo 3: Instalar nos Clientes

Você tem **3 opções** de instalação nos clientes:

#### **Opção A: Instalação Manual** (Recomendado para poucos clientes)

1. Copiar a pasta do sistema para cada cliente
2. Navegar até a pasta
3. Editar `public/config/api-config.json` com o IP do servidor
4. Executar `npm run dev` ou build

#### **Opção B: Pasta Compartilhada** (Recomendado para muitos clientes) ⭐

1. **No Servidor:**
   ```
   Compartilhar pasta: C:\sistemas-fichas-desktop\
   Como: \\SERVIDOR\SistemaFichas
   Permissões: Leitura para Todos
   ```

2. **Nos Clientes:**
   - Mapear unidade de rede: `Z:\` → `\\SERVIDOR\SistemaFichas`
   - Criar atalho para `Z:\dist\index.html` (após build)
   - Sistema lê automaticamente `Z:\config\api-config.json`

#### **Opção C: Build + Cópia** (Recomendado para produção) 🚀

1. **No Servidor, fazer build:**
   ```bash
   cd C:\sistemas-fichas-desktop
   npm run build
   ```

2. **Copiar pasta `dist` para cada cliente:**
   ```
   C:\SistemaFichas\
   ```

3. **Copiar arquivo de configuração:**
   ```
   C:\SistemaFichas\config\api-config.json
   ```

4. **Criar atalho:**
   - Botão direito → Novo → Atalho
   - Destino: `C:\SistemaFichas\index.html`
   - Nome: "Sistema de Fichas"

---

## ⚙️ Configuração Automática ao Iniciar

O sistema **automaticamente**:

1. ✅ Lê o arquivo `config/api-config.json`
2. ✅ Configura a URL da API
3. ✅ Conecta ao WebSocket
4. ✅ Testa a conexão
5. ✅ Salva no localStorage (backup)

**Você verá no console do navegador:**

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
💾 Configuração salva no localStorage

✅ Configuração carregada com sucesso!
🎨 Renderizando aplicação...
```

---

## 🔧 Mudando o IP do Servidor

Quando o servidor mudar de IP:

### Opção 1: Atualizar o Arquivo (Recomendado) ⭐

1. Editar **UM ÚNICO arquivo:**
   ```
   C:\sistemas-fichas-desktop\public\config\api-config.json
   ```

2. Alterar o IP:
   ```json
   {
     "apiURL": "http://192.168.1.200:8000",  ← NOVO IP
     "wsURL": "ws://192.168.1.200:8000"       ← NOVO IP
   }
   ```

3. **Pronto!** Todos os clientes pegam o novo IP ao recarregar 🎉

### Opção 2: Atualizar Via Interface (Futuro)

Interface admin para propagar via WebSocket (em desenvolvimento).

---

## ✅ Verificar Instalação

### No Servidor:

```bash
# Verificar se API está rodando
curl http://192.168.1.100:8000/health

# Deve retornar:
# {"status":"healthy","version":"1.0.0"}
```

### Nos Clientes:

1. Abrir o sistema
2. Pressionar `F12` (Console do navegador)
3. Verificar mensagens:
   ```
   ✅ Configuração carregada do arquivo
   ✅ Conexão com API bem-sucedida!
   ```

4. Testar comandos:
   ```javascript
   // Ver configuração atual
   showConfigInfo()
   
   // Atualizar manualmente (se necessário)
   updateApiConfig({
     apiURL: 'http://192.168.1.100:8000',
     wsURL: 'ws://192.168.1.100:8000'
   })
   ```

---

## 🐛 Problemas Comuns

### ❌ "Não foi possível carregar config/api-config.json"

**Causa:** Arquivo não existe ou está no lugar errado

**Solução:**
1. Verificar se existe: `public/config/api-config.json`
2. Verificar permissões de leitura
3. Se não existir, criar com o conteúdo correto

### ❌ "Não foi possível conectar na API"

**Causa:** Servidor não está rodando ou IP está errado

**Solução:**
1. Verificar se servidor está rodando
2. Testar: `curl http://IP:8000/health`
3. Verificar firewall do servidor
4. Verificar IP no arquivo de config

### ❌ "WebSocket connection failed"

**Causa:** Firewall bloqueando WebSocket

**Solução:**
1. Liberar porta 8000 no firewall
2. Verificar se `wsURL` está correto
3. Testar conexão HTTP primeiro

---

## 📊 Estrutura de Pastas

```
C:\sistemas-fichas-desktop\
├── public\
│   └── config\
│       ├── api-config.json        ← Configuração principal
│       └── api-config.example.json
├── src\
│   ├── utils\
│   │   └── configLoader.js        ← Sistema de carga
│   ├── services\
│   │   └── api.js                 ← API configurada
│   └── main.jsx                   ← Inicia sistema
└── dist\                          ← Após build
    ├── index.html
    ├── assets\
    └── config\
        └── api-config.json
```

---

## 📞 Suporte

### Debug via Console:

```javascript
// Ver configuração atual
showConfigInfo()

// Atualizar configuração
updateApiConfig({
  apiURL: 'http://192.168.1.100:8000',
  wsURL: 'ws://192.168.1.100:8000'
})

// Limpar configuração (volta ao padrão)
clearConfig()
```

---

## 🎯 Checklist de Instalação

### Servidor Central:
- [ ] IP fixo configurado
- [ ] Porta 8000 liberada no firewall
- [ ] API rodando sem erros
- [ ] Arquivo `config/api-config.json` atualizado com IP correto

### Cada Cliente:
- [ ] Sistema instalado/copiado
- [ ] Arquivo `config/api-config.json` presente
- [ ] IP do servidor correto no arquivo
- [ ] Console mostra "✅ Conexão bem-sucedida"
- [ ] Interface carrega corretamente

---

## 🚀 Próximos Passos

Após instalação:
1. ✅ Testar sincronização entre clientes
2. ✅ Criar pedido em um cliente
3. ✅ Verificar se aparece instantaneamente nos outros
4. ✅ Treinar equipe

**Sistema pronto para produção!** 🎉

---

*Última atualização: 13/10/2025*  
*Versão do documento: 1.0.0*

