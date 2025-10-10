# 🚀 Guia Rápido - Sistema de Sincronização em Tempo Real

## ⚡ Início Rápido (5 minutos)

### 1. Iniciar o Backend

```bash
cd src-api-python/api-sgp
python main.py
```

✅ O WebSocket estará disponível em: `ws://localhost:8000/ws/pedidos`

### 2. Configurar Frontend

No seu componente React, importe e use o hook:

```javascript
import { usePedidosSync } from './hooks/usePedidosSync';
import SyncStatusIndicator from './components/SyncStatusIndicator';

function MeuComponente() {
  const {
    pedidos,           // Lista de pedidos
    wsConnected,       // Status da conexão
    wsState,           // Estado detalhado
    lastSync,          // Última sincronização
    updatePedido,      // Função para atualizar
  } = usePedidosSync();

  return (
    <div>
      {/* Indicador de status */}
      <SyncStatusIndicator
        isConnected={wsConnected}
        connectionState={wsState}
        lastSync={lastSync}
      />

      {/* Seus pedidos */}
      {pedidos.map(pedido => (
        <div key={pedido.id}>
          {pedido.numero}
        </div>
      ))}
    </div>
  );
}
```

## 🎯 Exemplo Completo

Veja o arquivo: `src/components/PedidosSyncExample.jsx`

Para testar rapidamente, adicione no seu `App.jsx`:

```javascript
import PedidosSyncExample from './components/PedidosSyncExample';

function App() {
  return <PedidosSyncExample />;
}
```

## ✅ Como Atualizar um Pedido Corretamente

**❌ ERRADO** (não faça isso):
```javascript
// NÃO atualizar estado local diretamente!
setPedidos(prev => prev.map(p => 
  p.id === pedidoId ? { ...p, financeiro: true } : p
));
```

**✅ CORRETO:**
```javascript
// Envie para o servidor e aguarde
// O WebSocket vai notificar TODOS os clientes automaticamente
const handleUpdate = async (pedidoId, field, value) => {
  try {
    await updatePedido(pedidoId, { [field]: value });
    // Pronto! Não precisa fazer mais nada
    // Todos os clientes receberão a atualização
  } catch (err) {
    alert('Erro ao atualizar');
  }
};
```

## 🔧 Configuração Avançada

### Personalizar Reconexão

```javascript
const { pedidos } = usePedidosSync({
  autoFetch: true,           // Buscar ao conectar
  onPedidoCreate: (pedido) => {
    console.log('Novo pedido!', pedido);
    // Mostrar notificação
  },
  onPedidoUpdate: (pedido) => {
    console.log('Atualizado!', pedido);
  },
  onSyncError: (error) => {
    console.error('Erro!', error);
  },
});
```

## 📊 Monitorar Sincronização

### Ver Logs em Tempo Real

```javascript
const { syncLog } = usePedidosSync();

// syncLog contém todos os eventos:
syncLog.map(log => (
  <div>
    {log.timestamp} - {log.type} - {log.message}
  </div>
));
```

### Verificar Status da Conexão

```javascript
const { wsConnected, wsState, reconnectAttempt } = usePedidosSync();

console.log('Conectado:', wsConnected);
console.log('Estado:', wsState); // 'connected', 'connecting', 'disconnected', 'error'
console.log('Tentativas:', reconnectAttempt);
```

## 🐛 Problemas Comuns

### WebSocket não conecta?

1. Verifique se o backend está rodando
2. Verifique a URL: `ws://localhost:8000/ws/pedidos`
3. Olhe o console do navegador para erros

### Dados não atualizam em tempo real?

1. Verifique se `wsConnected` é `true`
2. Use `<SyncStatusIndicator />` para visualizar
3. Force reconexão: `wsReconnect()`

### Status diferente entre máquinas?

1. Clique em "Reconectar" ou "Recarregar Pedidos"
2. Verifique se todas as máquinas estão conectadas
3. Verifique logs no backend

## 📱 Testar com Múltiplos Clientes

1. Abra o sistema em 2+ navegadores/máquinas
2. Altere um status em uma máquina
3. Veja a atualização aparecer instantaneamente nas outras! ⚡

## 🎉 Pronto!

Agora você tem sincronização em tempo real funcionando! 

Para mais detalhes, veja: `documentation/SISTEMA_SINCRONIZACAO_TEMPO_REAL.md`

