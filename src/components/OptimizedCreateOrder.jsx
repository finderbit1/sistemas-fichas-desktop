import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
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
import { convertFormDataToApiPedido, validatePedidoForApi } from '../utils/apiConverter';
import logger from '../utils/logger';
import '../styles/forms.css';

// Componente memoizado para TypeProduction
const TypeProduction = memo(({ onItemsChange }) => {
  const [opcaoSelecionada, setOpcaoSelecionada] = useState('');
  const [items, setItems] = useState([]);

  const adicionarItem = useCallback((item) => {
    const updatedItems = [...items, item];
    setItems(updatedItems);
    onItemsChange(updatedItems);
  }, [items, onItemsChange]);

  const handleSelectChange = useCallback((e) => {
    setOpcaoSelecionada(e.target.value);
    setItems([]);
    onItemsChange([]);
  }, [onItemsChange]);

  const formProps = useMemo(() => ({
    onAdicionarItem: adicionarItem,
  }), [adicionarItem]);

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
});

// Hook customizado para gerenciar dados da API com cache
const useApiData = () => {
  const [data, setData] = useState({
    clientes: [],
    formasPagamento: [],
    formasEnvio: [],
    descontos: [],
    numeroPedido: ''
  });
  
  const [loading, setLoading] = useState({
    clientes: true,
    formasPagamento: true,
    formasEnvio: true,
    descontos: true,
    numeroPedido: true
  });
  
  const [errors, setErrors] = useState({
    clientes: false,
    formasPagamento: false,
    formasEnvio: false,
    descontos: false,
    numeroPedido: false
  });

  const loadData = useCallback(async () => {
    const promises = [
      getProximoNumeroPedido().catch(() => ({ data: { proximo_numero: Date.now() } })),
      getAllClientes().catch(() => ({ data: [] })),
      getAllFormasPagamentos().catch(() => ({ data: [] })),
      getAllFormasEnvios().catch(() => ({ data: [] })),
      getAllDescontos().catch(() => ({ data: [] }))
    ];

    try {
      const [numeroRes, clientesRes, pagamentosRes, enviosRes, descontosRes] = await Promise.all(promises);
      
      setData({
        numeroPedido: numeroRes.data.proximo_numero.toString(),
        clientes: clientesRes.data || [],
        formasPagamento: pagamentosRes.data.length > 0 ? pagamentosRes.data : [
          { id: 1, name: 'Dinheiro' },
          { id: 2, name: 'Cartão de Crédito' },
          { id: 3, name: 'PIX' },
          { id: 4, name: 'Boleto' },
          { id: 5, name: 'Transferência' }
        ],
        formasEnvio: enviosRes.data.length > 0 ? enviosRes.data : [
          { id: 1, name: 'Retirada no Local', value: 0 },
          { id: 2, name: 'Entrega Local', value: 15 },
          { id: 3, name: 'Sedex', value: 25 },
          { id: 4, name: 'PAC', value: 20 },
          { id: 5, name: 'Transportadora', value: 30 }
        ],
        descontos: descontosRes.data || []
      });
      
      setLoading({
        clientes: false,
        formasPagamento: false,
        formasEnvio: false,
        descontos: false,
        numeroPedido: false
      });
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setErrors({
        clientes: true,
        formasPagamento: true,
        formasEnvio: true,
        descontos: true,
        numeroPedido: true
      });
      setLoading({
        clientes: false,
        formasPagamento: false,
        formasEnvio: false,
        descontos: false,
        numeroPedido: false
      });
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { data, loading, errors, reload: loadData };
};

// Componente memoizado para campos do cliente
const ClienteFields = memo(({ 
  formData, 
  clientes, 
  selectedCliente, 
  loadingClientes, 
  errorClientes,
  onFormChange,
  onClienteSelecionado,
  onBuscarClientes
}) => {
  return (
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
            onInputChange={onBuscarClientes}
            onChange={onClienteSelecionado}
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
          {loadingClientes && (
            <div className="form-text">
              <div className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></div>
              Carregando clientes...
            </div>
          )}
          {errorClientes && (
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
            onChange={onFormChange}
            placeholder="(00) 00000-0000"
            className="form-control"
          />
        </div>
      </Col>
    </Row>
  );
});

// Componente memoizado para campos de data
const DateFields = memo(({ formData, dateValidationErrors, onFormChange }) => {
  return (
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
            onChange={onFormChange}
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
            onChange={onFormChange}
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
            onChange={onFormChange}
            className="form-control"
          />
        </div>
      </Col>
    </Row>
  );
});

const OptimizedCreateOrder = () => {
  const parseBRLMoney = useCallback((value) => {
    if (typeof value === 'number') return value;
    if (!value || value === '') return 0;
    
    const normalized = String(value).replace(/\./g, '').replace(',', '.');
    const num = parseFloat(normalized);
    
    return isNaN(num) ? 0 : num;
  }, []);

  const { data: apiData, loading: apiLoading, errors: apiErrors } = useApiData();

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

  const [selectedCliente, setSelectedCliente] = useState([]);
  const [descontoSelecionado, setDescontoSelecionado] = useState(null);
  const [descontoCalculado, setDescontoCalculado] = useState(null);
  const [formaSelecionada, setFormaSelecionada] = useState(null);
  const [frete, setFrete] = useState('');
  const [dateValidationErrors, setDateValidationErrors] = useState([]);
  const [tabsItems, setTabsItems] = useState({});
  const [count, setCount] = useState(1);
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

  const customAlert = useCustomAlert();

  // Atualizar formData quando apiData muda
  useEffect(() => {
    if (apiData.numeroPedido) {
      setFormData(prev => ({ ...prev, numeroPedido: apiData.numeroPedido }));
    }
  }, [apiData.numeroPedido]);

  const validateDatesInRealTime = useCallback((dataEntrada, dataEntrega) => {
    if (dataEntrada && dataEntrega) {
      const dateValidation = validateOrderDates(dataEntrada, dataEntrega);
      setDateValidationErrors(dateValidation.errors);
    } else {
      setDateValidationErrors([]);
    }
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newFormData = { ...prev, [name]: value };
      
      if (name === 'dataEntrada' || name === 'dataEntrega') {
        validateDatesInRealTime(
          name === 'dataEntrada' ? value : newFormData.dataEntrada,
          name === 'dataEntrega' ? value : newFormData.dataEntrega
        );
      }
      
      return newFormData;
    });
  }, [validateDatesInRealTime]);

  const handleBuscarClientes = useCallback((input) => {
    if (!input || input.length < 1) {
      const clientesRecentes = apiData.clientes
        .sort((a, b) => (b.ultimoPedido || 0) - (a.ultimoPedido || 0))
        .slice(0, 5);
      // Não precisamos atualizar clientes aqui, pois já estão no estado
    }
  }, [apiData.clientes]);

  const handleClienteSelecionado = useCallback((selected) => {
    if (selected.length > 0) {
      const cliente = selected[0];
      setFormData((prev) => ({
        ...prev,
        nomeCliente: cliente.nome,
        telefoneCliente: cliente.telefone || '',
        cidadeCliente: cliente.cidade || '',
      }));
      setSelectedCliente([cliente]);
    } else {
      setFormData((prev) => ({
        ...prev,
        nomeCliente: '',
        telefoneCliente: '',
        cidadeCliente: '',
      }));
      setSelectedCliente([]);
    }
  }, []);

  const handleChangeFormaEnvio = useCallback((e) => {
    const id = parseInt(e.target.value);
    const forma = apiData.formasEnvio.find((f) => f.id === id);
    setFormaSelecionada(forma);
    const freteValue = forma && forma.value !== null ? forma.value : '';
    setFrete(freteValue);
    setFormData((prev) => ({ 
      ...prev, 
      valorFrete: freteValue,
      formaEnvio: forma ? forma.name : '',
      formaEnvioId: forma ? forma.id : ''
    }));
  }, [apiData.formasEnvio]);

  const handleChangeDesconto = useCallback(async (e) => {
    const id = parseInt(e.target.value);
    if (id) {
      const desconto = apiData.descontos.find((d) => d.id === id);
      setDescontoSelecionado(desconto);
      
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
  }, [apiData.descontos, tabsItems, parseBRLMoney]);

  const handleItemsChange = useCallback((tabKey, newItems) => {
    setTabsItems((prev) => {
      const updated = { ...prev, [tabKey]: newItems };
      const allItems = Object.values(updated).flat();
      
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
  }, [parseBRLMoney]);

  const validarPedidoCompleto = useCallback(() => {
    const erros = [];
    
    const errosBasicos = validarPedido(formData);
    erros.push(...errosBasicos);
    
    if (!formData.nomeCliente?.trim()) {
      erros.push("Nome do cliente é obrigatório");
    }
    
    if (!formData.dataEntrada) {
      erros.push("Data de entrada é obrigatória");
    }
    
    if (!formData.dataEntrega) {
      erros.push("Data de entrega é obrigatória");
    }
    
    if (formData.dataEntrada && formData.dataEntrega) {
      const dateValidation = validateOrderDates(formData.dataEntrada, formData.dataEntrega);
      if (!dateValidation.isValid) {
        erros.push(...dateValidation.errors);
      }
    }
    
    if (!formData.items || formData.items.length === 0) {
      erros.push("Pelo menos um item de produção deve ser adicionado");
    }
    
    if (formData.items && formData.items.length > 0) {
      formData.items.forEach((item, index) => {
        if (!item.valor || parseFloat(item.valor.replace(',', '.')) <= 0) {
          erros.push(`Item ${index + 1} (${item.tipoProducao || 'Produção'}): Valor deve ser maior que zero`);
        }
      });
    }
    
    return erros;
  }, [formData]);

  const handleSalvarPedido = useCallback(() => {
    const erros = validarPedidoCompleto();
    setSaveValidationErrors(erros);
    setShowSaveModal(true);
  }, [validarPedidoCompleto]);

  const confirmarSalvamento = useCallback(async () => {
    setIsSaving(true);

    try {
      const payload = normalizarDecimais(formData);
      const apiPedido = convertFormDataToApiPedido(payload);
      const validation = validatePedidoForApi(apiPedido);
      
      if (!validation.isValid) {
        setSaveValidationErrors(validation.errors);
        setIsSaving(false);
        return;
      }
      
      try {
        const response = await createPedido(apiPedido);
        console.log('Pedido salvo na API com sucesso:', response.data);
        
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
        logger.logPedidoCreated(pedidoCompleto);
        customAlert.showSuccess('Sucesso!', 'Pedido salvo com sucesso na API!');
        
      } catch (apiError) {
        console.error('Erro ao salvar na API:', apiError);
        logger.log('PEDIDO_CREATE_ERROR', {
          numeroPedido: payload.numeroPedido,
          cliente: payload.nomeCliente,
          error: apiError.message || 'Erro desconhecido'
        }, 'error');
        customAlert.showError('Erro!', 'Falha ao salvar pedido na API. Tente novamente.');
        setIsSaving(false);
        return;
      }

      // Resetar formulário
      resetarFormulario();
      setShowSaveModal(false);
      
    } catch (error) {
      console.error("Erro ao salvar pedido:", error);
      customAlert.showError('Erro', 'Erro ao salvar pedido: ' + (error.message || "Erro desconhecido"));
    } finally {
      setIsSaving(false);
    }
  }, [formData, customAlert]);

  const resetarFormulario = useCallback(() => {
    setFormData({
      numeroPedido: apiData.numeroPedido || '',
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
    setTabs([
      {
        eventKey: `tab-1`,
        title: `Tab 1`,
        content: <TypeProduction onItemsChange={(items) => handleItemsChange('tab-1', items)} />,
      },
    ]);
    setCount(1);
    setFrete('');
    setFormaSelecionada(null);
  }, [apiData.numeroPedido, handleItemsChange]);

  const adTab = useCallback(() => {
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
  }, [count, tabs, handleItemsChange]);

  const removeTab = useCallback((eventKey) => {
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
  }, [tabs, handleItemsChange]);

  // Memoizar componentes pesados
  const loadingStatus = useMemo(() => (
    (apiLoading.clientes || apiLoading.formasPagamento || apiLoading.formasEnvio || apiLoading.descontos) && (
      <div className="alert alert-info d-flex align-items-center mb-3" role="alert">
        <div className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></div>
        <div>
          <strong>Carregando dados da API...</strong>
          <div className="small">
            {apiLoading.clientes && 'Clientes '}
            {apiLoading.formasPagamento && 'Formas de Pagamento '}
            {apiLoading.formasEnvio && 'Formas de Envio '}
            {apiLoading.descontos && 'Descontos '}
          </div>
        </div>
      </div>
    )
  ), [apiLoading]);

  const errorStatus = useMemo(() => (
    (apiErrors.clientes || apiErrors.formasPagamento || apiErrors.formasEnvio || apiErrors.descontos) && (
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
    )
  ), [apiErrors]);

  return (
    <div className="create-order-container">
      {loadingStatus}
      {errorStatus}

      <div className="dashboard-card mb-4">
        <div className="dashboard-card-header">
          <h5 className="dashboard-card-title">
            <Person size={20} style={{ marginRight: '8px' }} />
            Informações do Cliente
          </h5>
        </div>
        <Form onSubmit={(e) => e.preventDefault()}>
          <ClienteFields
            formData={formData}
            clientes={apiData.clientes}
            selectedCliente={selectedCliente}
            loadingClientes={apiLoading.clientes}
            errorClientes={apiErrors.clientes}
            onFormChange={handleChange}
            onClienteSelecionado={handleClienteSelecionado}
            onBuscarClientes={handleBuscarClientes}
          />
          
          <DateFields
            formData={formData}
            dateValidationErrors={dateValidationErrors}
            onFormChange={handleChange}
          />
          
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
                  disabled={apiLoading.formasEnvio}
                >
                  <option value="">
                    {apiLoading.formasEnvio ? 'Carregando...' : 
                     apiErrors.formasEnvio ? 'Erro ao carregar' : 'Selecione'}
                  </option>
                  {apiData.formasEnvio.map((forma) => (
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
                  const forma = apiData.formasPagamento.find((f) => f.id === id);
                  setFormData((prev) => ({
                    ...prev,
                    tipoPagamento: id || '',
                    tipoPagamentoNome: forma ? forma.name : ''
                  }));
                }}
                className={`form-control ${apiErrors.formasPagamento ? 'is-invalid' : ''}`}
                disabled={apiLoading.formasPagamento}
              >
                <option value="">
                  {apiLoading.formasPagamento ? 'Carregando...' : 
                   apiErrors.formasPagamento ? 'Erro ao carregar' : 'Selecione'}
                </option>
                {apiData.formasPagamento.map((forma) => (
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
                disabled={apiLoading.descontos}
              >
                <option value="">
                  {apiLoading.descontos ? 'Carregando...' : 
                   apiErrors.descontos ? 'Erro ao carregar' : 'Selecione um desconto'}
                </option>
                {apiData.descontos.map((desconto) => (
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
                onClick={resetarFormulario}
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

export default OptimizedCreateOrder;
