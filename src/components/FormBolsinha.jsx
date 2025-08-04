import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Card } from 'react-bootstrap';
import ImageDropZone from './ImageDropZone';
import InputValorReal from './InputValorMoeda';

function FormBolsinha({ adicionarItem }) {
    const [formData, setFormData] = useState({
        descricao: '',
        tipo: 'necessaire',
        tamanho: '',
        cor: '',
        tecido: 'Oxford',
        fecho: 'zíper',
        alcaAjustavel: false,
        observacao: '',
        valorBolsinha: '',
    });

    const [images, setImages] = useState([]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const saveOrder = (e) => {
        e.preventDefault();

        if (!formData.descricao || !formData.valorBolsinha) {
            alert('Preencha todos os campos obrigatórios.');
            return;
        }

        const item = {
            ...formData,
            valor: parseFloat(formData.valorBolsinha.replace(',', '.')),
            imagens: images,
        };

        if (adicionarItem) {
            adicionarItem(item);
        }

        // Resetar
        setFormData({
            descricao: '',
            tipo: 'necessaire',
            tamanho: '',
            cor: '',
            tecido: 'Oxford',
            fecho: 'zíper',
            alcaAjustavel: false,
            observacao: '',
            valorBolsinha: '',
        });
        setImages([]);
        alert('Item adicionado!');
    };

    return (
        <Container className="mt-4">
            <Form onSubmit={saveOrder}>
                <Row>
                    <Col md={6}>
                        <Form.Group controlId="descricao">
                            <Form.Label>Descrição</Form.Label>
                            <Form.Control
                                placeholder="Descrição da bolsinha"
                                type="text"
                                name="descricao"
                                value={formData.descricao}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                    </Col>

                    <Col md={6}>
                        <Form.Group controlId="tipo">
                            <Form.Label>Tipo de Bolsinha</Form.Label>
                            <Form.Select name="tipo" value={formData.tipo} onChange={handleChange}>
                                <option value="necessaire">Necessaire</option>
                                <option value="transversal">Transversal</option>
                                <option value="estojo">Estojo</option>
                                <option value="pochete">Pochete</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                </Row>

                <Row className="mt-3">
                    <Col md={4}>
                        <Form.Group controlId="tamanho">
                            <Form.Label>Tamanho (cm)</Form.Label>
                            <Form.Control
                                placeholder="Ex: 20x15"
                                type="text"
                                name="tamanho"
                                value={formData.tamanho}
                                onChange={handleChange}
                            />
                        </Form.Group>
                    </Col>

                    <Col md={4}>
                        <Form.Group controlId="cor">
                            <Form.Label>Cor</Form.Label>
                            <Form.Control
                                placeholder="Cor principal"
                                type="text"
                                name="cor"
                                value={formData.cor}
                                onChange={handleChange}
                            />
                        </Form.Group>
                    </Col>

                    <Col md={4}>
                        <Form.Group controlId="tecido">
                            <Form.Label>Tecido</Form.Label>
                            <Form.Select name="tecido" value={formData.tecido} onChange={handleChange}>
                                <option value="Oxford">Oxford</option>
                                <option value="Nylon">Nylon</option>
                                <option value="Jeans">Jeans</option>
                                <option value="PVC">PVC</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                </Row>

                <Row className="mt-3">
                    <Col md={6}>
                        <Form.Group controlId="fecho">
                            <Form.Label>Fecho</Form.Label>
                            <Form.Select name="fecho" value={formData.fecho} onChange={handleChange}>
                                <option value="zíper">Zíper</option>
                                <option value="botão">Botão</option>
                                <option value="velcro">Velcro</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>

                    <Col md={6}>
                        <Form.Group controlId="alcaAjustavel" className="mt-4">
                            <Form.Check
                                type="checkbox"
                                label="Alça Ajustável"
                                name="alcaAjustavel"
                                checked={formData.alcaAjustavel}
                                onChange={handleChange}
                            />
                        </Form.Group>
                    </Col>
                </Row>

                <Row className="mt-3">
                    <Col>
                        <Form.Group controlId="observacao">
                            <Form.Label>Observações</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                name="observacao"
                                value={formData.observacao}
                                onChange={handleChange}
                            />
                        </Form.Group>
                    </Col>
                </Row>

                <Row className="mt-3">
                    <Col>
                        <ImageDropZone images={images} setImages={setImages} />
                    </Col>
                </Row>

                <Row className="mt-4 align-items-center mb-4">
                    <Col md={8}>
                        <InputValorReal
                            name="valorBolsinha"
                            label="Valor da Bolsinha"
                            value={formData.valorBolsinha}
                            onChange={handleChange}
                            required
                        />
                    </Col>
                    <Col md={4} className="d-flex justify-content-end gap-2">
                        <Button variant="danger" type="reset" onClick={() => window.location.reload()} size="md">Limpar</Button>
                        <Button variant="success" type="submit" size="md">Salvar</Button>
                    </Col>
                </Row>
            </Form>
        </Container>
    );
}

export default FormBolsinha;
