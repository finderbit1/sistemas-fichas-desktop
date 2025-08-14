import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Card } from 'react-bootstrap';
import ImageDropZone from '../ImageDropZone';
import InputValorReal from '../InputValorMoeda';
import AreaCalculatorLinhaUnica from '../AreaCalculator';

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

    const saveOrder = (e) => {
        e.preventDefault();

        // Verificação de campos obrigatórios simples
        const camposObrigatorios = [
            { nome: "descricao", label: "Descrição" },
            { nome: "altura", label: "Altura" },
            { nome: "largura", label: "Largura" },
            { nome: "vendedor", label: "Vendedor" },
            { nome: "designer", label: "Designer" },
            { nome: "material", label: "Material" },
            { nome: "comPe", label: "Acabamento (Com Pé, Sem Pé, etc)" },
            { nome: "valorTotem", label: "Valor do Totem" }
        ];

        for (let campo of camposObrigatorios) {
            if (!formData[campo.nome] || formData[campo.nome].toString().trim() === "") {
                alert(`⚠️ Por favor, preencha o campo "${campo.label}".`);
                return;
            }
        }

        // Validação de altura e largura
        const altura = parseFloat(formData.altura);
        const largura = parseFloat(formData.largura);
        if (isNaN(altura) || altura <= 0 || isNaN(largura) || largura <= 0) {
            alert("⚠️ Altura e largura devem ser maiores que zero.");
            return;
        }

        // Validação de valor do totem
        const valorNumerico = parseFloat(formData.valorTotem.replace(',', '.'));
        if (isNaN(valorNumerico) || valorNumerico <= 0) {
            alert("⚠️ O valor do totem deve ser maior que zero.");
            return;
        }

        // Se passou tudo:
        const pedido = {
            ...formData,
            imagens: images
        };

        console.log("✅ Pedido validado:", pedido);
        alert("✅ Totem adicionado com sucesso!");
        props.items.push("Totem");
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Dados do formulário:', formData);
        console.log('Imagens:', images);
        alert("Totem salvo com sucesso");
    };

    return (
        <Container className="mt-4">
            <Form onSubmit={handleSubmit}>
                <Row>
                    <Col>
                        <Form.Group controlId="descricao">
                            <Form.Control placeholder="Descrição do Totem" type="text" name="descricao" value={formData.descricao} onChange={handleChange} required />
                        </Form.Group>
                    </Col>
                    <Col md={4}>
                        <AreaCalculatorLinhaUnica>
                        </AreaCalculatorLinhaUnica>
                    </Col>
                </Row>
                <hr />
                <Row>
                    <Col>
                        <Form.Group controlId="vendedor">
                            <Form.Label>Vendedor</Form.Label>
                            <Form.Select name="vendedor" value={formData.vendedor} onChange={handleChange} required>
                                <option value="andre">Andre</option>
                                <option value="carol">Carol</option>
                                <option value="maicon">Maicon</option>
                                <option value="robson">Robson</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="designer">
                            <Form.Label>Designer</Form.Label>
                            <Form.Select name="designer" value={formData.designer} onChange={handleChange} required>
                                <option value="andre">Andre</option>
                                <option value="carol">Carol</option>
                                <option value="fabio">Fabio</option>
                                <option value="maicon">Maicon</option>
                                <option value="robson">Robson</option>
                                <option value="willis">Willis</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                </Row>
                <br />
                <Row>
                    <Col>
                        <Form.Group controlId="material">
                            <Form.Label>Material</Form.Label>
                            <Form.Select name="material" value={formData.material} onChange={handleChange} required>
                                <option value="MDF 6MM">MDF 6MM</option>
                                <option value="MDF 3MM">MDF 3MM</option>
                                <option value="poliondas">POLIONDAS</option>
                            </Form.Select>
                        </Form.Group>
                        <br />
                        <Card>
                            <Card.Header>Acabamento</Card.Header>
                            <Card.Body>
                                <Form.Check
                                    type='radio'
                                    label="Com Pé"
                                    name='comPe'
                                    value="com"
                                    checked={formData.comPe === 'com'}
                                    onChange={handleChange}
                                />
                                <Form.Check
                                    type='radio'
                                    label="Sem Pé"
                                    name='comPe'
                                    value="sem"
                                    checked={formData.comPe === 'sem'}
                                    onChange={handleChange}
                                />
                                <Form.Check
                                    type='radio'
                                    label="Com Base"
                                    name='comPe'
                                    value="base"
                                    checked={formData.comPe === 'base'}
                                    onChange={handleChange}
                                />
                                <Form.Check
                                    type='radio'
                                    label="Sem Acabamento"
                                    name='comPe'
                                    value="semAcabamento"
                                    checked={formData.comPe === 'semAcabamento'}
                                    onChange={handleChange}
                                />
                            </Card.Body>
                        </Card>

                        <br />
                        <Form.Group controlId="observacao">
                            <Form.Label>Observações</Form.Label>
                            <Form.Control as="textarea" rows={2} name="observacao" value={formData.observacao} onChange={handleChange} />
                        </Form.Group>
                    </Col>
                    <Col>
                        <ImageDropZone />
                    </Col>
                </Row>
                <hr />
                <Row className="align-items-center mb-4">
                    <Col md={8}>
                        <InputValorReal
                            name="valorTotem"
                            label="Valor do Totem"
                            value={formData.valorTotem}
                            onChange={handleChange}
                            required
                        />
                    </Col>
                    <Col md={4} className="d-flex justify-content-end gap-2 mt-4">
                        <Button variant="danger" type="button" onClick={function () { }} size="md">Limpar</Button>
                        <Button variant="success" type="button" size="md" onClick={saveOrder}>Salvar</Button>

                    </Col>
                </Row>

            </Form>
        </Container>
    );
}

export default FormTotem;
