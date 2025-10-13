# 🖥️ Configuração para Tauri Desktop

## 🎯 Como Funciona com Tauri

O sistema foi adaptado para funcionar perfeitamente com Tauri Desktop App!

```
┌─────────────────────────────────────────┐
│     TAURI DESKTOP APP                   │
│                                         │
│  1. Lê arquivo do bundle (resourceDir)  │
│  2. Ou lê de appDataDir                 │
│  3. Ou usa localStorage                 │
│  4. Ou usa padrão                       │
└─────────────────────────────────────────┘
```

---

## 📦 Arquivos Necessários

### **1. Usar configLoaderTauri.js**

Ao invés do `configLoader.js` normal, use a versão para Tauri:

```javascript
// src/main.jsx
import { loadApiConfig } from './utils/configLoaderTauri';
```

### **2. Incluir arquivo no bundle do Tauri**

Edite `src-tauri/tauri.conf.json`:

```json
{
  "bundle": {
    "resources": [
      "resources/*"
    ]
  }
}
```

### **3. Criar diretório de recursos**

```bash
mkdir -p src-tauri/resources
```

### **4. Copiar arquivo de configuração**

```bash
cp config/api-config.json src-tauri/resources/api-config.json
```

---

## 🔧 Configuração Completa

### **Passo 1: Atualizar tauri.conf.json**

```json
{
  "$schema": "https://schema.tauri.app/config/2",
  "productName": "Sistema de Fichas",
  "version": "1.0.0",
  "identifier": "com.finderbit.sistema",
  "build": {
    "beforeDevCommand": "npm run dev",
    "devUrl": "http://localhost:1420",
    "beforeBuildCommand": "npm run build",
    "frontendDist": "../dist"
  },
  "app": {
    "windows": [
      {
        "title": "Sistema de Fichas V1.0",
        "width": 1280,
        "height": 720,
        "resizable": true,
        "fullscreen": false
      }
    ],
    "security": {
      "csp": null
    }
  },
  "bundle": {
    "active": true,
    "targets": ["msi"],
    "icon": [
      "icons/32x32.png",
      "icons/128x128.png",
      "icons/128x128@2x.png",
      "icons/icon.icns",
      "icons/icon.ico"
    ],
    "resources": [
      "resources/*"
    ]
  }
}
```

### **Passo 2: Estrutura de diretórios**

```
src-tauri/
├── resources/
│   └── api-config.json     ← Arquivo de configuração
├── src/
│   └── main.rs
├── tauri.conf.json
└── Cargo.toml
```

### **Passo 3: Arquivo api-config.json**

```json
{
  "apiURL": "http://192.168.1.100:8000",
  "wsURL": "ws://192.168.1.100:8000",
  "timeout": 10000,
  "retries": 3,
  "description": "Configuração da API Central",
  "version": "1.0.0",
  "updated": "2025-10-13T00:00:00Z"
}
```

---

## 🚀 Como Usar

### **Em Desenvolvimento:**

```bash
# O sistema automaticamente:
# 1. Tenta ler de src-tauri/resources/api-config.json
# 2. Fallback para fetch (modo web)
# 3. Fallback para localStorage
npm run dev
```

### **Build para Produção:**

```bash
# 1. Editar configuração
nano src-tauri/resources/api-config.json

# 2. Build
npm run tauri build

# 3. O arquivo será incluído no instalador .msi
```

---

## 📍 Onde o Arquivo Fica?

### **Durante Desenvolvimento:**
```
src-tauri/resources/api-config.json
```

### **Depois da Instalação (Windows):**
```
# Resource Dir (leitura):
C:\Program Files\Sistema de Fichas\resources\api-config.json

# App Data Dir (escrita):
C:\Users\{USER}\AppData\Roaming\com.finderbit.sistema\api-config.json
```

---

## 🔄 Mudou o IP do Servidor?

### **Opção 1: Atualizar via Interface (Recomendado)**

Criar uma tela de configurações no app:

```javascript
import { updateApiConfig } from './utils/configLoaderTauri';

async function salvarNovaConfiguracao() {
  await updateApiConfig({
    apiURL: 'http://192.168.1.200:8000',
    wsURL: 'ws://192.168.1.200:8000'
  });
  
  // Recarregar app
  window.location.reload();
}
```

### **Opção 2: Atualizar o Arquivo Manualmente**

No computador do usuário:

```
C:\Users\{USER}\AppData\Roaming\com.finderbit.sistema\api-config.json
```

Editar e reiniciar o app.

### **Opção 3: Redistribuir novo instalador**

1. Editar `src-tauri/resources/api-config.json`
2. Build novo instalador
3. Distribuir para os 20 clientes

---

## 🎨 Interface de Configuração (Exemplo)

