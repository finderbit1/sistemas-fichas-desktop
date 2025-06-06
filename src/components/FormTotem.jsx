import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Card } from 'react-bootstrap';
import ImageDropZone from './ImageDropZone';

function FormTotem(props) {
    const [formData, setFormData] = useState({
        descricao: '',
        altura: '',
        largura: '',
        vendedor: 'andre',
        designer: 'andre',
        material: 'PS 3mm',
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
                acabamento: { ...prev.acabamento, [name]: checked }
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
        alert("Totem adicionado");
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
            <h3>Cadastrar Totem</h3>
            <Form onSubmit={handleSubmit}>
                <Row>
                    <Col>
                        <Form.Group controlId="descricao">
                            <Form.Control placeholder="Descrição do Totem" type="text" name="descricao" value={formData.descricao} onChange={handleChange} required />
                        </Form.Group>
                    </Col>
                    <Col md={2}>
                        <Form.Group controlId="largura">
                            <Form.Control type="number" name="largura" placeholder="Largura (cm)" value={formData.largura} onChange={handleChange} required />
                        </Form.Group>
                    </Col>
                    <Col md={2}>
                        <Form.Group controlId="altura">
                            <Form.Control type="number" name="altura" placeholder="Altura (cm)" value={formData.altura} onChange={handleChange} required />
                        </Form.Group>
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
                                <option value="PS 3mm">PS 3mm</option>
                                <option value="PVC 2mm">PVC 2mm</option>
                                <option value="Cartonado">Cartonado</option>
                            </Form.Select>
                        </Form.Group>
                        <br />
                        <Card>
                            <Card.Header>Acabamento</Card.Header>
                            <Card.Body>
                                <Form.Check type="checkbox" label="Corte Reto" name="corteReto" checked={formData.acabamento.corteReto} onChange={handleChange} />
                                <Form.Check type="checkbox" label="Vinco para Dobra" name="vinco" checked={formData.acabamento.vinco} onChange={handleChange} />
                                <Form.Check type="checkbox" label="Base de Madeira" name="baseMadeira" checked={formData.acabamento.baseMadeira} onChange={handleChange} />
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
                <Row>
                    <Col>
                        <Form.Group controlId="valorTotem">
                            <Form.Label>Valor do Totem</Form.Label>
                            <Form.Control type="number" name="valorTotem" value={formData.valorTotem} onChange={handleChange} required />
                        </Form.Group>
                    </Col>
                </Row>
                <br />
                <Row>
                    <Col>
                        <Button variant="danger" type="reset" className="mt-3">Apagar</Button>
                        <Button variant="success" type="button" className="mt-3" onClick={saveOrder}>Salvar</Button>
                    </Col>
                </Row>
            </Form>
        </Container>
    );
}

export default FormTotem;
