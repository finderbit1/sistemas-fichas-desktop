# 🎨 Sistema de Materiais - Cadastro Dinâmico

## 📋 Visão Geral

Implementado sistema completo de **materiais cadastrados** no banco de dados, similar ao sistema de tecidos. Agora os materiais não estão mais hardcoded nos formulários!

---

## ✅ O Que Mudou

### ❌ ANTES (Hardcoded)
```javascript
// Material fixo no código
<Form.Select name="material">
  <option value="mdf-6mm">MDF 6mm</option>
  <option value="mdf-3mm">MDF 3mm</option>
  <option value="poliondas">Poliondas</option>
  <option value="pvc">PVC</option>
</Form.Select>
```

**Problemas:**
- Difícil de manter
- Não permite edição pelo admin
- Hardcoded em cada formulário

### ✅ AGORA (Cadastro Dinâmico)
```javascript
// Busca materiais da API
useEffect(() => {
  getMateriaisPorTipo('totem')
    .then(res => setMateriais(res.data))
}, []);

<Form.Select name="material">
  <option value="">Selecione o Material</option>
  {materiais.map(m => (
    <option key={m.id} value={m.name}>{m.name}</option>
  ))}
</Form.Select>
```

**Benefícios:**
- ✅ Cadastro centralizado
- ✅ Admin pode editar
- ✅ Fácil manutenção
- ✅ Dinâmico e flexível

---

## 🗄️ Estrutura do Banco de Dados

### Tabela: `material`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | INT | ID único (auto-increment) |
| `name` | VARCHAR | Nome do material |
| `description` | VARCHAR | Descrição opcional |
| `tipo_producao` | VARCHAR | Tipo: painel, totem, lona, almofada, bolsinha |
| `active` | BOOLEAN | Se está ativo (padrão: true) |

### Exemplo de Registro
```json
{
  "id": 1,
  "name": "MDF 6mm",
  "description": "MDF de 6mm de espessura",
  "tipo_producao": "totem",
  "active": true
}
```

---

## 🔧 Backend (API Python)

### Arquivos Criados

#### 1. `materiais/schema.py`
```python
class Material(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    description: Optional[str] = None
    tipo_producao: str
    active: bool = True
```

#### 2. `materiais/router.py`
Rotas disponíveis:
- `GET /materiais` - Lista todos
- `GET /materiais/tipo/{tipo}` - Lista por tipo
- `GET /materiais/{id}` - Busca por ID
- `POST /materiais` - Cria novo
- `PATCH /materiais/{id}` - Atualiza
- `DELETE /materiais/{id}` - Deleta

#### 3. `materiais/__init__.py`
Exporta o router

### Integração no `main.py`
```python
from materiais.router import router as materiais_router
app.include_router(materiais_router, prefix=settings.API_V1_STR)
```

### Modelo registrado no `database/database.py`
```python
from materiais.schema import Material
```

---

## 💻 Frontend (React)

### API Functions (`services/api.js`)

```javascript
// ===== MATERIAIS =====
export const getAllMateriais = () => api.get('/materiais');
export const getMateriaisPorTipo = (tipo) => api.get(`/materiais/tipo/${tipo}`);
export const getMaterialById = (id) => api.get(`/materiais/${id}`);
export const createMaterial = (data) => api.post('/materiais', data);
export const updateMaterial = (id, data) => api.patch(`/materiais/${id}`, data);
export const deleteMaterial = (id) => api.delete(`/materiais/${id}`);
```

### Uso nos Formulários

#### FormTotemCompleto.jsx
```javascript
const [materiais, setMateriais] = useState([]);
const [materiaisLoading, setMateriaisLoading] = useState(true);

useEffect(() => {
  getMateriaisPorTipo('totem')
    .then(res => {
      const ativos = res.data.filter(m => m.active);
      setMateriais(ativos);
    })
    .catch(e => console.error(e))
    .finally(() => setMateriaisLoading(false));
}, []);
```

#### FormLonaCompleto.jsx
```javascript
useEffect(() => {
  getMateriaisPorTipo('lona')
    .then(res => {
      const ativos = res.data.filter(m => m.active);
      setMateriais(ativos);
    })
    .catch(e => console.error(e))
    .finally(() => setMateriaisLoading(false));
}, []);
```

---

## 📦 Materiais Iniciais

### Script: `popular_materiais.py`

Execute para popular o banco:
```bash
cd src-api-python/api-sgp
python popular_materiais.py
```

### Materiais Incluídos

#### TOTEM
- ✅ MDF 6mm
- ✅ MDF 3mm
- ✅ Poliondas
- ✅ PVC

#### LONA
- ✅ Lona 280g
- ✅ Lona 340g
- ✅ Lona 440g
- ✅ Lona 520g

---

## 🎯 Formulários Atualizados

### ✅ FormTotemCompleto
- Material vem do cadastro (`getMateriaisPorTipo('totem')`)
- Loading state durante busca
- Mensagem de erro se falhar

