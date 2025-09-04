import { useState, useEffect } from 'react';
import { Form, Row, Col, Button, Card, Tabs, Tab, Container } from 'react-bootstrap';
import { Typeahead } from 'react-bootstrap-typeahead';
import { 
  Person, 
  Calendar, 
  GeoAlt, 
  Phone, 
  FileText, 
  Truck, 
  ExclamationTriangle,
  Plus,
  X,
  Save,
  ArrowClockwise,
  Eye,
  CurrencyDollar
} from 'react-bootstrap-icons';
import FormPainel from './prouctions/FormPainel';
import FormTotem from './prouctions/FormTotem';
import FormLona from './prouctions/FormLona';
import FormBolsinha from './FormBolsinha';
import { salvarPedido as salvarPedidoStorage, obterPedidos } from '../utils/localStorageHelper';
import { validarPedido, normalizarDecimais } from "../utils/validador"
import 'react-bootstrap-typeahead/css/Typeahead.css';
import { getAllClientes, getAllFormasPagamentos, getAllFormasEnvios, postPedido } from '../services/api';
import '../styles/forms.css';

function TypeProduction({ onItemsChange }) {
  const [opcaoSelecionada, setOpcaoSelecionada] = useState('');
  const [items, setItems] = useState([]);

  const adicionarItem = (item) => {
    const updatedItems = [...items, item];
    setItems(updatedItems);
    onItemsChange(updatedItems);
  };

  const handleSelectChange = (e) => {
    setOpcaoSelecionada(e.target.value);
    setItems([]);

    onItemsChange([]);
  };

  const formProps = {
    onAdicionarItem: adicionarItem,
  };

  return (
    <div className="form-section">
      <div className="form-group">
        <label className="form-label">
          <FileText size={16} style={{ marginRight: '8px' }} />
          Tipo de Produção
        </label>
        <Form.Select
          aria-label="Selecione o tipo de produção"
          onChange={handleSelectChange}
          value={opcaoSelecionada}
          className="form-control"
        >
          <option value="">Selecione uma opção</option>
          <option value="painel">Painel</option>
          <option value="totem">Totem</option>
          <option value="lona">Lona</option>
          <option value="bolsinha">Bolsinha</option>
        </Form.Select>
      </div>
      {opcaoSelecionada && (
        <div className="animate-fade-in">
          {opcaoSelecionada === 'painel' && <FormPainel {...formProps} />}
          {opcaoSelecionada === 'totem' && <FormTotem {...formProps} />}
          {opcaoSelecionada === 'lona' && <FormLona {...formProps} />}
          {opcaoSelecionada === 'bolsinha' && <FormBolsinha {...formProps} />}
        </div>
      )}
    </div>
  );
}


