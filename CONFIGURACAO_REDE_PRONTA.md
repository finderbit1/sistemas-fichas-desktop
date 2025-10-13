# ✅ Configuração de Rede - PRONTA!

## 🎯 Configuração Atual

**Servidor API:** `192.168.15.3:8000` (Linux)

Todos os arquivos foram atualizados para usar este IP automaticamente!

---

## 🚀 Como Usar (SUPER SIMPLES!)

### **Em QUALQUER Cliente (Linux ou Windows):**

```bash
pnpm run tauri dev
```

**Pronto!** O sistema **automaticamente** conecta no servidor `192.168.15.3:8000`! ✅

---

## 📦 O Que Foi Configurado

Todos esses arquivos já têm o IP correto:

✅ `config/api-config.json` → `192.168.15.3:8000`  
✅ `src-tauri/resources/api-config.json` → `192.168.15.3:8000`  
✅ `src/utils/configLoader.js` → `192.168.15.3:8000`  
✅ `src/utils/configLoaderTauri.js` → `192.168.15.3:8000`  

---

## 🔄 Se Já Tinha Testado Antes (Primeira Vez)

Se você já abriu o sistema antes com `localhost`, precisa limpar o cache **UMA VEZ**:

### **Opção 1: Console do Navegador (Mais Rápido)**

Pressione `F12` → Console → Cole:

```javascript
localStorage.removeItem('api_config');
location.reload();
```

### **Opção 2: DevTools (Mais Completo)**

1. `F12` → Aba **Application**
2. **Storage** → **Local Storage**
3. Clique com botão direito → **Clear**
4. Recarregue (`F5`)

---

## ✅ Resultado

Agora em **TODOS os clientes**:

```
🚀 Sistema de Fichas - Iniciando...

📋 Configuração carregada (fonte: arquivo):
   ├─ API URL: http://192.168.15.3:8000
   ├─ WebSocket URL: ws://192.168.15.3:8000
   
🧪 Testando conexão com: http://192.168.15.3:8000
✅ Conexão com API bem-sucedida!

✅ Configuração carregada com sucesso!
🎨 Renderizando aplicação...
```

---

## 🌐 Arquitetura Final

```
┌─────────────────────────────────┐
│  🖥️ Servidor Linux              │
│  IP: 192.168.15.3               │
│  API: porta 8000                │
│                                 │
│  Comando:                       │
│  uv run uvicorn main:app \     │
│    --reload --host 0.0.0.0 \   │
│    --port 8000                  │
└────────────┬────────────────────┘
             │
             │ Rede Local
             │
    ┌────────┴────────┐
    │                 │
    ▼                 ▼
┌─────────┐      ┌─────────┐
│Windows 1│      │Windows 2│
│         │      │         │
│pnpm run │      │pnpm run │
│tauri dev│      │tauri dev│
│         │      │         │
│Conecta  │      │Conecta  │
│192.168  │      │192.168  │
│.15.3    │      │.15.3    │
└─────────┘      └─────────┘
```

---

## 🔧 Se o IP do Servidor Mudar

Se no futuro o servidor Linux tiver outro IP, edite **estes 2 arquivos**:

1. `config/api-config.json`
2. `src-tauri/resources/api-config.json`

Altere de `192.168.15.3` para o novo IP.

Commit e distribua para os clientes.

---

## 🎉 Pronto!

Sistema configurado para funcionar em rede local com:

- ✅ 1 servidor Linux (API)
- ✅ N clientes (Windows/Linux)
- ✅ Sincronização em tempo real
- ✅ Zero configuração manual
- ✅ Apenas `pnpm run tauri dev` e funciona!

**Sistema pronto para uso!** 🚀

---

*Configurado em: 13/10/2025*  
*Servidor: 192.168.15.3:8000*

