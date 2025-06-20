import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Card } from 'react-bootstrap';
import ImageDropZone from './ImageDropZone';

function FormLona(props) {
    const [formData, setFormData] = useState({
        descricao: '',
        largura: '',
        altura: '',
        vendedor: 'andre',
        designer: 'andre',
        material: 'Lona 280g',
        acabamento: {
            solda: false,
            bastao: false,
            ilhos: false,
        },
        observacao: '',
        valorLona: '',
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

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Lona cadastrada:', formData);
        console.log('Imagens:', images);
        alert("Lona salva!");
    };

    return (
        <Container className="mt-4">
            <h3>Cadastrar Lona</h3>
            <Form onSubmit={handleSubmit}>
                <Row>
                    <Col>
                        <Form.Group controlId="descricao">
                            <Form.Control placeholder="Descrição da Lona" type="text" name="descricao" value={formData.descricao} onChange={handleChange} required />
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
                        <Form.Select name="vendedor" value={formData.vendedor} onChange={handleChange}>
                            <option value="andre">Andre</option>
                            <option value="carol">Carol</option>
                        </Form.Select>
                    </Col>
                    <Col>
                        <Form.Label>Designer</Form.Label>
                        <Form.Select name="designer" value={formData.designer} onChange={handleChange}>
                            <option value="andre">Andre</option>
                            <option value="carol">Carol</option>
                            <option value="fabio">Fabio</option>
                        </Form.Select>
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
                        <ImageDropZone />
                    </Col>
                </Row>

                <Row className="mt-3">
                    <Col>
                        <Form.Group controlId="observacao">
                            <Form.Label>Observações</Form.Label>
                            <Form.Control as="textarea" rows={2} name="observacao" value={formData.observacao} onChange={handleChange} />
                        </Form.Group>
                        <Form.Group controlId="valorLona" className="mt-2">
                            <Form.Label>Valor</Form.Label>
                            <Form.Control type="number" name="valorLona" value={formData.valorLona} onChange={handleChange} required />
                        </Form.Group>
                    </Col>
                </Row>

                <Row className="mt-3">
                    <Col>
                        <Button type="submit" variant="success">Salvar</Button>
                        <Button type="reset" variant="danger" className="ms-2">Limpar</Button>
                    </Col>
                </Row>
            </Form>
        </Container>
    );
}

export default FormLona;
