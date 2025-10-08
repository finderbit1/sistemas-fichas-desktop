# Formulário de Painel Completo

## 📋 Estrutura do Formulário

Este documento descreve o **FormPainelCompleto** - um formulário completo para criação de painéis de produção.

## 🎯 Campos do Formulário

### 1. Informações Básicas
- **Descrição**: Descrição detalhada do painel
- **Largura**: Largura em metros
- **Altura**: Altura em metros  
- **Área**: Calculada automaticamente em metros quadrados (m²)

### 2. Responsáveis
- **Vendedor**: Seleção do vendedor responsável
- **Designer**: Seleção do designer responsável

### 3. Material
- **Tipo de Tecido**: Seleção do tecido a ser utilizado

### 4. Acabamentos
- **Overloque**: Checkbox para indicar se terá overloque
- **Elástico**: Checkbox para indicar se terá elástico

### 5. Opções de Fixação

#### 5.1 Com Ilhós
Quando marcado "Com Ilhós", aparecem os campos:
- **Quantidade de Ilhós**: Número de ilhós no painel
- **Espaço entre Ilhós**: Espaçamento em centímetros
- **Valor Unitário**: Valor de cada ilhó

#### 5.2 Com Cordinha
Quando marcado "Com Cordinha", aparecem os campos:
- **Quantidade de Cordinha**: Número de cordinhas no painel
- **Espaço entre Cordinhas**: Espaçamento em centímetros
- **Valor Unitário**: Valor de cada cordinha

> **Nota**: É possível selecionar **ilhós E cordinha** ao mesmo tempo, ou apenas uma das opções.

### 6. Mídia
- **Imagem do Painel**: Upload de imagem via drag-and-drop, paste ou seleção de arquivo

### 7. Valores
- **Valor do Painel**: Valor principal do painel
- **Valores Adicionais**: Valores extras (opcional)

### 8. Observações
- **Campo de texto livre**: Para observações gerais sobre o painel

## 💾 Dados Salvos

Quando o formulário é salvo, os seguintes dados são enviados:

```javascript
{
  "tipoProducao": "painel",
  "tipo": "painel",
  "imagem": "base64_da_imagem",
  "valor": "valor_total_calculado",
  
  // Informações básicas
  "descricao": "string",
  "largura": "number",
  "altura": "number",
  "area": "number",
  
  // Responsáveis
  "vendedor": "string",
  "designer": "string",
  
  // Material
  "tecido": "string",
  
  // Acabamentos
  "acabamento": {
    "overloque": boolean,
    "elastico": boolean
  },
  
  // Opções
  "opcoes": {
    "ilhos": boolean,
    "cordinha": boolean
  },
  
  // Dados de Ilhós (se selecionado)
  "ilhosQtd": "number",
  "ilhosEspaco": "number",
  "ilhosValorUnitario": "string",
  
  // Dados de Cordinha (se selecionado)
  "cordinhaQtd": "number",
  "cordinhaEspaco": "number",
  "cordinhaValorUnitario": "string",
  
  // Valores
  "valorPainel": "string",
  "valorAdicionais": "string",
  
  // Observações
  "observacao": "string"
}
```

## ✅ Validações

O formulário possui validações para:

### Campos Obrigatórios
- Descrição do Painel
- Largura
- Altura
- Vendedor
- Designer
- Tecido
- Valor do Painel

### Validações Condicionais

#### Se "Com Ilhós" estiver marcado:
- Quantidade de Ilhós (obrigatório, > 0)
- Espaço entre Ilhós (obrigatório, > 0)
- Valor Unitário dos Ilhós (obrigatório, > 0)

#### Se "Com Cordinha" estiver marcado:
- Quantidade de Cordinha (obrigatório, > 0)
- Espaço entre Cordinhas (obrigatório, > 0)
- Valor Unitário da Cordinha (obrigatório, > 0)

### Validações Numéricas
- Largura e Altura devem ser números maiores que zero
- Valores monetários devem ser números válidos

## 🎨 Layout do Formulário

```
┌─────────────────────────────────────────────────────────┐
│ Descrição                           │ Calculadora Área  │
├─────────────────────────────────────┴───────────────────┤
│ Vendedor                            │ Designer          │
├─────────────────────────────────────┴───────────────────┤
│ Tipo de Tecido                                          │
├─────────────────────────────────────┬───────────────────┤
│ ┌─ Acabamento ─────────────────┐   │                   │
│ │ ☐ Overloque                  │   │                   │
│ │ ☐ Elástico                   │   │   Zona de Upload  │
│ └──────────────────────────────┘   │   de Imagem       │
│                                     │                   │
│ ┌─ Opções de Fixação ──────────┐   │                   │
│ │ ☐ Com Ilhós                  │   │                   │
│ │   ┌─ Config. Ilhós ───────┐  │   │                   │
│ │   │ Qtd │ Espaço │ Valor  │  │   │                   │
│ │   └─────────────────────────┘  │   │                   │
│ │                                │   │                   │
│ │ ☐ Com Cordinha               │   │                   │
│ │   ┌─ Config. Cordinha ────┐  │   │                   │
│ │   │ Qtd │ Espaço │ Valor  │  │   │                   │
│ │   └─────────────────────────┘  │   │                   │
│ └──────────────────────────────┘   │                   │
├─────────────────────────────────────┴───────────────────┤
│ Valor do Painel              │ Valores Adicionais       │
├─────────────────────────────────────────────────────────┤
│ Observações                                             │
│ ┌─────────────────────────────────────────────────────┐ │
│ │                                                     │ │
│ └─────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│                                      [Limpar] [Salvar]  │
└─────────────────────────────────────────────────────────┘
```