```jsx
import React, { useState } from 'react';
import { updateApiConfig, getCurrentConfig } from '../utils/configLoaderTauri';

function ConfiguracaoServidor() {
  const currentConfig = getCurrentConfig();
  const [apiURL, setApiURL] = useState(currentConfig.apiURL);
  const [wsURL, setWsURL] = useState(currentConfig.wsURL);
  const [saving, setSaving] = useState(false);

  const handleSalvar = async () => {
    setSaving(true);
    try {
      await updateApiConfig({
        apiURL,
        wsURL: wsURL || apiURL.replace('http', 'ws')
      });
      
      alert('Configuração salva! Reiniciando aplicação...');
      
      // Recarregar
      window.location.reload();
    } catch (error) {
      alert('Erro ao salvar: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="config-servidor">
      <h2>🔧 Configuração do Servidor</h2>
      
      <div className="form-group">
        <label>URL da API:</label>
        <input
          type="text"
          value={apiURL}
          onChange={(e) => setApiURL(e.target.value)}
          placeholder="http://192.168.1.100:8000"
        />
      </div>
      
      <div className="form-group">
        <label>URL do WebSocket:</label>
        <input
          type="text"
          value={wsURL}
          onChange={(e) => setWsURL(e.target.value)}
          placeholder="ws://192.168.1.100:8000"
        />
      </div>
      
      <button onClick={handleSalvar} disabled={saving}>
        {saving ? 'Salvando...' : 'Salvar e Reiniciar'}
      </button>
      
      <p className="help-text">
        💡 Após salvar, o aplicativo irá reiniciar com a nova configuração.
      </p>
    </div>
  );
}

export default ConfiguracaoServidor;
```

---

## 🧪 Testar

### **Console do Tauri DevTools:**

```javascript
// Ver se está rodando em Tauri
isTauri()

// Ver configuração atual
showConfigInfo()

// Atualizar configuração
await updateApiConfig({
  apiURL: 'http://192.168.1.100:8000',
  wsURL: 'ws://192.168.1.100:8000'
})

// Limpar configuração
clearConfig()
```

---

## 📊 Comparação: Web vs Tauri

| Aspecto | Web (Browser) | Tauri (Desktop) |
|---------|---------------|-----------------|
| **Leitura de arquivo** | `fetch()` | Tauri FS API |
| **Localização** | `public/config/` | `resources/` ou `appDataDir` |
| **Escrita** | ❌ Não permite | ✅ Permite (appDataDir) |
| **Persistência** | localStorage | localStorage + FS |
| **Distribuição** | Servidor web | Bundle .msi |

---

## ✅ Vantagens da Solução Tauri

✅ **Configuração persistente** - Salva no sistema de arquivos  
✅ **Interface de configuração** - Usuário pode mudar via UI  
✅ **Sem servidor web** - Arquivo local no computador  
✅ **Fallback inteligente** - Múltiplas fontes de config  
✅ **Portável** - Instalador .msi contém tudo  

---

## 🎯 Fluxo Completo

```
1️⃣ DESENVOLVIMENTO
─────────────────
Developer edita:
  src-tauri/resources/api-config.json
     ↓
npm run dev
     ↓
App lê configuração automaticamente

2️⃣ BUILD
────────
npm run tauri build
     ↓
Gera instalador .msi com config incluída
     ↓
Distribui para os 20 clientes

3️⃣ INSTALAÇÃO NOS CLIENTES
──────────────────────────
Usuário instala .msi
     ↓
Arquivo copiado para:
  C:\Program Files\...\resources\
     ↓
App lê automaticamente ao iniciar

4️⃣ MUDOU O SERVIDOR? (Opções)
────────────────────────────

Opção A: Interface no app
  Admin → Configurações → Novo IP → Salvar
       ↓
  Salvo em appDataDir
       ↓
  App reinicia com novo IP

Opção B: Arquivo manual
  Editar em appDataDir
       ↓
  Reiniciar app

Opção C: Novo instalador
  Build novo .msi → Distribuir
```

---

## 📝 Checklist de Implementação

- [ ] Criar `src-tauri/resources/`
- [ ] Copiar `api-config.json` para resources
- [ ] Atualizar `tauri.conf.json` (adicionar resources)
- [ ] Usar `configLoaderTauri.js` ao invés de `configLoader.js`
- [ ] Atualizar imports em `main.jsx`
- [ ] Testar em modo dev (`npm run dev`)
- [ ] Build para produção (`npm run tauri build`)
- [ ] Testar instalador em máquina limpa
- [ ] Criar interface de configuração (opcional)
- [ ] Documentar para o time

---

## 🐛 Troubleshooting

### **"Arquivo não encontrado"**

Verificar:
1. Arquivo existe em `src-tauri/resources/api-config.json`?
2. `tauri.conf.json` tem `"resources": ["resources/*"]`?
3. Build foi feito depois de adicionar o arquivo?

### **"Configuração não persiste"**

Verificar:
1. App tem permissão de escrita em appDataDir?
2. Console mostra "💾 Configuração salva"?
3. Verificar em `C:\Users\...\AppData\Roaming\...`

### **"TAURI not defined"**

Em desenvolvimento, Tauri APIs só funcionam quando roda via `npm run tauri dev`.
Para `npm run dev` normal, usa fallback para fetch/localStorage.

---

## 🚀 Resultado Final

Com essa configuração:

- ✅ **Desenvolvimento**: Fácil testar com diferentes IPs
- ✅ **Produção**: Instalador contém configuração
- ✅ **Usuário**: Pode mudar IP via interface
- ✅ **Admin**: Pode redistribuir novo instalador
- ✅ **Robusto**: Múltiplos fallbacks
- ✅ **Automático**: Zero configuração manual

**Sistema pronto para Tauri!** 🎉

---

*Última atualização: 13/10/2025*  
*Testado com Tauri 2.x*

