import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import ImageDropZone from '../ImageDropZone';
import InputValorReal from '../InputValorMoeda';
import AreaCalculatorLinhaUnica from '../AreaCalculator';
import ValidationModal from '../ValidationModal';
import { useVendedoresDesigners } from '../../hooks/useVendedoresDesigners';
import CustomRadio from '../CustomRadio';
import useCustomAlert from '../../hooks/useCustomAlert';
import CustomAlertModal from '../CustomAlertModal';

function FormTotem(props) {
    const { vendedores, designers, loading, error } = useVendedoresDesigners();
    
    const [formData, setFormData] = useState({
        descricao: '',
        altura: '',
        largura: '',
        vendedor: '',
        designer: '',
        material: 'MDF 6MM',
        acabamento: {
            corteReto: false,
            vinco: false,
            baseMadeira: false,
        },
        observacao: '',
        valorTotem: '',
        valorAdicionais: '',
    });

    const [images, setImages] = useState([]);
    const [showValidationModal, setShowValidationModal] = useState(false);
    const [validationErrors, setValidationErrors] = useState([]);
    const [isSuccess, setIsSuccess] = useState(false);
    const customAlert = useCustomAlert();

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (type === 'checkbox') {
            setFormData(prev => ({
                ...prev,
                acabamento: {
                    ...prev.acabamento,
                    [name]: checked
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const resetForm = () => {
        setFormData({
            descricao: '',
            altura: '',
            largura: '',
            vendedor: '',
            designer: '',
            material: 'MDF 6MM',
            acabamento: {
                corteReto: false,
                vinco: false,
                baseMadeira: false,
            },
            observacao: '',
            valorTotem: '',
            comPe: undefined,
        });
        setImages([]);
        setValidationErrors([]);
        setShowValidationModal(false);
        setIsSuccess(false);
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
        console.log('FormData na validação Totem:', formData);
        console.log('Largura:', formData.largura, 'Altura:', formData.altura);
        
        // Campos obrigatórios básicos
        if (!formData.descricao?.trim()) erros.push("Descrição do Totem");
        if (!formData.altura?.trim()) erros.push("Altura");
        if (!formData.largura?.trim()) erros.push("Largura");
        if (!formData.vendedor?.trim()) erros.push("Vendedor");
        if (!formData.designer?.trim()) erros.push("Designer");
        if (!formData.material?.trim()) erros.push("Material");
        if (!formData.comPe?.trim()) erros.push("Acabamento (Com Pé, Sem Pé, etc)");
        if (!formData.valorTotem?.trim()) erros.push("Valor do Totem");
        
        // Validação de valores numéricos
        if (formData.altura && (isNaN(parseFloat(formData.altura)) || parseFloat(formData.altura) <= 0)) {
            erros.push("Altura deve ser um número maior que zero");
        }
        if (formData.largura && (isNaN(parseFloat(formData.largura)) || parseFloat(formData.largura) <= 0)) {
            erros.push("Largura deve ser um número maior que zero");
        }
        if (formData.valorTotem && (isNaN(parseFloat(formData.valorTotem.replace(',', '.'))) || parseFloat(formData.valorTotem.replace(',', '.')) <= 0)) {
            erros.push("Valor do Totem deve ser um número maior que zero");
        }
        
        return erros;
    };

    const saveOrder = (e) => {
        e.preventDefault();

        const erros = validarCampos();
        if (erros.length > 0) {
            setValidationErrors(erros);
            setShowValidationModal(true);
            return;
        }

        // Se passou tudo:
        const parseBR = (v) => {
            if (!v) return 0;
            if (typeof v === 'number') return v;
            const normalized = String(v).replace(/\./g, '').replace(',', '.');
            const num = parseFloat(normalized);
            return isNaN(num) ? 0 : num;
        };

        const total = (parseBR(formData.valorTotem) + parseBR(formData.valorAdicionais)).toFixed(2).replace('.', ',');
        const pedido = {
            ...formData,
            tipoProducao: 'totem',
            tipo: 'totem',
            imagem: images.length > 0 ? images[0] : null,
            valor: total
        };

        // Ativar estado de sucesso
        setIsSuccess(true);

        console.log("✅ Pedido validado:", pedido);
        // Totem adicionado com sucesso
        props.onAdicionarItem(pedido);
        
        // Resetar estado de sucesso após 3 segundos
        setTimeout(() => {
            setIsSuccess(false);
        }, 3000);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Dados do formulário:', formData);
        console.log('Imagens:', images);
        // Totem salvo com sucesso
    };

    return (
        <>
        {error && customAlert.showWarning('Atenção', `${error}. Os campos de vendedor e designer podem não estar disponíveis.`)}
        <Form onSubmit={handleSubmit} className={isSuccess ? 'form-success form-success-animation' : ''}>
                <Row className="mb-3">
                    <Col md={8}>
                        <div className="form-group mb-3">
                            <label className="form-label">Descrição do Totem</label>
                            <Form.Control placeholder="Digite a descrição do totem" type="text" name="descricao" value={formData.descricao} onChange={handleChange} required className="form-control" />
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
                            <label className="form-label">Vendedor</label>
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
                            <label className="form-label">Designer</label>
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
                            <label className="form-label">Material</label>
                            <Form.Select name="material" value={formData.material} onChange={handleChange} required className="form-control">
                                <option value="">Selecione o Material</option>
                                <option value="MDF 6MM">MDF 6MM</option>
                                <option value="MDF 3MM">MDF 3MM</option>
                                <option value="poliondas">POLIONDAS</option>
                            </Form.Select>
                        </div>
                        <Card className="dashboard-card">
                            <div className="dashboard-card-header">
                                <h6 className="dashboard-card-title">Acabamento</h6>
                            </div>
                            <div className="p-3">
                                <div className="form-check mb-2">
                                    <CustomRadio id="totem-pe-com" label="Com Pé" name='comPe' value="com" checked={formData.comPe === 'com'} onChange={handleChange} />
                                </div>
                                <div className="form-check mb-2">
                                    <CustomRadio id="totem-pe-sem" label="Sem Pé" name='comPe' value="sem" checked={formData.comPe === 'sem'} onChange={handleChange} />
                                </div>
                                <div className="form-check mb-2">
                                    <CustomRadio id="totem-base" label="Com Base" name='comPe' value="base" checked={formData.comPe === 'base'} onChange={handleChange} />
                                </div>
                                <div className="form-check mb-2">
                                    <CustomRadio id="totem-sem-acab" label="Sem Acabamento" name='comPe' value="semAcabamento" checked={formData.comPe === 'semAcabamento'} onChange={handleChange} />
                                </div>
                            </div>
                        </Card>

                        <div className="form-group mb-3">
                            <label className="form-label">Observações</label>
                            <Form.Control 
                                as="textarea" 
                                rows={2} 
                                name="observacao" 
                                value={formData.observacao} 
                                onChange={handleChange}
                                className="form-control form-textarea"
                                placeholder="Observações adicionais sobre o totem..."
                            />
                        </div>
                    </Col>
                    <Col md={6}>
                        <ImageDropZone onImageChange={(image) => setImages([image])} />
                    </Col>
                </Row>
                <Row className="align-items-center mb-3">
                    <Col md={8}>
                        <InputValorReal
                            name="valorTotem"
                            label="Valor do Totem"
                            value={formData.valorTotem}
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
                        <Button variant="danger" type="button" onClick={resetForm} className="btn btn-error">Limpar</Button>
                        <Button variant="success" type="button" onClick={saveOrder} className="btn btn-success">Salvar</Button>
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
            title="Validação do Formulário - Totem"
        />
        </>
    );
}

export default FormTotem;
