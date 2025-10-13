# ⚡ Como Usar com Tauri - Guia Rápido

## 🎯 O Sistema Funciona com Tauri? **SIM!** ✅

O sistema foi adaptado para funcionar **perfeitamente** com Tauri Desktop App!

---

## 🚀 Mudanças Necessárias (3 minutos)

### **1. Usar o configLoaderTauri.js**

Em `src/main.jsx`, trocar o import:

**Antes:**
```javascript
import { loadApiConfig } from './utils/configLoader';
```

**Depois:**
```javascript
import { loadApiConfig } from './utils/configLoaderTauri';
```

**OU** usar detecção automática:

```javascript
// Detecta automaticamente se está em Tauri ou Web
import { loadApiConfig } from './utils/configLoaderTauri';
// Funciona em ambos!
```

### **2. Editar Configuração**

Editar o arquivo criado em:
```
src-tauri/resources/api-config.json
```

Alterar para o IP do seu servidor:
```json
{
  "apiURL": "http://192.168.1.100:8000",
  "wsURL": "ws://192.168.1.100:8000"
}
```

### **3. Pronto!** 🎉

O `tauri.conf.json` já foi atualizado automaticamente!

---

## 🧪 Testar

### **Modo Desenvolvimento:**
```bash
npm run tauri dev
```

O app irá:
1. ✅ Ler `src-tauri/resources/api-config.json`
2. ✅ Configurar API automaticamente
3. ✅ Conectar no servidor
4. ✅ Funcionar!

### **Build para Produção:**
```bash
npm run tauri build
```

Gera instalador `.msi` com configuração incluída!

---

## 📊 Como Funciona

```
Tauri Desktop App inicia
         ↓
Lê src-tauri/resources/api-config.json
         ↓
Configura API: http://192.168.1.100:8000
         ↓
Conecta WebSocket: ws://192.168.1.100:8000
         ↓
✅ Sistema pronto!
```

---

## 🔄 Mudou o IP do Servidor?

### **Opção 1: Antes do Build**
1. Editar `src-tauri/resources/api-config.json`
2. Build novo instalador
3. Distribuir para os clientes

### **Opção 2: Depois da Instalação**

O usuário pode editar em:
```
C:\Users\{USER}\AppData\Roaming\com.finderbit.sistema\api-config.json
```

**OU** criar uma tela de configurações no app (ver `CONFIGURACAO_TAURI.md`)

---

## ✅ Vantagens

| Recurso | Status |
|---------|--------|
| **Leitura automática** | ✅ Sim |
| **Funciona em dev** | ✅ Sim |
| **Funciona em produção** | ✅ Sim |
| **Usuário pode mudar** | ✅ Sim (via appDataDir) |
| **Fallback inteligente** | ✅ Sim (localStorage) |
| **20+ clientes** | ✅ Sim |

---

## 📚 Documentação Completa

Para detalhes técnicos e configurações avançadas, veja:

- **`CONFIGURACAO_TAURI.md`** - Documentação completa
- **`src/utils/configLoaderTauri.js`** - Código fonte

---

## 🎉 Resultado

Com Tauri:
- ✅ Sistema funciona como desktop app
- ✅ Configuração incluída no instalador
- ✅ Usuário pode mudar IP via arquivo
- ✅ Possibilidade de criar UI de configuração
- ✅ Mesmo sistema de sincronização em tempo real
- ✅ 20 clientes conectados e sincronizados

**Sistema pronto para Tauri!** 🚀

---

*Última atualização: 13/10/2025*

