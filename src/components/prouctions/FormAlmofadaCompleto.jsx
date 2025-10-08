import React, { useState, useEffect, useMemo } from 'react';
import { Form, Button, Row, Col, Card, InputGroup, Spinner, Alert, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FileText, Person, Layers, CheckCircle, XCircle, CurrencyDollar, Image as ImageIcon, InfoCircle } from 'react-bootstrap-icons';
import ImageDropZone from '../ImageDropZone';
import AreaCalculatorLinhaUnica from '../AreaCalculator';
import ValidationModal from '../ValidationModal';
import { useVendedoresDesigners } from '../../hooks/useVendedoresDesigners';
import { getAllTecidos } from '../../services/api';
import cacheManager from '../../utils/cacheManager';
import useCustomAlert from '../../hooks/useCustomAlert';
import CustomAlertModal from '../CustomAlertModal';

function FormAlmofadaCompleto({ onAdicionarItem }) {
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
    const [fieldErrors, setFieldErrors] = useState({});

    const handleImageChange = (imgBase64) => setImagem(imgBase64);

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
        const cachedTecidos = cacheManager.get('tecidos');
        
        if (cachedTecidos) {
            const ativos = cachedTecidos.filter((t) => t.active);
            setTecidos(ativos);
            setTecidosLoading(false);
            if (import.meta.env.DEV) console.log('⚡ Tecidos carregados do CACHE');
            return;
        }

        // Cache MISS - buscar da API
        if (import.meta.env.DEV) console.log('🌐 Buscando Tecidos da API...');
        
        getAllTecidos()
            .then((res) => {
                const tecidosData = res.data || [];
                const ativos = tecidosData.filter((t) => t.active);
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
            customAlert.showWarning('Atenção', `${error}.`);
        }
    }, [error]);

    const [formData, setFormData] = useState({
        descricao: '',
        largura: '',
        altura: '',
        area: '',
        quantidade: '1',
        vendedor: '',
        designer: '',
        tecido: '',
        enchimento: 'com-enchimento',
        valorAlmofada: '',
        valorAdicionais: '',
        observacao: '',
    });

    const valorTotalGeral = useMemo(() => {
        const valorAlmofada = parseBR(formData.valorAlmofada);
        const valorAdicionais = parseBR(formData.valorAdicionais);
        const quantidade = parseInt(formData.quantidade) || 1;
        return (valorAlmofada * quantidade) + valorAdicionais;
    }, [formData.valorAlmofada, formData.valorAdicionais, formData.quantidade]);

    const resetForm = () => {
        setFormData({
            descricao: '',
            largura: '',
            altura: '',
            area: '',
            quantidade: '1',
            vendedor: '',
            designer: '',
            tecido: '',
            enchimento: 'com-enchimento',
            valorAlmofada: '',
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
            case 'quantidade':
                if (!value || parseInt(value) <= 0) error = 'Quantidade deve ser maior que zero';
                break;
            case 'valorAlmofada':
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
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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
    };

    const validarCampos = () => {
        const erros = [];
        if (!formData.descricao?.trim()) erros.push("Descrição da Almofada");
        if (!formData.largura?.trim()) erros.push("Largura");
        if (!formData.altura?.trim()) erros.push("Altura");
        if (!formData.quantidade || parseInt(formData.quantidade) <= 0) erros.push("Quantidade");
        if (!formData.vendedor?.trim()) erros.push("Vendedor");
        if (!formData.designer?.trim()) erros.push("Designer");
        if (!formData.tecido?.trim()) erros.push("Tecido");
        if (!formData.valorAlmofada?.trim()) erros.push("Valor da Almofada");
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
            "tipoProducao": "almofada",
            "tipo": "almofada",
            "imagem": imagem,
            "valor": valorTotal,
            ...formData
        }
        
        setIsSuccess(true);
        setIsSaving(false);
        
        onAdicionarItem(dataProducao)
        console.log('✅ Dados da almofada salvos:', dataProducao);
        
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
                            <strong>Almofada salva com sucesso!</strong>
                        </Alert>
                    )}

                    <h5 className="mb-3" style={{ color: 'var(--color-primary)', borderBottom: '2px solid var(--color-primary)', paddingBottom: '0.5rem' }}>
                        <FileText size={20} className="me-2" />
                        Informações Básicas
                    </h5>
                    
                    <Row className="mb-3">
                        <Col md={6}>
                            <div className="form-group">
                                <label className="form-label">Descrição da Almofada</label>
                                <Form.Control 
                                    placeholder="Ex: Almofada decorativa" 
                                    type="text" 
                                    name="descricao" 
                                    value={formData.descricao} 
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    maxLength={200}
                                    required 
                                    className={`form-control ${fieldErrors.descricao ? 'is-invalid' : formData.descricao.length >= 3 ? 'is-valid' : ''}`}
                                />
                            </div>
                        </Col>
                        <Col md={3}>
                            <AreaCalculatorLinhaUnica 
                                formData={formData}
                                onChange={handleAreaChange}
                            />
                        </Col>
                        <Col md={3}>
                            <div className="form-group">
                                <label className="form-label">Quantidade</label>
                                <Form.Control 
                                    type="number" 
                                    name="quantidade" 
                                    min="1"
                                    value={formData.quantidade} 
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    required 
                                    className={`form-control ${fieldErrors.quantidade ? 'is-invalid' : formData.quantidade ? 'is-valid' : ''}`}
                                />
                            </div>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <div className="form-group mb-3">
                                <label className="form-label"><Person size={16} className="me-2" />Vendedor</label>
                                <Form.Select name="vendedor" value={formData.vendedor} onChange={handleChange} required className={`form-control ${formData.vendedor ? 'is-valid' : ''}`}>
                                    <option value="">Selecione um Vendedor</option>
                                    {vendedores.map(v => (<option key={v.id} value={v.name}>{v.name}</option>))}
                                </Form.Select>
                            </div>
                        </Col>
                        <Col md={6}>
                            <div className="form-group mb-3">
                                <label className="form-label"><Person size={16} className="me-2" />Designer</label>
                                <Form.Select name="designer" value={formData.designer} onChange={handleChange} required className={`form-control ${formData.designer ? 'is-valid' : ''}`}>
                                    <option value="">Selecione um Designer</option>
                                    {designers.map(d => (<option key={d.id} value={d.name}>{d.name}</option>))}
                                </Form.Select>
                            </div>
                        </Col>
                    </Row>

                    <hr className="my-4" />

                    <h5 className="mb-3" style={{ color: 'var(--color-primary)', borderBottom: '2px solid var(--color-primary)', paddingBottom: '0.5rem' }}>
                        <Layers size={20} className="me-2" />
                        Material e Configuração
                    </h5>

                    <Row className="mb-4">
                        <Col md={6}>
                            <div className="form-group mb-3">
                                <label className="form-label">Tecido</label>
                                <Form.Select name="tecido" value={formData.tecido} onChange={handleChange} required className={`form-control ${formData.tecido ? 'is-valid' : ''}`}>
                                    <option value="">Selecione o Tecido</option>
                                    {tecidos.map(t => (<option key={t.id} value={t.name}>{t.name}</option>))}
                                </Form.Select>
                            </div>

                            <div className="form-group mb-3">
                                <label className="form-label">Enchimento</label>
                                <Form.Select name="enchimento" value={formData.enchimento} onChange={handleChange} required className={`form-control ${formData.enchimento ? 'is-valid' : ''}`}>
                                    <option value="com-enchimento">Com enchimento</option>
                                    <option value="sem-enchimento">Sem enchimento</option>
                                </Form.Select>
                            </div>
                        </Col>

                        <Col md={6}>
                            <h6 className="mb-3" style={{ color: 'var(--color-neutral-700)', fontWeight: '600' }}>
                                <ImageIcon size={16} className="me-2" />Imagem da Almofada
                            </h6>
                            <ImageDropZone onImageChange={handleImageChange} />
                        </Col>
                    </Row>

                    <hr className="my-4" />

                    <h5 className="mb-3" style={{ color: 'var(--color-primary)', borderBottom: '2px solid var(--color-primary)', paddingBottom: '0.5rem' }}>
                        <CurrencyDollar size={20} className="me-2" />
                        Valores e Observações
                    </h5>

                    <Row className="mb-3">
                        <Col md={3}>
                            <div className="form-group">
                                <label className="form-label">Valor Unitário</label>
                                <InputGroup>
                                    <InputGroup.Text>R$</InputGroup.Text>
                                    <Form.Control type="text" name="valorAlmofada" value={formData.valorAlmofada} onChange={handleMoneyChange} onBlur={handleBlur} placeholder="Ex: 50,00" required className={`form-control ${fieldErrors.valorAlmofada ? 'is-invalid' : formData.valorAlmofada ? 'is-valid' : ''}`} />
                                </InputGroup>
                            </div>
                        </Col>
                        <Col md={3}>
                            <div className="form-group">
                                <label className="form-label">Valores Adicionais</label>
                                <InputGroup>
                                    <InputGroup.Text>R$</InputGroup.Text>
                                    <Form.Control type="text" name="valorAdicionais" value={formData.valorAdicionais} onChange={handleMoneyChange} placeholder="Ex: 10,00" className="form-control" />
                                </InputGroup>
                            </div>
                        </Col>
                        <Col md={3}>
                            <div className="form-group">
                                <label className="form-label">Subtotal ({formData.quantidade}un)</label>
                                <div className="form-control" style={{ background: '#f0f0f0', fontWeight: 'bold' }}>
                                    R$ {formatBR(parseBR(formData.valorAlmofada) * parseInt(formData.quantidade || 1))}
                                </div>
                            </div>
                        </Col>
                        <Col md={3}>
                            <div className="form-group">
                                <label className="form-label">Valor Total</label>
                                <div className="form-control" style={{ background: 'var(--color-success-light, #e8f5e9)', border: '2px solid var(--color-success)', fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--color-success)', textAlign: 'center' }}>
                                    R$ {formatBR(valorTotalGeral)}
                                </div>
                            </div>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={12}>
                            <div className="form-group">
                                <label className="form-label">Observações</label>
                                <Form.Control as="textarea" rows={3} name="observacao" value={formData.observacao} onChange={handleChange} maxLength={500} className="form-control form-textarea" placeholder="Observações adicionais..." />
                            </div>
                        </Col>
                    </Row>

                    <hr className="my-4" />

                    <Row>
                        <Col md={12} className="d-flex justify-content-end gap-2">
                            <Button variant="outline-secondary" type="button" onClick={resetForm} disabled={isSaving} className="btn">
                                <XCircle size={18} className="me-2" />Limpar Formulário
                            </Button>
                            <Button variant="success" type="button" onClick={saveProducao} disabled={isSaving} className="btn btn-success" style={{ minWidth: '150px' }}>
                                {isSaving ? (<><Spinner size="sm" className="me-2" animation="border" />Salvando...</>) : (<><CheckCircle size={18} className="me-2" />Salvar Almofada</>)}
                            </Button>
                        </Col>
                    </Row>
                </div>
            </Form>
        </Card>

        <CustomAlertModal isOpen={customAlert.alertState.isOpen} onClose={customAlert.hideAlert} type={customAlert.alertState.type} title={customAlert.alertState.title} message={customAlert.alertState.message} confirmText={customAlert.alertState.confirmText} onConfirm={customAlert.alertState.onConfirm} showCancel={customAlert.alertState.showCancel} cancelText={customAlert.alertState.cancelText} />
        <ValidationModal show={showValidationModal} onHide={() => setShowValidationModal(false)} errors={validationErrors} title="Validação do Formulário - Almofada" />
        </>
    );
}

export default FormAlmofadaCompleto;

