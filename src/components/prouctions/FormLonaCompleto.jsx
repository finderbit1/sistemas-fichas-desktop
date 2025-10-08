import React, { useState, useEffect, useMemo } from 'react';
import { Form, Button, Row, Col, Card, InputGroup, Spinner, Alert, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FileText, Person, Layers, CheckCircle, XCircle, CurrencyDollar, Image as ImageIcon, InfoCircle } from 'react-bootstrap-icons';
import ImageDropZone from '../ImageDropZone';
import AreaCalculatorLinhaUnica from '../AreaCalculator';
import ValidationModal from '../ValidationModal';
import { useVendedoresDesigners } from '../../hooks/useVendedoresDesigners';
import { getMateriaisPorTipo } from '../../services/api';
import cacheManager from '../../utils/cacheManager';
import CustomCheckbox from '../CustomCheckbox';
import useCustomAlert from '../../hooks/useCustomAlert';
import CustomAlertModal from '../CustomAlertModal';

/**
 * Formulário Completo de Lona - Versão Profissional
 */
function FormLonaCompleto({ onAdicionarItem }) {
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
    const [fieldErrors, setFieldErrors] = useState({});

    const handleImageChange = (imgBase64) => {
        setImagem(imgBase64);
    };

    // Funções auxiliares
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

    const formatarMoedaInput = (valor) => {
        const apenasNumeros = valor.replace(/\D/g, '');
        if (!apenasNumeros) return '';
        const numero = parseFloat(apenasNumeros) / 100;
        return numero.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    const handleMoneyChange = (e) => {
        const { name, value } = e.target;
        const valorFormatado = formatarMoedaInput(value);
        setFormData(prev => ({ ...prev, [name]: valorFormatado }));
        validateField(name, valorFormatado);
    };

    useEffect(() => {
        // Tentar buscar do cache primeiro
        const cachedMateriais = cacheManager.get('materiais_lona');
        
        if (cachedMateriais) {
            // Cache HIT
            const ativos = cachedMateriais.filter((m) => m.active);
            setMateriais(ativos);
            setMateriaisLoading(false);
            
            if (import.meta.env.DEV) {
                console.log('⚡ Materiais (lona) carregados do CACHE');
            }
            return;
        }

        // Cache MISS - buscar da API
        if (import.meta.env.DEV) {
            console.log('🌐 Buscando Materiais (lona) da API...');
        }
        
        getMateriaisPorTipo('lona')
            .then((res) => {
                const materiaisData = res.data || [];
                const ativos = materiaisData.filter((m) => m.active);
                
                // Salvar no cache
                cacheManager.set('materiais_lona', materiaisData);
                
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
        acabamento: {
            solda: false,
            bastao: false,
            ilhos: false,
        },
        valorLona: '',
        valorAdicionais: '',
        observacao: '',
    });

    const valorTotalGeral = useMemo(() => {
        const valorLona = parseBR(formData.valorLona);
        const valorAdicionais = parseBR(formData.valorAdicionais);
        return valorLona + valorAdicionais;
    }, [formData.valorLona, formData.valorAdicionais]);

    const resetForm = () => {
        setFormData({
            descricao: '',
            largura: '',
            altura: '',
            area: '',
            vendedor: '',
            designer: '',
            material: '',
            acabamento: {
                solda: false,
                bastao: false,
                ilhos: false,
            },
            valorLona: '',
            valorAdicionais: '',
            observacao: '',
        });
        setImagem(null);
        setFieldErrors({});
        setValidationErrors([]);
    };

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
            case 'valorLona':
                if (!value) error = 'Valor é obrigatório';
                else if (parseBR(value) <= 0) error = 'Valor deve ser maior que zero';
                break;
            default:
                break;
        }
        setFieldErrors(prev => ({ ...prev, [name]: error }));
        return error;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox') {
            setFormData(prev => ({
                ...prev,
                acabamento: { ...prev.acabamento, [name]: checked }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
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
        if (!formData.descricao?.trim()) erros.push("Descrição da Lona");
        if (!formData.largura?.trim()) erros.push("Largura");
        if (!formData.altura?.trim()) erros.push("Altura");
        if (!formData.vendedor?.trim()) erros.push("Vendedor");
        if (!formData.designer?.trim()) erros.push("Designer");
        if (!formData.material?.trim()) erros.push("Material");
        if (!formData.valorLona?.trim()) erros.push("Valor da Lona");
        
        if (formData.largura && (isNaN(parseFloat(formData.largura)) || parseFloat(formData.largura) <= 0)) {
            erros.push("Largura deve ser um número maior que zero");
        }
        if (formData.altura && (isNaN(parseFloat(formData.altura)) || parseFloat(formData.altura) <= 0)) {
            erros.push("Altura deve ser um número maior que zero");
        }
        if (formData.valorLona && (isNaN(parseFloat(formData.valorLona.replace(',', '.'))) || parseFloat(formData.valorLona.replace(',', '.')) <= 0)) {
            erros.push("Valor da Lona deve ser um número maior que zero");
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
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const valorTotal = formatBR(valorTotalGeral);
        const dataProducao = {
            "tipoProducao": "lona",
            "tipo": "lona",
            "imagem": imagem,
            "valor": valorTotal,
            ...formData
        }
        
        setIsSuccess(true);
        setIsSaving(false);
        
        onAdicionarItem(dataProducao)
        console.log('✅ Dados da lona salvos:', dataProducao);
        
        setTimeout(() => {
            setIsSuccess(false);
            resetForm();
        }, 2000);
    };

    const renderTooltip = (text) => (props) => (
        <Tooltip {...props}>{text}</Tooltip>
    );

    return (
        <>
        <Card className="dashboard-card">
            <Form className={isSuccess ? 'form-success form-success-animation' : ''}>
                <div className="p-4">
                    {isSuccess && (
                        <Alert variant="success" className="d-flex align-items-center mb-4">
                            <CheckCircle size={20} className="me-2" />
                            <strong>Lona salva com sucesso!</strong>
                        </Alert>
                    )}

                    <h5 className="mb-3" style={{ color: 'var(--color-primary)', borderBottom: '2px solid var(--color-primary)', paddingBottom: '0.5rem' }}>
                        <FileText size={20} className="me-2" />
                        Informações Básicas
                    </h5>
                    
                    <div>
                        <Row className="mb-3">
                            <Col md={8}>
                                <div className="form-group">
                                    <label className="form-label d-flex align-items-center">
                                        Descrição da Lona
                                        <OverlayTrigger placement="right" overlay={renderTooltip('Descreva a lona de forma clara')}>
                                            <span className="ms-2 text-muted" style={{ cursor: 'help' }}>
                                                <InfoCircle size={14} />
                                            </span>
                                        </OverlayTrigger>
                                        <span className="ms-auto text-muted" style={{ fontSize: '0.85rem' }}>
                                            {formData.descricao.length}/200
                                        </span>
                                    </label>
                                    <Form.Control 
                                        placeholder="Ex: Lona para fachada" 
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
                                            <span className="text-muted">Carregando...</span>
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
                                            <span className="text-muted">Carregando...</span>
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

                    <hr className="my-4" />

                    <h5 className="mb-3" style={{ color: 'var(--color-primary)', borderBottom: '2px solid var(--color-primary)', paddingBottom: '0.5rem' }}>
                        <Layers size={20} className="me-2" />
                        Material e Acabamento
                    </h5>

                    <Row className="mb-4">
                        <Col md={6}>
                            <div className="form-group mb-3">
                                <label className="form-label">
                                    Tipo de Material
                                    <OverlayTrigger placement="right" overlay={renderTooltip('Selecione o material da lona')}>
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

                            <div className="mb-3">
                                <h6 className="mb-3" style={{ color: 'var(--color-neutral-700)', fontWeight: '600' }}>
                                    Acabamento
                                </h6>
                                <div className="form-check mb-2">
                                    <CustomCheckbox
                                        id="acab-solda"
                                        label="Solda (acabamento soldado)"
                                        name="solda"
                                        checked={formData.acabamento.solda}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="form-check mb-2">
                                    <CustomCheckbox
                                        id="acab-bastao"
                                        label="Bastão (suporte em bastão)"
                                        name="bastao"
                                        checked={formData.acabamento.bastao}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="form-check mb-2">
                                    <CustomCheckbox
                                        id="acab-ilhos"
                                        label="Ilhós (furos reforçados)"
                                        name="ilhos"
                                        checked={formData.acabamento.ilhos}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </Col>

                        <Col md={6}>
                            <h6 className="mb-3" style={{ color: 'var(--color-neutral-700)', fontWeight: '600' }}>
                                <ImageIcon size={16} className="me-2" />
                                Imagem da Lona
                            </h6>
                            <ImageDropZone onImageChange={handleImageChange} />
                        </Col>
                    </Row>

                    <hr className="my-4" />

                    <h5 className="mb-3" style={{ color: 'var(--color-primary)', borderBottom: '2px solid var(--color-primary)', paddingBottom: '0.5rem' }}>
                        <CurrencyDollar size={20} className="me-2" />
                        Valores e Observações
                    </h5>

                    <div>
                        <Row className="mb-3">
                            <Col md={4}>
                                <div className="form-group">
                                    <label className="form-label">Valor da Lona</label>
                                    <InputGroup>
                                        <InputGroup.Text>R$</InputGroup.Text>
                                        <Form.Control
                                            type="text"
                                            name="valorLona"
                                            value={formData.valorLona}
                                            onChange={handleMoneyChange}
                                            onBlur={handleBlur}
                                            placeholder="Ex: 150,00"
                                            required
                                            className={`form-control ${fieldErrors.valorLona ? 'is-invalid' : formData.valorLona ? 'is-valid' : ''}`}
                                        />
                                    </InputGroup>
                                </div>
                            </Col>
                            <Col md={4}>
                                <div className="form-group">
                                    <label className="form-label">
                                        Valores Adicionais
                                        <OverlayTrigger placement="right" overlay={renderTooltip('Custos extras')}>
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
                                        placeholder="Observações adicionais sobre a lona..."
                                    />
                                </div>
                            </Col>
                        </Row>
                    </div>

                    <hr className="my-4" />

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
                                        Salvar Lona
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
            title="Validação do Formulário - Lona"
        />
        </>
    );
}

export default FormLonaCompleto;

