/**
 * FormPainel Otimizado com Rust/WASM
 * Versão de alta performance do formulário de painel
 */

import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import { FileText, Person, CheckCircle } from 'react-bootstrap-icons';
import ImageDropZone from '../ImageDropZone';
import RustAreaCalculator from '../RustAreaCalculator';
import RustMoneyInput from '../RustMoneyInput';
import ValidationModal from '../ValidationModal';
import { useVendedoresDesigners } from '../../hooks/useVendedoresDesigners';
import { getAllTecidos } from '../../services/api';
import CustomCheckbox from '../CustomCheckbox';
import useCustomAlert from '../../hooks/useCustomAlert';
import CustomAlertModal from '../CustomAlertModal';
import { useRustPerformance } from '../../hooks/useRustPerformance';
import ValidationFeedback, { ValidationErrorList, ValidationWarningList } from '../ValidationFeedback';

function FormPainelRust({ onAdicionarItem }) {
    const { vendedores, designers, loading, error } = useVendedoresDesigners();
    const { initialized: rustInitialized, validateDimensions, validateMoneyValue, validateIlhosConfig } = useRustPerformance();
    const customAlert = useCustomAlert();
    
    const [imagem, setImagem] = useState(null);
    const [showValidationModal, setShowValidationModal] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [tecidos, setTecidos] = useState([]);
    const [tecidosLoading, setTecidosLoading] = useState(true);
    const [tecidosError, setTecidosError] = useState(null);
    const [formErrors, setFormErrors] = useState([]);
    const [formWarnings, setFormWarnings] = useState([]);

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

    // Carregar tecidos
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

    // Mostrar alertas de erro
    useEffect(() => {
        if (error) {
            customAlert.showWarning('Atenção', `${error}. Os campos de vendedor e designer podem não estar disponíveis.`);
        }
    }, [error, customAlert]);

    useEffect(() => {
        if (tecidosError) {
            customAlert.showWarning('Atenção', tecidosError);
        }
    }, [tecidosError, customAlert]);

    const handleImageChange = (imgBase64) => {
        setImagem(imgBase64);
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
        setFormErrors([]);
        setFormWarnings([]);
        setIsSuccess(false);
    };

    // Validação usando Rust quando disponível
    const validateFormWithRust = () => {
        if (!rustInitialized) {
            // Fallback para validação JavaScript
            return validateFormJavaScript();
        }

        const errors = [];
        const warnings = [];
        
        // Campos obrigatórios básicos
        if (!formData.descricao?.trim()) errors.push("Descrição do Painel");
        if (!formData.vendedor?.trim()) errors.push("Vendedor");
        if (!formData.designer?.trim()) errors.push("Designer");
        if (!formData.tecido?.trim()) errors.push("Tecido");
        
        // Validações com Rust
        if (formData.largura && formData.altura) {
            const width = parseFloat(formData.largura.replace(',', '.'));
            const height = parseFloat(formData.altura.replace(',', '.'));
            
            if (!isNaN(width) && !isNaN(height)) {
                const dimensionValidation = validateDimensions(width, height);
                if (!dimensionValidation.valid) {
                    errors.push(...dimensionValidation.errors);
                }
                warnings.push(...dimensionValidation.warnings);
            }
        }
        
        if (formData.valorPainel) {
            const valor = parseFloat(formData.valorPainel.replace(',', '.').replace('.', ''));
            if (!isNaN(valor)) {
                const moneyValidation = validateMoneyValue(valor / 100);
                if (!moneyValidation.valid) {
                    errors.push(...moneyValidation.errors);
                }
                warnings.push(...moneyValidation.warnings);
            }
        }
        
        // Validação específica para ilhós
        if (formData.acabamento.ilhos) {
            if (!formData.ilhosQtd?.trim()) errors.push("Quantidade de Ilhós");
            if (!formData.ilhosValorUnitario?.trim()) errors.push("Valor Unitário dos Ilhós");
            if (!formData.ilhosDistancia?.trim()) errors.push("Distância dos Ilhós");
            
            if (formData.ilhosQtd && formData.ilhosValorUnitario && formData.ilhosDistancia) {
                const qtd = parseInt(formData.ilhosQtd);
                const valor = parseFloat(formData.ilhosValorUnitario.replace(',', '.').replace('.', '')) / 100;
                const distancia = parseFloat(formData.ilhosDistancia.replace(',', '.'));
                
                if (!isNaN(qtd) && !isNaN(valor) && !isNaN(distancia)) {
                    const ilhosValidation = validateIlhosConfig(qtd, valor, distancia);
                    if (!ilhosValidation.valid) {
                        errors.push(...ilhosValidation.errors);
                    }
                    warnings.push(...ilhosValidation.warnings);
                }
            }
        }
        
        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    };

    // Validação JavaScript fallback
    const validateFormJavaScript = () => {
        const errors = [];
        const warnings = [];
        
        // Campos obrigatórios básicos
        if (!formData.descricao?.trim()) errors.push("Descrição do Painel");
        if (!formData.largura?.trim()) errors.push("Largura");
        if (!formData.altura?.trim()) errors.push("Altura");
        if (!formData.vendedor?.trim()) errors.push("Vendedor");
        if (!formData.designer?.trim()) errors.push("Designer");
        if (!formData.tecido?.trim()) errors.push("Tecido");
        if (!formData.valorPainel?.trim()) errors.push("Valor do Painel");
        
        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
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
        
        // Limpar erros anteriores
        setFormErrors([]);
        setFormWarnings([]);
        
        // Validar formulário (Rust ou JavaScript)
        const validationResult = validateFormWithRust();
        
        if (!validationResult.valid) {
            setFormErrors(validationResult.errors);
            setFormWarnings(validationResult.warnings);
            setShowValidationModal(true);
            return;
        }
        
        // Se passou na validação, criar item
        const valorTotal = (parseBR(formData.valorPainel) + parseBR(formData.valorAdicionais)).toFixed(2).replace('.', ',');
        const dataProducao = {
            "tipoProducao": "painel",
            "tipo": "painel",
            "imagem": imagem,
            "valor": valorTotal,
            ...formData
        };
        
        // Ativar estado de sucesso
        setIsSuccess(true);
        
        if (onAdicionarItem) {
            onAdicionarItem(dataProducao);
        }
        
        console.log('Dados do formulário validados (Rust):', dataProducao);
        
        // Resetar estado de sucesso após 3 segundos
        setTimeout(() => {
            setIsSuccess(false);
        }, 3000);
    };

    return (
        <>
            <Form className={isSuccess ? 'form-success form-success-animation' : ''}>
                {/* Feedback de Sucesso */}
                {isSuccess && (
                    <ValidationFeedback
                        success="Painel adicionado com sucesso! (Rust Engine)"
                        size="md"
                        className="mb-3"
                    />
                )}

                {/* Engine Status */}
                <div className="mb-3">
                    {rustInitialized ? (
                        <div className="d-flex align-items-center text-success">
                            <CheckCircle size={16} className="me-2" />
                            <small>Rust Performance Engine Ativo</small>
                        </div>
                    ) : (
                        <div className="d-flex align-items-center text-warning">
                            <Spinner size="sm" className="me-2" />
                            <small>Inicializando Rust Engine...</small>
                        </div>
                    )}
                </div>

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
                        <RustAreaCalculator 
                            formData={formData}
                            onChange={handleAreaChange}
                            showPerformance={true}
                            showValidation={true}
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
                                        <option key={designer.id} value={designer.name}>
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
                                        <h6 className="mb-2" style={{ color: 'var(--color-primary)', fontSize: 'var(--font-size-sm)' }}>Configurações dos Ilhós (Rust)</h6>
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
                                                    <RustMoneyInput
                                                        name="ilhosValorUnitario"
                                                        value={formData.ilhosValorUnitario}
                                                        onChange={handleChange}
                                                        placeholder="Ex: 0,50"
                                                        showPerformance={false}
                                                        showValidation={true}
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
                        <RustMoneyInput
                            name="valorPainel"
                            label="Valor do Painel (Rust)"
                            value={formData.valorPainel}
                            onChange={handleChange}
                            required
                            showPerformance={true}
                            showValidation={true}
                            placeholder="Ex: 150,00"
                        />
                    </Col>
                    <Col md={4}>
                        <RustMoneyInput
                            name="valorAdicionais"
                            label="Valores adicionais (opcional)"
                            value={formData.valorAdicionais}
                            onChange={handleChange}
                            placeholder="Ex: 10,00"
                            showPerformance={false}
                            showValidation={true}
                        />
                    </Col>
                    <Col md={4} className="d-flex justify-content-end gap-2">
                        <Button variant="danger" type="button" onClick={resetForm} className="btn btn-error">
                            Limpar
                        </Button>
                        <Button 
                            variant="success" 
                            type="button" 
                            onClick={saveProducao} 
                            className="btn btn-success"
                        >
                            {rustInitialized ? (
                                <>
                                    <CheckCircle size={16} className="me-2" />
                                    Salvar (Rust)
                                </>
                            ) : (
                                <>
                                    <Spinner size="sm" className="me-2" />
                                    Validando...
                                </>
                            )}
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
                errors={formErrors}
                title="Validação do Formulário - Painel (Rust Engine)"
            />
        </>
    );
}

export default FormPainelRust;
