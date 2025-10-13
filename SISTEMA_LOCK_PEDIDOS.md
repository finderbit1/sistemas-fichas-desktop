# 🔒 Sistema de Lock (Trava) de Pedidos

## 🔴 Problema Identificado

**Situação:**
- Cliente A vê pedido com 4 status marcados ✅✅✅✅
- Cliente B vê MESMO pedido com 3 status ✅✅✅
- Ambos conectados na mesma API
- **Causa:** Race condition - atualizações simultâneas

**Erro observado:**
```
ERROR: tuple index out of range
307 Temporary Redirect → 500 Internal Server Error
```

---

## ✅ Solução: Sistema de Lock Implementado

Criado `lock_manager.py` com sistema de trava de pedidos.

### **Como Funciona:**

```
1. Cliente A clica para mudar status
        ↓
2. Sistema TRAVA pedido por 30 segundos
        ↓
3. Cliente B tenta mudar
        ↓
4. ❌ Bloqueado: "Pedido sendo editado"
        ↓
5. Após 30s → Destrava automaticamente
        ↓
6. WebSocket notifica todos sobre lock/unlock
```

---

## 📦 Arquivos Criados

### **1. `lock_manager.py`** ✅
Sistema completo de lock com:

**Funcionalidades:**
- `try_lock(pedido_id, client_id)` - Tenta travar pedido
- `unlock(pedido_id, client_id)` - Destrava manualmente
- `is_locked(pedido_id)` - Verifica se está travado
- `get_lock_info(pedido_id)` - Info do lock
- `cleanup_expired()` - Remove locks expirados
- `force_unlock(pedido_id)` - Destrava forçado (admin)

**Características:**
- ⏱️ Lock expira em 30 segundos automaticamente
- 🔄 Mesmo cliente pode renovar seu próprio lock
- 🔐 Outro cliente não pode editar durante lock
- 🧹 Limpeza automática de locks expirados

---

## 🔧 Próximos Passos (Implementação Completa)

### **Passo 1: Integrar no Endpoint de Atualização**

Modificar `atualizar_pedido()` em `router.py`:

```python
from fastapi import Request

@router.patch("/{pedido_id}")
async def atualizar_pedido(
    pedido_id: int, 
    pedido_update: PedidoUpdate,
    request: Request,
    session: Session = Depends(get_session)
):
    # Obter ID do cliente (IP)
    client_id = request.client.host
    
    # Tentar travar pedido
    if not lock_manager.try_lock(pedido_id, client_id):
        # Pedido está travado por outro cliente
        lock_info = lock_manager.get_lock_info(pedido_id)
        raise HTTPException(
            status_code=423,  # Locked
            detail={
                "message": "Pedido está sendo editado por outro usuário",
                "locked_by": lock_info['locked_by'],
                "time_left": lock_info['time_left_seconds']
            }
        )
    
    try:
        # ... código de atualização existente ...
        
        # Notificar via WebSocket sobre o lock
        await ws_manager.broadcast({
            "type": "pedido_locked",
            "pedido_id": pedido_id,
            "locked_by": client_id,
            "time_left": 30
        }, resource_type="pedidos")
        
        return response
        
    finally:
        # Destravar ao finalizar (opcional - expira automaticamente)
        # lock_manager.unlock(pedido_id, client_id)
        pass
```

### **Passo 2: Criar Endpoint de Verificação**

```python
@router.get("/{pedido_id}/lock")
async def verificar_lock(pedido_id: int):
    """
    Verifica se um pedido está travado.
    """
    if lock_manager.is_locked(pedido_id):
        return lock_manager.get_lock_info(pedido_id)
    return {"locked": False}

@router.delete("/{pedido_id}/lock")
async def remover_lock(pedido_id: int, request: Request):
    """
    Remove lock manualmente (se for o dono ou admin).
    """
    client_id = request.client.host
    
    if lock_manager.unlock(pedido_id, client_id):
        return {"success": True, "message": "Lock removido"}
    
    raise HTTPException(
        status_code=403,
        detail="Você não tem permissão para remover este lock"
    )

@router.post("/{pedido_id}/lock/force")
async def forcar_remover_lock(pedido_id: int):
    """
    Remove lock forçadamente (admin only).
    """
    lock_manager.force_unlock(pedido_id)
    return {"success": True, "message": "Lock removido forçadamente"}
```