### ✅ FormLonaCompleto
- Material vem do cadastro (`getMateriaisPorTipo('lona')`)
- Loading state durante busca
- Mensagem de erro se falhar

### ℹ️ FormAlmofadaCompleto
- Usa **tecido** (já vem do cadastro via `getAllTecidos()`)

### ℹ️ FormBolsinhaCompleto
- Usa **tecido** (já vem do cadastro via `getAllTecidos()`)

### ℹ️ FormPainelCompleto
- Usa **tecido** (já vem do cadastro via `getAllTecidos()`)

---

## 🚀 Como Funciona

### 1. API Inicia
```
1. Importa model Material
2. Cria tabela se não existir
3. Registra router /materiais
4. Pronto para receber requisições!
```

### 2. Usuário Abre Formulário de Totem
```
1. FormTotemCompleto carrega
2. useEffect executa
3. Chama getMateriaisPorTipo('totem')
4. API retorna materiais do tipo totem
5. Filtra apenas ativos
6. Popula o dropdown
7. Usuário vê opções!
```

### 3. Fluxo Completo
```
Frontend                    Backend
   │                           │
   ├─→ getMateriaisPorTipo()  │
   │                           │
   │   ←─────────────────────  ├─→ SELECT * FROM material
   │                           │   WHERE tipo_producao = 'totem'
   │                           │   AND active = true
   │   [Materiais carregados]  │
   │                           │
   └─→ Exibe no dropdown      │
```

---

## 🎨 Interface do Usuário

### Estado: Loading
```
┌─────────────────────────────┐
│ Tipo de Material            │
│ ⏳ Carregando materiais...  │
└─────────────────────────────┘
```

### Estado: Carregado
```
┌─────────────────────────────┐
│ Tipo de Material       ▼    │
│ ┌─────────────────────────┐ │
│ │ Selecione o Material    │ │
│ │ MDF 6mm                 │ │
│ │ MDF 3mm                 │ │
│ │ Poliondas               │ │
│ │ PVC                     │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

### Estado: Erro
```
┌─────────────────────────────────┐
│ Tipo de Material                │
│ ⚠️ Não foi possível carregar   │
│    a lista de materiais         │
└─────────────────────────────────┘
```

---

## 🔧 Administração

### Como Adicionar Novo Material

#### Via API (cURL):
```bash
curl -X POST http://localhost:8000/api/v1/materiais \
  -H "Content-Type: application/json" \
  -d '{
    "name": "MDF 9mm",
    "description": "MDF de 9mm de espessura",
    "tipo_producao": "totem",
    "active": true
  }'
```

#### Via Python:
```python
from sqlmodel import Session
from database.database import engine
from materiais.schema import Material

with Session(engine) as session:
    novo_material = Material(
        name="MDF 9mm",
        description="MDF de 9mm de espessura",
        tipo_producao="totem",
        active=True
    )
    session.add(novo_material)
    session.commit()
```

### Como Desativar Material
```bash
curl -X PATCH http://localhost:8000/api/v1/materiais/1 \
  -H "Content-Type: application/json" \
  -d '{"active": false}'
