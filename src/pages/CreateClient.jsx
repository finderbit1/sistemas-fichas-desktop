import React, { useState } from 'react';
import { Form, Button, Card, Row, Col } from 'react-bootstrap';

const CreateClient = () => {
    const [formData, setFormData] = useState({
        nome: '',
        cidade: '',
        estado: '',
        telefone: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/clientes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                alert('Cliente criado com sucesso!');
                setFormData({
                    nome: '',
                    cidade: '',
                    estado: '',
                    telefone: ''
                });
            } else {
                alert('Erro ao criar cliente.');
            }
        } catch (err) {
            console.error('Erro:', err);
            alert('Erro na conexão com o servidor.');
        }
    };

    return (
        <Card className="p-4">
            <h4>Novo Cliente</h4>
            <Form onSubmit={handleSubmit}>
                <Row className="mb-3">
                    <Col md={6}>
                        <Form.Group controlId="nome">
                            <Form.Label>Nome</Form.Label>
                            <Form.Control
                                type="text"
                                name="nome"
                                value={formData.nome}
                                onChange={handleChange}
                                placeholder="Nome do cliente"
                                required
                            />
                        </Form.Group>
                    </Col>

                    <Col md={4}>
                        <Form.Group controlId="cidade">
                            <Form.Label>Cidade</Form.Label>
                            <Form.Control
                                type="text"
                                name="cidade"
                                value={formData.cidade}
                                onChange={handleChange}
                                placeholder="Cidade"
                                required
                            />
                        </Form.Group>
                    </Col>

                    <Col md={2}>
                        <Form.Group controlId="estado">
                            <Form.Label>UF</Form.Label>
                            <Form.Control
                                type="text"
                                name="estado"
                                value={formData.estado}
                                onChange={handleChange}
                                placeholder="SP, RJ..."
                                maxLength={2}
                                required
                            />
                        </Form.Group>
                    </Col>
                </Row>

                <Row className="mb-3">
                    <Col md={6}>
                        <Form.Group controlId="telefone">
                            <Form.Label>Telefone</Form.Label>
                            <Form.Control
                                type="tel"
                                name="telefone"
                                value={formData.telefone}
                                onChange={handleChange}
                                placeholder="(00) 00000-0000"
                                required
                            />
                        </Form.Group>
                    </Col>
                </Row>

                <Button variant="success" type="submit">
                    Criar Cliente
                </Button>
            </Form>
        </Card>
    );
};

export default CreateClient;