## 🚀 Como Usar

### Importar o Componente
```javascript
import FormPainelCompleto from './components/prouctions/FormPainelCompleto';
```

### Usar no Componente Pai
```javascript
function MinhaPage() {
  const handleAdicionarPainel = (dadosPainel) => {
    console.log('Painel criado:', dadosPainel);
    // Processar dados do painel
  };

  return (
    <FormPainelCompleto 
      onAdicionarItem={handleAdicionarPainel}
    />
  );
}
```

## 📦 Dependências

O formulário utiliza:
- `react-bootstrap` - Para componentes de UI
- `ImageDropZone` - Para upload de imagem
- `AreaCalculatorLinhaUnica` - Para cálculo automático de área
- `InputValorReal` - Para entrada de valores monetários
- `CustomCheckbox` - Para checkboxes customizados
- `ValidationModal` - Para exibir erros de validação
- `useVendedoresDesigners` - Hook para carregar vendedores e designers
- `getAllTecidos` - API para carregar lista de tecidos

## 🎯 Recursos

### ✨ Features
- ✅ Validação completa de campos
- ✅ Cálculo automático de área
- ✅ Upload de imagem com preview
- ✅ Campos condicionais (ilhós/cordinha)
- ✅ Feedback visual de sucesso
- ✅ Modal de validação de erros
- ✅ Botão de limpar formulário
- ✅ Formatação automática de valores

### 🎨 UX/UI
- Design moderno e responsivo
- Campos agrupados logicamente
- Feedback visual em tempo real
- Animação de sucesso ao salvar
- Labels claros e descritivos

## 📝 Exemplo de Uso Completo

```javascript
// Exemplo de dados salvos
const exemploPainel = {
  tipoProducao: "painel",
  tipo: "painel",
  descricao: "Painel Promocional 2x3m",
  largura: "2",
  altura: "3",
  area: "6",
  vendedor: "João Silva",
  designer: "Maria Santos",
  tecido: "Lona 440g",
  acabamento: {
    overloque: true,
    elastico: false
  },
  opcoes: {
    ilhos: true,
    cordinha: false
  },
  ilhosQtd: "8",
  ilhosEspaco: "30",
  ilhosValorUnitario: "0,50",
  valorPainel: "180,00",
  valorAdicionais: "20,00",
  valor: "200,00",
  observacao: "Painel para evento corporativo",
  imagem: "data:image/jpeg;base64,..."
};
```

## 🔧 Personalização

Para personalizar o formulário, você pode:

1. **Adicionar novos campos**: Adicione no `formData` inicial
2. **Modificar validações**: Ajuste a função `validarCampos()`
3. **Alterar layout**: Modifique a estrutura de `Row` e `Col`
4. **Customizar estilos**: Use classes CSS customizadas

## 📊 Diferenças entre FormPainel e FormPainelCompleto

| Característica | FormPainel | FormPainelCompleto |
|----------------|------------|-------------------|
| Ilhós | ✅ Sim | ✅ Sim |
| Cordinha | ❌ Não | ✅ Sim |
| Campo Espaço | "Distância" | "Espaço" |
| Emenda | ✅ Sim | ❌ Não |
| Observação | "Observação da Costura" | "Observações" |

## 🎓 Notas Técnicas

- O valor total é calculado automaticamente: `valorPainel + valorAdicionais`
- Formato de valores aceita vírgula como separador decimal: `10,50`
- A área é calculada automaticamente: `largura × altura`
- Imagens são convertidas para base64
- Validação ocorre antes do envio

## 🐛 Solução de Problemas

### Vendedores/Designers não carregam
- Verifique se a API está rodando
- Verifique a conexão com o servidor
- Veja o console para erros

### Validação não funciona
- Certifique-se que todos os campos obrigatórios estão preenchidos
- Verifique se os valores numéricos estão corretos
- Se ilhós/cordinha marcados, preencha todos os campos relacionados

### Imagem não aparece
- Verifique o tamanho da imagem (máx 10MB)
- Use formatos suportados: JPG, PNG, WEBP
- Veja o console para erros de processamento

---

**Criado em:** 08/10/2025  
**Versão:** 1.0.0  
**Arquivo:** `src/components/prouctions/FormPainelCompleto.jsx`