```

---

## 📊 Tipos de Produção

### Materiais por Tipo

| Tipo Produção | Campo Usado | Busca de |
|---------------|-------------|----------|
| **Painel** | `tecido` | `getAllTecidos()` |
| **Totem** | `material` | `getMateriaisPorTipo('totem')` |
| **Lona** | `material` | `getMateriaisPorTipo('lona')` |
| **Almofada** | `tecido` | `getAllTecidos()` |
| **Bolsinha** | `tecido` | `getAllTecidos()` |

---

## 🔍 Endpoints da API

### GET `/materiais`
Lista todos os materiais

**Response:**
```json
[
  {
    "id": 1,
    "name": "MDF 6mm",
    "description": "MDF de 6mm",
    "tipo_producao": "totem",
    "active": true
  },
  ...
]
```

### GET `/materiais/tipo/{tipo}`
Lista materiais filtrados por tipo

**Exemplo:** `/materiais/tipo/totem`

**Response:**
```json
[
  {
    "id": 1,
    "name": "MDF 6mm",
    "description": "MDF de 6mm",
    "tipo_producao": "totem",
    "active": true
  },
  {
    "id": 2,
    "name": "MDF 3mm",
    "description": "MDF de 3mm",
    "tipo_producao": "totem",
    "active": true
  }
]
```

---

## 🎯 Próximos Passos

### Para Usar:

1. **Execute o script de população:**
```bash
cd src-api-python/api-sgp
python popular_materiais.py
```

2. **Reinicie a API:**
```bash
./start.sh
```

3. **Acesse o sistema:**
- Abra o formulário de Totem
- Veja os materiais carregados do banco!

---

## 💡 Gerenciamento Futuro

### Criar Interface Admin (Sugestão)

Adicionar em `/admin`:
- **MateriaisManagement.jsx** (similar a TecidosManagement)
- CRUD completo de materiais
- Filtro por tipo de produção
- Ativar/desativar materiais
- Edição inline

### Exemplo de Interface:
```
┌──────────────────────────────────────────┐
│  📦 Gerenciamento de Materiais           │
├──────────────────────────────────────────┤
│  Filtro: [Totem ▼]  [+ Novo Material]   │
├──────────────────────────────────────────┤
│  Nome       │ Tipo   │ Status │ Ações   │
│  MDF 6mm    │ Totem  │ ✅ Ativo│ ✏️ 🗑️   │
│  MDF 3mm    │ Totem  │ ✅ Ativo│ ✏️ 🗑️   │
│  Poliondas  │ Totem  │ ✅ Ativo│ ✏️ 🗑️   │
└──────────────────────────────────────────┘
```

---

## 🐛 Solução de Problemas

### Materiais não aparecem
**Solução:**
1. Verifique se a API está rodando
2. Execute `python popular_materiais.py`
3. Verifique o console do browser (F12)
4. Veja se o endpoint `/materiais/tipo/totem` responde

### Erro ao carregar
**Solução:**
- Verifique se a tabela `material` foi criada
- Reinicie a API
- Veja os logs da API

### Lista vazia
**Solução:**
- Execute o script de população
- Verifique se os materiais estão com `active=true`
- Use `GET /materiais` para ver todos

---

## 📚 Arquivos Criados/Modificados

### Backend (Python)
- ✅ `materiais/__init__.py` (novo)
- ✅ `materiais/schema.py` (novo)
- ✅ `materiais/router.py` (novo)
- ✅ `popular_materiais.py` (novo)
- ✅ `main.py` (modificado - router adicionado)
- ✅ `database/database.py` (modificado - model importado)

### Frontend (React)
- ✅ `services/api.js` (modificado - funções adicionadas)
- ✅ `FormTotemCompleto.jsx` (modificado - busca materiais)
- ✅ `FormLonaCompleto.jsx` (modificado - busca materiais)

---

## 🎉 Benefícios

### Para o Admin
- ✅ Pode adicionar novos materiais sem mexer no código
- ✅ Pode desativar materiais obsoletos
- ✅ Pode editar descrições
- ✅ Controle centralizado

### Para o Sistema
- ✅ Mais flexível e escalável
- ✅ Fácil manutenção
- ✅ Dados consistentes
- ✅ Código limpo

### Para o Usuário
- ✅ Sempre vê materiais atualizados
- ✅ Sem opções obsoletas
- ✅ Lista dinâmica

---

## 🚀 Como Popular os Materiais

### Método 1: Script Python (Recomendado)
```bash
cd src-api-python/api-sgp
python popular_materiais.py
```

**Saída esperada:**
```
🚀 Populando materiais iniciais...

✅ Material criado: MDF 6mm (totem)
✅ Material criado: MDF 3mm (totem)
✅ Material criado: Poliondas (totem)
✅ Material criado: PVC (totem)
✅ Material criado: Lona 280g (lona)
✅ Material criado: Lona 340g (lona)
✅ Material criado: Lona 440g (lona)
✅ Material criado: Lona 520g (lona)

🎉 Materiais populados com sucesso!

Materiais disponíveis:

LONA:
  - Lona 280g
  - Lona 340g
  - Lona 440g
  - Lona 520g

TOTEM:
  - MDF 6mm
  - MDF 3mm
  - Poliondas
  - PVC
```

### Método 2: Via API
```bash
curl -X POST http://localhost:8000/api/v1/materiais \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Material Novo",
    "tipo_producao": "totem",
    "active": true
  }'
```

---

## 📖 Exemplos de Uso

### Buscar Materiais de Totem
```javascript
import { getMateriaisPorTipo } from '../services/api';

const materiais = await getMateriaisPorTipo('totem');
// Retorna: [MDF 6mm, MDF 3mm, Poliondas, PVC]
```

### Buscar Materiais de Lona
```javascript
const materiais = await getMateriaisPorTipo('lona');
// Retorna: [Lona 280g, Lona 340g, Lona 440g, Lona 520g]
```

### Criar Novo Material
```javascript
import { createMaterial } from '../services/api';

await createMaterial({
  name: "MDF 12mm",
  description: "MDF de 12mm de espessura",
  tipo_producao: "totem",
  active: true
});
```

---

## 🎓 Resumo

### ✅ O Que Foi Implementado
1. Backend completo de materiais (schema, router, CRUD)
2. Endpoints REST para gerenciar materiais
3. Funções no frontend para consumir API
4. Formulários atualizados para buscar materiais dinâmicos
5. Script para popular materiais iniciais
6. Documentação completa

### 🎯 Próximas Melhorias Sugeridas
- [ ] Interface admin para gerenciar materiais
- [ ] Validação de duplicatas
- [ ] Categorias de materiais
- [ ] Preços sugeridos por material
- [ ] Histórico de uso de materiais

---

**Versão:** 1.0.0  
**Data:** 08/10/2025  
**Status:** ✅ Sistema Completo de Materiais Implementado