const CreateOrder = () => {
  const [formData, setFormData] = useState({
    numeroPedido: '',
    nomeCliente: '',
    telefoneCliente: '',
    dataEntrada: '',
    dataEntrega: '',
    cidadeCliente: '',
    observacao: '',
    prioridade: '1',
    items: [],
    valorTotal: '',
    valorFrete: '',
    tipoPagamento: '',
    obsPagamento: '',
  });

  const [clientes, setClientes] = useState([]);
  const [formasPagamento, setFormaPagamento] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState([]);
  const [formasEnvio, setFormasEnvio] = useState([]);
  const [formaSelecionada, setFormaSelecionada] = useState(null);
  const [frete, setFrete] = useState('');
  const [tabsItems, setTabsItems] = useState({});
  const [count, setCount] = useState(1);
  const [tabs, setTabs] = useState([
    {
      eventKey: `tab-1`,
      title: `Tab 1`,
      content: <TypeProduction onItemsChange={(items) => handleItemsChange('tab-1', items)} />,
    },
  ]);

  useEffect(() => {
    const pedidos = obterPedidos();
    const lastId = pedidos.length;
    setFormData((prev) => ({ ...prev, numeroPedido: String(lastId + 1) }));

    getAllClientes()
      .then((res) => setClientes(res.data))
      .catch((err) => console.error(err));

    getAllFormasPagamentos()
      .then((res) => setFormaPagamento(res.data))
      .catch((err) => console.error(err));

    getAllFormasEnvios()
      .then((res) => setFormasEnvio(res.data))
      .catch((err) => console.error(err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBuscarClientes = (input) => {
    if (!input || input.length < 1) return;
    const resultado = clientes.filter((cliente) =>
      cliente.nome.toLowerCase().includes(input.toLowerCase())
    );
    setClientes(resultado);
  };
  const handleClienteSelecionado = (selected) => {
    if (selected.length > 0) {
      const cliente = selected[0];
      setFormData((prev) => ({
        ...prev,
        nomeCliente: cliente.nome,
        telefoneCliente: cliente.telefone,
        cidadeCliente: cliente.cidade,
      }));
      setSelectedCliente([cliente]);
    }
  };

  const handleChangeFormaEnvio = (e) => {
    const id = parseInt(e.target.value);
    const forma = formasEnvio.find((f) => f.id === id);
    setFormaSelecionada(forma);
    const freteValue = forma && forma.value !== null ? forma.value : '';
    setFrete(freteValue);
    setFormData((prev) => ({ ...prev, valorFrete: freteValue }));
  };

  const handleItemsChange = (tabKey, newItems) => {
    setTabsItems((prev) => {
      const updated = { ...prev, [tabKey]: newItems };
      const allItems = Object.values(updated).flat();
      setFormData((prevForm) => ({ ...prevForm, items: allItems }));
      return updated;
    });
  };

  async function handleSalvarPedido() {
    const erros = validarPedido(formData);
    if (erros.length > 0) {
      alert("Erros encontrados:\n\n" + erros.join("\n"));
      return;
    }

    try {
      const payload = normalizarDecimais(formData);
      postPedido(payload)
        .then((res) => {
          alert('Pedido salvo com sucesso!');

        })
        .catch((err) => {
          alert(err)
        })
      // salvarPedidoStorage(payload);

      // Resetar formulário
      const pedidos = obterPedidos();
      const proximoId = pedidos.length + 1;
      setFormData({
        numeroPedido: String(proximoId),
        nomeCliente: '',
        telefoneCliente: '',
        dataEntrada: '',
        dataEntrega: '',
        cidadeCliente: '',
        observacao: '',
        prioridade: '1',
        items: [],
        valorTotal: '',
        valorFrete: '',
        tipoPagamento: '',
        obsPagamento: '',
      });
      setSelectedCliente([]);
      setTabsItems({});
      setTabs([
        {
          eventKey: `tab-1`,
          title: `Tab 1`,
          content: <TypeProduction onItemsChange={(items) => handleItemsChange('tab-1', items)} />,
        },
      ]);
      setCount(1);
    } catch (error) {
      console.error("Erro ao salvar pedido:", error.response?.data || error.message);
      alert("Erro ao salvar pedido: " + JSON.stringify(error.response?.data || error.message));
    }
  }

  const adTab = () => {
    const newCount = count + 1;
    setCount(newCount);
    const tabKey = `tab-${newCount}`;
    setTabs([
      ...tabs,
      {
        eventKey: tabKey,
        title: `Tab ${newCount}`,
        content: <TypeProduction onItemsChange={(items) => handleItemsChange(tabKey, items)} />,
      },
    ]);
  };

  const removeTab = (eventKey) => {
    const updatedTabs = tabs.filter((tab) => tab.eventKey !== eventKey);
    setTabs(updatedTabs);
    setTabsItems((prev) => {
      const updated = { ...prev };
      delete updated[eventKey];
      const allItems = Object.values(updated).flat();
      setFormData((prevForm) => ({ ...prevForm, items: allItems }));
      return updated;
    });

    if (updatedTabs.length === 0) {
      setCount(1);
      setTabs([
        {
          eventKey: `tab-1`,
          title: `Tab 1`,
          content: <TypeProduction onItemsChange={(items) => handleItemsChange('tab-1', items)} />,
        },
      ]);
    }
  };

  return (
    <div style={{ padding: 0 }}>
      <div className="dashboard-card mb-4">
        <div className="dashboard-card-header">
          <h5 className="dashboard-card-title">
            <Person size={20} style={{ marginRight: '8px' }} />
            Informações do Cliente
          </h5>
        </div>
        <Form onSubmit={(e) => e.preventDefault()}>
          <Row className="mb-4">
            <Col md={2}>
              <div className="form-group">
                <label className="form-label">Número do Pedido</label>
                <Form.Control
                  type="text"
                  name="numeroPedido"
                  value={formData.numeroPedido}
                  readOnly
                  placeholder="ID"
                  className="form-control"
                  style={{ backgroundColor: 'var(--color-neutral-100)', color: 'var(--color-neutral-600)' }}
                />
              </div>
            </Col>
            <Col md={7}>
              <div className="form-group">
                <label className="form-label">
                  <Person size={16} style={{ marginRight: '8px' }} />
                  Nome do Cliente
                </label>
                <Typeahead
                  id="autocomplete-clientes"
                  labelKey="nome"
                  options={clientes}
                  onInputChange={handleBuscarClientes}
                  onChange={handleClienteSelecionado}
                  selected={selectedCliente}
                  placeholder="Digite o nome do cliente"
                  minLength={2}
                  className="form-control"
                />
              </div>
            </Col>
            <Col md={3}>
              <div className="form-group">
                <label className="form-label">
                  <Phone size={16} style={{ marginRight: '8px' }} />
                  Telefone
                </label>
                <Form.Control
                  type="tel"
                  name="telefoneCliente"
                  value={formData.telefoneCliente}
                  onChange={handleChange}
                  placeholder="(00) 00000-0000"
                  className="form-control"
                />
              </div>
            </Col>
          </Row>
          <Row className="mb-4">
            <Col md={3}>
              <div className="form-group">
                <label className="form-label">
                  <Calendar size={16} style={{ marginRight: '8px' }} />
                  Data de Entrada
                </label>
                <Form.Control
                  type="date"
                  name="dataEntrada"
                  value={formData.dataEntrada}
                  onChange={handleChange}
                  required
                  className="form-control"
                />
              </div>
            </Col>
            <Col md={3}>
              <div className="form-group">
                <label className="form-label">
                  <Calendar size={16} style={{ marginRight: '8px' }} />
                  Data de Entrega
                </label>
                <Form.Control
                  type="date"
                  name="dataEntrega"
                  value={formData.dataEntrega}
                  onChange={handleChange}
                  required
                  className="form-control"
                />
              </div>
            </Col>
            <Col md={6}>
              <div className="form-group">
                <label className="form-label">
                  <GeoAlt size={16} style={{ marginRight: '8px' }} />
                  Cidade do Cliente
                </label>
                <Form.Control
                  type="text"
                  name="cidadeCliente"
                  value={formData.cidadeCliente}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
            </Col>
          </Row>
          <Row className="mb-4">
            <Col md={6}>
              <div className="form-group">
                <label className="form-label">
                  <FileText size={16} style={{ marginRight: '8px' }} />
                  Observações do Pedido
                </label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="observacao"
                  value={formData.observacao}
                  onChange={handleChange}
                  placeholder="Informações adicionais sobre o pedido..."
                  className="form-control form-textarea"
                />
              </div>
            </Col>
            <Col md={4}>
              <div className="form-group">
                <label className="form-label">
                  <Truck size={16} style={{ marginRight: '8px' }} />
                  Forma de Envio
                </label>
                <Form.Select name="envio" onChange={handleChangeFormaEnvio} className="form-control">
                  <option value="">Selecione</option>
                  {formasEnvio.map((forma) => (
                    <option key={forma.id} value={forma.id}>
                      {forma.name}
                    </option>
                  ))}
                </Form.Select>
              </div>
            </Col>
            <Col md={2}>
              <div className="form-group">
                <label className="form-label">
                  <ExclamationTriangle size={16} style={{ marginRight: '8px' }} />
                  Prioridade
                </label>
                <Form.Select
                  name="prioridade"
                  value={formData.prioridade}
                  onChange={handleChange}
                  className="form-control"
                >
                  <option value="1">Normal</option>
                  <option value="2">Alta</option>
                </Form.Select>
              </div>
            </Col>
          </Row>
        </Form>
      </div>
      <div className="dashboard-card mb-4">
        <div className="dashboard-card-header">
          <h5 className="dashboard-card-title">
            <FileText size={20} style={{ marginRight: '8px' }} />
            Itens do Pedido
          </h5>
          <Button 
            onClick={adTab} 
            className="btn btn-outline btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Plus size={16} />
            Adicionar Item
          </Button>
        </div>
        <div className="mt-4">
          <Tabs defaultActiveKey="tab-1" id="container-tabs" className="mb-3">
            {tabs.map((tab, index) => (
              <Tab
                eventKey={tab.eventKey}
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{tab.title}</span>
                    {tabs.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeTab(tab.eventKey);
                        }}
                        style={{ 
                          background: 'none', 
                          border: 'none', 
                          color: 'var(--color-error)', 
                          cursor: 'pointer',
                          padding: '2px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '20px',
                          height: '20px'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-error-light)'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                }
                key={index}
              >
                <div style={{ padding: '24px 0' }}>
                  {tab.content}
                </div>
              </Tab>
            ))}
          </Tabs>
        </div>
      </div>
      <div className="dashboard-card">
        <div className="dashboard-card-header">
          <h5 className="dashboard-card-title">
            <CurrencyDollar size={20} style={{ marginRight: '8px' }} />
            Informações Financeiras
          </h5>
        </div>
        <Row className="mb-4">
          <Col md={3}>
            <div className="form-group">
              <label className="form-label">
                <CurrencyDollar size={16} style={{ marginRight: '8px' }} />
                Valor Total (R$)
              </label>
              <Form.Control
                type="number"
                name="valorTotal"
                value={formData.valorTotal || ''}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="form-control"
              />
            </div>
          </Col>
          <Col md={3}>
            <div className="form-group">
              <label className="form-label">
                <Truck size={16} style={{ marginRight: '8px' }} />
                Valor do Frete (R$)
              </label>
              <Form.Control
                type="number"
                name="valorFrete"
                value={frete}
                onChange={(e) => {
                  setFrete(e.target.value);
                  setFormData((prev) => ({ ...prev, valorFrete: e.target.value }));
                }}
                placeholder="0.00"
                step="0.01"
                className="form-control"
              />
            </div>
          </Col>
          <Col md={3}>
            <div className="form-group">
              <label className="form-label">
                <CurrencyDollar size={16} style={{ marginRight: '8px' }} />
                Tipo de Pagamento
              </label>
              <Form.Select
                name="tipoPagamento"
                value={formData.tipoPagamento || ''}
                onChange={handleChange}
                className="form-control"
              >
                <option value="">Selecione</option>
                {formasPagamento.map((forma) => (
                  <option key={forma.id} value={forma.id}>
                    {forma.name}
                  </option>
                ))}
              </Form.Select>
            </div>
          </Col>
          <Col md={3}>
            <div className="form-group">
              <label className="form-label">
                <FileText size={16} style={{ marginRight: '8px' }} />
                Obs. Pagamento
              </label>
              <Form.Control
                type="text"
                name="obsPagamento"
                value={formData.obsPagamento || ''}
                onChange={handleChange}
                placeholder="Ex: 2x sem juros, pago no ato, etc."
                className="form-control"
              />
            </div>
          </Col>
        </Row>
        <Row>
          <Col md={12}>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
              <Button 
                variant="success" 
                type="button" 
                onClick={handleSalvarPedido}
                className="btn btn-success"
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Save size={16} />
                Salvar Pedido
              </Button>
              <Button
                variant="danger"
                type="reset"
                onClick={() => {
                  setFormData({
                    numeroPedido: formData.numeroPedido,
                    nomeCliente: '',
                    telefoneCliente: '',
                    dataEntrada: '',
                    dataEntrega: '',
                    cidadeCliente: '',
                    observacao: '',
                    prioridade: '1',
                    items: [],
                    valorTotal: '',
                    valorFrete: '',
                    tipoPagamento: '',
                    obsPagamento: '',
                  });
                  setSelectedCliente([]);
                  setTabsItems({});
                  setTabs([
                    {
                      eventKey: `tab-1`,
                      title: `Tab 1`,
                      content: (
                        <TypeProduction
                          onItemsChange={(items) => handleItemsChange('tab-1', items)}
                        />
                      ),
                    },
                  ]);
                  setCount(1);
                }}
                className="btn btn-error"
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <ArrowClockwise size={16} />
                Cancelar
              </Button>
              <Button 
                variant="primary" 
                type="button" 
                onClick={() => console.log(JSON.stringify(formData))}
                className="btn btn-outline"
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Eye size={16} />
                Resumo
              </Button>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default CreateOrder;