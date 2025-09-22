import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import ImageDropZone from '../ImageDropZone';
import InputValorReal from '../InputValorMoeda';
import AreaCalculatorLinhaUnica from '../AreaCalculator';
import ValidationModal from '../ValidationModal';
import { useVendedoresDesigners } from '../../hooks/useVendedoresDesigners';
import useCustomAlert from '../../hooks/useCustomAlert';
import CustomAlertModal from '../CustomAlertModal';

function FormLona({ onAdicionarItem }) {
    const { vendedores, designers, loading, error } = useVendedoresDesigners();
    const customAlert = useCustomAlert();
    
    const [formData, setFormData] = useState({
        descricao: '',
        largura: '',
        altura: '',
        vendedor: '',
        designer: '',
        material: 'Lona 280g',
        acabamento: {
            solda: false,
            bastao: false,
            ilhos: false,
        },
        observacao: '',
        valorLona: '',
        valorAdicionais: '',
    });

    const [images, setImages] = useState([]);
    const [showValidationModal, setShowValidationModal] = useState(false);
    const [validationErrors, setValidationErrors] = useState([]);
    const [isSuccess, setIsSuccess] = useState(false);

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
            material: 'Lona 280g',
            acabamento: {
                solda: false,
                bastao: false,
                ilhos: false,
            },
            observacao: '',
            valorLona: '',
        });
        setImages([]);
        setValidationErrors([]);
        setShowValidationModal(false);
        setIsSuccess(false);
    };

    const validarCampos = () => {
        const erros = [];
        
        // Campos obrigatórios básicos
        if (!formData.descricao?.trim()) erros.push("Descrição da Lona");
        if (!formData.largura?.trim()) erros.push("Largura");
        if (!formData.altura?.trim()) erros.push("Altura");
        if (!formData.vendedor?.trim()) erros.push("Vendedor");
        if (!formData.designer?.trim()) erros.push("Designer");
        if (!formData.material?.trim()) erros.push("Material");
        if (!formData.valorLona?.trim()) erros.push("Valor da Lona");
        
        // Validação de valores numéricos
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

    const parseBR = (v) => {
        if (!v) return 0;
        if (typeof v === 'number') return v;
        const normalized = String(v).replace(/\./g, '').replace(',', '.');
        const num = parseFloat(normalized);
        return isNaN(num) ? 0 : num;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const erros = validarCampos();
        if (erros.length > 0) {
            setValidationErrors(erros);
            setShowValidationModal(true);
            return;
        }
        const total = (parseBR(formData.valorLona) + parseBR(formData.valorAdicionais)).toFixed(2).replace('.', ',');
        const dataProducao = {
            "tipoProducao": "lona",
            "imagem": images.length > 0 ? images[0] : null,
            "valor": total,
            ...formData
        };
        
        // Ativar estado de sucesso
        setIsSuccess(true);
        
        if (onAdicionarItem) {
            onAdicionarItem(dataProducao);
        }
        
        console.log('Lona cadastrada:', dataProducao);
        // Lona adicionada com sucesso
        
        // Resetar estado de sucesso após 3 segundos
        setTimeout(() => {
            setIsSuccess(false);
        }, 3000);
    };

    return (
        <>
        {error && customAlert.showWarning('Atenção', `${error}. Os campos de vendedor e designer podem não estar disponíveis.`)}
        <Container className={`mt-4 ${isSuccess ? 'form-success form-success-animation' : ''}`}>
            <Form onSubmit={handleSubmit}>
                <Row>
                    <Col md={8}>
                        <Form.Group controlId="descricao">
                            <Form.Control placeholder="Descrição da Lona" type="text" name="descricao" value={formData.descricao} onChange={handleChange} required />
                        </Form.Group>
                    </Col>
                    <Col md={4}>
                        <AreaCalculatorLinhaUnica 
                            formData={formData}
                            onChange={handleAreaChange}
                        />
                    </Col>
                </Row>

                <Row className="mt-3">
                    <Col>
                        <Form.Label>Material</Form.Label>
                        <Form.Select name="material" value={formData.material} onChange={handleChange}>
                            <option value="Lona 280g">Lona 280g</option>
                            <option value="Lona 440g">Lona 440g</option>
                            <option value="Lona Backlight">Lona Backlight</option>
                        </Form.Select>
                    </Col>
                    <Col>
                        <Form.Label>Vendedor</Form.Label>
                        {loading ? (
                            <div className="d-flex align-items-center">
                                <Spinner size="sm" className="me-2" />
                                <span>Carregando...</span>
                            </div>
                        ) : (
                            <Form.Select name="vendedor" value={formData.vendedor} onChange={handleChange}>
                                <option value="">Selecione um Vendedor</option>
                                {vendedores.map(vendedor => (
                                    <option key={vendedor.id} value={vendedor.name}>
                                        {vendedor.name}
                                    </option>
                                ))}
                            </Form.Select>
                        )}
                    </Col>
                    <Col>
                        <Form.Label>Designer</Form.Label>
                        {loading ? (
                            <div className="d-flex align-items-center">
                                <Spinner size="sm" className="me-2" />
                                <span>Carregando...</span>
                            </div>
                        ) : (
                            <Form.Select name="designer" value={formData.designer} onChange={handleChange}>
                                <option value="">Selecione um Designer</option>
                                {designers.map(designer => (
                                    <option key={designer.id} value={designer.name}>
                                        {designer.name}
                                    </option>
                                ))}
                            </Form.Select>
                        )}
                    </Col>
                </Row>

                <Row className="mt-3">
                    <Col>
                        <Card>
                            <Card.Header>Acabamentos</Card.Header>
                            <Card.Body>
                                <Form.Check label="Solda" name="solda" checked={formData.acabamento.solda} onChange={handleChange} />
                                <Form.Check label="Bastão" name="bastao" checked={formData.acabamento.bastao} onChange={handleChange} />
                                <Form.Check label="Ilhós" name="ilhos" checked={formData.acabamento.ilhos} onChange={handleChange} />
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col>
                        <ImageDropZone onImageChange={(image) => setImages([image])} />
                    </Col>
                </Row>

                <Row className="mt-3">
                    <Col>
                        <Form.Group controlId="observacao">
                            <Form.Label>Observações</Form.Label>
                            <Form.Control as="textarea" rows={2} name="observacao" value={formData.observacao} onChange={handleChange} />
                        </Form.Group>
                    </Col>
                </Row>

                <Row className="align-items-center mb-4">
                    <Col md={8}>
                        <InputValorReal
                            name="valorLona"
                            label="Valor da Lona"
                            value={formData.valorLona}
                            onChange={handleChange}
                            required
                        />
                    </Col>
                    <Col md={4}>
                        <Form.Group controlId="valorAdicionais">
                            <Form.Label>Valores adicionais (opcional)</Form.Label>
                            <Form.Control
                                type="text"
                                name="valorAdicionais"
                                value={formData.valorAdicionais}
                                onChange={handleChange}
                                placeholder="Ex.: 10,00"
                            />
                        </Form.Group>
                    </Col>
                    <Col md={4} className="d-flex justify-content-end gap-2">
                        <Button variant="danger" type="button" onClick={resetForm} size="md">Limpar</Button>
                        <Button variant="success" type="submit" size="md">Salvar</Button>

                    </Col>
                </Row>
            </Form>
        </Container>
        
        <ValidationModal
            show={showValidationModal}
            onHide={() => setShowValidationModal(false)}
            errors={validationErrors}
            title="Validação do Formulário - Lona"
        />
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
        </>
    );
}

export default FormLona;
