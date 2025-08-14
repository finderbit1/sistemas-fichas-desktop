import { useState, useEffect } from 'react';
import { Form, Row, Col, Button, Card, Tabs, Tab, Container } from 'react-bootstrap';
import { Typeahead } from 'react-bootstrap-typeahead';
import FormPainel from './prouctions/FormPainel';
import FormTotem from './prouctions/FormTotem';
import FormLona from './prouctions/FormLona';
import FormBolsinha from './FormBolsinha';
import { salvarPedido as salvarPedidoStorage, obterPedidos } from '../utils/localStorageHelper';
import { validarPedido, normalizarDecimais } from "../utils/validador"
import 'react-bootstrap-typeahead/css/Typeahead.css';
import { getAllClientes, getAllFormasPagamentos, getAllFormasEnvios, postPedido } from '../services/api';

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
    <>
      <Form.Select
        aria-label="Selecione o tipo de produção"
        onChange={handleSelectChange}
        value={opcaoSelecionada}
      >
        <option value="">Selecione uma opção</option>
        <option value="painel">Painel</option>
        <option value="totem">Totem</option>
        <option value="lona">Lona</option>
        <option value="bolsinha">Bolsinha</option>
      </Form.Select>
      <div>
        {opcaoSelecionada === 'painel' && <FormPainel {...formProps} />}
        {opcaoSelecionada === 'totem' && <FormTotem {...formProps} />}
        {opcaoSelecionada === 'lona' && <FormLona {...formProps} />}
        {opcaoSelecionada === 'bolsinha' && <FormBolsinha {...formProps} />}
      </div>
    </>
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
    <>
      <Card className="p-4 mb-4 shadow-sm border-0">
        <Form onSubmit={(e) => e.preventDefault()}>
          <Row className="mb-3">
            <Col md={2}>
              <Form.Group controlId="numeroPedido">
                <Form.Control
                  type="text"
                  name="numeroPedido"
                  value={formData.numeroPedido}
                  readOnly
                  placeholder="Id do Pedido"
                />
              </Form.Group>
            </Col>
            <Col md={7}>
              <Form.Group controlId="nomeCliente">
                <Typeahead
                  id="autocomplete-clientes"
                  labelKey="nome"
                  options={clientes}
                  onInputChange={handleBuscarClientes}
                  onChange={handleClienteSelecionado}
                  selected={selectedCliente}
                  placeholder="Digite o nome do cliente"
                  minLength={2}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group controlId="telefoneCliente">
                <Form.Control
                  type="tel"
                  name="telefoneCliente"
                  value={formData.telefoneCliente}
                  onChange={handleChange}
                  placeholder="(00) 00000-0000"
                // readOnly
                />
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={3}>
              <Form.Group controlId="dataEntrada">
                <Form.Label>Data de Entrada</Form.Label>
                <Form.Control
                  type="date"
                  name="dataEntrada"
                  value={formData.dataEntrada}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group controlId="dataEntrega">
                <Form.Label>Data de Entrega</Form.Label>
                <Form.Control
                  type="date"
                  name="dataEntrega"
                  value={formData.dataEntrega}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="cidadeCliente">
                <Form.Label>Cidade do Cliente</Form.Label>
                <Form.Control
                  type="text"
                  name="cidadeCliente"
                  value={formData.cidadeCliente}
                  onChange={handleChange}
                // readOnly
                />
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="observacao">
                <Form.Label>Observações do Pedido</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={1}
                  name="observacao"
                  value={formData.observacao}
                  onChange={handleChange}
                  placeholder="Informações adicionais sobre o pedido..."
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Forma de Envio</Form.Label>
                <Form.Select name="envio" onChange={handleChangeFormaEnvio}>
                  <option value="">Selecione</option>
                  {formasEnvio.map((forma) => (
                    <option key={forma.id} value={forma.id}>
                      {forma.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Prioridade</Form.Label>
                <Form.Select
                  name="prioridade"
                  value={formData.prioridade}
                  onChange={handleChange}
                >
                  <option value="1">Normal</option>
                  <option value="2">Alta</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Card>
      <Card className="mb-3 p-3 shadow-sm border-0">
        <Container className="mt-4">
          <div>
            <Button onClick={adTab}>Adicionar Aba</Button>
          </div>
          <Card className="mt-3">
            <Tabs defaultActiveKey="tab-1" id="container-tabs" className="mb-3">
              {tabs.map((tab, index) => (
                <Tab
                  eventKey={tab.eventKey}
                  title={
                    <>
                      {tab.title}
                      <span
                        onClick={() => removeTab(tab.eventKey)}
                        style={{ cursor: 'pointer', marginLeft: '10px', color: 'red' }}
                      >
                        ✕
                      </span>
                    </>
                  }
                  key={index}
                >
                  {tab.content}
                </Tab>
              ))}
            </Tabs>
          </Card>
        </Container>
      </Card>
      <Card className="p-4 shadow-sm border-0">
        <Row className="mb-3">
          <Col md={3}>
            <Form.Group controlId="valorTotal">
              <Form.Label>Valor Total (R$)</Form.Label>
              <Form.Control
                type="number"
                name="valorTotal"
                value={formData.valorTotal || ''}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group controlId="valorFrete">
              <Form.Label>Valor do Frete (R$)</Form.Label>
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
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group controlId="tipoPagamento">
              <Form.Label>Tipo de Pagamento</Form.Label>
              <Form.Select
                name="tipoPagamento"
                value={formData.tipoPagamento || ''}
                onChange={handleChange}
              >
                <option value="">Selecione</option>
                {formasPagamento.map((forma) => (
                  <option key={forma.id} value={forma.id}>
                    {forma.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group controlId="obsPagamento">
              <Form.Label>Obs. Pagamento</Form.Label>
              <Form.Control
                type="text"
                name="obsPagamento"
                value={formData.obsPagamento || ''}
                onChange={handleChange}
                placeholder="Ex: 2x sem juros, pago no ato, etc."
              />
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col md={2}>
            <Button variant="success" type="button" onClick={handleSalvarPedido}>
              Salvar Pedido
            </Button>
          </Col>
          <Col md={2}>
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
            >
              Cancelar
            </Button>
          </Col>
          <Col md={2}>
            <Button variant="primary" type="button" onClick={() => console.log(JSON.stringify(formData))}>
              Resumo
            </Button>
          </Col>
        </Row>
      </Card>
    </>
  );
};

export default CreateOrder;