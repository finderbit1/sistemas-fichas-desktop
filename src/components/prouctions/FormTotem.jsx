import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Card } from 'react-bootstrap';
import ImageDropZone from '../ImageDropZone';
import InputValorReal from '../InputValorMoeda';
import AreaCalculatorLinhaUnica from '../AreaCalculator';
import ValidationModal from '../ValidationModal';

function FormTotem(props) {
    const [formData, setFormData] = useState({
        descricao: '',
        altura: '',
        largura: '',
        vendedor: 'andre',
        designer: 'andre',
        material: 'MDF 6MM',
        acabamento: {
            corteReto: false,
            vinco: false,
            baseMadeira: false,
        },
        observacao: '',
        valorTotem: '',
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
        const pedido = {
            ...formData,
            imagens: images,
            valor: formData.valorTotem
        };

        // Ativar estado de sucesso
        setIsSuccess(true);

        console.log("✅ Pedido validado:", pedido);
        alert("✅ Totem adicionado com sucesso!");
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
        alert("Totem salvo com sucesso");
    };

    return (
        <>
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
                            <Form.Select name="vendedor" value={formData.vendedor} onChange={handleChange} required className="form-control">
                                <option value="">Selecione um Vendedor</option>
                                <option value="andre">Andre</option>
                                <option value="carol">Carol</option>
                                <option value="maicon">Maicon</option>
                                <option value="robson">Robson</option>
                            </Form.Select>
                        </div>
                    </Col>
                    <Col md={6}>
                        <div className="form-group mb-3">
                            <label className="form-label">Designer</label>
                            <Form.Select name="designer" value={formData.designer} onChange={handleChange} required className="form-control">
                                <option value="">Selecione um Designer</option>
                                <option value="andre">Andre</option>
                                <option value="carol">Carol</option>
                                <option value="fabio">Fabio</option>
                                <option value="maicon">Maicon</option>
                                <option value="robson">Robson</option>
                                <option value="willis">Willis</option>
                            </Form.Select>
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
                                    <Form.Check
                                        type='radio'
                                        label="Com Pé"
                                        name='comPe'
                                        value="com"
                                        checked={formData.comPe === 'com'}
                                        onChange={handleChange}
                                        className="form-check-input"
                                    />
                                </div>
                                <div className="form-check mb-2">
                                    <Form.Check
                                        type='radio'
                                        label="Sem Pé"
                                        name='comPe'
                                        value="sem"
                                        checked={formData.comPe === 'sem'}
                                        onChange={handleChange}
                                        className="form-check-input"
                                    />
                                </div>
                                <div className="form-check mb-2">
                                    <Form.Check
                                        type='radio'
                                        label="Com Base"
                                        name='comPe'
                                        value="base"
                                        checked={formData.comPe === 'base'}
                                        onChange={handleChange}
                                        className="form-check-input"
                                    />
                                </div>
                                <div className="form-check mb-2">
                                    <Form.Check
                                        type='radio'
                                        label="Sem Acabamento"
                                        name='comPe'
                                        value="semAcabamento"
                                        checked={formData.comPe === 'semAcabamento'}
                                        onChange={handleChange}
                                        className="form-check-input"
                                    />
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
                        <ImageDropZone />
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
                    <Col md={4} className="d-flex justify-content-end gap-2">
                        <Button variant="danger" type="button" onClick={function () { }} className="btn btn-error">Limpar</Button>
                        <Button variant="success" type="button" onClick={saveOrder} className="btn btn-success">Salvar</Button>
                    </Col>
                </Row>

        </Form>
        
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
