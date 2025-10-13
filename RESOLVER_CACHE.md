# 🧹 Como Resolver Problemas de Cache

## ❌ Problema: Dados Desatualizados

**Sintoma:** Clientes mostram dados diferentes mesmo conectados na mesma API.

**Causa:** Cache local (localStorage) com dados antigos.

---

## ✅ Solução Rápida (30 segundos)

### **Em CADA cliente com dados desatualizados:**

1. **Abra o sistema**

2. **Pressione F12** (DevTools)

3. **Aba "Console"**

4. **Cole este comando:**

```javascript
clearAllCache()
```

5. **Página vai recarregar automaticamente**

6. **Dados frescos da API!** ✅

---

## 🔧 Comandos Disponíveis (Console)

O sistema já vem com comandos prontos:

### **1. Limpar TODO o cache:**
```javascript
clearAllCache()
// Limpa tudo, mantém só a configuração da API
```

### **2. Limpar só dados (mantém config e auth):**
```javascript
clearDataCache()
// Mais seletivo, mantém login e configurações
```

### **3. Forçar reload completo:**
```javascript
forceReload()
// Limpa cache + recarrega página automaticamente
```

### **4. Diagnóstico de cache:**
```javascript
checkCacheHealth()
// Mostra o que está em cache e tamanho
```

### **5. Ver informações completas:**
```javascript
showCacheInfo()
// Detalhes completos do cache
```

---

## 🎯 Cenários Comuns

### **Cenário 1: Dados diferentes entre clientes**

```javascript
// Em TODOS os clientes:
clearAllCache()
```

### **Cenário 2: Após mudar servidor**

```javascript
// Sistema já detecta automaticamente, mas pode forçar:
forceReload()
```

### **Cenário 3: Verificar se tem cache problemático**

```javascript
checkCacheHealth()
// Mostra diagnóstico completo
```

---

## 🚀 Evitar Problema no Futuro

### **Opção 1: Limpar cache ao iniciar (temporário)**

No console, ao abrir o sistema:

```javascript
// Força dados frescos sempre
clearDataCache()
```

### **Opção 2: Desabilitar cache (desenvolvimento)**

Se estiver desenvolvendo/testando, pode desabilitar o cache:

```javascript
// No console:
localStorage.setItem('disable_cache', 'true');
location.reload();
```

Para reativar:
```javascript
localStorage.removeItem('disable_cache');
location.reload();
```

---

## 🔍 Verificar Estado Atual

### **Ver o que está em cache:**

```javascript
checkCacheHealth()
```

**Exemplo de saída:**
```
📊 DIAGNÓSTICO DE CACHE

Chaves de cache encontradas: 3
   • pedidos_cache: 15.32 KB
   • clientes_cache: 8.45 KB
   • last_sync: 0.05 KB

💡 Para limpar o cache, execute:
   clearAllCache()
```

### **Ver configuração da API:**

```javascript
showCacheInfo()
```

---

## ⚠️ Importante

### **O que NÃO é apagado ao limpar cache:**

✅ Configuração da API (`api_config`)  
✅ Token de autenticação (se houver)  
✅ Dados do usuário logado  

**Ou seja:** Limpar cache é **SEGURO** e não vai deslogar ou desconfigurar! ✅

---

## 🧪 Teste

### **Depois de limpar o cache:**

1. Abra o console (`F12`)

2. Deve ver:
```
🚀 Sistema de Fichas - Iniciando...
📋 Configuração carregada (fonte: arquivo):
   ├─ API URL: http://192.168.15.3:8000
   
🧪 Testando conexão com: http://192.168.15.3:8000
✅ Conexão com API bem-sucedida!
```

3. Dados devem estar **sincronizados** com o servidor! ✅

---

## 📱 Interface Visual (Futuro)

Futuramente pode adicionar um botão na interface:

```jsx
<button onClick={() => {
  if (confirm('Limpar cache e recarregar dados?')) {
    window.forceReload();
  }
}}>
  🔄 Atualizar Dados
</button>
```

---

## 🎯 Checklist de Troubleshooting

Quando tiver dados inconsistentes:

- [ ] 1. Verificar se API está rodando
- [ ] 2. Verificar IP de conexão (`showConfigInfo()`)
- [ ] 3. Verificar estado do cache (`checkCacheHealth()`)
- [ ] 4. Limpar cache (`clearAllCache()`)
- [ ] 5. Recarregar página
- [ ] 6. Verificar se dados aparecem corretos

---

## 💡 Dica Profissional

**Crie um atalho de teclado** para limpar cache rapidamente:

No console, salve isso:

```javascript
// Atalho: Ctrl+Shift+R para limpar cache
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.shiftKey && e.key === 'R') {
    e.preventDefault();
    console.log('🔄 Limpando cache...');
    clearAllCache();
  }
});
```

Agora `Ctrl+Shift+R` limpa o cache instantaneamente! ⚡

---

## 📊 Resumo Rápido

**Problema:** Dados desatualizados  
**Causa:** Cache local  
**Solução:** `clearAllCache()` no console  
**Resultado:** Dados frescos da API! ✅

---

*Atualizado em: 13/10/2025*  
*Sistema com controle de cache implementado!*

