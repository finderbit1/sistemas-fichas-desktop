# 📁 Configuração via Arquivo `rede.conf`

## ✅ Solução Profissional

Agora o sistema usa um **arquivo de configuração** ao invés de localStorage!

### ✨ Vantagens:
- ✅ **Fácil de distribuir**: Apenas edite um arquivo
- ✅ **Versionável**: Pode usar Git
- ✅ **Centralizad**: Uma configuração para todo o sistema
- ✅ **Profissional**: Padrão da indústria
- ✅ **Sem necessidade de interface**: Configure via editor de texto

---

## 📍 Localização do Arquivo

```
sistemas-fichas-desktop/
  └── public/
      └── rede.conf  ← ARQUIVO DE CONFIGURAÇÃO
```

---

## 📝 Formato do Arquivo

```conf
# ⚙️ CONFIGURAÇÃO DE REDE - Sistema de Fichas

# URL do servidor da API
API_URL=http://192.168.15.6:8000

# Timeout das requisições (ms)
API_TIMEOUT=10000

# Número de tentativas
API_RETRIES=3
```

---

## 🚀 Como Usar

### 1. **Editar o Arquivo**

Abra `public/rede.conf` em qualquer editor de texto:

```bash
nano public/rede.conf
# ou
code public/rede.conf
# ou
vim public/rede.conf
```

### 2. **Alterar o IP do Servidor**

```conf
# Era assim:
API_URL=http://localhost:8000

# Mude para o IP do seu servidor:
API_URL=http://192.168.15.6:8000
```

### 3. **Salvar e Recarregar**

**Opção A - Recarregar página:**
- Pressione `F5` ou `Ctrl+R`
- O sistema lê o arquivo automaticamente

**Opção B - Botão na interface:**
- Vá em **Admin → Configurações do Sistema**
- Clique em **"Recarregar rede.conf"**
- ✅ Pronto!

---

## 🔄 Prioridade de Configuração

O sistema tenta carregar nesta ordem:

1. ✅ **`public/rede.conf`** (primeira opção)
2. ⚠️ **localStorage** (fallback se arquivo não existir)
3. 🔧 **Padrão** (http://192.168.15.6:8000)

---

## 📊 Ver Fonte da Configuração

Na interface **Admin → Configurações**, veja:

```
┌─────────────────────────────────────┐
│ Informações da Conexão              │
├─────────────────────────────────────┤
│ URL Atual: http://192.168.15.6:8000 │
│ Fonte: rede.conf                    │ ← Aqui mostra a fonte!
│ Status: Conectado                   │
│ Cache: 5 itens (23.4 KB)            │
└─────────────────────────────────────┘
```

**Possíveis fontes:**
- `rede.conf` - Carregado do arquivo ✅
- `localStorage (fallback)` - Arquivo não encontrado
- `padrão (fallback)` - Nenhuma configuração

---

## 🌐 Distribuir para Clientes

### Método 1: Copiar o Arquivo

1. Configure o `rede.conf` no servidor principal
2. Copie para os outros computadores:

```bash
# No servidor
scp public/rede.conf usuario@cliente:/caminho/do/sistema/public/

# Ou via compartilhamento de rede
cp public/rede.conf /mnt/compartilhado/
```

### Método 2: Script de Instalação

Crie um script `setup-rede.sh`:

```bash
#!/bin/bash

# IP do servidor (altere aqui)
SERVER_IP="192.168.15.6"

# Criar arquivo de configuração
cat > public/rede.conf << EOF
# ⚙️ CONFIGURAÇÃO DE REDE
API_URL=http://${SERVER_IP}:8000
API_TIMEOUT=10000
API_RETRIES=3
EOF

echo "✅ Configuração criada para ${SERVER_IP}"
```

Execute em cada cliente:
```bash
chmod +x setup-rede.sh
./setup-rede.sh
```

---

## 🔧 Configurações Disponíveis

| Parâmetro | Descrição | Padrão | Exemplo |
|-----------|-----------|--------|---------|
| `API_URL` | URL do servidor | http://192.168.15.6:8000 | http://10.0.0.50:8000 |
| `API_TIMEOUT` | Timeout em ms | 10000 | 15000 |
| `API_RETRIES` | Tentativas | 3 | 5 |

---

## 🐛 Troubleshooting

### Problema: Arquivo não é lido

**Solução 1**: Verifique se está em `public/rede.conf`
```bash
ls -la public/rede.conf
```

**Solução 2**: Verifique o console do navegador (F12)
```javascript
// Deve mostrar:
✅ Configuração de rede carregada: http://192.168.15.6:8000
📁 Fonte: rede.conf
```

**Solução 3**: Use o botão "Recarregar rede.conf"
- Admin → Configurações → **[📄 Recarregar rede.conf]**

### Problema: Mudanças não aplicam

1. **Limpe o cache do navegador**: `Ctrl + Shift + Delete`
2. **Force reload**: `Ctrl + Shift + R`
3. **Use o botão**: "Recarregar rede.conf"

### Problema: Arquivo com erro de sintaxe

Formato correto:
```conf
# Comentário (começa com #)
CHAVE=valor

# SEM espaços ao redor do =
✅ API_URL=http://192.168.15.6:8000
❌ API_URL = http://192.168.15.6:8000
```

---

## 📱 Integração com Interface

### Botões Disponíveis:

1. **📄 Recarregar rede.conf**
   - Relê o arquivo sem recarregar a página
   - Atualiza configuração instantaneamente

2. **🗑️ Limpar Cache**
   - Limpa dados em cache
   - Força buscar dados novos

3. **🔄 Restaurar Padrão**
   - Volta para configuração padrão
   - Ignora arquivo e localStorage

4. **💾 Salvar Configuração**
   - Salva no localStorage (fallback)
   - Útil se quiser sobrescrever o arquivo

---

## 🔍 Debug via Console

```javascript
// Ver configuração atual
window.networkConfig.current()

// Recarregar do arquivo
await window.networkConfig.reload()

// Verificar fonte
window.networkConfig.current().source
```

---

## 📋 Exemplo de Deployment

### Cenário: 10 computadores na rede

1. **No servidor principal** (192.168.15.6):
   ```bash
   # Descobrir IP
   ip addr show | grep "inet " | grep -v 127.0.0.1
   
   # Iniciar API
   cd src-api-python/api-sgp
   ./start.sh
   ```

2. **Criar arquivo de configuração**:
   ```bash
   cat > public/rede.conf << EOF
   API_URL=http://192.168.15.6:8000
   API_TIMEOUT=10000
   API_RETRIES=3
   EOF
   ```

3. **Distribuir para clientes**:
   ```bash
   # Via SSH
   for i in {1..10}; do
     scp public/rede.conf cliente${i}:/path/to/app/public/
   done
   
   # Ou crie um instalador
   tar czf config.tar.gz public/rede.conf
   ```

4. **Nos clientes**:
   ```bash
   # Descompactar
   tar xzf config.tar.gz
   
   # Iniciar sistema
   npm run dev
   ```

✅ **Pronto!** Todos conectados automaticamente!

---

## 🎯 Comparação: Antes vs Agora

### ❌ Antes (localStorage):
```
1. Abrir cada navegador
2. F12 → Console
3. Colar código JavaScript
4. Recarregar página
5. Repetir em cada máquina
```

### ✅ Agora (rede.conf):
```
1. Editar public/rede.conf
2. Distribuir arquivo
3. Pronto! ✨
```

---

## 🔐 Segurança

- ✅ Arquivo lido apenas do servidor (não aceita URLs externas)
- ✅ Validação de sintaxe
- ✅ Fallback seguro em caso de erro
- ✅ Não executa código (apenas lê configuração)

---

## 📚 Arquivos Relacionados

| Arquivo | Descrição |
|---------|-----------|
| `public/rede.conf` | ⭐ Arquivo de configuração |
| `src/utils/configLoader.js` | Leitor de configuração |
| `src/main.jsx` | Carrega config ao iniciar |
| `src/services/api.js` | Usa configuração na API |
| `src/components/ServerConfig.jsx` | Interface de gerenciamento |

---

## ✨ Próximos Passos

1. ✅ Edite `public/rede.conf` com o IP do seu servidor
2. ✅ Distribua o arquivo para os clientes
3. ✅ Recarregue o sistema (F5)
4. ✅ Verifique em Admin → Configurações se mostra "Fonte: rede.conf"
5. ✅ Teste criando um pedido!

---

**Data**: 08/10/2025  
**Versão**: 4.0.0 - Config File Based  
**Status**: ✅ Implementado e Documentado

