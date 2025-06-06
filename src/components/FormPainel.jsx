import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Card } from 'react-bootstrap';
import ImageDropZone from './ImageDropZone';


function FormPainel(props) {
    const [formData, setFormData] = useState({
        descricao: '',
        largura: '',
        altura: '',
        vendedor: 'andre',
        designer: 'andre',
        tecido: 'Tactel',
        acabamento: {
            overloque: false,
            elastico: false,
            ilhos: false,
        },
        emenda: 'sem-emenda',
        observacao: '',
        valorPainel: '',
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
        e.preventDefault()
        alert("Adicionando o pedido")
        props.items.push("Pedido")
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        alert()
        console.log('Dados do formulário:', formData);
        console.log('Imagens:', images);
        alert("Salvando");
    };

    return (
        <Container className="mt-4">
            <Form onSubmit={handleSubmit}>
                <Row>
                    <Col>
                        <Form.Group controlId="descricao">
                            <Form.Control placeholder="Descrição do Painel" type="text" name="descricao" value={formData.descricao} onChange={handleChange} required />
                        </Form.Group>
                    </Col>
                    <Col md={2}>
                        <Form.Group controlId="largura">
                            <Form.Control type="number" name="largura" placeholder="Largura" value={formData.largura} onChange={handleChange} required />
                        </Form.Group>
                    </Col>
                    <Col md={2}>
                        <Form.Group controlId="altura">
                            <Form.Control type="number" name="altura" placeholder="Altura" value={formData.altura} onChange={handleChange} required />
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
                                <Form.Check type="checkbox" label="Overloque" name="overloque" checked={formData.acabamento.overloque} onChange={handleChange} />
                                <Form.Check type="checkbox" label="Elástico" name="elastico" checked={formData.acabamento.elastico} onChange={handleChange} />
                                <Form.Check type="checkbox" label="Ilhós" name="ilhos" checked={formData.acabamento.ilhos} onChange={handleChange} />
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
                        <ImageDropZone />
                    </Col>
                </Row>
                <br />
                <hr />
                <Row>
                    <Col>
                        <Form.Group controlId="valorpainel">
                            <Form.Label>Valor do Painel</Form.Label>
                            <Form.Control type="number" name="valorPainel" value={formData.valorPainel} onChange={handleChange} required />
                        </Form.Group>
                    </Col>
                </Row>
                <br />
                <Row>
                    <Col>
                        <Button variant="danger" type="reset" className="mt-3">Apagar</Button>
                        <Button variant="success" type="button" className="mt-3" onClick={saveOrder} >Salvar</Button>
                    </Col>
                </Row>
            </Form>
        </Container>
    );
}

export default FormPainel;
