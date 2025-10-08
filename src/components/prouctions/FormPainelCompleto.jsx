import React, { useState, useEffect, useMemo } from 'react';
import { Form, Button, Container, Row, Col, Card, InputGroup, Spinner, Badge, Alert, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FileText, Person, Scissors, Image as ImageIcon, Calculator, InfoCircle, CheckCircle, XCircle, CurrencyDollar } from 'react-bootstrap-icons';
import ImageDropZone from '../ImageDropZone';
import AreaCalculatorLinhaUnica from '../AreaCalculator';
import InputValorReal from '../InputValorMoeda';
import ValidationModal from '../ValidationModal';
import { useVendedoresDesigners } from '../../hooks/useVendedoresDesigners';
import { getAllTecidos } from '../../services/api';
import cacheManager from '../../utils/cacheManager';
import CustomCheckbox from '../CustomCheckbox';
import useCustomAlert from '../../hooks/useCustomAlert';
import CustomAlertModal from '../CustomAlertModal';

/**
 * Formulário Completo de Painel de Produção - Versão Melhorada
 * 
 * Melhorias implementadas:
 * - Cálculos automáticos de valores de ilhós e cordinha
 * - Validação em tempo real com feedback visual
 * - Tooltips informativos
 * - Resumo de valores em tempo real
 * - Layout otimizado e mais profissional
 * - Máscaras de input
 * - Loading states melhorados
 */
