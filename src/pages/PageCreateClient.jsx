import React, { useState, useEffect } from 'react';
import { Button, Table, Modal, Form } from 'react-bootstrap';
import InputMask from 'react-input-mask';
import { getAllClientes, postCliente } from '../services/api';

const Clientes = () => {
    const [clientes, setClientes] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({
        nome: '',
        cep: '',
        cidade: '',
        estado: '',
        telefone: '',
    });
    const [editando, setEditando] = useState(null);
    const buscarEnderecoPorCep = async (cep) => {
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();
            if (!data.erro) {
                return {
                    cidade: data.localidade,
                    estado: data.uf,
                };
            }
        } catch (error) {
            console.error("Erro ao buscar endereço:", error);
        }
        return null;
    };

    // Busca clientes ao montar o componente
    useEffect(() => {
        carregarClientes();
    }, []);

    const carregarClientes = async () => {
        try {
            const res = await getAllClientes();
            setClientes(res.data);
        } catch (error) {
            alert('Erro ao carregar clientes.');
        }
    };

    // Abre modal para novo ou edição
    const abrirModal = (cliente = null) => {
        if (cliente) {
            setForm({ ...cliente });
            setEditando(cliente.id);
        } else {
            setForm({
                nome: '',
                cep: '',
                cidade: '',
                estado: '',
                telefone: '',
            });
            setEditando(null);
        }
        setShowModal(true);
    };

    // Salvar cliente (novo ou editar)
    const salvarCliente = async () => {
        const { nome, cidade, estado, telefone } = form;

        if (!nome.trim() || !cidade.trim() || !estado.trim() || !telefone.trim()) {
            alert('Todos os campos são obrigatórios!');
            return;
        }

        // Validações simples
        if (!/^\([0-9]{2}\)\s[0-9]{5}-[0-9]{4}$/.test(telefone)) {
            alert('Telefone inválido. Use o formato (99) 99999-9999');
            return;
        }

        if (!/^[A-Z]{2}$/.test(estado)) {
            alert('UF deve conter exatamente 2 letras maiúsculas (ex: SP)');
            return;
        }

        try {
            if (editando) {
                // Aqui você pode implementar edição via API
                alert('Funcionalidade de editar ainda não implementada');
            } else {
                await postCliente(form);
                alert('Cliente cadastrado com sucesso!');
            }
            setShowModal(false);
            setForm({
                nome: '',
                cep: '',
                cidade: '',
                estado: '',
                telefone: '',
            });
            setEditando(null);
            carregarClientes();
        } catch (err) {
            alert('Erro ao salvar cliente.');
        }
    };
    useEffect(() => {
        const cepSemMascara = form.cep.replace(/\D/g, '');
        if (cepSemMascara.length === 8) {
            buscarEnderecoPorCep(cepSemMascara).then((endereco) => {
                if (endereco) {
                    setForm((prev) => ({
                        ...prev,
                        cidade: endereco.cidade,
                        estado: endereco.estado,
                    }));
                } else {
                    alert("CEP não encontrado.");
                    setForm((prev) => ({
                        ...prev,
                        cidade: '',
                        estado: '',
                    }));
                }
            });
        }
    }, [form.cep]);


    return (
        <div style={{ padding: 0 }}>
            <div className="dashboard-card mb-4">
                <div className="dashboard-card-header">
                    <h4 className="dashboard-card-title">Clientes</h4>
                    <Button variant="success" onClick={() => abrirModal()}>
                        Novo Cliente
                    </Button>
                </div>
            </div>
            
            <div className="dashboard-card">
                <div className="table-container">
                    <Table hover responsive className="table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nome</th>
                                <th>Cidade</th>
                                <th>Estado</th>
                                <th>Telefone</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clientes.map((cli) => (
                                <tr key={cli.id}>
                                    <td>{cli.id}</td>
                                    <td>{cli.nome}</td>
                                    <td>{cli.cidade}</td>
                                    <td>{cli.estado}</td>
                                    <td>{cli.telefone}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            </div>

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{editando ? 'Editar Cliente' : 'Novo Cliente'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-2">
                            <Form.Label>Nome</Form.Label>
                            <Form.Control
                                type="text"
                                value={form.nome}
                                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-2">
                            <Form.Label>CEP</Form.Label>
                            <InputMask
                                mask="99999-999"
                                value={form.cep}
                                onChange={(e) => setForm({ ...form, cep: e.target.value })}
                            >
                                {(inputProps) => <Form.Control type="text" {...inputProps} />}
                            </InputMask>
                        </Form.Group>
                        <Form.Group className="mb-2">
                            <Form.Label>Cidade</Form.Label>
                            <Form.Control type="text" value={form.cidade} readOnly />
                        </Form.Group>
                        <Form.Group className="mb-2">
                            <Form.Label>Estado (UF)</Form.Label>
                            <Form.Control type="text" value={form.estado} readOnly />
                        </Form.Group>
                        <Form.Group className="mb-2">
                            <Form.Label>Telefone</Form.Label>
                            <InputMask
                                mask="(99) 99999-9999"
                                value={form.telefone}
                                onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                            >
                                {(inputProps) => <Form.Control type="text" {...inputProps} />}
                            </InputMask>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Cancelar
                    </Button>
                    <Button variant="primary" onClick={salvarCliente}>
                        Salvar
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Clientes;
