import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Card, InputGroup, Spinner } from 'react-bootstrap';
import { FileText, Person } from 'react-bootstrap-icons';
import ImageDropZone from '../ImageDropZone';
import AreaCalculatorLinhaUnica from '../AreaCalculator';
import InputValorReal from '../InputValorMoeda';
import ValidationModal from '../ValidationModal';
import { useVendedoresDesigners } from '../../hooks/useVendedoresDesigners';
import { getAllTecidos } from '../../services/api';
import CustomCheckbox from '../CustomCheckbox';
import useCustomAlert from '../../hooks/useCustomAlert';
import CustomAlertModal from '../CustomAlertModal';


function FormPainel({ onAdicionarItem }) {
    const { vendedores, designers, loading, error } = useVendedoresDesigners();
    
    const [imagem, setImagem] = useState(null);
    const [showValidationModal, setShowValidationModal] = useState(false);
    const [validationErrors, setValidationErrors] = useState([]);
    const [isSuccess, setIsSuccess] = useState(false);
    const [tecidos, setTecidos] = useState([]);
    const [tecidosLoading, setTecidosLoading] = useState(true);
    const [tecidosError, setTecidosError] = useState(null);
    const customAlert = useCustomAlert();

    const handleImageChange = (imgBase64) => {
        setImagem(imgBase64);
    };

    useEffect(() => {
        getAllTecidos()
            .then((res) => {
                const ativos = (res.data || []).filter((t) => t.active);
                setTecidos(ativos);
            })
            .catch((e) => {
                console.error('Erro ao carregar tecidos:', e);
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
        vendedor: '',
        designer: '',
        tecido: '',
        acabamento: {
            overloque: false,
            elastico: false,
            ilhos: false,
        },
        emenda: 'sem-emenda',
        observacao: '',
        valorPainel: '',
        valorAdicionais: '',
        ilhosQtd: '',
        ilhosValorUnitario: '',
        ilhosDistancia: '',
    });



    const resetForm = () => {
        setFormData({
            descricao: '',
            largura: '',
            altura: '',
            vendedor: '',
            designer: '',
            tecido: '',
            acabamento: {
                overloque: false,
                elastico: false,
                ilhos: false,
            },
            emenda: 'sem-emenda',
            observacao: '',
            valorPainel: '',
            ilhosQtd: '',
            ilhosValorUnitario: '',
            ilhosDistancia: '',
        });
        setImagem(null);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox') {
            setFormData(prev => ({
                ...prev,
                acabamento: { ...prev.acabamento, [name]: checked }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
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
        
        // Debug: verificar valores
        console.log('FormData na validação:', formData);
        console.log('Largura:', formData.largura, 'Altura:', formData.altura);
        
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
        if (formData.acabamento.ilhos) {
            if (!formData.ilhosQtd?.trim()) erros.push("Quantidade de Ilhós");
            if (!formData.ilhosValorUnitario?.trim()) erros.push("Valor Unitário dos Ilhós");
            if (!formData.ilhosDistancia?.trim()) erros.push("Distância dos Ilhós");
            
            if (formData.ilhosQtd && (isNaN(parseInt(formData.ilhosQtd)) || parseInt(formData.ilhosQtd) <= 0)) {
                erros.push("Quantidade de Ilhós deve ser um número maior que zero");
            }
            if (formData.ilhosValorUnitario && (isNaN(parseFloat(formData.ilhosValorUnitario.replace(',', '.'))) || parseFloat(formData.ilhosValorUnitario.replace(',', '.')) <= 0)) {
                erros.push("Valor Unitário dos Ilhós deve ser um número maior que zero");
            }
            if (formData.ilhosDistancia && (isNaN(parseFloat(formData.ilhosDistancia)) || parseFloat(formData.ilhosDistancia) <= 0)) {
                erros.push("Distância dos Ilhós deve ser um número maior que zero");
            }
        }
        
        return erros;
    };

    const parseBR = (v) => {
        if (!v) return 0;
        if (typeof v === 'number') return v;
        const normalized = String(v).replace(/\./g, '').replace(',', '.');
        const num = parseFloat(normalized);
        return isNaN(num) ? 0 : num;
    };

    const saveProducao = (e) => {
        e.preventDefault();
        
        const erros = validarCampos();
        if (erros.length > 0) {
            setValidationErrors(erros);
            setShowValidationModal(true);
            return;
        }
        
        const valorTotal = (parseBR(formData.valorPainel) + parseBR(formData.valorAdicionais)).toFixed(2).replace('.', ',');
        const dataProducao = {
            "tipoProducao": "painel",
            "tipo": "painel",
            "imagem": imagem,
            "valor": valorTotal,
            ...formData
        }
        
        // Ativar estado de sucesso
        setIsSuccess(true);
        
        onAdicionarItem(dataProducao)
        console.log('Dados do formulário:', dataProducao);
        
        // Resetar estado de sucesso após 3 segundos
        setTimeout(() => {
            setIsSuccess(false);
        }, 3000);
    };

    return (
        <>
        <Form className={isSuccess ? 'form-success form-success-animation' : ''}>
                <Row className="mb-3">
                    <Col md={8}>
                        <div className="form-group mb-3">
                            <label className="form-label">
                                <FileText size={16} style={{ marginRight: '8px' }} />
                                Descrição do Painel
                            </label>
                            <Form.Control 
                                placeholder="Digite a descrição do painel" 
                                type="text" 
                                name="descricao" 
                                value={formData.descricao} 
                                onChange={handleChange} 
                                required 
                                className="form-control"
                            />
                        </div>
                    </Col>
                    <Col md={4}>
                        <AreaCalculatorLinhaUnica 
                            formData={formData}
                            onChange={handleAreaChange}
                        />
                    </Col>
                </Row>
                <Row className="mb-3">
                    <Col md={6}>
                        <div className="form-group mb-3">
                            <label className="form-label">
                                <Person size={16} style={{ marginRight: '8px' }} />
                                Vendedor
                            </label>
                            {loading ? (
                                <div className="d-flex align-items-center">
                                    <Spinner size="sm" className="me-2" />
                                    <span>Carregando vendedores...</span>
                                </div>
                            ) : (
                                <Form.Select name="vendedor" value={formData.vendedor} onChange={handleChange} required className="form-control">
                                    <option value="">Selecione um Vendedor</option>
                                    {vendedores.map(vendedor => (
                                        <option key={vendedor.id} value={vendedor.id}>
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
                                <FileText size={16} style={{ marginRight: '8px' }} />
                                Designer
                            </label>
                            {loading ? (
                                <div className="d-flex align-items-center">
                                    <Spinner size="sm" className="me-2" />
                                    <span>Carregando designers...</span>
                                </div>
                            ) : (
                                <Form.Select name="designer" value={formData.designer} onChange={handleChange} required className="form-control">
                                    <option value="">Selecione um Designer</option>
                                    {designers.map(designer => (
                                        <option key={designer.id} value={designer.id}>
                                            {designer.name}
                                        </option>
                                    ))}
                                </Form.Select>
                            )}
                        </div>
                    </Col>
                </Row>
                <Row className="mb-3">
                    <Col md={6}>
                        <div className="form-group mb-3">
                            <label className="form-label">
                                <FileText size={16} style={{ marginRight: '8px' }} />
                                Tecido
                            </label>
                            {tecidosLoading ? (
                                <div className="d-flex align-items-center"><Spinner size="sm" className="me-2" />Carregando tecidos...</div>
                            ) : tecidosError ? (
                                <div className="form-text text-warning">{tecidosError}</div>
                            ) : (
                                <Form.Select name="tecido" value={formData.tecido} onChange={handleChange} required className="form-control">
                                    <option value="">Selecione o Tecido</option>
                                    {tecidos.map((t) => (
                                        <option key={t.id} value={t.name}>{t.name}</option>
                                    ))}
                                </Form.Select>
                            )}
                        </div>
                    </Col>
                </Row>
                <Row className="mb-3">
                    <Col md={6}>
                        <Card className="dashboard-card">
                            <div className="dashboard-card-header">
                                <h6 className="dashboard-card-title">Acabamento</h6>
                            </div>
                            <div className="p-3">
                                <div className="form-check mb-2">
                                    <CustomCheckbox
                                        id="acab-overloque"
                                        label="Overloque"
                                        name="overloque"
                                        checked={formData.acabamento.overloque}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="form-check mb-2">
                                    <CustomCheckbox
                                        id="acab-elastico"
                                        label="Elástico"
                                        name="elastico"
                                        checked={formData.acabamento.elastico}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="form-check mb-2">
                                    <CustomCheckbox
                                        id="acab-ilhos"
                                        label="Ilhós"
                                        name="ilhos"
                                        checked={formData.acabamento.ilhos}
                                        onChange={handleChange}
                                    />
                                </div>

                                {formData.acabamento.ilhos && (
                                    <div className="mt-3 p-3" style={{ background: 'var(--color-neutral-100)', borderRadius: 'var(--border-radius)' }}>
                                        <h6 className="mb-2" style={{ color: 'var(--color-primary)', fontSize: 'var(--font-size-sm)' }}>Configurações dos Ilhós</h6>
                                        <Row>
                                            <Col md={4}>
                                                <div className="form-group mb-2">
                                                    <label className="form-label">Quantidade</label>
                                                    <Form.Control
                                                        type="number"
                                                        name="ilhosQtd"
                                                        min="1"
                                                        value={formData.ilhosQtd}
                                                        onChange={handleChange}
                                                        required
                                                        className="form-control"
                                                    />
                                                </div>
                                            </Col>
                                            <Col md={4}>
                                                <div className="form-group mb-2">
                                                    <label className="form-label">Valor Unitário</label>
                                                    <Form.Control
                                                        type="text"
                                                        name="ilhosValorUnitario"
                                                        placeholder="Ex: 0,50"
                                                        value={formData.ilhosValorUnitario}
                                                        onChange={handleChange}
                                                        required
                                                        className="form-control"
                                                    />
                                                </div>
                                            </Col>
                                            <Col md={4}>
                                                <div className="form-group mb-2">
                                                    <label className="form-label">Distância (cm)</label>
                                                    <Form.Control
                                                        type="text"
                                                        name="ilhosDistancia"
                                                        placeholder="Ex: 20"
                                                        value={formData.ilhosDistancia}
                                                        onChange={handleChange}
                                                        required
                                                        className="form-control"
                                                    />
                                                </div>
                                            </Col>
                                        </Row>
                                    </div>
                                )}
                            </div>
                        </Card>

                        <div className="form-group mb-3">
                            <label className="form-label">Tipo de Emenda</label>
                            <Form.Select name="emenda" value={formData.emenda} onChange={handleChange} required className="form-control">
                                <option value="sem-emenda">Sem emenda</option>
                                <option value="vertical">Vertical</option>
                                <option value="horizontal">Horizontal</option>
                            </Form.Select>
                        </div>
                        <div className="form-group mb-3">
                            <label className="form-label">Observação da Costura</label>
                            <Form.Control 
                                as="textarea" 
                                rows={2} 
                                name="observacao" 
                                value={formData.observacao} 
                                onChange={handleChange}
                                className="form-control form-textarea"
                                placeholder="Observações adicionais sobre a costura..."
                            />
                        </div>
                    </Col>
                    <Col md={6}>
                        <ImageDropZone onImageChange={handleImageChange} />
                    </Col>
                </Row>
                <Row className="align-items-center mb-3">
                    <Col md={8}>
                        <InputValorReal
                            name="valorPainel"
                            label="Valor do Painel"
                            value={formData.valorPainel}
                            onChange={handleChange}
                            required
                        />
                    </Col>
                    <Col md={4}>
                        <div className="form-group mb-2">
                            <label className="form-label">Valores adicionais (opcional)</label>
                            <Form.Control
                                type="text"
                                name="valorAdicionais"
                                value={formData.valorAdicionais}
                                onChange={handleChange}
                                placeholder="Ex.: 10,00"
                                className="form-control"
                            />
                        </div>
                    </Col>
                    <Col md={4} className="d-flex justify-content-end gap-2">
                        <Button variant="danger" type="button" onClick={resetForm} className="btn btn-error">
                            Limpar
                        </Button>
                        <Button variant="success" type="button" onClick={saveProducao} className="btn btn-success">
                            Salvar
                        </Button>
                    </Col>
                </Row>
        </Form>
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

export default FormPainel;
