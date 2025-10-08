# 🗼 Formulário de Totem Completo

## 📋 Visão Geral

Formulário profissional e completo para criação de **Totens de produção**, seguindo o mesmo padrão do FormPainelCompleto.

---

## 🎯 Campos do Formulário

### 1. 📄 Informações Básicas

#### Descrição
- Campo de texto livre
- Limite: 200 caracteres
- Contador em tempo real
- Validação: mínimo 3 caracteres

#### Dimensões
- **Largura**: em metros
- **Altura**: em metros
- **Área**: calculada automaticamente (largura × altura)
- Calculadora integrada

#### Responsáveis
- **Vendedor**: seleção de vendedor
- **Designer**: seleção de designer

---

### 2. 🧱 Material e Acabamento

#### Tipo de Material
Opções disponíveis:
- ✅ **MDF 6mm** (padrão)
- ✅ **MDF 3mm**
- ✅ **Poliondas**
- ✅ **PVC**

#### Acabamento
Opções disponíveis:
- ✅ **Sem acabamento** (padrão)
- ✅ **Com pé**
- ✅ **Sem pé**

---

### 3. 🖼️ Imagem

- Upload de imagem (drag-and-drop, paste ou seleção)
- Visualização em tempo real
- Formato: Base64
- Tamanho máximo: 10MB

---

### 4. 💰 Valores e Observações

#### Valores
- **Valor do Totem**: valor principal (obrigatório)
- **Valores Adicionais**: custos extras (opcional)
- **Valor Total**: calculado automaticamente

#### Observações
- Campo de texto livre
- Limite: 500 caracteres
- Contador em tempo real

---

## 🎨 Estrutura Visual

```
┌───────────────────────────────────────────┐
│  TOTEM COMPLETO (Container Único)         │
├───────────────────────────────────────────┤
│                                           │
│  📄 Informações Básicas                   │
│  ═════════════════════════════            │
│  • Descrição                   150/200    │
│  • Largura × Altura → Área               │
│  • Vendedor | Designer                    │
│                                           │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                           │
│  🧱 Material e Acabamento                 │
│  ═════════════════════════════            │
│  • Tipo de Material: [MDF 6mm     ▼]     │
│  • Acabamento: [Sem acabamento   ▼]      │
│  • Imagem do Totem                        │
│                                           │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                           │
│  💰 Valores e Observações                 │
│  ═════════════════════════════            │
│  • Valor Totem | Adicionais | Total      │
│  • Resumo (se houver adicionais)         │
│  • Observações                   320/500  │
│                                           │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                           │
│       [Limpar Formulário] [Salvar Totem] │
│                                           │
└───────────────────────────────────────────┘
```

---

## ✨ Features Implementadas

### 1. Formatação Automática de Moeda
```
Você digita: 15000
Sistema exibe: R$ 150,00 ✅
```

- ❌ Não aceita letras
- ✅ Só números
- ✅ Formatação brasileira (1.234,56)

### 2. Validação em Tempo Real
- ✅ Verde quando OK
- ❌ Vermelho quando erro
- ⚪ Neutro quando vazio

### 3. Cálculo Automático
```
Valor do Totem:      R$ 150,00
+ Valores Adicionais: R$  10,00
─────────────────────────────
= VALOR TOTAL:        R$ 160,00
```

### 4. Resumo Financeiro
Aparece quando há valores adicionais:

```
┌────────────────────────────────────┐
│ 💰 Composição do Valor Total       │
├────────────────────────────────────┤
│ Valor Base:          R$ 150,00     │
│ + Adicionais:        R$  10,00     │
│ ════════════════════════════════   │
│ VALOR TOTAL:         R$ 160,00 ⭐  │
└────────────────────────────────────┘
```

### 5. Tooltips Informativos
- ℹ️ Descrição: "Descreva o totem..."
- ℹ️ Material: "Selecione o material..."
- ℹ️ Acabamento: "Selecione o tipo..."
- ℹ️ Adicionais: "Custos extras, frete..."

### 6. Contadores de Caracteres
- Descrição: 150/200
- Observações: 320/500

### 7. Loading States
- ⏳ "Salvando..." durante save
- ✅ "Totem salvo com sucesso!" após save
- 🔄 Auto-limpeza após 2 segundos

---

## 📦 Dados Salvos

```javascript
{
  // Tipo
  "tipoProducao": "totem",
  "tipo": "totem",
  
  // Informações Básicas
  "descricao": "Totem Promocional Loja X",
  "largura": "0.80",
  "altura": "1.80",
  "area": "1.44",
  
  // Responsáveis
  "vendedor": "João Silva",
  "designer": "Maria Santos",
  
  // Material e Acabamento
  "material": "mdf-6mm",
  "acabamento": "com-pe",
  
  // Valores
  "valorTotem": "150,00",
  "valorAdicionais": "10,00",
  "valor": "160,00",
  
  // Observações
  "observacao": "Totem para evento corporativo...",
  
  // Imagem
  "imagem": "data:image/jpeg;base64,..."
}
```

---

## 🎯 Validações

### Campos Obrigatórios
- ❌ Descrição (mín. 3 caracteres)
- ❌ Largura (> 0)
- ❌ Altura (> 0)
- ❌ Vendedor
- ❌ Designer
- ❌ Material
- ❌ Acabamento
- ❌ Valor do Totem (> 0)

