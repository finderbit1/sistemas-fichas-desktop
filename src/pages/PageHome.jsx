import React, { useState, useEffect } from 'react';
import {
    Card,
    Button,
    Row,
    Col,
    Table,
    Container,
    Form,
    Toast,
    ToastContainer,
    Modal,
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { 
    ClipboardData, 
    Clock, 
    ExclamationTriangle, 
    Plus,
    Search,
    Eye,
    CheckCircle,
    XCircle,
    Printer,
} from 'react-bootstrap-icons';
import { getAllPedidos, updatePedido } from '../services/api';
import { obterPedidos, salvarPedido, atualizarPedido } from '../utils/localStorageHelper';
import { convertApiPedidosToList, convertApiPedidoToFormData, convertFormDataToApiPedido } from '../utils/apiConverter';
import Tooltip from '../components/Tooltip';
import '../styles/home.css';


const Home = () => {
    const navigate = useNavigate();
    const [pedidos, setPedidos] = useState([]);
    const [erro, setErro] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '' });
    const [modal, setModal] = useState({ show: false, index: null, campo: '', pedido: null });
    const [previewModal, setPreviewModal] = useState({ show: false, pedido: null });
    const [confirmModal, setConfirmModal] = useState({ show: false, pedido: null, setor: '', action: '' });
    const [logsModal, setLogsModal] = useState({ show: false });
    const [logs, setLogs] = useState([]);
    const [pedidosSelecionados, setPedidosSelecionados] = useState([]);
    const [filtro, setFiltro] = useState('');

    useEffect(() => {
        const carregarPedidos = async () => {
            try {
                // Tentar buscar da API primeiro
                const response = await getAllPedidos();
                const pedidosApi = convertApiPedidosToList(response.data);
                
                // Formatar pedidos para exibição
                const pedidosFormatados = pedidosApi.map((pedido) => ({
                    ...pedido,
                    prioridade: pedido.prioridade === "ALTA", // transforma em booleano
                    dataCriacao: pedido.dataCriacao || new Date().toISOString(),
                    status: pedido.status || 'Pendente'
                }));

                setPedidos(pedidosFormatados);
                setErro(false);
                console.log('Pedidos carregados da API:', pedidosFormatados.length);
            } catch (apiError) {
                console.warn('Erro ao carregar da API, usando localStorage:', apiError);
                
                // Se a API falhar, usar localStorage
                const pedidosLocal = obterPedidos();
                
                // Formatar pedidos para exibição
                const pedidosFormatados = pedidosLocal.map((pedido) => ({
                    ...pedido,
                    prioridade: pedido.prioridade === "ALTA", // transforma em booleano
                    dataCriacao: pedido.dataCriacao || new Date().toISOString(),
                    status: pedido.status || 'Pendente'
                }));

                setPedidos(pedidosFormatados);
                setErro(true);
            }
        };

        carregarPedidos();
    }, []);


    const totalPedidos = pedidos.length;
    const pendentes = pedidos.filter(p => !p.financeiro).length;
    const emAndamento = pedidos.filter(p => p.financeiro && p.status !== 'Pronto').length;
    const prontos = pedidos.filter(p => p.status === 'Pronto').length;
    const prioridades = pedidos.filter(p => p.prioridade === true || p.prioridade === 'ALTA').length;

    const pedidosFiltrados = pedidos.filter(pedido =>
        (pedido.nomeCliente || '').toLowerCase().includes(filtro.toLowerCase()) ||
        (pedido.numeroPedido || '').toLowerCase().includes(filtro.toLowerCase()) ||
        (pedido.cidadeCliente || '').toLowerCase().includes(filtro.toLowerCase())
    );

    // Função para gerar logs
    const gerarLog = (pedido, setor, action, usuario = 'Sistema') => {
        const timestamp = new Date().toISOString();
        const logEntry = {
            id: Date.now(),
            timestamp,
            pedidoId: pedido.id,
            numeroPedido: pedido.numeroPedido,
            cliente: pedido.nomeCliente,
            setor: setor.charAt(0).toUpperCase() + setor.slice(1),
            action: action === 'marcar' ? 'Marcado' : 'Desmarcado',
            usuario,
            statusAnterior: pedido.status,
            statusNovo: action === 'marcar' ? 'Em Andamento' : 'Pendente'
        };
        
        console.log('📋 LOG DE ALTERAÇÃO DE SETOR:', logEntry);
        
        // Adicionar log ao estado
        setLogs(prevLogs => [logEntry, ...prevLogs].slice(0, 100)); // Manter apenas os últimos 100 logs
        
        // Aqui você pode enviar para um serviço de logs, banco de dados, etc.
        // Exemplo: enviarLogParaAPI(logEntry);
        
        return logEntry;
    };

    const toggleSetor = (pedidoId, setor) => {
        const pedido = pedidos.find(p => p.id === pedidoId);
        if (!pedido) return;

        // Se não é financeiro e financeiro não está marcado, não permite
        if (setor !== 'financeiro' && !pedido.financeiro) {
            setToast({ 
                show: true, 
                message: 'O setor Financeiro deve ser aprovado primeiro!' 
            });
            return;
        }

        // Se está tentando desmarcar, mostrar modal de confirmação
        if (pedido[setor]) {
            setConfirmModal({ 
                show: true, 
                pedido, 
                setor, 
                action: 'desmarcar' 
            });
            return;
        }

        // Se está marcando, executar diretamente
        executarAlteracaoSetor(pedido, setor, 'marcar');
    };

    const executarAlteracaoSetor = async (pedido, setor, action) => {
        try {
            // Atualizar localmente primeiro
            const pedidosAtualizados = pedidos.map(p => {
                if (p.id === pedido.id) {
                    const pedidoAtualizado = {
                        ...p,
                        [setor]: action === 'marcar'
                    };

                    // Verificar se todos os setores estão concluídos
                    const setores = ['financeiro', 'conferencia', 'sublimacao', 'costura', 'expedicao'];
                    const todosConcluidos = setores.every(setor => pedidoAtualizado[setor]);
                    
                    if (todosConcluidos) {
                        pedidoAtualizado.status = 'Pronto';
                        setToast({ 
                            show: true, 
                            message: `Pedido #${pedidoAtualizado.numeroPedido} concluído! Status: Pronto` 
                        });
                    } else {
                        pedidoAtualizado.status = 'Em Andamento';
                    }

                    // Gerar log da alteração
                    gerarLog(pedidoAtualizado, setor, action);

                    return pedidoAtualizado;
                }
                return p;
            });
            setPedidos(pedidosAtualizados);

            // Tentar atualizar na API
            try {
                const pedidoAtualizado = pedidosAtualizados.find(p => p.id === pedido.id);
                const apiPedido = convertFormDataToApiPedido(pedidoAtualizado);
                await updatePedido(pedido.id, apiPedido);
                console.log('Setor atualizado na API com sucesso');
                
                // Atualizar no localStorage como backup
                atualizarPedido(pedido.id, pedidoAtualizado);
            } catch (apiError) {
                console.warn('Erro ao atualizar na API, mas atualizado localmente:', apiError);
                // Manter atualização local mesmo se a API falhar
                atualizarPedido(pedido.id, pedidosAtualizados.find(p => p.id === pedido.id));
            }
        } catch (error) {
            console.error('Erro ao atualizar setor:', error);
            setToast({
                show: true,
                message: 'Erro ao atualizar setor. Tente novamente.'
            });
        }
    };

    const confirmarAlteracao = () => {
        if (confirmModal.pedido && confirmModal.setor) {
            executarAlteracaoSetor(confirmModal.pedido, confirmModal.setor, confirmModal.action);
            setConfirmModal({ show: false, pedido: null, setor: '', action: '' });
        }
    };

    // Funções para seleção de pedidos para impressão
    const toggleSelecaoPedido = (pedidoId) => {
        setPedidosSelecionados(prev => {
            if (prev.includes(pedidoId)) {
                return prev.filter(id => id !== pedidoId);
            } else {
                return [...prev, pedidoId];
            }
        });
    };

    const selecionarTodos = () => {
        if (pedidosSelecionados.length === pedidosFiltrados.length) {
            setPedidosSelecionados([]);
        } else {
            setPedidosSelecionados(pedidosFiltrados.map(p => p.id));
        }
    };

    const imprimirPedidos = () => {
        if (pedidosSelecionados.length === 0) {
            setToast({ show: true, message: 'Selecione pelo menos um pedido para imprimir!' });
            return;
        }

        const pedidosParaImprimir = pedidos.filter(p => pedidosSelecionados.includes(p.id));
        imprimirConteudo(pedidosParaImprimir, `${pedidosParaImprimir.length} pedido(s)`);
    };

    const imprimirPedidoIndividual = (pedido) => {
        imprimirConteudo([pedido], `Pedido #${pedido.numeroPedido}`);
    };

    const imprimirConteudo = (pedidos, titulo) => {
        try {
            const conteudoImpressao = gerarConteudoImpressao(pedidos);
            
            // Tentar abrir nova janela primeiro
            const novaJanela = window.open('', '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
            
            if (novaJanela) {
                // Escrever o conteúdo na nova janela
                novaJanela.document.write(conteudoImpressao);
                novaJanela.document.close();
                
                setToast({ 
                    show: true, 
                    message: `Abrindo visualização de ${titulo}. Use Ctrl+P para imprimir.` 
                });
            } else {
                // Fallback: usar método sem pop-up
                imprimirSemPopup(conteudoImpressao, titulo);
            }
            
        } catch (error) {
            console.error('Erro ao imprimir:', error);
            setToast({ 
                show: true, 
                message: 'Erro ao preparar impressão. Tente novamente.' 
            });
        }
    };

    const imprimirSemPopup = (conteudo, titulo) => {
        try {
            // Criar modal para exibir conteúdo
            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                z-index: 10000;
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 20px;
            `;
            
            const modalContent = document.createElement('div');
            modalContent.style.cssText = `
                background: white;
                border-radius: 8px;
                padding: 20px;
                max-width: 90%;
                max-height: 90%;
                overflow: auto;
                position: relative;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            `;
            
            // Adicionar botões de controle
            const botoes = document.createElement('div');
            botoes.style.cssText = `
                position: sticky;
                top: 0;
                background: white;
                padding: 10px 0;
                margin-bottom: 20px;
                border-bottom: 2px solid #eee;
                display: flex;
                gap: 10px;
                justify-content: center;
            `;
            
            const botaoImprimir = document.createElement('button');
            botaoImprimir.innerHTML = '🖨️ Imprimir';
            botaoImprimir.style.cssText = `
                padding: 12px 24px;
                background: #28a745;
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 16px;
                font-weight: bold;
            `;
            botaoImprimir.onclick = () => {
                // Criar janela temporária para impressão
                const janelaImpressao = window.open('', '_blank');
                if (janelaImpressao) {
                    janelaImpressao.document.write(conteudo);
                    janelaImpressao.document.close();
                    setTimeout(() => {
                        janelaImpressao.print();
                    }, 500);
                } else {
                    // Fallback: imprimir na janela atual
                    const conteudoOriginal = document.body.innerHTML;
                    document.body.innerHTML = conteudo;
                    window.print();
                    document.body.innerHTML = conteudoOriginal;
                }
            };
            
            const botaoFechar = document.createElement('button');
            botaoFechar.innerHTML = '❌ Fechar';
            botaoFechar.style.cssText = `
                padding: 12px 24px;
                background: #dc3545;
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 16px;
                font-weight: bold;
            `;
            botaoFechar.onclick = () => {
                document.body.removeChild(modal);
            };
            
            botoes.appendChild(botaoImprimir);
            botoes.appendChild(botaoFechar);
            
            // Adicionar conteúdo
            const conteudoDiv = document.createElement('div');
            conteudoDiv.innerHTML = conteudo;
            
            modalContent.appendChild(botoes);
            modalContent.appendChild(conteudoDiv);
            modal.appendChild(modalContent);
            
            // Fechar ao clicar fora do modal
            modal.onclick = (e) => {
                if (e.target === modal) {
                    document.body.removeChild(modal);
                }
            };
            
            // Adicionar ao DOM
            document.body.appendChild(modal);
            
            setToast({ 
                show: true, 
                message: `Exibindo ${titulo}. Use o botão "Imprimir" ou Ctrl+P.` 
            });
            
        } catch (error) {
            console.error('Erro no método sem pop-up:', error);
            setToast({ 
                show: true, 
                message: 'Erro ao exibir conteúdo. Tente novamente.' 
            });
        }
    };


    const gerarConteudoImpressao = (pedidos) => {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Fichas de Pedidos - Sistema SGP</title>
                <meta charset="UTF-8">
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    
                    body {
                        font-family: 'Arial', sans-serif;
                        font-size: 12px;
                        line-height: 1.4;
                        color: #333;
                        background: white;
                    }
                    
                    .page {
                        width: 210mm;
                        min-height: 297mm;
                        margin: 0 auto;
                        padding: 15mm;
                        background: white;
                        position: relative;
                    }
                    
                    .header {
                        text-align: center;
                        margin-bottom: 20px;
                        border-bottom: 2px solid #333;
                        padding-bottom: 15px;
                    }
                    
                    .header h1 {
                        font-size: 24px;
                        font-weight: bold;
                        color: #2c3e50;
                        margin-bottom: 5px;
                    }
                    
                    .header-info {
                        display: flex;
                        justify-content: space-between;
                        font-size: 11px;
                        color: #666;
                    }
                    
                    .ficha {
                        border: 2px solid #333;
                        margin-bottom: 20px;
                        page-break-inside: avoid;
                        background: white;
                    }
                    
                    .ficha-header {
                        background: #f8f9fa;
                        padding: 12px;
                        border-bottom: 1px solid #333;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                    
                    .ficha-title {
                        font-size: 16px;
                        font-weight: bold;
                        color: #2c3e50;
                    }
                    
                    .ficha-status {
                        padding: 6px 12px;
                        border-radius: 4px;
                        font-weight: bold;
                        font-size: 11px;
                        text-transform: uppercase;
                    }
                    
                    .status-pronto { background: #d4edda; color: #155724; }
                    .status-em-andamento { background: #fff3cd; color: #856404; }
                    .status-pendente { background: #f8d7da; color: #721c24; }
                    
                    .ficha-content {
                        padding: 15px;
                    }
                    
                    .info-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 15px;
                        margin-bottom: 15px;
                    }
                    
                    .info-item {
                        display: flex;
                        flex-direction: column;
                    }
                    
                    .info-label {
                        font-weight: bold;
                        color: #555;
                        font-size: 10px;
                        text-transform: uppercase;
                        margin-bottom: 2px;
                    }
                    
                    .info-value {
                        font-size: 12px;
                        color: #333;
                    }
                    
                    .setores-grid {
                        display: grid;
                        grid-template-columns: repeat(5, 1fr);
                        gap: 8px;
                        margin: 15px 0;
                    }
                    
                    .setor {
                        padding: 8px;
                        text-align: center;
                        border-radius: 4px;
                        font-size: 10px;
                        font-weight: bold;
                        text-transform: uppercase;
                    }
                    
                    .setor-aprovado { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
                    .setor-pendente { background: #fff3cd; color: #856404; border: 1px solid #ffeaa7; }
                    .setor-desabilitado { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
                    
                    .items-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 15px;
                        font-size: 11px;
                    }
                    
                    .items-table th,
                    .items-table td {
                        border: 1px solid #333;
                        padding: 8px;
                        text-align: left;
                    }
                    
                    .items-table th {
                        background: #f8f9fa;
                        font-weight: bold;
                        text-transform: uppercase;
                        font-size: 10px;
                    }
                    
                    .items-table tr:nth-child(even) {
                        background: #f8f9fa;
                    }
                    
                    .totals {
                        margin-top: 15px;
                        padding: 10px;
                        background: #f8f9fa;
                        border: 1px solid #333;
                        border-radius: 4px;
                    }
                    
                    .total-row {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 5px;
                    }
                    
                    .total-row.final {
                        font-weight: bold;
                        font-size: 14px;
                        border-top: 1px solid #333;
                        padding-top: 5px;
                        margin-top: 10px;
                    }
                    
                    .observacoes {
                        margin-top: 15px;
                        padding: 10px;
                        background: #f8f9fa;
                        border: 1px solid #333;
                        border-radius: 4px;
                    }
                    
                    .observacoes h4 {
                        font-size: 11px;
                        font-weight: bold;
                        margin-bottom: 5px;
                        text-transform: uppercase;
                    }
                    
                    .observacoes p {
                        font-size: 11px;
                        line-height: 1.3;
                    }
                    
                    @media print {
                        body { margin: 0; }
                        .page { margin: 0; padding: 15mm; }
                        .ficha { page-break-inside: avoid; }
                    }
                    
                    @page {
                        size: A4;
                        margin: 15mm;
                    }
                </style>
            </head>
            <body>
                <div class="page">
                    <div class="header">
                        <h1>FICHAS DE PEDIDOS</h1>
                        <div class="header-info">
                            <span><strong>Data de Impressão:</strong> ${new Date().toLocaleString('pt-BR')}</span>
                            <span><strong>Total de Pedidos:</strong> ${pedidos.length}</span>
                        </div>
                    </div>
                    
                    ${pedidos.map(pedido => `
                        <div class="ficha">
                            <div class="ficha-header">
                                <div class="ficha-title">PEDIDO #${pedido.numeroPedido}</div>
                                <div class="ficha-status ${pedido.status === 'Pronto' ? 'status-pronto' : pedido.financeiro ? 'status-em-andamento' : 'status-pendente'}">
                                    ${pedido.status}
                                </div>
                            </div>
                            
                            <div class="ficha-content">
                                <div class="info-grid">
                                    <div class="info-item">
                                        <div class="info-label">Cliente</div>
                                        <div class="info-value">${pedido.nomeCliente}</div>
                                    </div>
                                    <div class="info-item">
                                        <div class="info-label">Cidade</div>
                                        <div class="info-value">${pedido.cidadeCliente}</div>
                                    </div>
                                    <div class="info-item">
                                        <div class="info-label">Telefone</div>
                                        <div class="info-value">${pedido.telefoneCliente || 'N/A'}</div>
                                    </div>
                                    <div class="info-item">
                                        <div class="info-label">Data de Entrega</div>
                                        <div class="info-value">${new Date(pedido.dataEntrega).toLocaleDateString('pt-BR')}</div>
                                    </div>
                                    <div class="info-item">
                                        <div class="info-label">Prioridade</div>
                                        <div class="info-value">${pedido.prioridade === 'ALTA' ? 'ALTA' : 'NORMAL'}</div>
                                    </div>
                                    <div class="info-item">
                                        <div class="info-label">Forma de Envio</div>
                                        <div class="info-value">${pedido.formaEnvio || 'N/A'}</div>
                                    </div>
                                </div>
                                
                                <div class="setores-grid">
                                    <div class="setor ${pedido.financeiro ? 'setor-aprovado' : 'setor-pendente'}">
                                        Financeiro<br>${pedido.financeiro ? '✓' : '✗'}
                                    </div>
                                    <div class="setor ${pedido.conferencia ? 'setor-aprovado' : pedido.financeiro ? 'setor-pendente' : 'setor-desabilitado'}">
                                        Conferência<br>${pedido.conferencia ? '✓' : pedido.financeiro ? '✗' : '⏸'}
                                    </div>
                                    <div class="setor ${pedido.sublimacao ? 'setor-aprovado' : pedido.financeiro ? 'setor-pendente' : 'setor-desabilitado'}">
                                        Sublimação<br>${pedido.sublimacao ? '✓' : pedido.financeiro ? '✗' : '⏸'}
                                    </div>
                                    <div class="setor ${pedido.costura ? 'setor-aprovado' : pedido.financeiro ? 'setor-pendente' : 'setor-desabilitado'}">
                                        Costura<br>${pedido.costura ? '✓' : pedido.financeiro ? '✗' : '⏸'}
                                    </div>
                                    <div class="setor ${pedido.expedicao ? 'setor-aprovado' : pedido.financeiro ? 'setor-pendente' : 'setor-desabilitado'}">
                                        Expedição<br>${pedido.expedicao ? '✓' : pedido.financeiro ? '✗' : '⏸'}
                                    </div>
                                </div>
                                
                                ${pedido.items && pedido.items.length > 0 ? `
                                    <table class="items-table">
                                        <thead>
                                            <tr>
                                                <th>Tipo</th>
                                                <th>Descrição</th>
                                                <th>Dimensões</th>
                                                <th>Quantidade</th>
                                                <th>Valor Unit.</th>
                                                <th>Valor Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${pedido.items.map(item => `
                                                <tr>
                                                    <td>${item.tipo || 'N/A'}</td>
                                                    <td>${item.descricao || 'N/A'}</td>
                                                    <td>${item.largura || '0'} x ${item.altura || '0'}</td>
                                                    <td>${item.quantidade || 1}</td>
                                                    <td>R$ ${parseFloat(item.valor || 0).toFixed(2)}</td>
                                                    <td>R$ ${(parseFloat(item.valor || 0) * (item.quantidade || 1)).toFixed(2)}</td>
                                                </tr>
                                            `).join('')}
                                        </tbody>
                                    </table>
                                    
                                    <div class="totals">
                                        <div class="total-row">
                                            <span>Valor dos Itens:</span>
                                            <span>R$ ${parseFloat(pedido.valorItens || 0).toFixed(2)}</span>
                                        </div>
                                        <div class="total-row">
                                            <span>Valor do Frete:</span>
                                            <span>R$ ${parseFloat(pedido.valorFrete || 0).toFixed(2)}</span>
                                        </div>
                                        <div class="total-row final">
                                            <span>VALOR TOTAL:</span>
                                            <span>R$ ${parseFloat(pedido.valorTotal || 0).toFixed(2)}</span>
                                        </div>
                                    </div>
                                ` : ''}
                                
                                ${pedido.observacao ? `
                                    <div class="observacoes">
                                        <h4>Observações</h4>
                                        <p>${pedido.observacao}</p>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </body>
            </html>
        `;
    };

    const toggleStatus = (index, campo) => {
        const pedido = pedidos[index];
        if (pedido[campo]) {
            setModal({ show: true, index, campo, pedido });
        } else {
            confirmarToggle(index, campo);
        }
    };

    const confirmarToggle = (index, campo) => {
        const novosPedidos = [...pedidos];
        const pedido = novosPedidos[index];
        pedido[campo] = !pedido[campo];
        setPedidos(novosPedidos);

        const status = pedido[campo] ? 'liberado' : 'removido';
        const label = campo.charAt(0).toUpperCase() + campo.slice(1);
        setToast({
            show: true,
            message: `Pedido ${pedido.numero} do cliente ${pedido.cliente} foi ${status} por ${label}`,
        });
    };

    const handleConfirm = () => {
        if (modal.index !== null && modal.campo) {
            confirmarToggle(modal.index, modal.campo);
        }
        setModal({ show: false, index: null, campo: '', pedido: null });
    };

    const handleCancel = () => {
        setModal({ show: false, index: null, campo: '', pedido: null });
    };

    return (
        <div className="home-container">
            <ToastContainer position="bottom-end" className="p-3">
                <Toast
                    bg="info"
                    onClose={() => setToast({ ...toast, show: false })}
                    show={toast.show}
                    delay={3000}
                    autohide
                >
                    <Toast.Body>{toast.message}</Toast.Body>
                </Toast>
            </ToastContainer>

            <Modal show={modal.show} onHide={handleCancel} backdrop="static" centered>
                <Modal.Header closeButton className="modal-header">
                    <Modal.Title className="modal-title">Confirmar alteração</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modal-body confirmation-modal">
                    <ExclamationTriangle size={24} className="confirmation-icon" />
                    <div className="confirmation-text">
                    Tem certeza que deseja desmarcar o passo <strong>{modal.campo}</strong> do pedido{' '}
                    <strong>{modal.pedido?.numero}</strong> do(a) cliente <strong>{modal.pedido?.cliente}</strong>?
                    </div>
                </Modal.Body>
                <Modal.Footer className="modal-footer">
                    <Button variant="secondary" onClick={handleCancel} className="btn btn-secondary">
                        Cancelar
                    </Button>
                    <Button variant="danger" onClick={handleConfirm} className="btn btn-error">
                        Desmarcar
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal
                show={previewModal.show}
                onHide={() => setPreviewModal({ show: false, pedido: null })}
                size="lg"
                centered
            >
                <Modal.Header closeButton className="modal-header">
                    <Modal.Title className="modal-title">Visualização do Pedido</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modal-body">
                    {previewModal.pedido && (
                        <Row>
                            <Col md={6}>
                                <div className="dashboard-card" style={{ marginBottom: '16px' }}>
                                    <div className="dashboard-card-header">
                                        <h6 className="dashboard-card-title">Informações do Pedido</h6>
                                        <ClipboardData className="dashboard-card-icon" />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <div>
                                            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-neutral-600)' }}>O.S:</span>
                                            <p style={{ margin: '4px 0 0 0', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-primary)' }}>
                                                {previewModal.pedido.numero}
                                            </p>
                                        </div>
                                        <div>
                                            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-neutral-600)' }}>Cliente:</span>
                                            <p style={{ margin: '4px 0 0 0', fontWeight: 'var(--font-weight-medium)' }}>
                                                {previewModal.pedido.cliente}
                                            </p>
                                        </div>
                                        <div>
                                            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-neutral-600)' }}>Data de Entrada:</span>
                                            <p style={{ margin: '4px 0 0 0' }}>{previewModal.pedido.data_entrada}</p>
                                        </div>
                                        <div>
                                            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-neutral-600)' }}>Data de Entrega:</span>
                                            <p style={{ margin: '4px 0 0 0' }}>{previewModal.pedido.data_entrega}</p>
                                        </div>
                                        <div>
                                            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-neutral-600)' }}>Status:</span>
                                            <div style={{ marginTop: '4px' }}>
                                                <span className={`badge ${previewModal.pedido.status === 'pendente' ? 'badge-warning' : 'badge-success'}`}>
                                                    {previewModal.pedido.status}
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-neutral-600)' }}>Prioridade:</span>
                                            <div style={{ marginTop: '4px' }}>
                                                {previewModal.pedido.prioridade ? (
                                                    <span className="badge badge-error">ALTA</span>
                                                ) : (
                                                    <span className="badge badge-neutral">NORMAL</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Col>
                            <Col md={6}>
                                <div className="dashboard-card">
                                    <div className="dashboard-card-header">
                                        <h6 className="dashboard-card-title">Ficha do Pedido</h6>
                                    </div>
                                    <div style={{ 
                                        background: 'var(--color-neutral-100)', 
                                        borderRadius: 'var(--border-radius)',
                                        padding: '24px',
                                        textAlign: 'center',
                                        border: '2px dashed var(--color-neutral-300)'
                                    }}>
                                        <img
                                            src="https://via.placeholder.com/300x200?text=Ficha+do+Pedido"
                                    alt="Ficha do Pedido"
                                            style={{ 
                                                maxWidth: '100%', 
                                                height: 'auto',
                                                borderRadius: 'var(--border-radius)',
                                                boxShadow: 'var(--shadow-sm)'
                                            }}
                                        />
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    )}
                </Modal.Body>
                <Modal.Footer className="modal-footer">
                    <Button variant="secondary" onClick={() => setPreviewModal({ show: false, pedido: null })} className="btn btn-secondary">
                        Fechar
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal de Confirmação para Desmarcar Setor */}
            <Modal show={confirmModal.show} onHide={() => setConfirmModal({ show: false, pedido: null, setor: '', action: '' })} centered>
                <Modal.Header closeButton className="bg-warning text-dark">
                    <Modal.Title>
                        <ExclamationTriangle size={20} className="me-2" />
                        Confirmar Alteração de Setor
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="text-center">
                        <div className="mb-3">
                            <ExclamationTriangle size={48} className="text-warning" />
                        </div>
                        <h5 className="mb-3">Tem certeza que deseja desmarcar este setor?</h5>
                        <div className="alert alert-warning">
                            <strong>Pedido:</strong> #{confirmModal.pedido?.numeroPedido}<br/>
                            <strong>Cliente:</strong> {confirmModal.pedido?.nomeCliente}<br/>
                            <strong>Setor:</strong> {confirmModal.setor?.charAt(0).toUpperCase() + confirmModal.setor?.slice(1)}
                        </div>
                        <p className="text-muted">
                            Esta ação será registrada no log do sistema e pode afetar o status geral do pedido.
                        </p>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button 
                        variant="secondary" 
                        onClick={() => setConfirmModal({ show: false, pedido: null, setor: '', action: '' })}
                    >
                        Cancelar
                    </Button>
                    <Button 
                        variant="warning" 
                        onClick={confirmarAlteracao}
                    >
                        <XCircle size={16} className="me-2" />
                        Confirmar Desmarcação
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal de Logs */}
            <Modal show={logsModal.show} onHide={() => setLogsModal({ show: false })} size="lg" centered>
                <Modal.Header closeButton className="bg-info text-white">
                    <Modal.Title>
                        <ClipboardData size={20} className="me-2" />
                        Logs de Alterações de Setores
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ maxHeight: '500px', overflowY: 'auto' }}>
                    {logs.length === 0 ? (
                        <div className="text-center py-4">
                            <ClipboardData size={48} className="text-muted mb-3" />
                            <p className="text-muted">Nenhum log de alteração encontrado.</p>
                        </div>
                    ) : (
                        <div className="logs-container">
                            {logs.map((log, index) => (
                                <div key={log.id} className={`log-entry p-3 mb-2 border-start border-4 ${
                                    log.action === 'Marcado' ? 'border-success bg-light' : 'border-warning bg-light'
                                }`}>
                                    <div className="d-flex justify-content-between align-items-start">
                                        <div className="flex-grow-1">
                                            <div className="d-flex align-items-center mb-1">
                                                <span className={`badge me-2 ${
                                                    log.action === 'Marcado' ? 'badge-success' : 'badge-warning'
                                                }`}>
                                                    {log.action}
                                                </span>
                                                <strong>#{log.numeroPedido}</strong>
                                                <span className="text-muted ms-2">- {log.cliente}</span>
                                            </div>
                                            <div className="small text-muted">
                                                <strong>Setor:</strong> {log.setor} | 
                                                <strong> Usuário:</strong> {log.usuario} | 
                                                <strong> Status:</strong> {log.statusAnterior} → {log.statusNovo}
                                            </div>
                                        </div>
                                        <div className="text-end">
                                            <small className="text-muted">
                                                {new Date(log.timestamp).toLocaleString('pt-BR')}
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button 
                        variant="secondary" 
                        onClick={() => setLogsModal({ show: false })}
                    >
                        Fechar
                    </Button>
                    <Button 
                        variant="info" 
                        onClick={() => {
                            console.log('📋 TODOS OS LOGS:', logs);
                            setToast({ show: true, message: 'Logs exportados para o console!' });
                        }}
                    >
                        <ClipboardData size={16} className="me-2" />
                        Exportar Console
                    </Button>
                </Modal.Footer>
            </Modal>

            <Row className="mb-4">
                <Col md={3}>
                    <div className="dashboard-card">
                        <div className="dashboard-card-header">
                            <h6 className="dashboard-card-title">Total de Pedidos</h6>
                            <ClipboardData className="dashboard-card-icon" />
                        </div>
                        <h3 className="dashboard-card-value">{totalPedidos}</h3>
                        <p className="dashboard-card-subtitle">Todos os pedidos cadastrados</p>
                    </div>
                </Col>
                <Col md={3}>
                    <div className="dashboard-card">
                        <div className="dashboard-card-header">
                            <h6 className="dashboard-card-title">Pendentes</h6>
                            <Clock className="dashboard-card-icon" style={{ color: 'var(--color-neutral-500)' }} />
                        </div>
                        <h3 className="dashboard-card-value" style={{ color: 'var(--color-neutral-500)' }}>{pendentes}</h3>
                        <p className="dashboard-card-subtitle">Aguardando financeiro</p>
                    </div>
                </Col>
                <Col md={3}>
                    <div className="dashboard-card">
                        <div className="dashboard-card-header">
                            <h6 className="dashboard-card-title">Em Andamento</h6>
                            <Clock className="dashboard-card-icon" style={{ color: 'var(--color-warning)' }} />
                        </div>
                        <h3 className="dashboard-card-value" style={{ color: 'var(--color-warning)' }}>{emAndamento}</h3>
                        <p className="dashboard-card-subtitle">Processando setores</p>
                    </div>
                </Col>
                <Col md={3}>
                    <div className="dashboard-card">
                        <div className="dashboard-card-header">
                            <h6 className="dashboard-card-title">Prontos</h6>
                            <CheckCircle className="dashboard-card-icon" style={{ color: 'var(--color-success)' }} />
                        </div>
                        <h3 className="dashboard-card-value" style={{ color: 'var(--color-success)' }}>{prontos}</h3>
                        <p className="dashboard-card-subtitle">Concluídos</p>
                    </div>
                </Col>
            </Row>

            <Row className="mb-4">
                <Col md={9}>
                    <div className="search-input-container">
                        <Search size={16} className="search-icon" />
                    <Form.Control
                        type="text"
                        placeholder="Buscar por número ou cliente..."
                        value={filtro}
                        onChange={(e) => setFiltro(e.target.value)}
                            className="form-control"
                    />
                    </div>
                </Col>
                <Col md={3}>
                    <Button 
                        variant="primary" 
                        onClick={() => navigate('/orders')}
                        className="btn btn-primary"
                        style={{ width: '100%' }}
                    >
                        <Plus size={16} style={{ marginRight: '8px' }} />
                        Novo Pedido
                    </Button>
                </Col>
            </Row>

            <div className="dashboard-card">
                <div className="dashboard-card-header">
                    <div className="d-flex justify-content-between align-items-center">
                        <h5 className="dashboard-card-title mb-0">Últimos Pedidos</h5>
                        <div className="d-flex gap-2">
                            <Button 
                                variant="outline-info" 
                                size="sm"
                                onClick={() => setLogsModal({ show: true })}
                                className="btn-outline"
                            >
                                <ClipboardData size={14} className="me-1" />
                                Ver Logs
                            </Button>
                            <Button 
                                variant="outline-info" 
                                size="sm"
                                onClick={() => imprimirConteudo(pedidos.filter(p => pedidosSelecionados.includes(p.id)), `${pedidosSelecionados.length} pedido(s)`)}
                                disabled={pedidosSelecionados.length === 0}
                                className="btn-outline me-2"
                                title={pedidosSelecionados.length === 0 ? 'Selecione pedidos para visualizar' : `Visualizar ${pedidosSelecionados.length} pedido(s)`}
                            >
                                <Eye size={14} className="me-1" />
                                Visualizar {pedidosSelecionados.length > 0 && `(${pedidosSelecionados.length})`}
                            </Button>
                            <Button 
                                variant="outline-success" 
                                size="sm"
                                onClick={imprimirPedidos}
                                disabled={pedidosSelecionados.length === 0}
                                className="btn-outline"
                                title={pedidosSelecionados.length === 0 ? 'Selecione pedidos para imprimir' : `Imprimir ${pedidosSelecionados.length} pedido(s)`}
                            >
                                <Printer size={14} className="me-1" />
                                Imprimir {pedidosSelecionados.length > 0 && `(${pedidosSelecionados.length})`}
                            </Button>
                        </div>
                    </div>
                </div>
                <div className="table-container">
                    <Table hover responsive className="table">
                        <thead>
                            <tr>
                                <th>
                                    <input
                                        type="checkbox"
                                        checked={pedidosSelecionados.length === pedidosFiltrados.length && pedidosFiltrados.length > 0}
                                        onChange={selecionarTodos}
                                        className="form-check-input"
                                        title="Selecionar todos"
                                    />
                                </th>
                                <th>Nº Pedido</th>
                                <th>Cliente</th>
                                <th>Status</th>
                                <th>Prioridade</th>
                                <th>Data Entrega</th>
                                <th>Financeiro</th>
                                <th>Conferência</th>
                                <th>Sublimação</th>
                                <th>Costura</th>
                                <th>Expedição</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pedidosFiltrados.map((pedido, index) => (
                                <tr key={pedido.id || index}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={pedidosSelecionados.includes(pedido.id)}
                                            onChange={() => toggleSelecaoPedido(pedido.id)}
                                            className="form-check-input"
                                            title="Selecionar para impressão"
                                        />
                                    </td>
                                    <td>
                                        <span style={{ 
                                            fontFamily: 'var(--font-family-mono)', 
                                            fontWeight: 'var(--font-weight-semibold)',
                                            color: 'var(--color-primary)'
                                        }}>
                                            #{pedido.numeroPedido}
                                        </span>
                                    </td>
                                    <td>
                                        <div>
                                            <div style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                                                {pedido.nomeCliente || 'Sem nome'}
                                            </div>
                                            {pedido.cidadeCliente && (
                                                <small className="text-muted">{pedido.cidadeCliente}</small>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        {pedido.status === 'Pronto' ? (
                                            <span className="badge badge-success">
                                                <CheckCircle size={10} className="me-1" />
                                                Pronto
                                            </span>
                                        ) : pedido.financeiro ? (
                                            <span className="badge badge-warning">
                                                <Clock size={10} className="me-1" />
                                                Em Andamento
                                            </span>
                                        ) : (
                                            <span className="badge badge-neutral">
                                                <Clock size={10} className="me-1" />
                                                Pendente
                                            </span>
                                        )}
                                    </td>
                                    <td>
                                        {pedido.prioridade === true || pedido.prioridade === 'ALTA' ? (
                                            <span className="badge badge-error">Alta</span>
                                        ) : (
                                            <span className="badge badge-neutral">Normal</span>
                                        )}
                                    </td>
                                    <td>
                                        {pedido.dataEntrega ? new Date(pedido.dataEntrega).toLocaleDateString('pt-BR') : 'Não definida'}
                                    </td>
                                    <td className="setor-cell">
                                        <Tooltip content={pedido.financeiro ? "Financeiro aprovado" : "Financeiro pendente"} position="top">
                                            <input
                                                type="checkbox"
                                                className="setor-checkbox"
                                                checked={pedido.financeiro || false}
                                                onChange={() => toggleSetor(pedido.id, 'financeiro')}
                                            />
                                        </Tooltip>
                                    </td>
                                    <td className="setor-cell">
                                        <Tooltip content={pedido.conferencia ? "Conferência concluída" : pedido.financeiro ? "Conferência pendente" : "Aguarde aprovação do Financeiro"} position="top">
                                            <input
                                                type="checkbox"
                                                className="setor-checkbox"
                                                checked={pedido.conferencia || false}
                                                disabled={!pedido.financeiro}
                                                onChange={() => toggleSetor(pedido.id, 'conferencia')}
                                            />
                                        </Tooltip>
                                    </td>
                                    <td className="setor-cell">
                                        <Tooltip content={pedido.sublimacao ? "Sublimação concluída" : pedido.financeiro ? "Sublimação pendente" : "Aguarde aprovação do Financeiro"} position="top">
                                            <input
                                                type="checkbox"
                                                className="setor-checkbox"
                                                checked={pedido.sublimacao || false}
                                                disabled={!pedido.financeiro}
                                                onChange={() => toggleSetor(pedido.id, 'sublimacao')}
                                            />
                                        </Tooltip>
                                    </td>
                                    <td className="setor-cell">
                                        <Tooltip content={pedido.costura ? "Costura concluída" : pedido.financeiro ? "Costura pendente" : "Aguarde aprovação do Financeiro"} position="top">
                                            <input
                                                type="checkbox"
                                                className="setor-checkbox"
                                                checked={pedido.costura || false}
                                                disabled={!pedido.financeiro}
                                                onChange={() => toggleSetor(pedido.id, 'costura')}
                                            />
                                        </Tooltip>
                                    </td>
                                    <td className="setor-cell">
                                        <Tooltip content={pedido.expedicao ? "Expedição concluída" : pedido.financeiro ? "Expedição pendente" : "Aguarde aprovação do Financeiro"} position="top">
                                            <input
                                                type="checkbox"
                                                className="setor-checkbox"
                                                checked={pedido.expedicao || false}
                                                disabled={!pedido.financeiro}
                                                onChange={() => toggleSetor(pedido.id, 'expedicao')}
                                            />
                                        </Tooltip>
                                    </td>
                                    <td>
                                        <div className="d-flex gap-2">
                                            <Tooltip content="Visualizar detalhes do pedido" position="top">
                                                <button
                                                    onClick={() => setPreviewModal({ show: true, pedido })}
                                                    className="action-button btn-outline"
                                                >
                                                    <Eye size={14} />
                                                    Ver
                                                </button>
                                            </Tooltip>
                                            <Tooltip content="Imprimir ficha do pedido" position="top">
                                                <button
                                                    onClick={() => imprimirPedidoIndividual(pedido)}
                                                    className="action-button btn-outline-success"
                                                >
                                                    <Printer size={14} />
                                                    Imprimir
                                                </button>
                                            </Tooltip>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            </div>
        </div>
    );
};

export default Home;
