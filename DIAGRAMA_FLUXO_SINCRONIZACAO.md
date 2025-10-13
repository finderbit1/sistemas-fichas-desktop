# 📊 Diagrama de Fluxo - Sistema de Sincronização

## 🔄 Fluxo Completo de Atualização

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    FLUXO DE ATUALIZAÇÃO DE PEDIDO                       │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│  Cliente 1   │         │  Cliente 2   │         │  Cliente N   │
│ (React/Tauri)│         │ (React/Tauri)│         │ (React/Tauri)│
└──────┬───────┘         └──────┬───────┘         └──────┬───────┘
       │                        │                        │
       │ 1. User clica          │                        │
       │    checkbox            │                        │
       │    (financeiro)        │                        │
       │                        │                        │
       │ 2. updatePedido()      │                        │
       ├────────────────────────┼────────────────────────┼──────┐
       │                        │                        │      │
       │              HTTP PATCH /api/v1/pedidos/123    │      │
       │              Body: { "financeiro": true }       │      │
       │                        │                        │      │
       │                        ▼                        │      │
       │              ┌─────────────────────┐            │      │
       │              │   FastAPI Backend   │            │      │
       │              │                     │            │      │
       │              │ 3. Validar dados    │            │      │
       │              │ 4. Iniciar transação│            │      │
       │              │ 5. UPDATE no SQLite │            │      │
       │              │ 6. Commit           │            │      │
       │              │ 7. Atualizar updated│            │      │
       │              │    _at timestamp    │            │      │
       │              └──────────┬──────────┘            │      │
       │                         │                       │      │
       │                         │ 8. Broadcast WebSocket│      │
       │                         │    para TODOS         │      │
       │                         │                       │      │
       │◄────────────────────────┼───────────────────────┼──────┘
       │                         │                       │
       │ 9. Recebe WS msg        │ 9. Recebe WS msg      │ 9. Recebe WS msg
       │    type: pedido_update  │    type: pedido_update│    type: pedido_update
       │    pedido_id: 123       │    pedido_id: 123     │    pedido_id: 123
       │    data: {...}          │    data: {...}        │    data: {...}
       │                         │                       │
       │ 10. updatePedidoLocal() │ 10. updatePedidoLocal()│ 10. updatePedidoLocal()
       │     setPedidos(...)     │     setPedidos(...)   │     setPedidos(...)
       │                         │                       │
       │ 11. UI atualiza ✅      │ 11. UI atualiza ✅    │ 11. UI atualiza ✅
       │     automaticamente     │     automaticamente   │     automaticamente
       │                         │                       │
       ▼                         ▼                       ▼
  ✅ Sincronizado          ✅ Sincronizado         ✅ Sincronizado
```

## 🔌 Fluxo de Conexão WebSocket

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    CONEXÃO E RECONEXÃO WEBSOCKET                        │
└─────────────────────────────────────────────────────────────────────────┘

    Cliente                                        Servidor
      │                                               │
      │ 1. Componente monta                          │
      │    useWebSocket() é chamado                  │
      │                                               │
      │ 2. new WebSocket(url)                        │
      ├──────────────────────────────────────────────>│
      │           WS Handshake                        │
      │                                               │
      │<──────────────────────────────────────────────┤
      │        3. ws.onopen                           │ 3. ws_manager.connect()
      │           setIsConnected(true)                │    Registra conexão
      │           startHeartbeat()                    │
      │                                               │
      │<──────────────────────────────────────────────┤
      │     4. Mensagem de boas-vindas                │ 4. send_personal_message()
      │        { type: "connection",                  │    { status: "connected" }
      │          status: "connected" }                │
      │                                               │
      │  ┌────────────────────────────────┐          │
      │  │   Loop de Heartbeat (30s)      │          │
      │  │                                 │          │
      │  │ 5. Enviar ping                 │          │
      │  ├────────────────────────────────────────────>│
      │  │    { type: "ping" }                        │ 5. Receber ping
      │  │                                             │
      │  │<────────────────────────────────────────────┤
      │  │ 6. Receber pong                            │ 6. Enviar pong
      │  │    { type: "pong" }                        │    { type: "pong" }
      │  │                                             │
      │  │ ... aguardar 30s ...                       │
      │  │                                             │
      │  └─────────────────────────────────           │
      │                                               │
      ▼                                               ▼
```