### Campos Opcionais
- ✅ Valores Adicionais
- ✅ Observações
- ✅ Imagem

---

## 🚀 Como Usar

### 1. Selecione o Tipo de Produção
```
Tipo de Produção: [Totem Completo ▼]
```

### 2. Preencha as Informações Básicas
```
Descrição: "Totem Promocional"
Largura: 0.80 m
Altura: 1.80 m
Área: 1.44 m² (calculado)
Vendedor: João Silva
Designer: Maria Santos
```

### 3. Escolha Material e Acabamento
```
Material: [MDF 6mm ▼]
Acabamento: [Com pé ▼]
```

### 4. Adicione Imagem (opcional)
- Drag and drop
- Ctrl+V (paste)
- Ou clique para selecionar

### 5. Defina os Valores
```
Valor do Totem: 15000 → R$ 150,00
Valores Adicionais: 1000 → R$ 10,00

TOTAL: R$ 160,00 ✅
```

### 6. Adicione Observações (opcional)
```
"Totem para evento corporativo.
Entrega dia 15/10."
```

### 7. Salve!
```
[Limpar Formulário] [Salvar Totem]
```

---

## 📊 Comparação: Simples vs Completo

| Feature | Totem Simples | Totem Completo |
|---------|--------------|----------------|
| Descrição | ✅ | ✅ |
| Dimensões | ✅ | ✅ |
| Vendedor/Designer | ✅ | ✅ |
| Material | ✅ (limitado) | ✅ (4 opções) |
| Acabamento | Checkboxes | Dropdown |
| Formatação Moeda | ❌ | ✅ Automática |
| Validação Tempo Real | ❌ | ✅ |
| Resumo Financeiro | ❌ | ✅ |
| Tooltips | ❌ | ✅ |
| Contadores | ❌ | ✅ |
| Loading States | Básico | Profissional |
| Layout | Múltiplos cards | Container único |

---

## 💡 Diferenças do Painel Completo

| Feature | Painel Completo | Totem Completo |
|---------|----------------|----------------|
| Acabamentos | Checkboxes (overloque, elástico) | Dropdown (pé/sem pé) |
| Emenda | ✅ (com quantidade) | ❌ |
| Ilhós | ✅ (com cálculo) | ❌ |
| Cordinha | ✅ (com cálculo) | ❌ |
| Material | Tecido | MDF/Poliondas/PVC |
| Valor Extra | Vários componentes | Valores Adicionais |

---

## 🔧 Recursos Técnicos

### Hooks Utilizados
- `useState` - Estado do formulário
- `useEffect` - Efeitos colaterais
- `useMemo` - Cálculos otimizados
- `useVendedoresDesigners` - Custom hook
- `useCustomAlert` - Alertas

### Componentes
- `Form.Control` - Inputs
- `Form.Select` - Dropdowns
- `InputGroup` - Campos com prefixo
- `Alert` - Alertas de sucesso
- `Badge` - Indicadores
- `OverlayTrigger` / `Tooltip` - Dicas
- `ImageDropZone` - Upload de imagem
- `AreaCalculatorLinhaUnica` - Calculadora

### Performance
- `useMemo` para cálculo de valor total
- Validação otimizada por campo
- Formatação lazy de moeda

---

## 📝 Exemplo Prático

### Cenário: Totem 80cm × 180cm com pé

```javascript
// Input do usuário
{
  descricao: "Totem Promocional Loja X",
  largura: "0.80",
  altura: "1.80",
  vendedor: "João Silva",
  designer: "Maria Santos",
  material: "mdf-6mm",
  acabamento: "com-pe",
  valorTotem: "15000", // Digita
  valorAdicionais: "1000" // Digita
}

// Output do sistema
{
  tipoProducao: "totem",
  tipo: "totem",
  descricao: "Totem Promocional Loja X",
  largura: "0.80",
  altura: "1.80",
  area: "1.44", // Calculado
  vendedor: "João Silva",
  designer: "Maria Santos",
  material: "mdf-6mm",
  acabamento: "com-pe",
  valorTotem: "150,00", // Formatado
  valorAdicionais: "10,00", // Formatado
  valor: "160,00", // Calculado e formatado
  imagem: "data:image/jpeg;base64,..."
}
```

---

## 🎉 Benefícios

### Para o Usuário
- ✅ Interface intuitiva
- ✅ Validação clara
- ✅ Cálculos automáticos
- ✅ Feedback imediato
- ✅ Menos erros

### Para o Sistema
- ✅ Dados consistentes
- ✅ Validações robustas
- ✅ Performance otimizada
- ✅ Manutenibilidade
- ✅ Extensível

---

## 🚀 Onde Encontrar

### No Sistema
1. Acesse: **Criar Pedido**
2. Selecione: **Totem Completo**
3. Preencha o formulário
4. Salve!

### Código
```
📁 src/components/prouctions/
  └── FormTotemCompleto.jsx
```

---

**Versão:** 1.0.0  
**Data:** 08/10/2025  
**Status:** ✅ Implementado e Funcional  
**Arquivo:** `FormTotemCompleto.jsx`

