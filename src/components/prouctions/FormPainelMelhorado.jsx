/**
 * FormPainel Melhorado com Validações Robustas
 * Versão aprimorada do formulário de painel com validação em tempo real
 */

import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import { FileText, Person, CheckCircle } from 'react-bootstrap-icons';
import ImageDropZone from '../ImageDropZone';
import AreaCalculatorLinhaUnica from '../AreaCalculator';
import InputValorReal from '../InputValorMoeda';
import ValidationModal from '../ValidationModal';
import ValidationFeedback, { ValidationErrorList, ValidationWarningList } from '../ValidationFeedback';
import ValidatedInput from '../ValidatedInput';
import { useVendedoresDesigners } from '../../hooks/useVendedoresDesigners';
import { getAllTecidos } from '../../services/api';
import CustomCheckbox from '../CustomCheckbox';
import useCustomAlert from '../../hooks/useCustomAlert';
import CustomAlertModal from '../CustomAlertModal';
import useValidation from '../../hooks/useValidation';
import { validatePainel } from '../../utils/validators/producaoValidator';

function FormPainelMelhorado({ onAdicionarItem }) {
    const { vendedores, designers, loading, error } = useVendedoresDesigners();
    const validation = useValidation('painel');
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
        validation.clearAllErrors();
        setFormErrors([]);
        setFormWarnings([]);
        setIsSuccess(false);
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
        validation.clearAllErrors();
        setFormErrors([]);
        setFormWarnings([]);
        
        // Validar formulário completo
        const validationResult = validatePainel(formData);
        
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
        
        console.log('Dados do formulário validados:', dataProducao);
        
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
                        success="Painel adicionado com sucesso!"
                        size="md"
                        className="mb-3"
                    />
                )}

                <Row className="mb-3">
                    <Col md={8}>
                        <ValidatedInput
                            name="descricao"
                            label={
                                <>
                                    <FileText size={16} style={{ marginRight: '8px' }} />
                                    Descrição do Painel
                                </>
                            }
                            value={formData.descricao}
                            onChange={handleChange}
                            placeholder="Digite a descrição do painel"
                            required
                            validationHook={validation}
                            tipoProducao="painel"
                            showSuccessFeedback={true}
                        />
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
                        <ValidatedInput
                            type="select"
                            name="vendedor"
                            label={
                                <>
                                    <Person size={16} style={{ marginRight: '8px' }} />
                                    Vendedor
                                </>
                            }
                            value={formData.vendedor}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            validationHook={validation}
                            tipoProducao="painel"
                            options={[
                                { value: '', label: 'Selecione um Vendedor' },
                                ...vendedores.map(v => ({ value: v.name, label: v.name }))
                            ]}
                        >
                            {loading && (
                                <div className="d-flex align-items-center">
                                    <Spinner size="sm" className="me-2" />
                                    <span>Carregando vendedores...</span>
                                </div>
                            )}
                        </ValidatedInput>
                    </Col>
                    <Col md={6}>
                        <ValidatedInput
                            type="select"
                            name="designer"
                            label={
                                <>
                                    <FileText size={16} style={{ marginRight: '8px' }} />
                                    Designer
                                </>
                            }
                            value={formData.designer}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            validationHook={validation}
                            tipoProducao="painel"
                            options={[
                                { value: '', label: 'Selecione um Designer' },
                                ...designers.map(d => ({ value: d.name, label: d.name }))
                            ]}
                        >
                            {loading && (
                                <div className="d-flex align-items-center">
                                    <Spinner size="sm" className="me-2" />
                                    <span>Carregando designers...</span>
                                </div>
                            )}
                        </ValidatedInput>
                    </Col>
                </Row>

                <Row className="mb-3">
                    <Col md={6}>
                        <ValidatedInput
                            type="select"
                            name="tecido"
                            label={
                                <>
                                    <FileText size={16} style={{ marginRight: '8px' }} />
                                    Tecido
                                </>
                            }
                            value={formData.tecido}
                            onChange={handleChange}
                            required
                            disabled={tecidosLoading}
                            validationHook={validation}
                            tipoProducao="painel"
                            options={[
                                { value: '', label: 'Selecione o Tecido' },
                                ...tecidos.map(t => ({ value: t.name, label: t.name }))
                            ]}
                        >
                            {tecidosLoading && (
                                <div className="d-flex align-items-center">
                                    <Spinner size="sm" className="me-2" />
                                    <span>Carregando tecidos...</span>
                                </div>
                            )}
                            {tecidosError && (
                                <div className="form-text text-warning">{tecidosError}</div>
                            )}
                        </ValidatedInput>
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
                                                <ValidatedInput
                                                    type="number"
                                                    name="ilhosQtd"
                                                    label="Quantidade"
                                                    value={formData.ilhosQtd}
                                                    onChange={handleChange}
                                                    required={formData.acabamento.ilhos}
                                                    min="1"
                                                    max="100"
                                                    validationHook={validation}
                                                    tipoProducao="painel"
                                                    placeholder="Ex: 4"
                                                />
                                            </Col>
                                            <Col md={4}>
                                                <ValidatedInput
                                                    name="ilhosValorUnitario"
                                                    label="Valor Unitário"
                                                    value={formData.ilhosValorUnitario}
                                                    onChange={handleChange}
                                                    required={formData.acabamento.ilhos}
                                                    validationHook={validation}
                                                    tipoProducao="painel"
                                                    placeholder="Ex: 0,50"
                                                />
                                            </Col>
                                            <Col md={4}>
                                                <ValidatedInput
                                                    name="ilhosDistancia"
                                                    label="Distância (cm)"
                                                    value={formData.ilhosDistancia}
                                                    onChange={handleChange}
                                                    required={formData.acabamento.ilhos}
                                                    validationHook={validation}
                                                    tipoProducao="painel"
                                                    placeholder="Ex: 20"
                                                />
                                            </Col>
                                        </Row>
                                    </div>
                                )}
                            </div>
                        </Card>

                        <ValidatedInput
                            type="select"
                            name="emenda"
                            label="Tipo de Emenda"
                            value={formData.emenda}
                            onChange={handleChange}
                            required
                            validationHook={validation}
                            tipoProducao="painel"
                            options={[
                                { value: 'sem-emenda', label: 'Sem emenda' },
                                { value: 'vertical', label: 'Vertical' },
                                { value: 'horizontal', label: 'Horizontal' }
                            ]}
                        />

                        <ValidatedInput
                            type="textarea"
                            name="observacao"
                            label="Observação da Costura"
                            value={formData.observacao}
                            onChange={handleChange}
                            rows={2}
                            placeholder="Observações adicionais sobre a costura..."
                            validationHook={validation}
                            tipoProducao="painel"
                        />
                    </Col>
                    <Col md={6}>
                        <ImageDropZone onImageChange={handleImageChange} />
                    </Col>
                </Row>

                <Row className="align-items-center mb-3">
                    <Col md={8}>
                        <ValidatedInput
                            name="valorPainel"
                            label="Valor do Painel"
                            value={formData.valorPainel}
                            onChange={handleChange}
                            required
                            validationHook={validation}
                            tipoProducao="painel"
                            placeholder="Ex: 150,00"
                            showSuccessFeedback={true}
                        />
                    </Col>
                    <Col md={4}>
                        <ValidatedInput
                            name="valorAdicionais"
                            label="Valores adicionais (opcional)"
                            value={formData.valorAdicionais}
                            onChange={handleChange}
                            validationHook={validation}
                            tipoProducao="painel"
                            placeholder="Ex: 10,00"
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
                            disabled={validation?.isValidating}
                        >
                            {validation?.isValidating ? (
                                <>
                                    <Spinner size="sm" className="me-2" />
                                    Validando...
                                </>
                            ) : (
                                <>
                                    <CheckCircle size={16} className="me-2" />
                                    Salvar
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
                title="Validação do Formulário - Painel"
            />
        </>
    );
}

export default FormPainelMelhorado;
