# AutocompleteInput Component

Componente de input com autocomplete para seleção de opções.

## Funcionalidades

- ✅ **Busca em tempo real** - Filtra opções conforme você digita
- ✅ **Navegação por teclado** - Use as setas ↑↓ para navegar
- ✅ **Seleção por teclado** - Pressione Enter para selecionar
- ✅ **Escape para fechar** - Pressione Esc para fechar o dropdown
- ✅ **Clique para selecionar** - Clique em qualquer opção
- ✅ **Indicador de carregamento** - Mostra spinner quando carregando
- ✅ **Estado desabilitado** - Pode ser desabilitado
- ✅ **Placeholder dinâmico** - Texto de ajuda contextual

## Como Usar

```jsx
import AutocompleteInput from '../components/AutocompleteInput';

const [valor, setValor] = useState('');

<AutocompleteInput
  label="Selecione um Cliente"
  placeholder="Digite o nome do cliente..."
  options={['Cliente 1', 'Cliente 2', 'Cliente 3']}
  value={valor}
  onChange={setValor}
  onSelect={(valorSelecionado) => {
    console.log('Cliente selecionado:', valorSelecionado);
  }}
  loading={false}
  disabled={false}
/>
```

## Props

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `label` | string | - | Label do input |
| `placeholder` | string | - | Texto de placeholder |
| `options` | string[] | [] | Lista de opções disponíveis |
| `value` | string | - | Valor atual do input |
| `onChange` | function | - | Callback quando o valor muda |
| `onSelect` | function | - | Callback quando uma opção é selecionada |
| `disabled` | boolean | false | Se o input está desabilitado |
| `loading` | boolean | false | Se está carregando (mostra spinner) |
| `className` | string | "" | Classes CSS adicionais |

## Navegação por Teclado

- **↑** - Opção anterior
- **↓** - Próxima opção  
- **Enter** - Selecionar opção destacada
- **Esc** - Fechar dropdown
- **Tab** - Sair do componente

## Exemplo de Uso na Página de Relatórios

```jsx
<AutocompleteInput
  label="Cliente"
  placeholder="Digite o nome do cliente..."
  options={listaClientes}
  value={filtroNome}
  onChange={setFiltroNome}
  onSelect={(cliente) => {
    console.log('Cliente selecionado:', cliente);
    setFiltroNome(cliente);
  }}
  disabled={carregandoListas || listaClientes.length === 0}
  loading={carregandoListas}
/>
```

