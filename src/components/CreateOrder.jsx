import { useState, useEffect } from 'react';
import { Form, Row, Col, Button, Card, Tabs, Tab } from 'react-bootstrap';
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
import CustomAlertModal from './CustomAlertModal';
import useCustomAlert from '../hooks/useCustomAlert';
import FormPainel from './prouctions/FormPainel';
import FormTotem from './prouctions/FormTotem';
import FormLona from './prouctions/FormLona';
import FormAlmofada from './prouctions/FormAlmofada';
import FormBolsinha from './FormBolsinha';
import ResumoModal from './ResumoModal';
import SaveConfirmModal from './SaveConfirmModal';
import ErrorBoundary from './ErrorBoundary';
import pedidosCache from '../utils/pedidosCache';
import { validarPedido, normalizarDecimais } from "../utils/validador"
import { validateOrderDates } from "../utils/dateValidator"
import 'react-bootstrap-typeahead/css/Typeahead.css';
import { getAllClientes, getAllFormasPagamentos, getAllFormasEnvios, getAllDescontos, calcularDesconto, createPedido, getProximoNumeroPedido } from '../services/api';
import { convertFormDataToApiPedido, convertFormDataToRustPedido, validateRustPedidoForApi } from '../utils/apiConverter';
import logger from '../utils/logger';
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
    <div className="form-section" >
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
          <option value="almofada">Almofada</option>
        </Form.Select>
      </div>
      {opcaoSelecionada && (
        <div>
          {opcaoSelecionada === 'painel' && <FormPainel {...formProps} />}
          {opcaoSelecionada === 'totem' && <FormTotem {...formProps} />}
          {opcaoSelecionada === 'lona' && <FormLona {...formProps} />}
          {opcaoSelecionada === 'bolsinha' && <FormBolsinha {...formProps} />}
          {opcaoSelecionada === 'almofada' && <FormAlmofada {...formProps} />}
        </div>
      )}
    </div>
  );
}


