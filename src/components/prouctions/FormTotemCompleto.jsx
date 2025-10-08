import React, { useState, useEffect, useMemo } from 'react';
import { Form, Button, Row, Col, Card, InputGroup, Spinner, Badge, Alert, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FileText, Person, Layers, CheckCircle, XCircle, CurrencyDollar, Image as ImageIcon, InfoCircle } from 'react-bootstrap-icons';
import ImageDropZone from '../ImageDropZone';
import AreaCalculatorLinhaUnica from '../AreaCalculator';
import ValidationModal from '../ValidationModal';
import { useVendedoresDesigners } from '../../hooks/useVendedoresDesigners';
import { getMateriaisPorTipo } from '../../services/api';
import cacheManager from '../../utils/cacheManager';
import useCustomAlert from '../../hooks/useCustomAlert';
import CustomAlertModal from '../CustomAlertModal';

/**
 * Formulário Completo de Totem de Produção
 * 
 * Campos incluídos:
 * - Descrição, largura, altura e área em m²
 * - Vendedor e Designer
 * - Tipo de material (busca do cadastro)
 * - Acabamento (Com pé, Sem pé, Sem acabamento)
 * - Imagem do totem
 * - Valor do totem e valores adicionais
 * - Observações
 */
function FormTotemCompleto({ onAdicionarItem }) {
    const { vendedores, designers, loading, error } = useVendedoresDesigners();
    
    const [imagem, setImagem] = useState(null);
    const [showValidationModal, setShowValidationModal] = useState(false);
    const [validationErrors, setValidationErrors] = useState([]);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [materiais, setMateriais] = useState([]);
    const [materiaisLoading, setMateriaisLoading] = useState(true);
    const [materiaisError, setMateriaisError] = useState(null);
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
        const apenasNumeros = valor.replace(/\D/g, '');
        if (!apenasNumeros) return '';
        const numero = parseFloat(apenasNumeros) / 100;
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
        
        validateField(name, valorFormatado);
    };

    useEffect(() => {
        // Tentar buscar do cache primeiro
        const cachedMateriais = cacheManager.get('materiais_totem');
        
        if (cachedMateriais) {
            // Cache HIT
            const ativos = cachedMateriais.filter((m) => m.active);
            setMateriais(ativos);
            setMateriaisLoading(false);
            
            if (import.meta.env.DEV) {
                console.log('⚡ Materiais (totem) carregados do CACHE');
            }
            return;
        }

        // Cache MISS - buscar da API
        if (import.meta.env.DEV) {
            console.log('🌐 Buscando Materiais (totem) da API...');
        }
        
        getMateriaisPorTipo('totem')
            .then((res) => {
                const materiaisData = res.data || [];
                const ativos = materiaisData.filter((m) => m.active);
                
                // Salvar no cache
                cacheManager.set('materiais_totem', materiaisData);
                
                setMateriais(ativos);
            })
            .catch((e) => {
                console.error('❌ Erro ao carregar materiais:', e);
                setMateriaisError('Não foi possível carregar a lista de materiais');
            })
            .finally(() => setMateriaisLoading(false));
    }, []);

    useEffect(() => {
        if (error) {
            customAlert.showWarning('Atenção', `${error}. Os campos de vendedor e designer podem não estar disponíveis.`);
        }
    }, [error]);

    useEffect(() => {
        if (materiaisError) {
            customAlert.showWarning('Atenção', materiaisError);
        }
    }, [materiaisError]);

    const [formData, setFormData] = useState({
        descricao: '',
        largura: '',
        altura: '',
        area: '',
        vendedor: '',
        designer: '',
        material: '',
        acabamento: 'sem-acabamento',
        valorTotem: '',
        valorAdicionais: '',
        observacao: '',
    });

    // Calcular valor total geral
    const valorTotalGeral = useMemo(() => {
        const valorTotem = parseBR(formData.valorTotem);
        const valorAdicionais = parseBR(formData.valorAdicionais);
        const total = valorTotem + valorAdicionais;
        return total;
    }, [formData.valorTotem, formData.valorAdicionais]);

    const resetForm = () => {
        setFormData({
            descricao: '',
            largura: '',
            altura: '',
            area: '',
            vendedor: '',
            designer: '',
            material: '',
            acabamento: 'sem-acabamento',
            valorTotem: '',
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
            case 'valorTotem':
                if (!value) error = 'Valor é obrigatório';
                else if (parseBR(value) <= 0) error = 'Valor deve ser maior que zero';
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
        const { name, value } = e.target;
        
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Validar campo em tempo real
        validateField(name, value);
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
        if (!formData.descricao?.trim()) erros.push("Descrição do Totem");
        if (!formData.largura?.trim()) erros.push("Largura");
        if (!formData.altura?.trim()) erros.push("Altura");
        if (!formData.vendedor?.trim()) erros.push("Vendedor");
        if (!formData.designer?.trim()) erros.push("Designer");
        if (!formData.material?.trim()) erros.push("Material");
        if (!formData.acabamento?.trim()) erros.push("Acabamento");
        if (!formData.valorTotem?.trim()) erros.push("Valor do Totem");
        
        // Validação de valores numéricos
        if (formData.largura && (isNaN(parseFloat(formData.largura)) || parseFloat(formData.largura) <= 0)) {
            erros.push("Largura deve ser um número maior que zero");
        }
        if (formData.altura && (isNaN(parseFloat(formData.altura)) || parseFloat(formData.altura) <= 0)) {
            erros.push("Altura deve ser um número maior que zero");
        }
        if (formData.valorTotem && (isNaN(parseFloat(formData.valorTotem.replace(',', '.'))) || parseFloat(formData.valorTotem.replace(',', '.')) <= 0)) {
            erros.push("Valor do Totem deve ser um número maior que zero");
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
            "tipoProducao": "totem",
            "tipo": "totem",
            "imagem": imagem,
            "valor": valorTotal,
            ...formData
        }
        
        // Ativar estado de sucesso
        setIsSuccess(true);
        setIsSaving(false);
        
        onAdicionarItem(dataProducao)
        console.log('✅ Dados do totem salvos:', dataProducao);
        
        // Resetar estado de sucesso após 2 segundos
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
                            <strong>Totem salvo com sucesso!</strong>
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
                                        Descrição do Totem
                                        <OverlayTrigger placement="right" overlay={renderTooltip('Descreva o totem de forma clara e objetiva')}>
                                            <span className="ms-2 text-muted" style={{ cursor: 'help' }}>
                                                <InfoCircle size={14} />
                                            </span>
                                        </OverlayTrigger>
                                        <span className="ms-auto text-muted" style={{ fontSize: '0.85rem' }}>
                                            {formData.descricao.length}/200
                                        </span>
                                    </label>
                                    <Form.Control 
                                        placeholder="Ex: Totem promocional para loja" 
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
                    </div>

                    {/* Divisor */}
                    <hr className="my-4" />

                    {/* Título: Material e Acabamento */}
                    <h5 className="mb-3" style={{ color: 'var(--color-primary)', borderBottom: '2px solid var(--color-primary)', paddingBottom: '0.5rem' }}>
                        <Layers size={20} className="me-2" />
                        Material e Acabamento
                    </h5>

                    <Row className="mb-4">
                        <Col md={6}>
                            {/* Material */}
                            <div className="form-group mb-3">
                                <label className="form-label">
                                    Tipo de Material
                                    <OverlayTrigger placement="right" overlay={renderTooltip('Selecione o material do totem')}>
                                        <span className="ms-2 text-muted" style={{ cursor: 'help' }}>
                                            <InfoCircle size={14} />
                                        </span>
                                    </OverlayTrigger>
                                </label>
                                {materiaisLoading ? (
                                    <div className="d-flex align-items-center">
                                        <Spinner size="sm" className="me-2" animation="border" />
                                        <span className="text-muted">Carregando materiais...</span>
                                    </div>
                                ) : materiaisError ? (
                                    <div className="form-text text-warning">{materiaisError}</div>
                                ) : (
                                    <Form.Select 
                                        name="material" 
                                        value={formData.material} 
                                        onChange={handleChange} 
                                        required 
                                        className={`form-control ${formData.material ? 'is-valid' : ''}`}
                                    >
                                        <option value="">Selecione o Material</option>
                                        {materiais.map((m) => (
                                            <option key={m.id} value={m.name}>{m.name}</option>
                                        ))}
                                    </Form.Select>
                                )}
                            </div>

                            {/* Acabamento */}
                            <div className="form-group mb-3">
                                <label className="form-label">
                                    Acabamento
                                    <OverlayTrigger placement="right" overlay={renderTooltip('Selecione o tipo de acabamento')}>
                                        <span className="ms-2 text-muted" style={{ cursor: 'help' }}>
                                            <InfoCircle size={14} />
                                        </span>
                                    </OverlayTrigger>
                                </label>
                                <Form.Select 
                                    name="acabamento" 
                                    value={formData.acabamento} 
                                    onChange={handleChange} 
                                    required 
                                    className={`form-control ${formData.acabamento ? 'is-valid' : ''}`}
                                >
                                    <option value="sem-acabamento">Sem acabamento</option>
                                    <option value="com-pe">Com pé</option>
                                    <option value="sem-pe">Sem pé</option>
                                </Form.Select>
                            </div>
                        </Col>

                        {/* Imagem */}
                        <Col md={6}>
                            <h6 className="mb-3" style={{ color: 'var(--color-neutral-700)', fontWeight: '600' }}>
                                <ImageIcon size={16} className="me-2" />
                                Imagem do Totem
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
                                    <label className="form-label">Valor do Totem</label>
                                    <InputGroup>
                                        <InputGroup.Text>R$</InputGroup.Text>
                                        <Form.Control
                                            type="text"
                                            name="valorTotem"
                                            value={formData.valorTotem}
                                            onChange={handleMoneyChange}
                                            onBlur={handleBlur}
                                            placeholder="Ex: 150,00"
                                            required
                                            className={`form-control ${fieldErrors.valorTotem ? 'is-invalid' : formData.valorTotem ? 'is-valid' : ''}`}
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
                        {formData.valorTotem && parseBR(formData.valorAdicionais) > 0 && (
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
                                        </div>
                                        <div className="mt-2" style={{ fontSize: '0.95rem' }}>
                                            <div className="d-flex justify-content-between py-1">
                                                <span>Valor Base do Totem:</span>
                                                <strong>R$ {formatBR(parseBR(formData.valorTotem))}</strong>
                                            </div>
                                            <div className="d-flex justify-content-between py-1">
                                                <span>+ Valores Adicionais:</span>
                                                <strong>R$ {formatBR(parseBR(formData.valorAdicionais))}</strong>
                                            </div>
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
                                        placeholder="Observações adicionais sobre o totem, instruções especiais, detalhes importantes..."
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
                                        Salvar Totem
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
            title="Validação do Formulário - Totem"
        />
        </>
    );
}

export default FormTotemCompleto;

