import React, { useState, useEffect } from 'react';
import { Button, Table, Modal, Form, Alert, ProgressBar, InputGroup, Pagination } from 'react-bootstrap';
import InputMask from 'react-input-mask';
import { getAllClientes, postCliente, updateCliente, deleteCliente, importClientesCSV } from '../services/api';
import CustomAlertModal from '../components/CustomAlertModal';
import useCustomAlert from '../hooks/useCustomAlert';
import { Upload, FileText, CheckCircle, XCircle, Pencil, Trash, Search, Eye, ChevronLeft, ChevronRight } from 'react-bootstrap-icons';

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
    const customAlert = useCustomAlert();
    
    // Estados para importação CSV
    const [showImportModal, setShowImportModal] = useState(false);
    const [csvFile, setCsvFile] = useState(null);
    const [importing, setImporting] = useState(false);
    const [importResult, setImportResult] = useState(null);
    
    // Estados para funcionalidades de edição/exclusão
    const [searchTerm, setSearchTerm] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [clienteParaExcluir, setClienteParaExcluir] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [clienteParaVisualizar, setClienteParaVisualizar] = useState(null);
    
    // Estados para paginação
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(50);
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
            customAlert.showError('Erro', 'Erro ao carregar clientes.');
        }
    };

    // Função para importar CSV
    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file && file.type === 'text/csv') {
            setCsvFile(file);
            setImportResult(null);
        } else {
            customAlert.showError('Erro', 'Por favor, selecione um arquivo CSV válido.');
        }
    };

    const handleImportCSV = async () => {
        if (!csvFile) {
            customAlert.showError('Erro', 'Por favor, selecione um arquivo CSV.');
            return;
        }

        setImporting(true);
        setImportResult(null);

        try {
            const response = await importClientesCSV(csvFile);
            setImportResult(response.data);
            
            // Recarregar lista de clientes
            await carregarClientes();
            
            customAlert.showSuccess('Sucesso', `Importação concluída! ${response.data.clientes_criados} clientes criados.`);
        } catch (error) {
            console.error('Erro na importação:', error);
            customAlert.showError('Erro', 'Erro ao importar arquivo CSV.');
        } finally {
            setImporting(false);
        }
    };

    const resetImportModal = () => {
        setCsvFile(null);
        setImportResult(null);
        setShowImportModal(false);
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
            customAlert.showWarning('Atenção', 'Todos os campos são obrigatórios!');
            return;
        }

        // Validações simples
        if (!/^\([0-9]{2}\)\s[0-9]{5}-[0-9]{4}$/.test(telefone)) {
            customAlert.showWarning('Atenção', 'Telefone inválido. Use o formato (99) 99999-9999');
            return;
        }

        if (!/^[A-Z]{2}$/.test(estado)) {
            customAlert.showWarning('Atenção', 'UF deve conter exatamente 2 letras maiúsculas (ex: SP)');
            return;
        }

        try {
            if (editando) {
                await updateCliente(editando, form);
                customAlert.showSuccess('Sucesso!', 'Cliente atualizado com sucesso!');
            } else {
                await postCliente(form);
                customAlert.showSuccess('Sucesso!', 'Cliente cadastrado com sucesso!');
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
            customAlert.showError('Erro', 'Erro ao salvar cliente.');
        }
    };

    // Função para excluir cliente
    const excluirCliente = async () => {
        try {
            await deleteCliente(clienteParaExcluir.id);
            customAlert.showSuccess('Sucesso!', 'Cliente excluído com sucesso!');
            setShowDeleteModal(false);
            setClienteParaExcluir(null);
            carregarClientes();
        } catch (err) {
            customAlert.showError('Erro', 'Erro ao excluir cliente.');
        }
    };

    // Função para abrir modal de exclusão
    const abrirModalExclusao = (cliente) => {
        setClienteParaExcluir(cliente);
        setShowDeleteModal(true);
    };

    // Função para abrir modal de visualização
    const abrirModalVisualizacao = (cliente) => {
        setClienteParaVisualizar(cliente);
        setShowViewModal(true);
    };

    // Filtrar clientes por termo de busca
    const clientesFiltrados = clientes.filter(cliente =>
        cliente.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.cidade?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.telefone?.includes(searchTerm)
    );

    // Calcular dados de paginação
    const totalPages = Math.ceil(clientesFiltrados.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const clientesPaginados = clientesFiltrados.slice(startIndex, endIndex);

    // Função para mudar de página
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    // Função para ir para a primeira página
    const goToFirstPage = () => {
        setCurrentPage(1);
    };

    // Função para ir para a última página
    const goToLastPage = () => {
        setCurrentPage(totalPages);
    };

    // Função para ir para a página anterior
    const goToPreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    // Função para ir para a próxima página
    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    // Resetar página quando termo de busca mudar
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);
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
                    customAlert.showWarning('Atenção', 'CEP não encontrado.');
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
                    <div className="d-flex gap-2">
                        <Button variant="outline-primary" onClick={() => setShowImportModal(true)}>
                            <Upload className="me-2" />
                            Importar CSV
                        </Button>
                        <Button variant="success" onClick={() => abrirModal()}>
                            Novo Cliente
                        </Button>
                    </div>
                </div>
            </div>

            {/* Barra de pesquisa */}
            <div className="dashboard-card mb-4">
                <div className="dashboard-card-header">
                    <h5 className="dashboard-card-title">Pesquisar Clientes</h5>
                </div>
                <div className="p-3">
                    <InputGroup>
                        <InputGroup.Text>
                            <Search size={16} />
                        </InputGroup.Text>
                        <Form.Control
                            type="text"
                            placeholder="Pesquisar por nome, cidade ou telefone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </InputGroup>
                    <div className="mt-2">
                        <small className="text-muted">
                            Mostrando {startIndex + 1}-{Math.min(endIndex, clientesFiltrados.length)} de {clientesFiltrados.length} clientes encontrados
                            {clientesFiltrados.length !== clientes.length && ` (${clientes.length} total)`}
                        </small>
                    </div>
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
                                <th width="120">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clientesPaginados.map((cli) => (
                                <tr key={cli.id}>
                                    <td>{cli.id}</td>
                                    <td>{cli.nome}</td>
                                    <td>{cli.cidade}</td>
                                    <td>{cli.estado}</td>
                                    <td>{cli.telefone}</td>
                                    <td>
                                        <div className="d-flex gap-1">
                                            <Button
                                                variant="outline-info"
                                                size="sm"
                                                onClick={() => abrirModalVisualizacao(cli)}
                                                title="Visualizar"
                                            >
                                                <Eye size={14} />
                                            </Button>
                                            <Button
                                                variant="outline-warning"
                                                size="sm"
                                                onClick={() => abrirModal(cli)}
                                                title="Editar"
                                            >
                                                <Pencil size={14} />
                                            </Button>
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={() => abrirModalExclusao(cli)}
                                                title="Excluir"
                                            >
                                                <Trash size={14} />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    {clientesFiltrados.length === 0 && (
                        <div className="text-center p-4">
                            <p className="text-muted">
                                {searchTerm ? 'Nenhum cliente encontrado com os filtros aplicados' : 'Nenhum cliente cadastrado'}
                            </p>
                        </div>
                    )}
                </div>
                
                {/* Controles de Paginação */}
                {clientesFiltrados.length > 0 && totalPages > 1 && (
                    <div className="d-flex justify-content-between align-items-center p-3 border-top">
                        <div className="d-flex align-items-center">
                            <span className="text-muted me-3">
                                Página {currentPage} de {totalPages}
                            </span>
                            <span className="text-muted">
                                ({clientesFiltrados.length} clientes)
                            </span>
                        </div>
                        
                        <Pagination className="mb-0">
                            <Pagination.First 
                                onClick={goToFirstPage}
                                disabled={currentPage === 1}
                            />
                            <Pagination.Prev 
                                onClick={goToPreviousPage}
                                disabled={currentPage === 1}
                            />
                            
                            {/* Números das páginas */}
                            {(() => {
                                const pages = [];
                                const maxVisiblePages = 5;
                                let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                                let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                                
                                // Ajustar startPage se estivermos no final
                                if (endPage - startPage + 1 < maxVisiblePages) {
                                    startPage = Math.max(1, endPage - maxVisiblePages + 1);
                                }
                                
                                for (let i = startPage; i <= endPage; i++) {
                                    pages.push(
                                        <Pagination.Item
                                            key={i}
                                            active={i === currentPage}
                                            onClick={() => handlePageChange(i)}
                                        >
                                            {i}
                                        </Pagination.Item>
                                    );
                                }
                                
                                return pages;
                            })()}
                            
                            <Pagination.Next 
                                onClick={goToNextPage}
                                disabled={currentPage === totalPages}
                            />
                            <Pagination.Last 
                                onClick={goToLastPage}
                                disabled={currentPage === totalPages}
                            />
                        </Pagination>
                    </div>
                )}
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

            {/* Modal de Importação CSV */}
            <Modal show={showImportModal} onHide={resetImportModal} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        <FileText className="me-2" />
                        Importar Clientes via CSV
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Alert variant="info" className="mb-3">
                        <strong>Formato do CSV:</strong> O arquivo deve conter as colunas: <code>nome</code>, <code>cep</code>, <code>cidade</code>, <code>estado</code>, <code>telefone</code>
                    </Alert>
                    
                    <Form.Group className="mb-3">
                        <Form.Label>Selecionar arquivo CSV</Form.Label>
                        <Form.Control
                            type="file"
                            accept=".csv"
                            onChange={handleFileSelect}
                            disabled={importing}
                        />
                    </Form.Group>

                    {csvFile && (
                        <Alert variant="success" className="mb-3">
                            <CheckCircle className="me-2" />
                            Arquivo selecionado: <strong>{csvFile.name}</strong>
                        </Alert>
                    )}

                    {importing && (
                        <div className="mb-3">
                            <ProgressBar animated now={100} label="Importando..." />
                        </div>
                    )}

                    {importResult && (
                        <div className="mb-3">
                            <Alert variant={importResult.erros.length > 0 ? "warning" : "success"}>
                                <strong>Resultado da Importação:</strong>
                                <ul className="mb-0 mt-2">
                                    <li>Clientes criados: <strong>{importResult.clientes_criados}</strong></li>
                                    <li>Total de linhas processadas: <strong>{importResult.total_linhas_processadas}</strong></li>
                                    {importResult.erros.length > 0 && (
                                        <li>Erros encontrados: <strong>{importResult.erros.length}</strong></li>
                                    )}
                                </ul>
                            </Alert>
                            
                            {importResult.erros.length > 0 && (
                                <Alert variant="danger">
                                    <strong>Erros encontrados:</strong>
                                    <ul className="mb-0 mt-2" style={{ fontSize: '0.9em' }}>
                                        {importResult.erros.map((erro, index) => (
                                            <li key={index}>{erro}</li>
                                        ))}
                                    </ul>
                                </Alert>
                            )}
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={resetImportModal} disabled={importing}>
                        Cancelar
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={handleImportCSV} 
                        disabled={!csvFile || importing}
                    >
                        {importing ? 'Importando...' : 'Importar'}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal de Visualização */}
            <Modal show={showViewModal} onHide={() => setShowViewModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Detalhes do Cliente</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {clienteParaVisualizar && (
                        <div>
                            <h5>{clienteParaVisualizar.nome}</h5>
                            <hr />
                            <div className="row">
                                <div className="col-md-6">
                                    <p><strong>ID:</strong> {clienteParaVisualizar.id}</p>
                                    <p><strong>Nome:</strong> {clienteParaVisualizar.nome}</p>
                                    <p><strong>Telefone:</strong> {clienteParaVisualizar.telefone}</p>
                                </div>
                                <div className="col-md-6">
                                    <p><strong>Cidade:</strong> {clienteParaVisualizar.cidade}</p>
                                    <p><strong>Estado:</strong> {clienteParaVisualizar.estado}</p>
                                    <p><strong>CEP:</strong> {clienteParaVisualizar.cep}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowViewModal(false)}>
                        Fechar
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal de Confirmação de Exclusão */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmar Exclusão</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Alert variant="warning" className="d-flex align-items-center">
                        <XCircle size={24} className="me-2" />
                        <div>
                            <strong>Atenção!</strong> Esta ação não pode ser desfeita.
                        </div>
                    </Alert>
                    <p>
                        Tem certeza que deseja excluir o cliente <strong>{clienteParaExcluir?.nome}</strong>?
                    </p>
                    <p className="text-muted">
                        Todos os dados relacionados a este cliente serão permanentemente removidos.
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Cancelar
                    </Button>
                    <Button variant="danger" onClick={excluirCliente}>
                        <Trash size={16} className="me-2" />
                        Excluir Cliente
                    </Button>
                </Modal.Footer>
            </Modal>

            <CustomAlertModal
                isOpen={customAlert.alertState.isOpen}
                onClose={customAlert.hideAlert}
                type={customAlert.alertState.type}
                title={customAlert.alertState.title}
                message={customAlert.alertState.message}
                confirmText={customAlert.alertState.confirmText}
                onConfirm={customAlert.alertState.onConfirm}
                showCancel={customAlert.alertState.showCancel}
                cancelText={customAlert.alertState.cancelText}
            />
        </div>
    );
};

export default Clientes;
