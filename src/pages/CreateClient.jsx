import React, { useState, useEffect } from 'react';
import { Button, Table, Modal, Form } from 'react-bootstrap';
import { invoke } from '@tauri-apps/api/core';
import InputMask from 'react-input-mask';

const Clientes = () => {
    const [clientes, setClientes] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editando, setEditando] = useState(null);
    const [form, setForm] = useState({
        nome: '',
        cidade: '',
        estado: '',
        telefone: '',
    });

    const carregarClientes = async () => {
        const res = await invoke('listar_clientes');
        setClientes(res);
    };

    const abrirModal = (cliente = null) => {
        if (cliente) {
            setForm(cliente);
            setEditando(cliente.id);
        } else {
            setForm({ nome: '', cidade: '', estado: '', telefone: '' });
            setEditando(null);
        }
        setShowModal(true);
    };

    const excluirCliente = async (id) => {
        if (window.confirm('Deseja excluir este cliente?')) {
            await invoke('excluir_cliente', { id });
            carregarClientes();
        }
    };

    const salvarCliente = async () => {
        const { nome, cidade, estado, telefone } = form;

        if (!nome.trim() || !cidade.trim() || !estado.trim() || !telefone.trim()) {
            alert('Todos os campos são obrigatórios!');
            return;
        }

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
                await invoke('editar_cliente', { cliente: { ...form, id: editando } });
            } else {
                await invoke('criar_cliente', { cliente: form });
            }
            setShowModal(false);
            setForm({ nome: '', cidade: '', estado: '', telefone: '' });
            setEditando(null);
            carregarClientes();
        } catch (err) {
            alert('Erro ao salvar cliente.');
        }
    };

    useEffect(() => {
        carregarClientes();
    }, []);

    return (
        <div className="p-4">
            <h3>Clientes</h3>
            <Button variant="success" onClick={() => abrirModal()}>
                Novo Cliente
            </Button>
            <Table striped bordered hover className="mt-3">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nome</th>
                        <th>Cidade</th>
                        <th>Estado</th>
                        <th>Telefone</th>
                        <th>Ações</th>
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
                            <td>
                                <Button size="sm" onClick={() => abrirModal(cli)}>
                                    Editar
                                </Button>{' '}
                                <Button
                                    size="sm"
                                    variant="danger"
                                    onClick={() => excluirCliente(cli.id)}
                                >
                                    Excluir
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

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
                            <Form.Label>Cidade</Form.Label>
                            <Form.Control
                                type="text"
                                value={form.cidade}
                                onChange={(e) => setForm({ ...form, cidade: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-2">
                            <Form.Label>Estado (UF)</Form.Label>
                            <Form.Control
                                type="text"
                                value={form.estado}
                                maxLength={2}
                                onChange={(e) =>
                                    setForm({ ...form, estado: e.target.value.toUpperCase() })
                                }
                            />
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
