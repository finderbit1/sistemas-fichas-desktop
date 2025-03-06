import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Button, Card } from 'react-bootstrap';
import { Typeahead } from 'react-bootstrap-typeahead';
import { invoke } from '@tauri-apps/api/core';

import FormOrder from '../components/FormOrder';
import 'react-bootstrap-typeahead/css/Typeahead.css';

const CreateOrder = () => {
    const [formData, setFormData] = useState({
        numeroPedido: '',
        nomeCliente: '',
        telefoneCliente: '',
        dataEntrada: '',
        dataEntrega: '',
        cidadeCliente: '',
        observacao: '',
        prioridade: '1',
        items: []
    });

    const [clientes, setClientes] = useState([]);
    const [selectedCliente, setSelectedCliente] = useState([]);

    useEffect(() => {
        let lastId = 0; // Simulação, ajuste conforme seu backend
        const generateOrderId = () => `${lastId + 1}`;
        setFormData((prev) => ({ ...prev, numeroPedido: generateOrderId() }));
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleBuscarClientes = async (input) => {
        if (!input || input.length < 2) return;
        try {
            const resultado = await invoke('buscar_clientes', { nomeParcial: input });
            setClientes(resultado);
        } catch (err) {
            console.error('Erro ao buscar clientes:', err);
        }
    };

    const handleClienteSelecionado = (selected) => {
        if (selected.length > 0) {
            const cliente = selected[0];
            setFormData((prev) => ({
                ...prev,
                nomeCliente: cliente.nome,
                telefoneCliente: cliente.telefone,
                cidadeCliente: cliente.cidade,
            }));
            setSelectedCliente([cliente]);
        }
    };

    const addItem = (item) => {
        setFormData((prev) => ({
            ...prev,
            items: [...prev.items, item]
        }));
    };

    const removeItem = (index) => {
        setFormData((prev) => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const handleSalvarPedido = () => {
        if (
            !formData.nomeCliente ||
            !formData.dataEntrada ||
            !formData.dataEntrega ||
            !formData.telefoneCliente ||
            !formData.cidadeCliente
        ) {
            alert('Preencha todos os campos obrigatórios!');
            return;
        }

        console.log('Pedido salvo:', formData);
        // Aqui você faz o POST via invoke ou fetch
    };

    return (
        <>
            <Card className="p-3">
                <Form onSubmit={(e) => e.preventDefault()}>
                    <Row className="mb-3">
                        <Col md={2}>
                            <Form.Group controlId="numeroPedido">
                                <Form.Control
                                    type="text"
                                    name="numeroPedido"
                                    value={formData.numeroPedido}
                                    readOnly
                                    placeholder="Id do Pedido"
                                />
                            </Form.Group>
                        </Col>

                        <Col md={7}>
                            <Form.Group controlId="nomeCliente">
                                <Typeahead
                                    id="autocomplete-clientes"
                                    labelKey="nome"
                                    options={clientes}
                                    onInputChange={handleBuscarClientes}
                                    onChange={handleClienteSelecionado}
                                    selected={selectedCliente}
                                    placeholder="Digite o nome do cliente"
                                    minLength={2}
                                />
                            </Form.Group>
                        </Col>

                        <Col md={3}>
                            <Form.Group controlId="telefoneCliente">
                                <Form.Control
                                    type="tel"
                                    name="telefoneCliente"
                                    value={formData.telefoneCliente}
                                    onChange={handleChange}
                                    placeholder="(00) 00000-0000"
                                    readOnly
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col md={3}>
                            <Form.Group controlId="dataEntrada">
                                <Form.Label>Data de Entrada</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="dataEntrada"
                                    value={formData.dataEntrada}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                        </Col>

                        <Col md={3}>
                            <Form.Group controlId="dataEntrega">
                                <Form.Label>Data de Entrega</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="dataEntrega"
                                    value={formData.dataEntrega}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group controlId="cidadeCliente">
                                <Form.Label>Cidade do Cliente</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="cidadeCliente"
                                    value={formData.cidadeCliente}
                                    onChange={handleChange}
                                    readOnly
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col md={10}>
                            <Form.Group controlId="observacao">
                                <Form.Label>Observações do Pedido</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={1}
                                    name="observacao"
                                    value={formData.observacao}
                                    onChange={handleChange}
                                    placeholder="Informações adicionais sobre o pedido..."
                                />
                            </Form.Group>
                        </Col>
                        <Col md={2} >
                            <Form.Group>
                                <Form.Label>Prioridade</Form.Label>
                                <Form.Select
                                    name='prioridade'
                                    value={formData.prioridade}
                                    onChange={handleChange}
                                >
                                    <option value="1">Normal</option>
                                    <option value="2">Média</option>
                                    <option value="3">Alta</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>
                </Form>
            </Card>

            <Card>
                <FormOrder items={formData.items} addItem={addItem} removeItem={removeItem} />
            </Card>

            <Card>
                <Row className="mb-4 p-3">
                    <Col md={2}>
                        <Button variant="primary" type="button" onClick={handleSalvarPedido}>
                            Salvar Pedido
                        </Button>
                    </Col>
                    <Col md={2}>
                        <Button variant="danger" type="reset">
                            Cancelar
                        </Button>
                    </Col>
                </Row>
            </Card>
        </>
    );
};

export default CreateOrder;