### **Passo 3: Frontend - Hook de Verificação**

Criar `usePedidoLock.js`:

```javascript
import { useState, useEffect } from 'react';
import api from '../services/api';

export function usePedidoLock(pedidoId) {
  const [isLocked, setIsLocked] = useState(false);
  const [lockInfo, setLockInfo] = useState(null);
  const [canEdit, setCanEdit] = useState(true);

  useEffect(() => {
    // Verificar lock ao montar
    checkLock();
    
    // Verificar a cada 5 segundos
    const interval = setInterval(checkLock, 5000);
    
    return () => clearInterval(interval);
  }, [pedidoId]);

  const checkLock = async () => {
    try {
      const { data } = await api.get(`/pedidos/${pedidoId}/lock`);
      
      if (data.locked) {
        setIsLocked(true);
        setLockInfo(data);
        setCanEdit(false);
      } else {
        setIsLocked(false);
        setLockInfo(null);
        setCanEdit(true);
      }
    } catch (error) {
      console.error('Erro ao verificar lock:', error);
    }
  };

  return { isLocked, lockInfo, canEdit, checkLock };
}
```

### **Passo 4: Frontend - Componente Visual**

```jsx
function PedidoStatusButtons({ pedidoId }) {
  const { isLocked, lockInfo, canEdit } = usePedidoLock(pedidoId);

  if (isLocked) {
    return (
      <div className="pedido-locked">
        <div className="lock-icon">🔒</div>
        <div className="lock-message">
          Sendo editado por outro usuário
        </div>
        <div className="lock-timer">
          Disponível em {lockInfo.time_left_seconds}s
        </div>
      </div>
    );
  }

  return (
    <div className="pedido-status-buttons">
      <button disabled={!canEdit} onClick={handleUpdateStatus}>
        Mudar Status
      </button>
    </div>
  );
}
```

### **Passo 5: WebSocket - Notificações de Lock**

Adicionar listener no `useWebSocket`:

```javascript
// Quando receber notificação de lock
if (message.type === 'pedido_locked') {
  // Atualizar UI para mostrar que pedido está travado
  setPedidoLocked(message.pedido_id, message.locked_by);
}

if (message.type === 'pedido_unlocked') {
  // Atualizar UI para mostrar que pedido está disponível
  setPedidoUnlocked(message.pedido_id);
}
```

---

## 🎯 Benefícios

1. **Zero conflitos** - Apenas 1 cliente pode editar por vez
2. **Feedback visual** - Usuário vê quem está editando
3. **Automático** - Destrava após 30s
4. **Simples** - Usa IP como identificador
5. **Robusto** - Limpeza automática de locks expirados

---

## ⚙️ Configuração

**Duração do lock (padrão 30s):**
```python
lock_manager = PedidoLockManager(lock_duration_seconds=30)
```

**Alterar duração:**
```python
# Para 60 segundos
lock_manager = PedidoLockManager(lock_duration_seconds=60)
```

---

## 🧪 Teste

1. **Cliente A** edita pedido → Trava por 30s
2. **Cliente B** tenta editar → ❌ "Sendo editado"
3. **Aguarda 30s** → Destrava automático
4. **Cliente B** edita → ✅ Sucesso

---

## 📊 Monitoramento

**Ver todos os locks ativos:**
```python
locks = lock_manager.get_all_locks()
# Retorna lista de locks com tempo restante
```

**Limpar locks expirados:**
```python
removed = lock_manager.cleanup_expired()
print(f"{removed} locks removidos")
```

---

## 🔐 Identificação de Clientes

**Usa IP do cliente:**
```python
client_id = request.client.host  # Ex: "192.168.15.3"
```

**Alternativas:**
- User ID (se tiver autenticação)
- Session ID
- Device ID

---

## ✅ Status Atual

- ✅ Lock manager implementado
- ✅ Import adicionado no router
- ⏳ Integração no endpoint de atualização
- ⏳ Endpoints de verificação
- ⏳ Frontend hooks e componentes

---

## 📝 Próxima Ação

**Continuar implementação nos próximos passos acima** ou testar o sistema básico primeiro!

---

*Criado em: 13/10/2025*  
*Sistema de lock pronto para integração!*

