import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Card, InputGroup, } from 'react-bootstrap';
import ImageDropZone from './ImageDropZone';
import AreaCalculatorLinhaUnica from './AreaCalculator';
import InputValorReal from './InputValorMoeda';


function FormPainel({ onAdicionarItem }) {
    const [imagem, setImagem] = useState(null);

    const handleImageChange = (imgBase64) => {
        setImagem(imgBase64);
    };

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

    const saveProducao = (e) => {
        e.preventDefault();
        const dataProducao = {
            "tipoProducao": "painel",
            "imagem": imagem,
            ...formData
        }
        onAdicionarItem(dataProducao)
        console.log('Dados do formulário:', dataProducao);
    };

    return (
        <Container className="mt-4">
            <Form>
                <Row>
                    <Col>
                        <Form.Group controlId="descricao">
                            <Form.Control placeholder="Descrição do Painel" type="text" name="descricao" value={formData.descricao} onChange={handleChange} required />
                        </Form.Group>
                    </Col>
                    <Col md={4}>
                        <AreaCalculatorLinhaUnica ></AreaCalculatorLinhaUnica>
                    </Col>
                </Row>
                <hr />
                <Row>
                    <Col>
                        <Form.Group controlId="vendedor">
                            <Form.Label>Vendedor</Form.Label>
                            <Form.Select name="vendedor" value={formData.vendedor} onChange={handleChange} required>
                                <option value="default">Selecione um Vendedor</option>
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
                                <option value="default">Selecione um Vendedor</option>
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
                <hr />
                <Row>
                    <Col>
                        <Form.Group controlId="tecido">
                            <Form.Label>Tecido</Form.Label>
                            <Form.Select name="tecido" value={formData.tecido} onChange={handleChange} required>
                                <option value="Tactel">Tactel</option>
                                <option value="Malha Vest Facil">Malha Vest Facil</option>
                            </Form.Select>
                        </Form.Group>
                        <br />
                        <Card>
                            <Card.Header>Acabamento</Card.Header>
                            <Card.Body>
                                <Form.Check
                                    type="checkbox"
                                    label="Overloque"
                                    name="overloque"
                                    checked={formData.acabamento.overloque}
                                    onChange={handleChange}
                                />
                                <Form.Check
                                    type="checkbox"
                                    label="Elástico"
                                    name="elastico"
                                    checked={formData.acabamento.elastico}
                                    onChange={handleChange}
                                />
                                <Form.Check
                                    type="checkbox"
                                    label="Ilhós"
                                    name="ilhos"
                                    checked={formData.acabamento.ilhos}
                                    onChange={handleChange}
                                />

                                {formData.acabamento.ilhos && (
                                    <div className="mt-3">
                                        <Form.Group controlId="ilhosQtd">
                                            <Form.Label>Quantidade de Ilhós</Form.Label>
                                            <Form.Control
                                                type="number"
                                                name="ilhosQtd"
                                                min="1"
                                                value={formData.ilhosQtd}
                                                onChange={handleChange}
                                                required
                                            />
                                        </Form.Group>

                                        <Form.Group controlId="ilhosValorUnitario">
                                            <Form.Label>Valor Unitário do Ilhós</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="ilhosValorUnitario"
                                                placeholder="Ex: 0,50"
                                                value={formData.ilhosValorUnitario}
                                                onChange={handleChange}
                                                required
                                            />
                                        </Form.Group>

                                        <Form.Group controlId="ilhosDistancia">
                                            <Form.Label>Distância entre Ilhós (cm)</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="ilhosDistancia"
                                                placeholder="Ex: 20"
                                                value={formData.ilhosDistancia}
                                                onChange={handleChange}
                                                required
                                            />
                                        </Form.Group>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>

                        <Form.Group controlId="tipoEmenda">
                            <Form.Label>Selecione o tipo de emenda</Form.Label>
                            <Form.Select name="emenda" value={formData.emenda} onChange={handleChange} required>
                                <option value="sem-emenda">Sem emenda</option>
                                <option value="vertical">Vertical</option>
                                <option value="horizontal">Horizontal</option>
                            </Form.Select>
                        </Form.Group>
                        <br />
                        <Form.Group controlId="observacao">
                            <Form.Label>Observação da Costura</Form.Label>
                            <Form.Control as="textarea" rows={1} name="observacao" value={formData.observacao} onChange={handleChange} />
                        </Form.Group>
                    </Col>
                    <Col>
                        <ImageDropZone onImageChange={handleImageChange} />

                    </Col>
                </Row>
                <br />
                <hr />
                <Row className="align-items-center mb-4">
                    <Col md={8}>
                        <InputValorReal
                            name="valorpainel"
                            label="Valor do Painel"
                            value={formData.valorTotem}
                            onChange={handleChange}
                            required
                        />
                    </Col>
                    <Col md={4} className="d-flex justify-content-end gap-2 mt-4">
                        <Button variant="danger" type="button" onClick={resetForm} size="md">Limpar</Button>
                        <Button variant="success" type="button" onClick={saveProducao} size="md">Salvar</Button>

                    </Col>
                </Row>
            </Form>
        </Container>
    );
}

export default FormPainel;