function FormPainelCompleto({ onAdicionarItem }) {
    const { vendedores, designers, loading, error } = useVendedoresDesigners();
    
    const [imagem, setImagem] = useState(null);
    const [showValidationModal, setShowValidationModal] = useState(false);
    const [validationErrors, setValidationErrors] = useState([]);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [tecidos, setTecidos] = useState([]);
    const [tecidosLoading, setTecidosLoading] = useState(true);
    const [tecidosError, setTecidosError] = useState(null);
    const customAlert = useCustomAlert();

    // Estado de validação em tempo real
    const [fieldErrors, setFieldErrors] = useState({});

    const handleImageChange = (imgBase64) => {
        setImagem(imgBase64);
    };

    // Funções auxiliares (declaradas antes dos hooks que as utilizam)
    const parseBR = (v) => {
        if (!v) return 0;
        if (typeof v === 'number') return v;
        const normalized = String(v).replace(/\./g, '').replace(',', '.');
        const num = parseFloat(normalized);
        return isNaN(num) ? 0 : num;
    };

    const formatBR = (v) => {
        if (!v) return '0,00';
        return v.toFixed(2).replace('.', ',');
    };

    // Formatar valor como moeda enquanto digita
    const formatarMoedaInput = (valor) => {
        // Remove tudo que não é número
        const apenasNumeros = valor.replace(/\D/g, '');
        
        if (!apenasNumeros) return '';
        
        // Converte para número e divide por 100 (centavos)
        const numero = parseFloat(apenasNumeros) / 100;
        
        // Formata com separadores
        return numero.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    // Handler especial para campos monetários
    const handleMoneyChange = (e) => {
        const { name, value } = e.target;
        const valorFormatado = formatarMoedaInput(value);
        
        setFormData(prev => ({
            ...prev,
            [name]: valorFormatado
        }));
        
        // Validar campo
        validateField(name, valorFormatado);
    };

    useEffect(() => {
        // Tentar buscar do cache primeiro
        const cachedTecidos = cacheManager.get('tecidos');
        
        if (cachedTecidos) {
            // Cache HIT
            const ativos = cachedTecidos.filter((t) => t.active);
            setTecidos(ativos);
            setTecidosLoading(false);
            
            if (import.meta.env.DEV) {
                console.log('⚡ Tecidos carregados do CACHE');
            }
            return;
        }

        // Cache MISS - buscar da API
        if (import.meta.env.DEV) {
            console.log('🌐 Buscando Tecidos da API...');
        }
        
        getAllTecidos()
            .then((res) => {
                const tecidosData = res.data || [];
                const ativos = tecidosData.filter((t) => t.active);
                
                // Salvar no cache
                cacheManager.set('tecidos', tecidosData);
                
                setTecidos(ativos);
            })
            .catch((e) => {
                console.error('❌ Erro ao carregar tecidos:', e);
                setTecidosError('Não foi possível carregar a lista de tecidos');
            })
            .finally(() => setTecidosLoading(false));
    }, []);

    useEffect(() => {
        if (error) {
            customAlert.showWarning('Atenção', `${error}. Os campos de vendedor e designer podem não estar disponíveis.`);
        }
    }, [error]);

    useEffect(() => {
        if (tecidosError) {
            customAlert.showWarning('Atenção', tecidosError);
        }
    }, [tecidosError]);

    const [formData, setFormData] = useState({
        descricao: '',
        largura: '',
        altura: '',
        area: '',
        vendedor: '',
        designer: '',
        tecido: '',
        acabamento: {
            overloque: false,
            elastico: false,
        },
        opcoes: {
            ilhos: false,
            cordinha: false,
        },
        // Emenda
        emenda: 'sem-emenda',
        emendaQtd: '',
        // Campos para Ilhós
        ilhosQtd: '',
        ilhosEspaco: '',
        ilhosValorUnitario: '',
        // Campos para Cordinha
        cordinhaQtd: '',
        cordinhaEspaco: '',
        cordinhaValorUnitario: '',
        // Valores e observações
        valorPainel: '',
        valorAdicionais: '',
        observacao: '',
    });

    // Calcular valor total dos ilhós
    const valorTotalIlhos = useMemo(() => {
        if (!formData.opcoes.ilhos) return 0;
        const qtd = parseInt(formData.ilhosQtd) || 0;
        const valorUnit = parseBR(formData.ilhosValorUnitario);
        return qtd * valorUnit;
    }, [formData.opcoes.ilhos, formData.ilhosQtd, formData.ilhosValorUnitario]);

    // Calcular valor total da cordinha
    const valorTotalCordinha = useMemo(() => {
        if (!formData.opcoes.cordinha) return 0;
        const qtd = parseInt(formData.cordinhaQtd) || 0;
        const valorUnit = parseBR(formData.cordinhaValorUnitario);
        return qtd * valorUnit;
    }, [formData.opcoes.cordinha, formData.cordinhaQtd, formData.cordinhaValorUnitario]);

    // Calcular valor total geral
    const valorTotalGeral = useMemo(() => {
        const valorPainel = parseBR(formData.valorPainel);
        const valorAdicionais = parseBR(formData.valorAdicionais);
        const total = valorPainel + valorAdicionais + valorTotalIlhos + valorTotalCordinha;
        return total;
    }, [formData.valorPainel, formData.valorAdicionais, valorTotalIlhos, valorTotalCordinha]);

    const resetForm = () => {
        setFormData({
            descricao: '',
            largura: '',
            altura: '',
            area: '',
            vendedor: '',
            designer: '',
            tecido: '',
            acabamento: {
                overloque: false,
                elastico: false,
            },
            opcoes: {
                ilhos: false,
                cordinha: false,
            },
            emenda: 'sem-emenda',
            emendaQtd: '',
            ilhosQtd: '',
            ilhosEspaco: '',
            ilhosValorUnitario: '',
            cordinhaQtd: '',
            cordinhaEspaco: '',
            cordinhaValorUnitario: '',
            valorPainel: '',
            valorAdicionais: '',
            observacao: '',
        });
        setImagem(null);
        setFieldErrors({});
        setValidationErrors([]);
    };

    // Validação em tempo real de um campo específico
    const validateField = (name, value) => {
        let error = null;

        switch (name) {
            case 'descricao':
                if (!value?.trim()) error = 'Descrição é obrigatória';
                else if (value.length < 3) error = 'Mínimo 3 caracteres';
                break;
            case 'largura':
            case 'altura':
                if (!value) error = 'Campo obrigatório';
                else if (isNaN(parseFloat(value)) || parseFloat(value) <= 0) {
                    error = 'Deve ser maior que zero';
                }
                break;
            case 'valorPainel':
                if (!value) error = 'Valor é obrigatório';
                else if (parseBR(value) <= 0) error = 'Valor deve ser maior que zero';
                break;
            case 'ilhosQtd':
                if (formData.opcoes.ilhos && !value) error = 'Obrigatório quando ilhós marcado';
                break;
            case 'ilhosEspaco':
                if (formData.opcoes.ilhos && !value) error = 'Obrigatório quando ilhós marcado';
                break;
            case 'ilhosValorUnitario':
                if (formData.opcoes.ilhos && !value) error = 'Obrigatório quando ilhós marcado';
                break;
            case 'cordinhaQtd':
                if (formData.opcoes.cordinha && !value) error = 'Obrigatório quando cordinha marcada';
                break;
            case 'cordinhaEspaco':
                if (formData.opcoes.cordinha && !value) error = 'Obrigatório quando cordinha marcada';
                break;
            case 'cordinhaValorUnitario':
                if (formData.opcoes.cordinha && !value) error = 'Obrigatório quando cordinha marcada';
                break;
            case 'emendaQtd':
                if (formData.emenda !== 'sem-emenda' && !value) error = 'Obrigatório quando há emenda';
                else if (value && (isNaN(parseInt(value)) || parseInt(value) <= 0)) {
                    error = 'Quantidade deve ser maior que zero';
                }
                break;
            default:
                break;
        }

        setFieldErrors(prev => ({
            ...prev,
            [name]: error
        }));

        return error;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (type === 'checkbox') {
            // Verifica se é um checkbox de acabamento ou opções
            if (name === 'overloque' || name === 'elastico') {
                setFormData(prev => ({
                    ...prev,
                    acabamento: { ...prev.acabamento, [name]: checked }
                }));
            } else if (name === 'ilhos' || name === 'cordinha') {
                setFormData(prev => ({
                    ...prev,
                    opcoes: { ...prev.opcoes, [name]: checked }
                }));
            }
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
            
            // Validar campo em tempo real
            validateField(name, value);
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        validateField(name, value);
    };

    const handleAreaChange = (areaData) => {
        setFormData(prev => ({
            ...prev,
            largura: areaData.largura,
            altura: areaData.altura,
            area: areaData.area
        }));
        validateField('largura', areaData.largura);
        validateField('altura', areaData.altura);
    };

    const validarCampos = () => {
        const erros = [];
        
        // Campos obrigatórios básicos
        if (!formData.descricao?.trim()) erros.push("Descrição do Painel");
        if (!formData.largura?.trim()) erros.push("Largura");
        if (!formData.altura?.trim()) erros.push("Altura");
        if (!formData.vendedor?.trim()) erros.push("Vendedor");
        if (!formData.designer?.trim()) erros.push("Designer");
        if (!formData.tecido?.trim()) erros.push("Tecido");
        if (!formData.valorPainel?.trim()) erros.push("Valor do Painel");
        
        // Validação de valores numéricos
        if (formData.largura && (isNaN(parseFloat(formData.largura)) || parseFloat(formData.largura) <= 0)) {
            erros.push("Largura deve ser um número maior que zero");
        }
        if (formData.altura && (isNaN(parseFloat(formData.altura)) || parseFloat(formData.altura) <= 0)) {
            erros.push("Altura deve ser um número maior que zero");
        }
        if (formData.valorPainel && (isNaN(parseFloat(formData.valorPainel.replace(',', '.'))) || parseFloat(formData.valorPainel.replace(',', '.')) <= 0)) {
            erros.push("Valor do Painel deve ser um número maior que zero");
        }
        
        // Validação específica para ilhós
        if (formData.opcoes.ilhos) {
            if (!formData.ilhosQtd?.trim()) erros.push("Quantidade de Ilhós");
            if (!formData.ilhosEspaco?.trim()) erros.push("Espaço entre Ilhós");
            if (!formData.ilhosValorUnitario?.trim()) erros.push("Valor Unitário dos Ilhós");
            
            if (formData.ilhosQtd && (isNaN(parseInt(formData.ilhosQtd)) || parseInt(formData.ilhosQtd) <= 0)) {
                erros.push("Quantidade de Ilhós deve ser um número maior que zero");
            }
            if (formData.ilhosEspaco && (isNaN(parseFloat(formData.ilhosEspaco)) || parseFloat(formData.ilhosEspaco) <= 0)) {
                erros.push("Espaço entre Ilhós deve ser um número maior que zero");
            }
            if (formData.ilhosValorUnitario && (isNaN(parseFloat(formData.ilhosValorUnitario.replace(',', '.'))) || parseFloat(formData.ilhosValorUnitario.replace(',', '.')) <= 0)) {
                erros.push("Valor Unitário dos Ilhós deve ser um número maior que zero");
            }
        }
        
        // Validação específica para cordinha
        if (formData.opcoes.cordinha) {
            if (!formData.cordinhaQtd?.trim()) erros.push("Quantidade de Cordinha");
            if (!formData.cordinhaEspaco?.trim()) erros.push("Espaço entre Cordinhas");
            if (!formData.cordinhaValorUnitario?.trim()) erros.push("Valor Unitário da Cordinha");
            
            if (formData.cordinhaQtd && (isNaN(parseInt(formData.cordinhaQtd)) || parseInt(formData.cordinhaQtd) <= 0)) {
                erros.push("Quantidade de Cordinha deve ser um número maior que zero");
            }
            if (formData.cordinhaEspaco && (isNaN(parseFloat(formData.cordinhaEspaco)) || parseFloat(formData.cordinhaEspaco) <= 0)) {
                erros.push("Espaço entre Cordinhas deve ser um número maior que zero");
            }
            if (formData.cordinhaValorUnitario && (isNaN(parseFloat(formData.cordinhaValorUnitario.replace(',', '.'))) || parseFloat(formData.cordinhaValorUnitario.replace(',', '.')) <= 0)) {
                erros.push("Valor Unitário da Cordinha deve ser um número maior que zero");
            }
        }
        
        // Validação específica para emenda
        if (formData.emenda !== 'sem-emenda') {
            if (!formData.emendaQtd?.trim()) erros.push("Quantidade de Emendas");
            
            if (formData.emendaQtd && (isNaN(parseInt(formData.emendaQtd)) || parseInt(formData.emendaQtd) <= 0)) {
                erros.push("Quantidade de Emendas deve ser um número maior que zero");
            }
        }
        
        return erros;
    };

    const saveProducao = async (e) => {
        e.preventDefault();
        
        setIsSaving(true);
        
        const erros = validarCampos();
        if (erros.length > 0) {
            setValidationErrors(erros);
            setShowValidationModal(true);
            setIsSaving(false);
            return;
        }
        
        // Simular delay de salvamento
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const valorTotal = formatBR(valorTotalGeral);
        const dataProducao = {
            "tipoProducao": "painel",
            "tipo": "painel",
            "imagem": imagem,
            "valor": valorTotal,
            "valorIlhos": formatBR(valorTotalIlhos),
            "valorCordinha": formatBR(valorTotalCordinha),
            ...formData
        }
        
        // Ativar estado de sucesso
        setIsSuccess(true);
        setIsSaving(false);
        
        onAdicionarItem(dataProducao)
        console.log('✅ Dados do painel salvos:', dataProducao);
        
        // Resetar estado de sucesso após 3 segundos
        setTimeout(() => {
            setIsSuccess(false);
            resetForm();
        }, 2000);
    };

    // Tooltip helper
    const renderTooltip = (text) => (props) => (
        <Tooltip {...props}>{text}</Tooltip>
    );

    return (
        <>
        <Card className="dashboard-card">
            <Form className={isSuccess ? 'form-success form-success-animation' : ''}>
                <div className="p-4">
                    {/* Alert de Sucesso */}
                    {isSuccess && (
                        <Alert variant="success" className="d-flex align-items-center mb-4">
                            <CheckCircle size={20} className="me-2" />
                            <strong>Painel salvo com sucesso!</strong>
                        </Alert>
                    )}

                    {/* Título: Informações Básicas */}
                    <h5 className="mb-3" style={{ color: 'var(--color-primary)', borderBottom: '2px solid var(--color-primary)', paddingBottom: '0.5rem' }}>
                        <FileText size={20} className="me-2" />
                        Informações Básicas
                    </h5>
                    
                    <div>
                        <Row className="mb-3">
                            <Col md={8}>
                                <div className="form-group">
                                    <label className="form-label d-flex align-items-center">
                                        Descrição do Painel
                                        <OverlayTrigger placement="right" overlay={renderTooltip('Descreva o painel de forma clara e objetiva')}>
                                            <span className="ms-2 text-muted" style={{ cursor: 'help' }}>
                                                <InfoCircle size={14} />
                                            </span>
                                        </OverlayTrigger>
                                        <span className="ms-auto text-muted" style={{ fontSize: '0.85rem' }}>
                                            {formData.descricao.length}/200
                                        </span>
                                    </label>
                                    <Form.Control 
                                        placeholder="Ex: Painel promocional para evento corporativo" 
                                        type="text" 
                                        name="descricao" 
                                        value={formData.descricao} 
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        maxLength={200}
                                        required 
                                        className={`form-control ${fieldErrors.descricao ? 'is-invalid' : formData.descricao.length >= 3 ? 'is-valid' : ''}`}
                                    />
                                    {fieldErrors.descricao && (
                                        <div className="invalid-feedback d-block">
                                            <XCircle size={14} className="me-1" />
                                            {fieldErrors.descricao}
                                        </div>
                                    )}
                                </div>
                            </Col>
                            <Col md={4}>
                                <AreaCalculatorLinhaUnica 
                                    formData={formData}
                                    onChange={handleAreaChange}
                                />
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <div className="form-group mb-3">
                                    <label className="form-label">
                                        <Person size={16} className="me-2" />
                                        Vendedor
                                    </label>
                                    {loading ? (
                                        <div className="d-flex align-items-center">
                                            <Spinner size="sm" className="me-2" animation="border" />
                                            <span className="text-muted">Carregando vendedores...</span>
                                        </div>
                                    ) : (
                                        <Form.Select 
                                            name="vendedor" 
                                            value={formData.vendedor} 
                                            onChange={handleChange} 
                                            required 
                                            className={`form-control ${formData.vendedor ? 'is-valid' : ''}`}
                                        >
                                            <option value="">Selecione um Vendedor</option>
                                            {vendedores.map(vendedor => (
                                                <option key={vendedor.id} value={vendedor.name}>
                                                    {vendedor.name}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    )}
                                </div>
                            </Col>
                            <Col md={6}>
                                <div className="form-group mb-3">
                                    <label className="form-label">
                                        <Person size={16} className="me-2" />
                                        Designer
                                    </label>
                                    {loading ? (
                                        <div className="d-flex align-items-center">
                                            <Spinner size="sm" className="me-2" animation="border" />
                                            <span className="text-muted">Carregando designers...</span>
                                        </div>
                                    ) : (
                                        <Form.Select 
                                            name="designer" 
                                            value={formData.designer} 
                                            onChange={handleChange} 
                                            required 
                                            className={`form-control ${formData.designer ? 'is-valid' : ''}`}
                                        >
                                            <option value="">Selecione um Designer</option>
                                            {designers.map(designer => (
                                                <option key={designer.id} value={designer.name}>
                                                    {designer.name}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    )}
                                </div>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <div className="form-group">
                                    <label className="form-label">
                                        <Scissors size={16} className="me-2" />
                                        Tipo de Tecido
                                    </label>
                                    {tecidosLoading ? (
                                        <div className="d-flex align-items-center">
                                            <Spinner size="sm" className="me-2" animation="border" />
                                            <span className="text-muted">Carregando tecidos...</span>
                                        </div>
                                    ) : tecidosError ? (
                                        <div className="form-text text-warning">{tecidosError}</div>
                                    ) : (
                                        <Form.Select 
                                            name="tecido" 
                                            value={formData.tecido} 
                                            onChange={handleChange} 
                                            required 
                                            className={`form-control ${formData.tecido ? 'is-valid' : ''}`}
                                        >
                                            <option value="">Selecione o Tecido</option>
                                            {tecidos.map((t) => (
                                                <option key={t.id} value={t.name}>{t.name}</option>
                                            ))}
                                        </Form.Select>
                                    )}
                                </div>
                            </Col>
                        </Row>
                    </div>

                    {/* Divisor */}
                    <hr className="my-4" />

                    {/* Título: Acabamento e Opções */}
                    <h5 className="mb-3" style={{ color: 'var(--color-primary)', borderBottom: '2px solid var(--color-primary)', paddingBottom: '0.5rem' }}>
                        <Scissors size={20} className="me-2" />
                        Acabamento e Opções de Fixação
                    </h5>

                    <Row className="mb-4">
                        <Col md={6}>
                            {/* Acabamento */}
                            <div className="mb-4">
                                <h6 className="mb-3" style={{ color: 'var(--color-neutral-700)', fontWeight: '600' }}>
                                    <Scissors size={16} className="me-2" />
                                    Acabamento
                                </h6>
                                <div className="form-check mb-3">
                                    <CustomCheckbox
                                        id="acab-overloque"
                                        label="Overloque (acabamento das bordas)"
                                        name="overloque"
                                        checked={formData.acabamento.overloque}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="form-check mb-3">
                                    <CustomCheckbox
                                        id="acab-elastico"
                                        label="Elástico (reforço elástico)"
                                        name="elastico"
                                        checked={formData.acabamento.elastico}
                                        onChange={handleChange}
                                    />
                                </div>

                                {/* Tipo de Emenda */}
                                <div className="form-group mt-3">
                                    <label className="form-label">
                                        Tipo de Emenda
                                        <OverlayTrigger placement="right" overlay={renderTooltip('Selecione o tipo de emenda do painel')}>
                                            <span className="ms-2 text-muted" style={{ cursor: 'help' }}>
                                                <InfoCircle size={14} />
                                            </span>
                                        </OverlayTrigger>
                                    </label>
                                    <Form.Select 
                                        name="emenda" 
                                        value={formData.emenda} 
                                        onChange={handleChange} 
                                        required 
                                        className={`form-control ${formData.emenda ? 'is-valid' : ''}`}
                                    >
                                        <option value="sem-emenda">Sem emenda</option>
                                        <option value="vertical">Vertical</option>
                                        <option value="horizontal">Horizontal</option>
                                    </Form.Select>
                                </div>

                                {/* Campos de Emenda - Aparece quando há emenda */}
                                {formData.emenda !== 'sem-emenda' && (
                                    <div className="mt-3 p-3" style={{ background: 'var(--color-warning-light, #fff3cd)', borderRadius: 'var(--border-radius)', border: '1px solid var(--color-warning, #ffc107)' }}>
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <h6 className="mb-0" style={{ color: 'var(--color-warning-dark, #856404)', fontSize: 'var(--font-size-sm)' }}>
                                                Configuração da Emenda {formData.emenda === 'vertical' ? 'Vertical' : 'Horizontal'}
                                            </h6>
                                        </div>
                                        <Row>
                                            <Col md={12}>
                                                <div className="form-group mb-0">
                                                    <label className="form-label" style={{ fontSize: '0.9rem' }}>
                                                        Quantidade de Emendas
                                                        <OverlayTrigger placement="right" overlay={renderTooltip('Informe quantas emendas terá o painel')}>
                                                            <span className="ms-2 text-muted" style={{ cursor: 'help' }}>
                                                                <InfoCircle size={12} />
                                                            </span>
                                                        </OverlayTrigger>
                                                    </label>
                                                    <Form.Control
                                                        type="number"
                                                        name="emendaQtd"
                                                        min="1"
                                                        max="20"
                                                        value={formData.emendaQtd}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        placeholder="Ex: 2"
                                                        required={formData.emenda !== 'sem-emenda'}
                                                        className={`form-control ${fieldErrors.emendaQtd ? 'is-invalid' : formData.emendaQtd ? 'is-valid' : ''}`}
                                                    />
                                                    {fieldErrors.emendaQtd && (
                                                        <div className="invalid-feedback d-block" style={{ fontSize: '0.85rem' }}>
                                                            <XCircle size={12} className="me-1" />
                                                            {fieldErrors.emendaQtd}
                                                        </div>
                                                    )}
                                                </div>
                                            </Col>
                                        </Row>
                                    </div>
                                )}
                            </div>

                            {/* Opções de Fixação */}
                            <div className="mb-3">
                                <h6 className="mb-3" style={{ color: 'var(--color-neutral-700)', fontWeight: '600' }}>
                                    <Calculator size={16} className="me-2" />
                                    Opções de Fixação
                                </h6>
                                <div className="form-check mb-2">
                                    <CustomCheckbox
                                        id="opcao-ilhos"
                                        label="Com Ilhós"
                                        name="ilhos"
                                        checked={formData.opcoes.ilhos}
                                        onChange={handleChange}
                                    />
                                </div>

                                {/* Campos de Ilhós */}
                                {formData.opcoes.ilhos && (
                                    <div className="mt-3 p-3" style={{ background: 'var(--color-primary-light, #e3f2fd)', borderRadius: 'var(--border-radius)', border: '1px solid var(--color-primary, #2196f3)' }}>
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <h6 className="mb-0" style={{ color: 'var(--color-primary)', fontSize: 'var(--font-size-sm)' }}>
                                                Configurações dos Ilhós
                                            </h6>
                                            {valorTotalIlhos > 0 && (
                                                <Badge bg="primary">
                                                    Total: R$ {formatBR(valorTotalIlhos)}
                                                </Badge>
                                            )}
                                        </div>
                                        <Row>
                                            <Col md={4}>
                                                <div className="form-group mb-2">
                                                    <label className="form-label" style={{ fontSize: '0.9rem' }}>Quantidade</label>
                                                    <Form.Control
                                                        type="number"
                                                        name="ilhosQtd"
                                                        min="1"
                                                        max="100"
                                                        value={formData.ilhosQtd}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        placeholder="Ex: 4"
                                                        required={formData.opcoes.ilhos}
                                                        className={`form-control ${fieldErrors.ilhosQtd ? 'is-invalid' : formData.ilhosQtd ? 'is-valid' : ''}`}
                                                    />
                                                </div>
                                            </Col>
                                            <Col md={4}>
                                                <div className="form-group mb-2">
                                                    <label className="form-label" style={{ fontSize: '0.9rem' }}>Espaço (cm)</label>
                                                    <Form.Control
                                                        type="number"
                                                        name="ilhosEspaco"
                                                        min="1"
                                                        step="0.1"
                                                        placeholder="Ex: 20"
                                                        value={formData.ilhosEspaco}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        required={formData.opcoes.ilhos}
                                                        className={`form-control ${fieldErrors.ilhosEspaco ? 'is-invalid' : formData.ilhosEspaco ? 'is-valid' : ''}`}
                                                    />
                                                </div>
                                            </Col>
                                            <Col md={4}>
                                                <div className="form-group mb-2">
                                                    <label className="form-label" style={{ fontSize: '0.9rem' }}>Valor Unit.</label>
                                                    <InputGroup>
                                                        <InputGroup.Text>R$</InputGroup.Text>
                                                        <Form.Control
                                                            type="text"
                                                            name="ilhosValorUnitario"
                                                            placeholder="0,50"
                                                            value={formData.ilhosValorUnitario}
                                                            onChange={handleMoneyChange}
                                                            onBlur={handleBlur}
                                                            required={formData.opcoes.ilhos}
                                                            className={`form-control ${fieldErrors.ilhosValorUnitario ? 'is-invalid' : formData.ilhosValorUnitario ? 'is-valid' : ''}`}
                                                        />
                                                    </InputGroup>
                                                </div>
                                            </Col>
                                        </Row>
                                    </div>
                                )}

                                <div className="form-check mb-2 mt-3">
                                    <CustomCheckbox
                                        id="opcao-cordinha"
                                        label="Com Cordinha"
                                        name="cordinha"
                                        checked={formData.opcoes.cordinha}
                                        onChange={handleChange}
                                    />
                                </div>

                                {/* Campos de Cordinha */}
                                {formData.opcoes.cordinha && (
                                    <div className="mt-3 p-3" style={{ background: 'var(--color-success-light, #e8f5e9)', borderRadius: 'var(--border-radius)', border: '1px solid var(--color-success, #4caf50)' }}>
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <h6 className="mb-0" style={{ color: 'var(--color-success)', fontSize: 'var(--font-size-sm)' }}>
                                                Configurações da Cordinha
                                            </h6>
                                            {valorTotalCordinha > 0 && (
                                                <Badge bg="success">
                                                    Total: R$ {formatBR(valorTotalCordinha)}
                                                </Badge>
                                            )}
                                        </div>
                                        <Row>
                                            <Col md={4}>
                                                <div className="form-group mb-2">
                                                    <label className="form-label" style={{ fontSize: '0.9rem' }}>Quantidade</label>
                                                    <Form.Control
                                                        type="number"
                                                        name="cordinhaQtd"
                                                        min="1"
                                                        max="50"
                                                        value={formData.cordinhaQtd}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        placeholder="Ex: 2"
                                                        required={formData.opcoes.cordinha}
                                                        className={`form-control ${fieldErrors.cordinhaQtd ? 'is-invalid' : formData.cordinhaQtd ? 'is-valid' : ''}`}
                                                    />
                                                </div>
                                            </Col>
                                            <Col md={4}>
                                                <div className="form-group mb-2">
                                                    <label className="form-label" style={{ fontSize: '0.9rem' }}>Espaço (cm)</label>
                                                    <Form.Control
                                                        type="number"
                                                        name="cordinhaEspaco"
                                                        min="1"
                                                        step="0.1"
                                                        placeholder="Ex: 30"
                                                        value={formData.cordinhaEspaco}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        required={formData.opcoes.cordinha}
                                                        className={`form-control ${fieldErrors.cordinhaEspaco ? 'is-invalid' : formData.cordinhaEspaco ? 'is-valid' : ''}`}
                                                    />
                                                </div>
                                            </Col>
                                            <Col md={4}>
                                                <div className="form-group mb-2">
                                                    <label className="form-label" style={{ fontSize: '0.9rem' }}>Valor Unit.</label>
                                                    <InputGroup>
                                                        <InputGroup.Text>R$</InputGroup.Text>
                                                        <Form.Control
                                                            type="text"
                                                            name="cordinhaValorUnitario"
                                                            placeholder="1,50"
                                                            value={formData.cordinhaValorUnitario}
                                                            onChange={handleMoneyChange}
                                                            onBlur={handleBlur}
                                                            required={formData.opcoes.cordinha}
                                                            className={`form-control ${fieldErrors.cordinhaValorUnitario ? 'is-invalid' : formData.cordinhaValorUnitario ? 'is-valid' : ''}`}
                                                        />
                                                    </InputGroup>
                                                </div>
                                            </Col>
                                        </Row>
                                    </div>
                                )}
                            </div>
                        </Col>

                        {/* Imagem */}
                        <Col md={6}>
                            <h6 className="mb-3" style={{ color: 'var(--color-neutral-700)', fontWeight: '600' }}>
                                <ImageIcon size={16} className="me-2" />
                                Imagem do Painel
                            </h6>
                            <ImageDropZone onImageChange={handleImageChange} />
                        </Col>
                    </Row>

                    {/* Divisor */}
                    <hr className="my-4" />

                    {/* Título: Valores e Observações */}
                    <h5 className="mb-3" style={{ color: 'var(--color-primary)', borderBottom: '2px solid var(--color-primary)', paddingBottom: '0.5rem' }}>
                        <CurrencyDollar size={20} className="me-2" />
                        Valores e Observações
                    </h5>

                    <div>
                        <Row className="mb-3">
                            <Col md={4}>
                                <div className="form-group">
                                    <label className="form-label">Valor do Painel</label>
                                    <InputGroup>
                                        <InputGroup.Text>R$</InputGroup.Text>
                                        <Form.Control
                                            type="text"
                                            name="valorPainel"
                                            value={formData.valorPainel}
                                            onChange={handleMoneyChange}
                                            onBlur={handleBlur}
                                            placeholder="Ex: 150,00"
                                            required
                                            className={`form-control ${fieldErrors.valorPainel ? 'is-invalid' : formData.valorPainel ? 'is-valid' : ''}`}
                                        />
                                    </InputGroup>
                                </div>
                            </Col>
                            <Col md={4}>
                                <div className="form-group">
                                    <label className="form-label">
                                        Valores Adicionais
                                        <OverlayTrigger placement="right" overlay={renderTooltip('Custos extras, frete, etc.')}>
                                            <span className="ms-2 text-muted" style={{ cursor: 'help' }}>
                                                <InfoCircle size={14} />
                                            </span>
                                        </OverlayTrigger>
                                    </label>
                                    <InputGroup>
                                        <InputGroup.Text>R$</InputGroup.Text>
                                        <Form.Control
                                            type="text"
                                            name="valorAdicionais"
                                            value={formData.valorAdicionais}
                                            onChange={handleMoneyChange}
                                            placeholder="Ex: 10,00"
                                            className="form-control"
                                        />
                                    </InputGroup>
                                </div>
                            </Col>
                            <Col md={4}>
                                <div className="form-group">
                                    <label className="form-label">Valor Total</label>
                                    <div 
                                        className="form-control" 
                                        style={{ 
                                            background: 'var(--color-success-light, #e8f5e9)', 
                                            border: '2px solid var(--color-success)',
                                            fontWeight: 'bold',
                                            fontSize: '1.2rem',
                                            color: 'var(--color-success)',
                                            textAlign: 'center'
                                        }}
                                    >
                                        R$ {formatBR(valorTotalGeral)}
                                    </div>
                                </div>
                            </Col>
                        </Row>

                        {/* Resumo de Valores - Sempre Visível */}
                        {formData.valorPainel && (
                            <Row className="mb-3">
                                <Col md={12}>
                                    <div className="p-3" style={{ 
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                                        borderRadius: '12px', 
                                        color: 'white',
                                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                    }}>
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <strong style={{ fontSize: '1.1rem' }}>💰 Composição do Valor Total</strong>
                                            {(valorTotalIlhos > 0 || valorTotalCordinha > 0) && (
                                                <Badge bg="light" text="dark" style={{ fontSize: '0.75rem' }}>
                                                    Com Extras
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="mt-2" style={{ fontSize: '0.95rem' }}>
                                            <div className="d-flex justify-content-between py-1">
                                                <span>Valor Base do Painel:</span>
                                                <strong>R$ {formatBR(parseBR(formData.valorPainel))}</strong>
                                            </div>
                                            {valorTotalIlhos > 0 && (
                                                <div className="d-flex justify-content-between py-1" style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '4px', margin: '4px 0' }}>
                                                    <span>+ Ilhós ({formData.ilhosQtd} un. × R$ {formData.ilhosValorUnitario}):</span>
                                                    <strong style={{ color: '#90caf9' }}>R$ {formatBR(valorTotalIlhos)}</strong>
                                                </div>
                                            )}
                                            {valorTotalCordinha > 0 && (
                                                <div className="d-flex justify-content-between py-1" style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '4px', margin: '4px 0' }}>
                                                    <span>+ Cordinha ({formData.cordinhaQtd} un. × R$ {formData.cordinhaValorUnitario}):</span>
                                                    <strong style={{ color: '#a5d6a7' }}>R$ {formatBR(valorTotalCordinha)}</strong>
                                                </div>
                                            )}
                                            {parseBR(formData.valorAdicionais) > 0 && (
                                                <div className="d-flex justify-content-between py-1">
                                                    <span>+ Valores Adicionais:</span>
                                                    <strong>R$ {formatBR(parseBR(formData.valorAdicionais))}</strong>
                                                </div>
                                            )}
                                            <hr style={{ borderColor: 'rgba(255,255,255,0.3)', margin: '12px 0' }} />
                                            <div className="d-flex justify-content-between align-items-center" style={{ fontSize: '1.3rem', fontWeight: 'bold', padding: '8px', background: 'rgba(255,255,255,0.15)', borderRadius: '8px' }}>
                                                <span>VALOR TOTAL:</span>
                                                <span style={{ color: '#ffd740', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                                                    R$ {formatBR(valorTotalGeral)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        )}

                        <Row>
                            <Col md={12}>
                                <div className="form-group">
                                    <label className="form-label">
                                        Observações
                                        <span className="ms-auto text-muted" style={{ fontSize: '0.85rem', float: 'right' }}>
                                            {formData.observacao.length}/500
                                        </span>
                                    </label>
                                    <Form.Control 
                                        as="textarea" 
                                        rows={3} 
                                        name="observacao" 
                                        value={formData.observacao} 
                                        onChange={handleChange}
                                        maxLength={500}
                                        className="form-control form-textarea"
                                        placeholder="Observações adicionais sobre o painel, instruções especiais, detalhes importantes..."
                                    />
                                </div>
                            </Col>
                        </Row>
                    </div>

                    {/* Divisor */}
                    <hr className="my-4" />

                    {/* Botões de Ação */}
                    <Row>
                        <Col md={12} className="d-flex justify-content-end gap-2">
                            <Button 
                                variant="outline-secondary" 
                                type="button" 
                                onClick={resetForm} 
                                disabled={isSaving}
                                className="btn"
                            >
                                <XCircle size={18} className="me-2" />
                                Limpar Formulário
                            </Button>
                            <Button 
                                variant="success" 
                                type="button" 
                                onClick={saveProducao} 
                                disabled={isSaving}
                                className="btn btn-success"
                                style={{ minWidth: '150px' }}
                            >
                                {isSaving ? (
                                    <>
                                        <Spinner size="sm" className="me-2" animation="border" />
                                        Salvando...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle size={18} className="me-2" />
                                        Salvar Painel
                                    </>
                                )}
                            </Button>
                        </Col>
                    </Row>
                </div>
            </Form>
        </Card>

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
        
        <ValidationModal
            show={showValidationModal}
            onHide={() => setShowValidationModal(false)}
            errors={validationErrors}
            title="Validação do Formulário - Painel"
        />
        </>
    );
}

export default FormPainelCompleto;
