# 🧪 Como Testar o Sistema de Sincronização

## 🚀 Teste Rápido (2 minutos)

### Passo 1: Iniciar o Servidor

```bash
cd src-api-python/api-sgp
python main.py
```

Você deve ver:
```
✅ Banco de dados inicializado com sucesso
✅ API iniciada com sucesso
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Passo 2: Executar o Teste Automático

Em outro terminal:

```bash
cd src-api-python/api-sgp
python test_websocket.py
```

Você deve ver:
```
✅ Conectado com sucesso!
📨 Mensagem de boas-vindas: {...}
💓 Enviando ping...
📨 Resposta: {'type': 'pong', ...}
✅ Teste concluído com sucesso!
```

### Passo 3: Testar no Navegador

```bash
# Na raiz do projeto
npm run dev
```

Acesse: http://localhost:5173

Importe e use o componente de exemplo no seu `App.jsx`:

```javascript
import PedidosSyncExample from './components/PedidosSyncExample';

function App() {
  return <PedidosSyncExample />;
}
```

## 🔥 Teste com Múltiplos Clientes

### Teste Real - Múltiplas Máquinas

1. **Máquina 1 (Servidor):**
   ```bash
   cd src-api-python/api-sgp
   python main.py
   ```

2. **Configure VITE_API_URL em todas as outras máquinas:**
   
   Crie arquivo `.env.local` na raiz do projeto frontend:
   ```
   VITE_API_URL=http://IP_DO_SERVIDOR:8000
   ```
   
   Exemplo:
   ```
   VITE_API_URL=http://192.168.1.100:8000
   ```

3. **Máquinas 2, 3, 4... (Clientes):**
   ```bash
   npm run dev
   ```
   
   Acesse: http://localhost:5173

4. **Teste a Sincronização:**
   - Em uma máquina, marque um checkbox de status
   - Veja atualizar INSTANTANEAMENTE em todas as outras! ⚡

### Teste Simulado - Múltiplas Abas

Abra várias abas/janelas do navegador em:
- http://localhost:5173
- http://localhost:5173
- http://localhost:5173

Altere um status em uma aba e veja atualizar nas outras!

## 📊 Verificar Estatísticas

Enquanto o servidor está rodando e clientes conectados:

```bash
curl http://localhost:8000/ws/stats
```

Retorna algo como:
```json
{
  "total_connections": 3,
  "connections_by_type": {
    "pedidos": 3,
    "global": 0
  },
  "active_types": ["pedidos", "global"]
}
```

## 🔍 Verificar Logs

### Backend (Terminal do servidor)

Você verá:
```
✅ Nova conexão WebSocket [pedidos] - Total: 1
📢 Broadcast para 1 clientes [pedidos]
📡 Notificação enviada: update pedido 123
🔌 Cliente desconectado
```

### Frontend (Console do navegador)

Você verá:
```
🔌 Conectando ao WebSocket: ws://localhost:8000/ws/pedidos
✅ WebSocket conectado
💓 Heartbeat enviado
📨 Mensagem recebida: pedido_update
📡 Notificação enviada: update pedido 123
```

## 🧪 Teste de Reconexão

1. Com o frontend aberto e conectado
2. Pare o servidor backend (Ctrl+C)
3. Observe no frontend:
   - Indicador muda para "🔄 Reconectando..."
   - Tentativas de reconexão aparecem
4. Inicie o servidor novamente:
   ```bash
   python main.py
   ```
5. Observe:
   - "✅ Conectado" aparece automaticamente
   - Dados são recarregados

## ✅ Checklist de Testes

Marque conforme testar:

- [ ] Backend inicia sem erros
- [ ] Teste automático passa (test_websocket.py)
- [ ] Frontend conecta ao WebSocket
- [ ] Indicador mostra "✅ Sincronizado"
- [ ] Lista de pedidos carrega
- [ ] Alterar status atualiza no servidor
- [ ] Logs de sincronização aparecem
- [ ] Múltiplas abas sincronizam
- [ ] Reconexão automática funciona
- [ ] Estatísticas mostram conexões corretas

## 🐛 Problemas Comuns

### "Connection refused"

**Causa:** Servidor não está rodando

**Solução:**
```bash
cd src-api-python/api-sgp
python main.py
```

### "CORS error"

**Causa:** CORS não configurado corretamente

**Solução:** Já está configurado no `main.py`, mas verifique se o servidor está rodando na porta 8000

### "Module not found: websockets"

**Causa:** Dependência não instalada

**Solução:**
```bash
pip install -r requirements.txt
```

### Frontend não conecta

**Causa:** URL do WebSocket incorreta

**Solução:** Verifique a variável `VITE_API_URL` ou ajuste a URL manualmente no código

### Dados não sincronizam

**Causa:** WebSocket não está conectado

**Solução:**
1. Verifique o indicador de status
2. Clique em "Reconectar"
3. Verifique logs do navegador (F12)
4. Verifique logs do servidor

## 📱 Teste em Rede Local

### 1. Descobrir IP do servidor:

**Linux/Mac:**
```bash
ip addr show | grep inet
# ou
ifconfig | grep inet
```

**Windows:**
```bash
ipconfig
```

Procure algo como: `192.168.1.100`

### 2. Iniciar servidor:

```bash
cd src-api-python/api-sgp
python main.py
```

### 3. Nos clientes, configurar `.env.local`:

```
VITE_API_URL=http://192.168.1.100:8000
```

### 4. Verificar firewall:

Certifique-se de que a porta 8000 está aberta no firewall do servidor.

**Linux:**
```bash
sudo ufw allow 8000
```

**Windows:**
Configurações > Windows Defender Firewall > Permitir porta 8000

## 🎉 Teste de Carga (Opcional)

Para testar com carga simulada:

```bash
cd src-api-python/api-sgp

# Teste com 10 clientes simultâneos
python -c "
import asyncio
import websockets

async def client(n):
    async with websockets.connect('ws://localhost:8000/ws/pedidos') as ws:
        print(f'Cliente {n} conectado')
        await asyncio.sleep(60)

async def main():
    await asyncio.gather(*[client(i) for i in range(10)])

asyncio.run(main())
"
```

Verifique as estatísticas:
```bash
curl http://localhost:8000/ws/stats
# Deve mostrar 10 conexões
```

## 📈 Resultado Esperado

Ao final de todos os testes, você deve ter:

✅ Servidor rodando sem erros
✅ Múltiplos clientes conectados
✅ Sincronização instantânea entre todos
✅ Reconexão automática funcionando
✅ Logs detalhados disponíveis
✅ Estatísticas corretas

## 🎯 Próximos Passos

Se todos os testes passaram:
1. ✅ Sistema está pronto para uso!
2. 🚀 Pode colocar em produção
3. 📚 Consulte a documentação completa em `documentation/SISTEMA_SINCRONIZACAO_TEMPO_REAL.md`

Se algum teste falhou:
1. 🐛 Consulte a seção de problemas comuns
2. 📋 Verifique os logs
3. 🔍 Revise a configuração

---

**Dúvidas?** Consulte:
- `documentation/SISTEMA_SINCRONIZACAO_TEMPO_REAL.md` - Documentação completa
- `GUIA_RAPIDO_SINCRONIZACAO.md` - Guia rápido
- `RESUMO_SINCRONIZACAO_IMPLEMENTADA.md` - Resumo da implementação

