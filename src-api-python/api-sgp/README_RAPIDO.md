# 🚀 SISTEMA DE FICHAS - INÍCIO RÁPIDO

## ⚡ Inicialização em 3 Passos

### 1. Executar Script de Inicialização
```bash
./start.sh
```

### 2. Escolher Opção
- **Opção 1**: API Simples (desenvolvimento)
- **Opção 2**: Sistema de Produção (3 instâncias + Load Balancer)
- **Opção 3**: Teste de 25 PCs

### 3. Acessar API
- **API**: http://localhost:8000
- **Health Check**: http://localhost:8000/health
- **Documentação**: http://localhost:8000/docs

---

## 🎯 Resultados dos Testes

✅ **25 PCs simultâneos** - 98.88% de sucesso  
✅ **716 requisições** em 63 segundos  
✅ **11.36 RPS** sustentável  
✅ **Sistema estável** sem travamentos  

---

## 📋 Endpoints Principais

| Endpoint | Descrição | Rate Limit |
|----------|-----------|------------|
| `GET /health` | Status da API | 500/min |
| `GET /api/v1/clientes` | Listar clientes | 100/min |
| `GET /api/v1/pedidos` | Listar pedidos | 100/min |
| `GET /api/v1/producoes/tipos` | Tipos de produção | 100/min |

---

## 🔧 Comandos Úteis

```bash
# Verificar status
curl http://localhost:8000/health

# Teste rápido
./start.sh (opção 3)

# Logs em tempo real
tail -f logs/api.log

# Parar API
pkill -f uvicorn
```

---

## 📚 Documentação Completa

Para mais detalhes, consulte: `GUIA_COMPLETO_USO_SISTEMA.md`

---

## 🆘 Suporte

- **Status**: ✅ Pronto para produção
- **Performance**: ✅ Otimizado para 25 PCs
- **Estabilidade**: ✅ 98.88% de sucesso
- **Monitoramento**: ✅ Logs completos

**Sistema testado e aprovado!** 🎉