const CreateOrder = () => {
  const parseBRLMoney = (value) => {
    if (typeof value === 'number') return value;
    if (!value || value === '') return 0;
    
    // Remove pontos (separador de milhares) e substitui vírgula por ponto
    const normalized = String(value).replace(/\./g, '').replace(',', '.');
    const num = parseFloat(normalized);
    
    return isNaN(num) ? 0 : num;
  };

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
  const [clientesOriginais, setClientesOriginais] = useState([]);
  const [formasPagamento, setFormaPagamento] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState([]);
  const [formasEnvio, setFormasEnvio] = useState([]);
  const [descontos, setDescontos] = useState([]);
  const [descontoSelecionado, setDescontoSelecionado] = useState(null);
  const [descontoCalculado, setDescontoCalculado] = useState(null);
  const [formaSelecionada, setFormaSelecionada] = useState(null);
  const [frete, setFrete] = useState('');
  const [loadingData, setLoadingData] = useState({
    clientes: true,
    formasPagamento: true,
    formasEnvio: true,
    descontos: true,
    numeroPedido: true
  });
  const [apiErrors, setApiErrors] = useState({
    clientes: false,
    formasPagamento: false,
    formasEnvio: false,
    descontos: false,
    numeroPedido: false
  });

  const customAlert = useCustomAlert();
  const [tabsItems, setTabsItems] = useState({});
  const [count, setCount] = useState(1);
  const [resetKey, setResetKey] = useState(0);
  const [activeTab, setActiveTab] = useState('tab-1');
  const [tabs, setTabs] = useState([
    {
      eventKey: `tab-1`,
      title: `Tab 1`,
      content: <TypeProduction key={`tp-init-tab-1`} onItemsChange={(items) => handleItemsChange('tab-1', items)} />,
    },
  ]);
  const [showResumoModal, setShowResumoModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveValidationErrors, setSaveValidationErrors] = useState([]);
  const [dateValidationErrors, setDateValidationErrors] = useState([]);

  useEffect(() => {
    // Carregar próximo número de pedido da API
    getProximoNumeroPedido()
      .then((res) => {
        const proximoNumero = res.data.proximo_numero;
        setFormData((prev) => ({ ...prev, numeroPedido: proximoNumero.toString() }));
        setLoadingData(prev => ({ ...prev, numeroPedido: false }));
      })
      .catch((err) => {
        console.error('Erro ao carregar próximo número de pedido:', err);
        // Fallback para timestamp em caso de erro
        const timestamp = Date.now();
        const numeroPedido = `PED-${timestamp}`;
        setFormData((prev) => ({ ...prev, numeroPedido }));
        setLoadingData(prev => ({ ...prev, numeroPedido: false }));
        setApiErrors(prev => ({ ...prev, numeroPedido: true }));
      });

    // Carregar clientes
    getAllClientes()
      .then((res) => {
        console.log('Clientes carregados:', res.data.length);
        setClientes(res.data);
        setClientesOriginais(res.data);
        setLoadingData(prev => ({ ...prev, clientes: false }));
      })
      .catch((err) => {
        console.error('Erro ao carregar clientes:', err);
        setClientes([]);
        setClientesOriginais([]);
        setLoadingData(prev => ({ ...prev, clientes: false }));
        setApiErrors(prev => ({ ...prev, clientes: true }));
      });

    // Carregar formas de pagamento
    getAllFormasPagamentos()
      .then((res) => {
        console.log('Formas de pagamento carregadas:', res.data.length);
        // Se a API retornar array vazio, usar dados padrão
        const dados = res.data.length > 0 ? res.data : [
          { id: 1, name: 'Dinheiro' },
          { id: 2, name: 'Cartão de Crédito' },
          { id: 3, name: 'PIX' },
          { id: 4, name: 'Boleto' },
          { id: 5, name: 'Transferência' }
        ];
        setFormaPagamento(dados);
        setLoadingData(prev => ({ ...prev, formasPagamento: false }));
      })
      .catch((err) => {
        console.error('Erro ao carregar formas de pagamento:', err);
        // Usar dados padrão em caso de erro
        setFormaPagamento([
          { id: 1, name: 'Dinheiro' },
          { id: 2, name: 'Cartão de Crédito' },
          { id: 3, name: 'PIX' },
          { id: 4, name: 'Boleto' },
          { id: 5, name: 'Transferência' }
        ]);
        setLoadingData(prev => ({ ...prev, formasPagamento: false }));
        setApiErrors(prev => ({ ...prev, formasPagamento: true }));
      });

    // Carregar formas de envio
    getAllFormasEnvios()
      .then((res) => {
        console.log('Formas de envio carregadas:', res.data.length);
        // Se a API retornar array vazio, usar dados padrão
        const dados = res.data.length > 0 ? res.data : [
          { id: 1, name: 'Retirada no Local', value: 0 },
          { id: 2, name: 'Entrega Local', value: 15 },
          { id: 3, name: 'Sedex', value: 25 },
          { id: 4, name: 'PAC', value: 20 },
          { id: 5, name: 'Transportadora', value: 30 }
        ];
        setFormasEnvio(dados);
        setLoadingData(prev => ({ ...prev, formasEnvio: false }));
      })
      .catch((err) => {
        console.error('Erro ao carregar formas de envio:', err);
        // Usar dados padrão em caso de erro
        setFormasEnvio([
          { id: 1, name: 'Retirada no Local', value: 0 },
          { id: 2, name: 'Entrega Local', value: 15 },
          { id: 3, name: 'Sedex', value: 25 },
          { id: 4, name: 'PAC', value: 20 },
          { id: 5, name: 'Transportadora', value: 30 }
        ]);
        setLoadingData(prev => ({ ...prev, formasEnvio: false }));
        setApiErrors(prev => ({ ...prev, formasEnvio: true }));
      });

    // Carregar descontos
    getAllDescontos()
      .then((res) => {
        console.log('Descontos carregados:', res.data.length);
        setDescontos(res.data || []);
        setLoadingData(prev => ({ ...prev, descontos: false }));
      })
      .catch((err) => {
        console.error('Erro ao carregar descontos:', err);
        setDescontos([]);
        setLoadingData(prev => ({ ...prev, descontos: false }));
        setApiErrors(prev => ({ ...prev, descontos: true }));
      });
  }, []);

  const validateDatesInRealTime = (dataEntrada, dataEntrega) => {
    if (dataEntrada && dataEntrega) {
      const dateValidation = validateOrderDates(dataEntrada, dataEntrega);
      setDateValidationErrors(dateValidation.errors);
    } else {
      setDateValidationErrors([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newFormData = { ...prev, [name]: value };
      
      // Validar datas em tempo real
      if (name === 'dataEntrada' || name === 'dataEntrega') {
        validateDatesInRealTime(
          name === 'dataEntrada' ? value : newFormData.dataEntrada,
          name === 'dataEntrega' ? value : newFormData.dataEntrega
        );
      }
      
      return newFormData;
    });
  };

  const handleBuscarClientes = (input) => {
    // A busca será feita pelo filterBy personalizado
    // Esta função pode ser usada para debounce ou outras lógicas se necessário
    if (!input || input.length < 1) {
      // Mostrar clientes mais recentes quando não há input
      const clientesRecentes = clientesOriginais
        .sort((a, b) => (b.ultimoPedido || 0) - (a.ultimoPedido || 0))
        .slice(0, 5);
      setClientes(clientesRecentes);
    }
  };
  const handleClienteSelecionado = (selected) => {
    if (selected.length > 0) {
      const cliente = selected[0];
      setFormData((prev) => ({
        ...prev,
        nomeCliente: cliente.nome,
        telefoneCliente: cliente.telefone || '',
        cidadeCliente: cliente.cidade || '',
        clienteId: cliente.id, // Incluir o ID do cliente
      }));
      setSelectedCliente([cliente]);
    } else {
      // Limpar campos quando não há seleção
      setFormData((prev) => ({
        ...prev,
        nomeCliente: '',
        telefoneCliente: '',
        cidadeCliente: '',
      }));
      setSelectedCliente([]);
    }
  };

  const handleChangeFormaEnvio = (e) => {
    const id = parseInt(e.target.value);
    const forma = formasEnvio.find((f) => f.id === id);
    setFormaSelecionada(forma);
    const freteValue = forma && forma.value !== null ? forma.value : '';
    setFrete(freteValue);
    setFormData((prev) => ({ 
      ...prev, 
      valorFrete: freteValue,
      formaEnvio: forma ? forma.name : '',
      formaEnvioId: forma ? forma.id : ''
    }));
  };

  const handleChangeDesconto = async (e) => {
    const id = parseInt(e.target.value);
    if (id) {
      const desconto = descontos.find((d) => d.id === id);
      setDescontoSelecionado(desconto);
      
      // Calcular desconto baseado no valor total atual
      const allItems = Object.values(tabsItems).flat();
      const valorTotal = allItems.reduce((total, item) => {
        const valor = parseBRLMoney(item.valor);
        return total + valor;
      }, 0);
      
      if (valorTotal > 0) {
        try {
          const response = await calcularDesconto(valorTotal);
          setDescontoCalculado(response.data);
        } catch (error) {
          console.error('Erro ao calcular desconto:', error);
        }
      }
    } else {
      setDescontoSelecionado(null);
      setDescontoCalculado(null);
    }
  };

  const handleItemsChange = (tabKey, newItems) => {
    setTabsItems((prev) => {
      const updated = { ...prev, [tabKey]: newItems };
      const allItems = Object.values(updated).flat();
      
      // Calcular valor total baseado nos itens
      const valorTotal = allItems.reduce((total, item) => {
        const valor = parseBRLMoney(item.valor);
        return total + valor;
      }, 0);
      
      setFormData((prevForm) => ({ 
        ...prevForm, 
        items: allItems,
        valorTotal: valorTotal.toFixed(2).replace('.', ',')
      }));
      return updated;
    });
  };

  const validarPedidoCompleto = () => {
    const erros = [];
    
    // Validação básica usando a função existente
    const errosBasicos = validarPedido(formData);
    erros.push(...errosBasicos);
    
    // Validações adicionais específicas
    if (!formData.nomeCliente?.trim()) {
      erros.push("Nome do cliente é obrigatório");
    }
    
    if (!formData.dataEntrada) {
      erros.push("Data de entrada é obrigatória");
    }
    
    if (!formData.dataEntrega) {
      erros.push("Data de entrega é obrigatória");
    }
    
    // Validação específica de datas
    if (formData.dataEntrada && formData.dataEntrega) {
      const dateValidation = validateOrderDates(formData.dataEntrada, formData.dataEntrega);
      if (!dateValidation.isValid) {
        erros.push(...dateValidation.errors);
      }
    }
    
    if (!formData.items || formData.items.length === 0) {
      erros.push("Pelo menos um item de produção deve ser adicionado");
    }
    
    // Validar se todos os itens têm valor
    if (formData.items && formData.items.length > 0) {
      formData.items.forEach((item, index) => {
        if (!item.valor || parseFloat(item.valor.replace(',', '.')) <= 0) {
          erros.push(`Item ${index + 1} (${item.tipoProducao || 'Produção'}): Valor deve ser maior que zero`);
        }
      });
    }
    
    return erros;
  };

  const handleSalvarPedido = () => {
    const erros = validarPedidoCompleto();
    setSaveValidationErrors(erros);
    setShowSaveModal(true);
  };

  const confirmarSalvamento = async () => {
    setIsSaving(true);

    try {
      const payload = normalizarDecimais(formData);
      
      // Converter para formato da API Rust
      const rustPedido = convertFormDataToRustPedido(payload);
      
      // Validar dados para API
      const validation = validateRustPedidoForApi(rustPedido);
      if (!validation.isValid) {
        setSaveValidationErrors(validation.errors);
        setIsSaving(false);
        return;
      }
      
      // Salvar apenas na API
      try {
        const response = await createPedido(rustPedido);
        console.log('Pedido salvo na API com sucesso:', response.data);
        
        // Adicionar ao cache local
        const pedidoCompleto = {
          ...payload,
          id: response.data.id,
          dataCriacao: new Date().toISOString(),
          status: 'Pendente',
          prioridade: payload.prioridade === '2' ? 'ALTA' : 'NORMAL',
          financeiro: false,
          conferencia: false,
          sublimacao: false,
          costura: false,
          expedicao: false
        };
        
        pedidosCache.addPedido(pedidoCompleto);
        
        // Log da criação do pedido
        logger.logPedidoCreated(pedidoCompleto);
        
        // Mostrar sucesso
        customAlert.showSuccess('Sucesso!', 'Pedido salvo com sucesso na API!');
        
      } catch (apiError) {
        console.error('Erro ao salvar na API:', apiError);
        
        // Log do erro
        logger.log('PEDIDO_CREATE_ERROR', {
          numeroPedido: payload.numeroPedido,
          cliente: payload.nomeCliente,
          error: apiError.message || 'Erro desconhecido'
        }, 'error');
        
        // Mostrar erro
        customAlert.showError('Erro!', 'Falha ao salvar pedido na API. Tente novamente.');
        setIsSaving(false);
        return;
      }

      // Resetar formulário
      resetarFormulario();
      
      // Fechar modal
      setShowSaveModal(false);
      
    } catch (error) {
      console.error("Erro ao salvar pedido:", error);
      customAlert.showError('Erro', 'Erro ao salvar pedido: ' + (error.message || "Erro desconhecido"));
    } finally {
      setIsSaving(false);
    }
  };

  const resetarFormulario = () => {
      // Carregar próximo número de pedido da API
      getProximoNumeroPedido()
        .then((res) => {
          const proximoNumero = res.data.proximo_numero;
          setFormData({
            numeroPedido: proximoNumero.toString(),
        nomeCliente: '',
        telefoneCliente: '',
        dataEntrada: '',
        dataEntrega: '',
        cidadeCliente: '',
        observacao: '',
        prioridade: '1',
        items: [],
      valorTotal: '0,00',
        valorFrete: '',
        tipoPagamento: '',
        obsPagamento: '',
      });
    
      setSelectedCliente([]);
      setTabsItems({});
      setTabs([]); // sem abas após salvar com sucesso
      setCount(0);
      setFrete('');
      setFormaSelecionada(null);
        })
        .catch((err) => {
          console.error('Erro ao carregar próximo número de pedido:', err);
          // Fallback para timestamp em caso de erro
          const timestamp = Date.now();
          const numeroPedido = `PED-${timestamp}`;
          setFormData({
            numeroPedido,
            nomeCliente: '',
            telefoneCliente: '',
            dataEntrada: '',
            dataEntrega: '',
            cidadeCliente: '',
            observacao: '',
            prioridade: '1',
            items: [],
            valorTotal: '0,00',
            valorFrete: '',
            tipoPagamento: '',
            obsPagamento: '',
          });
          setSelectedCliente([]);
          setTabsItems({});
          setTabs([]);
          setCount(0);
          setFrete('');
          setFormaSelecionada(null);
        });
  };

  const adTab = () => {
    const newCount = (count || 0) + 1;
    setCount(newCount);
    const tabKey = `tab-${newCount}`;
    setTabs([
      ...tabs,
      {
        eventKey: tabKey,
        title: `Tab ${newCount}`,
        content: <TypeProduction key={`tp-${Date.now()}-${tabKey}`} onItemsChange={(items) => handleItemsChange(tabKey, items)} />,
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
    <div className="create-order-container">
      {/* Status da API */}
      {(loadingData.clientes || loadingData.formasPagamento || loadingData.formasEnvio || loadingData.descontos) && (
        <div className="alert alert-info d-flex align-items-center mb-3" role="alert">
          <div className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></div>
          <div>
            <strong>Carregando dados da API...</strong>
            <div className="small">
              {loadingData.clientes && 'Clientes '}
              {loadingData.formasPagamento && 'Formas de Pagamento '}
              {loadingData.formasEnvio && 'Formas de Envio '}
              {loadingData.descontos && 'Descontos '}
            </div>
          </div>
        </div>
      )}
      
      {/* Erros da API */}
      {(apiErrors.clientes || apiErrors.formasPagamento || apiErrors.formasEnvio || apiErrors.descontos) && (
        <div className="alert alert-warning d-flex align-items-center mb-3" role="alert">
          <ExclamationTriangle size={20} className="me-2" />
          <div>
            <strong>Atenção:</strong> Alguns dados não puderam ser carregados da API.
            <div className="small">
              {apiErrors.clientes && 'Clientes '}
              {apiErrors.formasPagamento && 'Formas de Pagamento '}
              {apiErrors.formasEnvio && 'Formas de Envio '}
              {apiErrors.descontos && 'Descontos '}
              - usando dados padrão para garantir funcionamento.
            </div>
          </div>
        </div>
      )}

      {/* Sucesso da API */}

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
                <label className="form-label">ID Pedido</label>
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
                  placeholder="Digite o nome do cliente..."
                  minLength={1}
                  className="form-control typeahead-normal"
                  clearButton
                  highlightOnlyResult
                  selectHintOnEnter
                  allowNew={false}
                  newSelectionPrefix=""
                  maxResults={8}
                  renderMenuItemChildren={(option, props) => (
                    <div>
                      <div className="fw-semibold">{option.nome}</div>
                      <small className="text-muted">
                        {option.telefone && `${option.telefone} • `}
                        {option.cidade}
                      </small>
                    </div>
                  )}
                  filterBy={(option, props) => {
                    const text = props.text.toLowerCase();
                    return (
                      option.nome.toLowerCase().includes(text) ||
                      (option.telefone && option.telefone.includes(text)) ||
                      (option.cidade && option.cidade.toLowerCase().includes(text))
                    );
                  }}
                />
                {loadingData.clientes && (
                  <div className="form-text">
                    <div className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></div>
                    Carregando clientes...
                  </div>
                )}
                {apiErrors.clientes && (
                  <div className="form-text text-warning">
                    <ExclamationTriangle size={12} className="me-1" />
                    Erro ao carregar clientes - usando dados locais
                  </div>
                )}
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
                  className={`form-control ${dateValidationErrors.some(err => err.includes('entrada')) ? 'is-invalid' : ''}`}
                />
                {dateValidationErrors.some(err => err.includes('entrada')) && (
                  <div className="invalid-feedback">
                    {dateValidationErrors.find(err => err.includes('entrada'))}
                  </div>
                )}
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
                  className={`form-control ${dateValidationErrors.some(err => err.includes('entrega')) ? 'is-invalid' : ''}`}
                />
                {dateValidationErrors.some(err => err.includes('entrega')) && (
                  <div className="invalid-feedback">
                    {dateValidationErrors.find(err => err.includes('entrega'))}
                  </div>
                )}
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
          
          {/* Alerta de validação de datas */}
          {dateValidationErrors.length > 0 && (
            <Row className="mb-3">
              <Col md={12}>
                <div className="alert alert-warning d-flex align-items-center" role="alert">
                  <ExclamationTriangle size={20} className="me-2" />
                  <div>
                    <strong>Atenção:</strong>
                    <ul className="mb-0 mt-1">
                      {dateValidationErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Col>
            </Row>
          )}
          
          <Row className="mb-4">
            <Col md={6}>
              <div className="form-group">
                <label className="form-label">
                  <FileText size={16} style={{ marginRight: '8px' }} />
                  Observações do Pedido
                </label>
                <Form.Control
                  as="textarea"
                  rows={1}
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
                <Form.Select 
                  name="envio" 
                  onChange={handleChangeFormaEnvio} 
                  className={`form-control ${apiErrors.formasEnvio ? 'is-invalid' : ''}`}
                  disabled={loadingData.formasEnvio}
                >
                  <option value="">
                    {loadingData.formasEnvio ? 'Carregando...' : 
                     apiErrors.formasEnvio ? 'Erro ao carregar' : 'Selecione'}
                  </option>
                  {formasEnvio.map((forma) => (
                    <option key={forma.id} value={forma.id}>
                      {forma.name} {forma.value ? `(R$ ${forma.value.toFixed(2)})` : ''}
                    </option>
                  ))}
                </Form.Select>
                {apiErrors.formasEnvio && (
                  <div className="invalid-feedback">
                    Erro ao carregar formas de envio da API
                  </div>
                )}
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
            className="add-tab-button"
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
                        className="tab-close-button"
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
                type="text"
                name="valorTotal"
                value={formData.valorTotal || '0,00'}
                readOnly
                placeholder="0,00"
                className="form-control"
                style={{ backgroundColor: 'var(--color-neutral-100)', color: 'var(--color-neutral-600)' }}
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
                onChange={(e) => {
                  const id = parseInt(e.target.value);
                  const forma = formasPagamento.find((f) => f.id === id);
                  setFormData((prev) => ({
                    ...prev,
                    tipoPagamento: id || '',
                    tipoPagamentoNome: forma ? forma.name : ''
                  }));
                }}
                className={`form-control ${apiErrors.formasPagamento ? 'is-invalid' : ''}`}
                disabled={loadingData.formasPagamento}
              >
                <option value="">
                  {loadingData.formasPagamento ? 'Carregando...' : 
                   apiErrors.formasPagamento ? 'Erro ao carregar' : 'Selecione'}
                </option>
                {formasPagamento.map((forma) => (
                  <option key={forma.id} value={forma.id}>
                    {forma.name} {forma.value ? `(+R$ ${forma.value.toFixed(2)})` : ''}
                  </option>
                ))}
              </Form.Select>
              {apiErrors.formasPagamento && (
                <div className="invalid-feedback">
                  Erro ao carregar formas de pagamento da API
                </div>
              )}
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
        
        {/* Campo de Desconto */}
        <Row className="mb-4">
          <Col md={6}>
            <div className="form-group">
              <label className="form-label">
                <CurrencyDollar size={16} style={{ marginRight: '8px' }} />
                Desconto
              </label>
              <Form.Select 
                name="desconto" 
                onChange={handleChangeDesconto} 
                className={`form-control ${apiErrors.descontos ? 'is-invalid' : ''}`}
                disabled={loadingData.descontos}
              >
                <option value="">
                  {loadingData.descontos ? 'Carregando...' : 
                   apiErrors.descontos ? 'Erro ao carregar' : 'Selecione um desconto'}
                </option>
                {descontos.map((desconto) => (
                  <option key={desconto.id} value={desconto.id}>
                    {desconto.descricao} - {desconto.percentual}% (mín. R$ {desconto.valor_minimo.toFixed(2)})
                  </option>
                ))}
              </Form.Select>
              {apiErrors.descontos && (
                <div className="invalid-feedback">
                  Erro ao carregar descontos da API
                </div>
              )}
            </div>
          </Col>
          <Col md={6}>
            {descontoCalculado && (
              <div className="form-group">
                <label className="form-label">
                  <CurrencyDollar size={16} style={{ marginRight: '8px' }} />
                  Resumo do Desconto
                </label>
                <div className="alert alert-info">
                  <div className="d-flex justify-content-between">
                    <span>Valor Original:</span>
                    <strong>R$ {descontoCalculado.valor_original.toFixed(2)}</strong>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Desconto ({descontoCalculado.percentual_aplicado}%):</span>
                    <strong className="text-success">-R$ {descontoCalculado.valor_desconto.toFixed(2)}</strong>
                  </div>
                  <hr className="my-2" />
                  <div className="d-flex justify-content-between">
                    <span><strong>Valor Final:</strong></span>
                    <strong className="text-primary">R$ {descontoCalculado.valor_final.toFixed(2)}</strong>
                  </div>
                </div>
              </div>
            )}
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
                onClick={() => setShowResumoModal(true)}
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
      
      <ResumoModal
        show={showResumoModal}
        onHide={() => setShowResumoModal(false)}
        formData={formData}
      />
      
      <ErrorBoundary>
        <SaveConfirmModal
          show={showSaveModal}
          onHide={() => setShowSaveModal(false)}
          onConfirm={confirmarSalvamento}
          isSaving={isSaving}
          formData={formData || {}}
          validationErrors={saveValidationErrors || []}
        />
      </ErrorBoundary>

      <CustomAlertModal
        isOpen={customAlert.alertState.isOpen}
        onClose={customAlert.hideAlert}
        type={customAlert.alertState.type}
        title={customAlert.alertState.title}
        message={customAlert.alertState.message}
        confirmText={customAlert.alertState.confirmText}
        onConfirm={customAlert.alertState.onConfirm}
        showCancel={customAlert.alertState.showCancel}
        cancelText={customAlert.alertState.cancelText}
      />
    </div>
  );
};

export default CreateOrder;