# 🚀 Instruções para Iniciar o Sistema Completo

## 📋 Passo a Passo

### 1️⃣ Popular Materiais no Banco de Dados

```bash
cd src-api-python/api-sgp
python popular_materiais.py
```

**Isso vai criar:**
- 4 materiais para Totem (MDF 6mm, MDF 3mm, Poliondas, PVC)
- 4 materiais para Lona (Lona 280g, 340g, 440g, 520g)

### 2️⃣ Iniciar a API

```bash
cd src-api-python/api-sgp
./start.sh
```

Ou:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 3️⃣ Iniciar o Frontend

```bash
# Na raiz do projeto
npm run dev
```

Ou:
```bash
npm run tauri dev
```

---

## ✅ Verificações

### API Funcionando
Acesse: http://localhost:8000/docs

Teste o endpoint:
- `GET /materiais` - Deve retornar lista de materiais
- `GET /materiais/tipo/totem` - Deve retornar materiais de totem

### Frontend Funcionando
1. Acesse o sistema
2. Vá em **Criar Pedido**
3. Selecione **Totem**
4. Veja se o campo "Tipo de Material" carrega os materiais!

---

## 🎯 Formulários Disponíveis

Agora você tem **5 formulários completos**:

```
Tipo de Produção: ▼
├── Painel
├── Totem
├── Lona
├── Almofada
└── Bolsinha
```

**Todos com:**
- ✅ Formatação automática de moeda
- ✅ Validação em tempo real
- ✅ Cálculos automáticos
- ✅ Materiais/Tecidos do cadastro
- ✅ Visual profissional

---

## 📦 O Que Cada Um Busca do Banco

| Formulário | Busca | API |
|------------|-------|-----|
| Painel | Tecidos | `getAllTecidos()` |
| Totem | **Materiais** | `getMateriaisPorTipo('totem')` |
| Lona | **Materiais** | `getMateriaisPorTipo('lona')` |
| Almofada | Tecidos | `getAllTecidos()` |
| Bolsinha | Tecidos | `getAllTecidos()` |

---

## 🎉 Tudo Pronto!

Após seguir os passos acima, você terá:
- ✅ Banco de dados com materiais
- ✅ API funcionando
- ✅ Frontend conectado
- ✅ Formulários carregando materiais dinamicamente

**Aproveite! 🚀**