## 🔄 Fluxo de Reconexão Automática

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        RECONEXÃO AUTOMÁTICA                             │
└─────────────────────────────────────────────────────────────────────────┘

    Cliente                                        Servidor
      │                                               │
      │ ✅ Conectado normalmente                      │ ✅ Servidor funcionando
      │                                               │
      │                                               ╳ ❌ Servidor cai
      │                                               │    ou rede cai
      │                                               │
      ╳ ❌ ws.onclose                                 │
      │    setIsConnected(false)                     │
      │    setConnectionState('disconnected')        │
      │                                               │
      │ 🔄 Iniciar tentativa de reconexão            │
      │    setTimeout(() => connect(), 3000)         │
      │                                               │
      │ ... aguardar 3 segundos ...                  │
      │                                               │
      │ Tentativa 1                                  │
      ├──────────────────────────────────────────────>╳ ❌ Falha
      │                                               │
      │ setReconnectAttempt(1)                       │
      │ UI mostra: "Tentativa 1"                     │
      │                                               │
      │ ... aguardar 3 segundos ...                  │
      │                                               │
      │ Tentativa 2                                  │
      ├──────────────────────────────────────────────>╳ ❌ Falha
      │                                               │
      │ setReconnectAttempt(2)                       │
      │ UI mostra: "Tentativa 2"                     │
      │                                               │
      │ ... aguardar 3 segundos ...                  │
      │                                               ▲
      │                                               ✅ Servidor volta
      │                                               │
      │ Tentativa 3                                  │
      ├──────────────────────────────────────────────>│ ✅ Sucesso!
      │           WS Handshake                        │
      │                                               │
      │<──────────────────────────────────────────────┤
      │ ✅ ws.onopen                                  │ ws_manager.connect()
      │    setIsConnected(true)                       │
      │    setReconnectAttempt(0)                    │
      │    fetchPedidos() // Recarregar dados        │
      │                                               │
      │ UI mostra: "✅ Sincronizado"                  │
      │                                               │
      ▼                                               ▼
```

## 📦 Arquitetura de Componentes

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      ARQUITETURA DO SISTEMA                             │
└─────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────── FRONTEND ─────────────────────────────────┐
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │                    Seu Componente React                         │   │
│  │  (ex: ListaPedidos.jsx, KanbanBoard.jsx, etc)                 │   │
│  └───────────────────────────┬────────────────────────────────────┘   │
│                              │                                          │
│                              │ usa                                      │
│                              ▼                                          │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │              usePedidosSync()  (Hook)                          │   │
│  │                                                                 │   │
│  │  • Estado: pedidos, isLoading, wsConnected                     │   │
│  │  • Funções: updatePedido(), createPedido(), deletePedido()    │   │
│  │  • Callbacks: onPedidoCreate, onPedidoUpdate, etc             │   │
│  │  • Logs: syncLog                                               │   │
│  └───────────────────────────┬─────────────┬──────────────────────┘   │
│                              │             │                            │
│                              │ usa         │ usa                        │
│                              ▼             ▼                            │
│  ┌──────────────────────┐   ┌─────────────────────────┐               │
│  │   useWebSocket()     │   │      api.js             │               │
│  │   (Hook genérico)    │   │  (HTTP requests)        │               │
│  │                      │   │                         │               │
│  │ • Conexão WS         │   │ • GET /pedidos/         │               │
│  │ • Reconexão auto     │   │ • PATCH /pedidos/:id    │               │
│  │ • Heartbeat          │   │ • POST /pedidos/        │               │
│  │ • Mensagens          │   │ • DELETE /pedidos/:id   │               │
│  └───────────┬──────────┘   └──────────┬──────────────┘               │
│              │                         │                                │
│              │ WebSocket               │ HTTP                          │
└──────────────┼─────────────────────────┼────────────────────────────────┘
               │                         │
               │                         │
┌──────────────┼─────────────────────────┼──────────── BACKEND ───────────┐
│              │                         │                                 │
│              ▼                         ▼                                 │
│  ┌─────────────────────┐   ┌──────────────────────────┐                │
│  │  WebSocket Manager  │   │   Pedidos Router         │                │
│  │  websocket_manager  │   │   pedidos/router.py      │                │
│  │                     │   │                          │                │
│  │ • connect()         │◄──┤ • criar_pedido()         │                │
│  │ • disconnect()      │   │   └─> broadcast()        │                │
│  │ • broadcast()       │◄──┤ • atualizar_pedido()     │                │
│  │ • get_stats()       │   │   └─> broadcast()        │                │
│  │                     │◄──┤ • deletar_pedido()       │                │
│  │ Gerencia conexões   │   │   └─> broadcast()        │                │
│  │ ativas dos clientes │   │                          │                │
│  └─────────────────────┘   └──────────┬───────────────┘                │
│                                       │                                 │
│                                       │ usa                             │
│                                       ▼                                 │
│                            ┌──────────────────────┐                    │
│                            │   Database           │                    │
│                            │   database.py        │                    │
│                            │                      │                    │
│                            │ • SQLite + WAL mode  │                    │
│                            │ • Transações atômicas│                    │
│                            │ • Campo updated_at   │                    │
│                            │ • Pool de conexões   │                    │
│                            └──────────────────────┘                    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## 🎯 Fluxo de Dados Simplificado

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         FLUXO DE DADOS                                  │
└─────────────────────────────────────────────────────────────────────────┘

   User Action (UI)
        │
        ▼
   updatePedido(id, data)  ───────────► HTTP PATCH /api/v1/pedidos/123
        │                                       │
        │                                       ▼
        │                               Backend processa
        │                                       │
        │                                       ▼
        │                               UPDATE no SQLite
        │                                       │
        │                                       ▼
        │                         WebSocket Broadcast para TODOS
        │                                       │
        ├───────────────────────────────────────┼──────────────┐
        │                                       │              │
        ▼                                       ▼              ▼
   Cliente 1 recebe                       Cliente 2        Cliente N
        │                                 recebe           recebe
        ▼                                    │               │
   updatePedidoLocal(data)                   │               │
        │                                    │               │
        ▼                                    ▼               ▼
   setPedidos(...)                 setPedidos(...)  setPedidos(...)
        │                                    │               │
        ▼                                    ▼               ▼
   React re-render                  React re-render  React re-render
        │                                    │               │
        ▼                                    ▼               ▼
   UI atualiza ✅                    UI atualiza ✅    UI atualiza ✅
```

## 🔐 Garantias do Sistema

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       GARANTIAS DE CONSISTÊNCIA                         │
└─────────────────────────────────────────────────────────────────────────┘

1. ATOMICIDADE
   ┌─────────────────────────┐
   │  Banco de Dados         │
   │  (SQLite + WAL)         │
   │                         │
   │  BEGIN TRANSACTION      │
   │  UPDATE pedidos ...     │
   │  COMMIT                 │ ✅ Tudo ou nada
   └─────────────────────────┘

2. ORDENAÇÃO
   ┌─────────────────────────┐
   │  Timestamp              │
   │  (ultima_atualizacao)   │
   │                         │
   │  2025-10-10 12:30:01    │ ✅ Sempre atualizado
   │  2025-10-10 12:30:02    │    Resolve conflitos
   └─────────────────────────┘

3. BROADCAST GARANTIDO
   ┌─────────────────────────┐
   │  WebSocket Manager      │
   │                         │
   │  for cada cliente:      │
   │    try:                 │
   │      enviar(msg)        │ ✅ Tenta todos
   │    except:              │    Remove falhas
   │      remover_cliente    │
   └─────────────────────────┘

4. NUNCA ATUALIZAR ANTES DO SERVIDOR
   ┌─────────────────────────┐
   │  Cliente                │
   │                         │
   │  ❌ NUNCA:              │
   │     setPedidos(...)     │
   │     await api.patch()   │
   │                         │
   │  ✅ SEMPRE:             │
   │     await api.patch()   │ ✅ Servidor primeiro
   │     // WS atualiza auto │    WS atualiza todos
   └─────────────────────────┘
```

## 📊 Métricas de Performance

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      MÉTRICAS DE PERFORMANCE                            │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────┬──────────────┬─────────────────────┐
│ Métrica                 │ Valor        │ Observação          │
├─────────────────────────┼──────────────┼─────────────────────┤
│ Clientes Suportados     │ ~20          │ Testado e otimizado │
│ Latência de Broadcast   │ < 100ms      │ Rede local          │
│ Tempo de Reconexão      │ < 3s         │ Após queda          │
│ Intervalo de Heartbeat  │ 30s          │ Configurável        │
│ Timeout de Banco        │ 30s          │ Evita locks         │
│ Tamanho de Cache        │ 50.000 pág   │ SQLite              │
│ Logs Mantidos           │ 50 eventos   │ Por cliente         │
│ Tentativas de Reconexão │ Infinitas    │ Configurável        │
└─────────────────────────┴──────────────┴─────────────────────┘
```

---

**📚 Mais informações:**
- Documentação completa: `documentation/SISTEMA_SINCRONIZACAO_TEMPO_REAL.md`
- Guia rápido: `GUIA_RAPIDO_SINCRONIZACAO.md`
- Testes: `TESTE_SINCRONIZACAO.md`


