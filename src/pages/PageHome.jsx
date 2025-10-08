import React, { useState, useEffect, useRef, useMemo } from 'react';
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
    Calendar,
    CurrencyDollar,
    FileText,
    PencilSquare,
    Trash,
    ArrowClockwise,
} from 'react-bootstrap-icons';
import { updatePedido, getAllPedidos, getPedidosByStatus } from '../services/api';
import { fecharDia } from '../utils/fechamento';
import { criarPedidosFakesNaAPI } from '../utils/pedidosFaker';
import { limparPedidosFakes } from '../utils/pedidosCleanup';
import { salvarFiltrosHome, obterFiltrosHome, atualizarPedidoPendente, isPedidoConcluido, forcarBackupPedidosPendentes, mesclarPedidosComProtecao } from '../utils/localStorageHelper';
import pedidosCache from '../utils/pedidosCache';
import syncManager from '../utils/syncManager';
import { convertApiPedidosToList, convertApiPedidoToFormData, convertFormDataToApiPedido } from '../utils/apiConverter';
import Tooltip from '../components/Tooltip';
import KanbanBoard from '../components/KanbanBoard';
import EditOrderModal from '../components/EditOrderModal';
import CustomAlertModal from '../components/CustomAlertModal';
import LogsModal from '../components/LogsModal';
import useCustomAlert from '../hooks/useCustomAlert';
import CustomCheckbox from '../components/CustomCheckbox';
import logger from '../utils/logger';
import CollapsibleFilters from '../components/CollapsibleFilters';
import '../styles/collapsible-filters.css';


const Home = () => {
    const navigate = useNavigate();
    const customAlert = useCustomAlert();
    const [pedidos, setPedidos] = useState([]);
    const [erro, setErro] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '' });
    const [modal, setModal] = useState({ show: false, index: null, campo: '', pedido: null });
    const [previewModal, setPreviewModal] = useState({ show: false, pedido: null });
    const [confirmModal, setConfirmModal] = useState({ show: false, pedido: null, setor: '', action: '' });
    const [pedidosSelecionados, setPedidosSelecionados] = useState([]);
    const filtrosSalvos = obterFiltrosHome() || {};
    const [filtro, setFiltro] = useState(filtrosSalvos.filtro || '');
    const [editModal, setEditModal] = useState({ show: false, pedido: null });
    const [filtroApenasProntos, setFiltroApenasProntos] = useState(!!filtrosSalvos.filtroApenasProntos || false);
    const [filtrosAvancados, setFiltrosAvancados] = useState({ 
        status: filtrosSalvos.status || 'all', 
        tipo: filtrosSalvos.tipo || 'all', 
        dataInicio: filtrosSalvos.dataInicio || '', 
        dataFim: filtrosSalvos.dataFim || '' 
    });
    const [logsModal, setLogsModal] = useState({ show: false });
    const [cacheStats, setCacheStats] = useState(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [pendingPedidosStats, setPendingPedidosStats] = useState(null);
    const [isLoadingLista, setIsLoadingLista] = useState(false);
    const [imageModal, setImageModal] = useState({ show: false, src: '', alt: '' });
    const [viewMode, setViewMode] = useState('table'); // 'table' | 'kanban'
    const [listScope, setListScope] = useState('ativos'); // 'ativos' | 'hoje' | 'todos'
    const TODOS_PAGE_SIZE = 50;
    const [todosPeriod, setTodosPeriod] = useState('7'); // '7' | '30' | 'all'
    const [todosBase, setTodosBase] = useState([]); // lista completa formatada
    const [todosAll, setTodosAll] = useState([]); // após filtro por período
    const [todosIndex, setTodosIndex] = useState(0);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMoreTodos, setHasMoreTodos] = useState(false);
    const sentinelRef = useRef(null);
    const [isSeeding, setIsSeeding] = useState(false);
    const [seedProgress, setSeedProgress] = useState({ current: 0, total: 0, sucesso: 0, falhas: 0 });
    const [isCleaning, setIsCleaning] = useState(false);
    const [cleanProgress, setCleanProgress] = useState({ current: 0, total: 0, sucesso: 0, falhas: 0 });
    const [isClosing, setIsClosing] = useState(false);
    const [closeDate, setCloseDate] = useState(() => new Date());
    const [isAutoRefreshing, setIsAutoRefreshing] = useState(false);

    const atualizarStatsPedidosPendentes = () => {
        const stats = pedidosCache.getPendingPedidosStats();
        setPendingPedidosStats(stats);
    };

    const carregarListaPorScope = async (scope) => {
        setIsLoadingLista(true);
        try {
            // 🔒 PROTEÇÃO: Fazer backup dos pedidos atuais antes de carregar
            console.log('🔒 Fazendo backup de proteção antes de carregar lista...');
            forcarBackupPedidosPendentes(pedidos);
            
            // Sincronizar pedidos pendentes do localStorage primeiro
            pedidosCache.syncPendingPedidos();
            // Atualizar estatísticas
            atualizarStatsPedidosPendentes();
            if (scope === 'ativos') {
                const [pend, prod] = await Promise.all([
                    getPedidosByStatus('pendente'),
                    getPedidosByStatus('em_producao')
                ]);
                const data = [
                    ...(Array.isArray(pend.data) ? pend.data : []),
                    ...(Array.isArray(prod.data) ? prod.data : [])
                ];
                const pedidosApi = convertApiPedidosToList(data);
                const pedidosFormatados = pedidosApi.map((pedido) => ({
                    ...pedido,
                    prioridade: pedido.prioridade === "ALTA",
                    dataCriacao: pedido.dataCriacao || new Date().toISOString(),
                    status: pedido.status || 'Pendente'
                }));
                
                // 🔒 PROTEÇÃO: Mesclar com pedidos pendentes do localStorage
                const pedidosProtegidos = mesclarPedidosComProtecao(pedidosFormatados);
                
                setPedidos(pedidosProtegidos);
                setErro(false);
            } else if (scope === 'hoje') {
                const response = await getAllPedidos();
                const pedidosApi = convertApiPedidosToList(response.data || []);
                const todayStr = new Date().toISOString().slice(0,10);
                const pedidosHoje = pedidosApi.filter(p => {
                    const de = (p.dataEntrada || '').slice(0,10);
                    const dd = (p.dataEntrega || '').slice(0,10);
                    return de === todayStr || dd === todayStr;
                }).map((pedido) => ({
                    ...pedido,
                    prioridade: pedido.prioridade === "ALTA",
                    dataCriacao: pedido.dataCriacao || new Date().toISOString(),
                    status: pedido.status || 'Pendente'
                }));
                setPedidos(pedidosHoje);
                setErro(false);
            } else { // 'todos'
                const response = await getAllPedidos();
                const pedidosApi = convertApiPedidosToList(response.data || []);
                const base = pedidosApi.map((pedido) => ({
                    ...pedido,
                    prioridade: pedido.prioridade === "ALTA",
                    dataCriacao: pedido.dataCriacao || new Date().toISOString(),
                    status: pedido.status || 'Pendente'
                }));
                setTodosBase(base);
                // aplicar filtro por período
                const filtrarPorPeriodo = (lista, periodKey) => {
                    if (periodKey === 'all') return lista;
                    const dias = periodKey === '7' ? 7 : 30;
                    const hoje = new Date();
                    const inicio = new Date(hoje);
                    inicio.setDate(hoje.getDate() - dias + 1);
                    const inRange = (dstr) => {
                        if (!dstr) return false;
                        const d = new Date(dstr);
                        // Zerar horas
                        const dd = new Date(d.getFullYear(), d.getMonth(), d.getDate());
                        const di = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate());
                        const dh = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
                        return dd >= di && dd <= dh;
                    };
                    return lista.filter(p => inRange(p.dataEntrada) || inRange(p.dataEntrega));
                };
                const filtrada = filtrarPorPeriodo(base, todosPeriod);
                setTodosAll(filtrada);
                const firstSlice = filtrada.slice(0, TODOS_PAGE_SIZE);
                setPedidos(firstSlice);
                setTodosIndex(firstSlice.length);
                setHasMoreTodos(filtrada.length > firstSlice.length);
                setErro(false);
            }
        } catch (error) {
            console.error('Erro ao carregar pedidos (scope):', scope, error);
            setPedidos([]);
            setErro(true);
        } finally {
            setIsLoadingLista(false);
        }
    };

    useEffect(() => {
        carregarListaPorScope(listScope);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [listScope]);

    // Inicializar estatísticas dos pedidos pendentes e verificar pedidos perdidos
    useEffect(() => {
        atualizarStatsPedidosPendentes();
        
        // 🔍 Verificar se há pedidos perdidos ao inicializar
        setTimeout(() => {
            try {
                const pedidosPerdidos = pedidosCache.verificarPedidosPerdidos();
                if (pedidosPerdidos.length > 0) {
                    console.warn(`⚠️ Encontrados ${pedidosPerdidos.length} pedidos perdidos ao inicializar!`);
                    setToast({ 
                        show: true, 
                        message: `⚠️ ${pedidosPerdidos.length} pedidos perdidos detectados! Use o botão 🔄 para recuperar.` 
                    });
                }
            } catch (error) {
                console.error('Erro ao verificar pedidos perdidos na inicialização:', error);
            }
        }, 2000); // Aguardar 2 segundos para a página carregar completamente
    }, []);

    // Reaplicar período quando estiver no escopo 'todos'
    useEffect(() => {
        if (listScope !== 'todos') return;
        const filtrar = () => {
            const periodKey = todosPeriod;
            const lista = todosBase;
            const filtrarPorPeriodo = (listaIn, key) => {
                if (key === 'all') return listaIn;
                const dias = key === '7' ? 7 : 30;
                const hoje = new Date();
                const inicio = new Date(hoje);
                inicio.setDate(hoje.getDate() - dias + 1);
                const inRange = (dstr) => {
                    if (!dstr) return false;
                    const d = new Date(dstr);
                    const dd = new Date(d.getFullYear(), d.getMonth(), d.getDate());
                    const di = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate());
                    const dh = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
                    return dd >= di && dd <= dh;
                };
                return listaIn.filter(p => inRange(p.dataEntrada) || inRange(p.dataEntrega));
            };
            const filtrada = filtrarPorPeriodo(lista, periodKey);
            setTodosAll(filtrada);
            const firstSlice = filtrada.slice(0, TODOS_PAGE_SIZE);
            setPedidos(firstSlice);
            setTodosIndex(firstSlice.length);
            setHasMoreTodos(filtrada.length > firstSlice.length);
        };
        filtrar();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [todosPeriod]);

    const carregarMaisTodos = async () => {
        if (!hasMoreTodos || isLoadingMore) return;
        setIsLoadingMore(true);
        try {
            const nextIndex = todosIndex + TODOS_PAGE_SIZE;
            const slice = todosAll.slice(todosIndex, nextIndex);
            setPedidos(prev => [...prev, ...slice]);
            setTodosIndex(nextIndex);
            setHasMoreTodos(nextIndex < todosAll.length);
        } finally {
            setIsLoadingMore(false);
        }
    };

    // IntersectionObserver para scroll infinito em 'todos'
    useEffect(() => {
        if (listScope !== 'todos') return;
        const el = sentinelRef.current;
        if (!el) return;
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    carregarMaisTodos();
                }
            });
        }, { root: null, rootMargin: '200px', threshold: 0 });
        observer.observe(el);
        return () => observer.disconnect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [listScope, sentinelRef.current, hasMoreTodos, isLoadingMore, todosIndex, todosAll]);

    // Atualização automática leve para 'ativos' a cada 30s
    useEffect(() => {
        if (listScope !== 'ativos') return;
        let timerId = null;
        const refreshAtivosQuietly = async () => {
            if (isAutoRefreshing) return;
            setIsAutoRefreshing(true);
            try {
                // 🔒 PROTEÇÃO: Fazer backup dos pedidos atuais antes da atualização
                console.log('🔒 Fazendo backup de proteção antes da atualização automática...');
                forcarBackupPedidosPendentes(pedidos);
                
                const [pend, prod] = await Promise.all([
                    getPedidosByStatus('pendente'),
                    getPedidosByStatus('em_producao')
                ]);
                const data = [
                    ...(Array.isArray(pend.data) ? pend.data : []),
                    ...(Array.isArray(prod.data) ? prod.data : [])
                ];
                const pedidosApi = convertApiPedidosToList(data);
                const pedidosFormatados = pedidosApi.map((pedido) => ({
                    ...pedido,
                    prioridade: pedido.prioridade === "ALTA",
                    dataCriacao: pedido.dataCriacao || new Date().toISOString(),
                    status: pedido.status || 'Pendente'
                }));
                
                // 🔒 PROTEÇÃO: Mesclar com pedidos pendentes do localStorage
                const pedidosProtegidos = mesclarPedidosComProtecao(pedidosFormatados);
                
                setPedidos(pedidosProtegidos);
            } catch (_) {
                // silencioso
            } finally {
                setIsAutoRefreshing(false);
            }
        };
        timerId = setInterval(refreshAtivosQuietly, 5000); // 5 segundos para sincronização ultra-rápida
        return () => { if (timerId) clearInterval(timerId); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [listScope, isAutoRefreshing]);

    // 🚀 SINCRONIZAÇÃO EM TEMPO REAL - Listener para mudanças de outras abas/clientes
    useEffect(() => {
        // Listener para quando um pedido é criado
        const unsubscribeCreated = syncManager.on('pedido:created', (data) => {
            console.log('🆕 Pedido criado em outra aba/cliente - atualizando...', data);
            if (listScope === 'ativos' || listScope === 'hoje') {
                carregarListaPorScope(listScope);
            }
        });

        // Listener para quando um pedido é atualizado
        const unsubscribeUpdated = syncManager.on('pedido:updated', (data) => {
            console.log('✏️ Pedido atualizado em outra aba/cliente - atualizando...', data);
            carregarListaPorScope(listScope);
        });

        // Listener para quando um pedido é deletado
        const unsubscribeDeleted = syncManager.on('pedido:deleted', (data) => {
            console.log('🗑️ Pedido deletado em outra aba/cliente - atualizando...', data);
            carregarListaPorScope(listScope);
        });

        // Cleanup - remover listeners ao desmontar
        return () => {
            unsubscribeCreated();
            unsubscribeUpdated();
            unsubscribeDeleted();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [listScope]);

    // Função para sincronizar com a API
    const sincronizarCache = async () => {
        setIsSyncing(true);
        try {
            await pedidosCache.forceSync();
            const pedidosAtualizados = await pedidosCache.getPedidos();
            
            const pedidosFormatados = pedidosAtualizados.map((pedido) => ({
                ...pedido,
                prioridade: pedido.prioridade === "ALTA",
                dataCriacao: pedido.dataCriacao || new Date().toISOString(),
                status: pedido.status || 'Pendente'
            }));
            
            setPedidos(pedidosFormatados);
            setCacheStats(pedidosCache.getCacheStats());
            
            setToast({
                show: true,
                message: 'Cache sincronizado com sucesso!'
            });
        } catch (error) {
            console.error('Erro ao sincronizar cache:', error);
            setToast({
                show: true,
                message: 'Erro ao sincronizar cache. Tente novamente.'
            });
        } finally {
            setIsSyncing(false);
        }
    };

    const gerarPedidosFakes = async (quantidade = 100) => {
        if (isSeeding) return;
        setIsSeeding(true);
        setSeedProgress({ current: 0, total: quantidade, sucesso: 0, falhas: 0 });
        try {
            const resultado = await criarPedidosFakesNaAPI(quantidade, (p) => setSeedProgress(p));
            setToast({ show: true, message: `Seed concluído: ${resultado.sucesso} sucesso(s), ${resultado.falhas} falha(s)` });
            // Atualiza a lista após inserir
            await sincronizarCache();
        } catch (e) {
            console.error('Erro ao gerar pedidos fakes:', e);
            setToast({ show: true, message: 'Erro ao gerar pedidos fakes' });
        } finally {
            setIsSeeding(false);
        }
    };

    const limparFakes = async () => {
        if (isCleaning) return;
        setIsCleaning(true);
        setCleanProgress({ current: 0, total: 0, sucesso: 0, falhas: 0 });
        try {
            const result = await limparPedidosFakes((p) => setCleanProgress(p));
            setToast({ show: true, message: `Limpeza concluída: ${result.sucesso} removido(s), ${result.falhas} falha(s)` });
            await sincronizarCache();
        } catch (e) {
            console.error('Erro ao limpar pedidos fakes:', e);
            setToast({ show: true, message: 'Erro ao limpar pedidos fakes' });
        } finally {
            setIsCleaning(false);
        }
    };

    const fecharDiario = async (date) => {
        if (isClosing) return;
        setIsClosing(true);
        try {
            const snapshot = await fecharDia(date || new Date(), pedidos);
            setToast({ show: true, message: `Fechamento criado: ${snapshot.id}` });
        } catch (e) {
            console.error('Erro ao fechar dia:', e);
            setToast({ show: true, message: 'Erro ao realizar fechamento' });
        } finally {
            setIsClosing(false);
        }
    };


    const aplicaFiltros = (lista) => {
        const texto = filtro.trim().toLowerCase();
        const inicio = filtrosAvancados.dataInicio ? new Date(filtrosAvancados.dataInicio) : null;
        const fim = filtrosAvancados.dataFim ? new Date(filtrosAvancados.dataFim) : null;
        return lista.filter(p => {
            const matchTexto = !texto || `${p.numeroPedido}`.toLowerCase().includes(texto) || (p.nomeCliente||'').toLowerCase().includes(texto);
            const statusPadrao = (p.status||'').toString().toLowerCase();
            const matchStatus = filtrosAvancados.status === 'all' || statusPadrao === filtrosAvancados.status;
            const matchTipo = filtrosAvancados.tipo === 'all' || (p.items||[]).some(i => (i.tipoProducao||i.tipo||i.tipo_producao||'').toLowerCase() === filtrosAvancados.tipo);
            const dataP = p.dataEntrada ? new Date(p.dataEntrada) : null;
            const matchData = (!inicio || (dataP && dataP >= inicio)) && (!fim || (dataP && dataP <= fim));
            const matchPronto = !filtroApenasProntos || statusPadrao === 'pronto';
            return matchTexto && matchStatus && matchTipo && matchData && matchPronto;
        });
    };
    // persistir quando filtros mudarem
    useEffect(() => {
        salvarFiltrosHome({
            filtro,
            filtroApenasProntos,
            status: filtrosAvancados.status,
            tipo: filtrosAvancados.tipo,
            dataInicio: filtrosAvancados.dataInicio,
            dataFim: filtrosAvancados.dataFim
        });
    }, [filtro, filtroApenasProntos, filtrosAvancados]);

    const filtroDebounced = useDebouncedValue(filtro, 200);
    const pedidosFiltrados = useMemo(() => aplicaFiltros(pedidos), [pedidos, filtroDebounced, filtroApenasProntos, filtrosAvancados]);
    const pedidosOrdenados = useMemo(() => {
        const lista = [...pedidosFiltrados];
        lista.sort((a, b) => {
            const aPronto = (a.status || '').toLowerCase() === 'pronto';
            const bPronto = (b.status || '').toLowerCase() === 'pronto';
            if (aPronto === bPronto) return 0;
            return aPronto ? 1 : -1;
        });
        return lista;
    }, [pedidosFiltrados]);

    const totalPedidos = pedidosFiltrados.length;
    const pendentes = pedidosFiltrados.filter(p => !p.financeiro).length;
    const emAndamento = pedidosFiltrados.filter(p => p.financeiro && p.status !== 'Pronto').length;
    const prontos = pedidosFiltrados.filter(p => p.status === 'Pronto').length;
    const prioridades = pedidos.filter(p => p.prioridade === true || p.prioridade === 'ALTA').length;

    // pedidosFiltrados agora computado por aplicaFiltros acima

    // Função para gerar logs
    const gerarLog = (pedido, setor, action, usuario = 'Sistema') => {
        // Usar o sistema de logs centralizado
        logger.logSetorChanged(
            pedido.id,
            setor,
            action === 'marcar' ? 'checked' : 'unchecked',
            !pedido[setor],
            pedido[setor]
        );
        
        // Manter compatibilidade com o estado local de logs
        const logEntry = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            pedidoId: pedido.id,
            numeroPedido: pedido.numeroPedido,
            cliente: pedido.nomeCliente,
            setor: setor.charAt(0).toUpperCase() + setor.slice(1),
            action: action === 'marcar' ? 'Marcado' : 'Desmarcado',
            usuario,
            statusAnterior: pedido.status,
            statusNovo: action === 'marcar' ? 'Em Andamento' : 'Pendente'
        };
        
        // Adicionar log ao estado local
        
        
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
            const novoValor = action === 'marcar';
            
            // Criar pedido atualizado
            const pedidoAtualizado = {
                ...pedido,
                [setor]: novoValor
            };

            // Verificar se todos os setores estão concluídos
            const setores = ['financeiro', 'conferencia', 'sublimacao', 'costura', 'expedicao'];
            const todosConcluidos = setores.every(s => pedidoAtualizado[s] === true);
            
            pedidoAtualizado.status = todosConcluidos ? 'Pronto' : 'Em Andamento';

            // Atualizar estado local primeiro
            setPedidos(prev => prev.map(p => p.id === pedido.id ? pedidoAtualizado : p));

            // Atualizar no localStorage - remove se concluído
            atualizarPedidoPendente(pedido.id, pedidoAtualizado);
            // Atualizar estatísticas
            atualizarStatsPedidosPendentes();

            // Mostrar toast se concluído
            if (todosConcluidos) {
                setToast({ 
                    show: true, 
                    message: `Pedido #${pedidoAtualizado.numeroPedido} concluído! Status: Pronto` 
                });
            }

            // Gerar log da alteração
            gerarLog(pedidoAtualizado, setor, action);

            // Tentar atualizar na API
            try {
                // Garantir que o pedido tenha todos os campos necessários
                const pedidoCompleto = {
                    ...pedidoAtualizado,
                    items: pedidoAtualizado.items || [],
                    numeroPedido: pedidoAtualizado.numeroPedido || pedidoAtualizado.numero || '',
                    nomeCliente: pedidoAtualizado.nomeCliente || pedidoAtualizado.cliente || '',
                    telefoneCliente: pedidoAtualizado.telefoneCliente || pedidoAtualizado.telefone_cliente || '',
                    cidadeCliente: pedidoAtualizado.cidadeCliente || pedidoAtualizado.cidade_cliente || '',
                    dataEntrada: pedidoAtualizado.dataEntrada || pedidoAtualizado.data_entrada || '',
                    dataEntrega: pedidoAtualizado.dataEntrega || pedidoAtualizado.data_entrega || '',
                    valorTotal: pedidoAtualizado.valorTotal || pedidoAtualizado.valor_total || '0',
                    valorFrete: pedidoAtualizado.valorFrete || pedidoAtualizado.valor_frete || '0',
                    formaEnvio: pedidoAtualizado.formaEnvio || pedidoAtualizado.forma_envio || '',
                    tipoPagamento: pedidoAtualizado.tipoPagamento || pedidoAtualizado.tipo_pagamento || '',
                    observacao: pedidoAtualizado.observacao || ''
                };
                
                const apiPedido = convertFormDataToApiPedido(pedidoCompleto);
                console.log('Enviando para API:', apiPedido);
                
            await updatePedido(pedido.id, apiPedido);
                console.log('Pedido atualizado na API com sucesso');
            
            // Atualizar no cache local
                pedidosCache.updatePedido(pedido.id, pedidoCompleto);
                
            } catch (apiError) {
                console.error('Erro na API:', apiError);
                
                // Se falhou na API, mostrar erro mas manter mudança local
                setToast({
                    show: true,
                    message: `Setor ${setor} atualizado localmente. Erro na sincronização: ${apiError.message || 'Erro desconhecido'}`
                });
            }

        } catch (error) {
            console.error('Erro geral:', error);
            
            setToast({
                show: true,
                message: `Erro ao atualizar setor ${setor}: ${error.message || 'Erro desconhecido'}`
            });
            
            // Reverter mudança local em caso de erro
            setPedidos(prev => prev.map(p => p.id === pedido.id ? pedido : p));
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
        if (pedidosSelecionados.length === pedidosOrdenados.length) {
            setPedidosSelecionados([]);
        } else {
            setPedidosSelecionados(pedidosOrdenados.map(p => p.id));
        }
    };

    const imprimirPedidos = () => {
        console.log('🔍 IMPRIMIR MULTIPLOS - Chamada com pedidosSelecionados:', pedidosSelecionados);
        
        if (pedidosSelecionados.length === 0) {
            setToast({ show: true, message: 'Selecione pelo menos um pedido para imprimir!' });
            return;
        }

        const pedidosParaImprimir = pedidos.filter(p => pedidosSelecionados.includes(p.id));
        console.log('🔍 IMPRIMIR MULTIPLOS - Filtrados:', {
            quantidade: pedidosParaImprimir.length,
            ids: pedidosParaImprimir.map(p => p.id),
            nomes: pedidosParaImprimir.map(p => p.nomeCliente)
        });
        
        // Log da impressão
        logger.logPrint(pedidosSelecionados, 'multiple');
        
        imprimirConteudo(pedidosParaImprimir, `${pedidosParaImprimir.length} pedido(s)`);
    };

    const imprimirPedidoIndividual = (pedido) => {
        console.log('🔍 IMPRIMIR INDIVIDUAL - Pedido recebido:', {
            id: pedido.id,
            numeroPedido: pedido.numeroPedido,
            nomeCliente: pedido.nomeCliente
        });
        
        // Log da impressão individual
        logger.logPrint(pedido.id, 'individual');
        
        // Criar array com apenas este pedido
        const pedidosParaImprimir = [pedido];
        console.log('🔍 IMPRIMIR INDIVIDUAL - Array criado com', pedidosParaImprimir.length, 'pedido(s)');
        
        imprimirConteudo(pedidosParaImprimir, `Pedido #${pedido.numeroPedido}`);
    };

    const handleEditPedido = (pedido) => {
        setEditModal({ show: true, pedido });
    };

    const handlePedidoUpdated = (pedidoAtualizado) => {
        setPedidos(prev => prev.map(p => p.id === pedidoAtualizado.id ? pedidoAtualizado : p));
        setEditModal({ show: false, pedido: null });
        
        // Atualizar no localStorage - remove se concluído
        atualizarPedidoPendente(pedidoAtualizado.id, pedidoAtualizado);
        // Atualizar estatísticas
        atualizarStatsPedidosPendentes();
        
        // Log da atualização
        logger.log('PEDIDO_UPDATED_IN_LIST', {
            pedidoId: pedidoAtualizado.id,
            numeroPedido: pedidoAtualizado.numeroPedido
        }, 'info');
    };

    const handlePedidoDeleted = (pedidoId) => {
        setPedidos(prev => prev.filter(p => p.id !== pedidoId));
        setEditModal({ show: false, pedido: null });
        
        // Remover da seleção se estiver selecionado
        setPedidosSelecionados(prev => prev.filter(id => id !== pedidoId));
        
        // Log da remoção
        logger.log('PEDIDO_DELETED_FROM_LIST', {
            pedidoId: pedidoId
        }, 'info');
    };

    const handleImageClick = (imageSrc, imageAlt) => {
        setImageModal({ 
            show: true, 
            src: imageSrc, 
            alt: imageAlt || 'Imagem do item' 
        });
    };

    const closeImageModal = () => {
        setImageModal({ show: false, src: '', alt: '' });
    };

    // Mover pedido para uma coluna específica do Kanban ajustando setores
    const movePedidoToColumn = async (pedido, targetKey) => {
        const orderedKeys = ['Financeiro','Conferência','Sublimação','Costura','Expedição','Pronto'];
        const fieldByKey = {
            'Financeiro': 'financeiro',
            'Conferência': 'conferencia',
            'Sublimação': 'sublimacao',
            'Costura': 'costura',
            'Expedição': 'expedicao'
        };
        const steps = ['financeiro','conferencia','sublimacao','costura','expedicao'];
        const targetIdx = orderedKeys.indexOf(targetKey);
        if (targetIdx === -1) return;

        const desired = { financeiro: false, conferencia: false, sublimacao: false, costura: false, expedicao: false };
        if (targetKey === 'Pronto') {
            steps.forEach(s => desired[s] = true);
        } else {
            const idx = steps.indexOf(fieldByKey[targetKey]);
            // anteriores verdadeiros
            steps.slice(0, idx).forEach(s => desired[s] = true);
            // alvo e posteriores falsos
            steps.slice(idx).forEach(s => desired[s] = false);
        }

        const needUncheck = steps.some(s => (pedido[s] || false) && desired[s] === false);
        if (needUncheck) {
            const confirm = window.confirm('Mover para esta coluna irá reabrir etapas seguintes. Deseja continuar?');
            if (!confirm) return;
        }

        // Executar alterações em sequência para evitar conflitos
        for (const s of steps) {
            const current = !!pedido[s];
            const want = !!desired[s];
            if (current === want) continue;
            await executarAlteracaoSetor(pedido, s, want ? 'marcar' : 'desmarcar');
        }
    };

    // Adicionar suporte ao ESC para fechar modal de imagem
    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.key === 'Escape' && imageModal.show) {
                closeImageModal();
            }
        };

        if (imageModal.show) {
            document.addEventListener('keydown', handleKeyPress);
            // Prevenir scroll do body quando modal está aberto
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.removeEventListener('keydown', handleKeyPress);
            document.body.style.overflow = 'unset';
        };
    }, [imageModal.show]);

    // Função para formatar acabamentos específicos por tipo de produção
    const formatarAcabamentos = (item) => {
        if (!item.acabamento || typeof item.acabamento !== 'object') return 'Nenhum';
        
        const acabamentos = [];
        const tipoProducao = item.tipoProducao || item.tipo;
        
        switch (tipoProducao) {
            case 'painel':
                if (item.acabamento.overloque) acabamentos.push('Overloque');
                if (item.acabamento.elastico) acabamentos.push('Elástico');
                if (item.acabamento.ilhos) {
                    let ilhosInfo = 'Ilhós';
                    if (item.ilhosQtd) ilhosInfo += ` (${item.ilhosQtd} unidades)`;
                    if (item.ilhosDistancia) ilhosInfo += ` - Distância: ${item.ilhosDistancia}`;
                    if (item.ilhosValorUnitario) ilhosInfo += ` - Valor unit.: R$ ${item.ilhosValorUnitario}`;
                    acabamentos.push(ilhosInfo);
                }
                break;
                
            case 'totem':
                if (item.acabamento.corteReto) acabamentos.push('Corte Reto');
                if (item.acabamento.vinco) acabamentos.push('Vinco');
                if (item.acabamento.baseMadeira) acabamentos.push('Base de Madeira');
                break;
                
            case 'lona':
                if (item.acabamento.solda) acabamentos.push('Solda');
                if (item.acabamento.bastao) acabamentos.push('Bastão');
                if (item.acabamento.ilhos) acabamentos.push('Ilhós');
                break;
                
            default:
                // Para outros tipos, listar todos os acabamentos verdadeiros
                Object.entries(item.acabamento).forEach(([key, value]) => {
                    if (value) {
                        acabamentos.push(key.charAt(0).toUpperCase() + key.slice(1));
                    }
                });
        }
        
        return acabamentos.length > 0 ? acabamentos.join(', ') : 'Nenhum';
    };

    const imprimirConteudo = (pedidos, titulo) => {
        console.log('🔍 IMPRIMIR CONTEUDO - Recebido:', {
            quantidade: pedidos.length,
            titulo: titulo,
            ids: pedidos.map(p => p.id)
        });
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
        console.log('🔍 GERAR CONTEUDO - Recebido:', {
            quantidade: pedidos.length,
            ids: pedidos.map(p => p.id),
            nomes: pedidos.map(p => p.nomeCliente)
        });
        
        // Se for apenas um pedido, usar layout de ficha individual
        if (pedidos.length === 1) {
            console.log('✅ GERAR CONTEUDO - Usando layout de ficha individual para pedido:', pedidos[0].id);
            return gerarFichaIndividual(pedidos[0]);
        }
        
        // Se for múltiplos pedidos, usar layout resumido
        console.log('✅ GERAR CONTEUDO - Usando layout resumido para múltiplos pedidos');
        return gerarListaPedidosResumida(pedidos);
    };

    const gerarFichaIndividual = (pedido) => {
        console.log('🔍 FICHA INDIVIDUAL - Gerando ficha para pedido:', {
            id: pedido.id,
            numeroPedido: pedido.numeroPedido,
            nomeCliente: pedido.nomeCliente,
            quantidadeItens: pedido.items ? pedido.items.length : 0
        });
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Ficha Individual - Pedido #${pedido.numeroPedido}</title>
                <meta charset="UTF-8">
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    
                    body {
                        font-family: 'Arial', sans-serif;
                        font-size: 14px;
                        line-height: 1.4;
                        color: #000;
                        background: white;
                        padding: 20px;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    
                    .ficha-container {
                        max-width: 800px;
                        margin: 0 auto;
                        border: 2px solid #000;
                        padding: 20px;
                    }
                    
                    .page {
                        width: 210mm;
                        min-height: 297mm;
                        margin: 0 auto;
                        padding: 10mm;
                        background: white;
                        position: relative;
                        overflow-x: hidden;
                        box-sizing: border-box;
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
                        word-break: break-word;
                        overflow-wrap: anywhere;
                    }

                    .info-row span {
                        word-break: break-word;
                        overflow-wrap: anywhere;
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
                        table-layout: fixed;
                    }
                    
                    .items-table th,
                    .items-table td {
                        border: 1px solid #333;
                        padding: 6px;
                        text-align: left;
                        vertical-align: top;
                        word-wrap: break-word;
                        overflow-wrap: break-word;
                    }
                    
                    .items-table th {
                        background: #f8f9fa;
                        font-weight: bold;
                        text-transform: uppercase;
                        font-size: 9px;
                        line-height: 1.2;
                    }
                    
                    /* Larguras específicas das colunas */
                    .items-table th:nth-child(1) { width: 5%; } /* # */
                    .items-table th:nth-child(2) { width: 10%; } /* Tipo */
                    .items-table th:nth-child(3) { width: 20%; } /* Descrição */
                    .items-table th:nth-child(4) { width: 12%; } /* Tecido/Material */
                    .items-table th:nth-child(5) { width: 10%; } /* Dimensões */
                    .items-table th:nth-child(6) { width: 18%; } /* Detalhes */
                    .items-table th:nth-child(7) { width: 10%; } /* Vendedor/Designer */
                    .items-table th:nth-child(8) { width: 10%; } /* Valor */
                    .items-table th:nth-child(9) { width: 5%; } /* Imagem */

                    .items-table td img {
                        max-width: 60px;
                        max-height: 60px;
                        object-fit: contain;
                        display: block;
                        margin: 0 auto;
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
                        .page { margin: 0; padding: 8mm; }
                        .ficha { page-break-inside: avoid; }
                        .item-card { page-break-inside: avoid; break-inside: avoid; }
                        
                        /* Ajustes específicos para layout horizontal na impressão */
                        .item-image {
                            flex: 0 0 60% !important;
                            width: 60% !important;
                            max-width: 60% !important;
                            overflow: hidden !important;
                        }
                        
                        .item-image img,
                        .items-section .image-frame img {
                            max-width: 100% !important;
                            max-height: 600px !important;
                            width: auto !important;
                            height: auto !important;
                            object-fit: contain !important;
                            display: block !important;
                            margin: 0 auto !important;
                        }
                        
                        /* Seção de informações ocupa 40% */
                        .item-info {
                            flex: 1 !important;
                            width: 40% !important;
                            max-width: 40% !important;
                        }
                        
                        .item-details {
                            max-width: 100% !important;
                            overflow: hidden !important;
                        }
                        
                        .item-info {
                            flex-shrink: 1 !important;
                        }
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
                        <h1>FICHA DE PEDIDO</h1>
                        <div class="header-info">
                            <span><strong>Data de Impressão:</strong> ${new Date().toLocaleString('pt-BR')}</span>
                            <span><strong>Total de Pedidos:</strong> 1</span>
                        </div>
                    </div>
                    
                        <div class="ficha">
                            <div class="ficha-header">
                                <div class="ficha-title">PEDIDO #${pedido.numeroPedido}</div>
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
                                        <div class="info-value">${pedido.forma_envio || pedido.formaEnvio || 'N/A'}</div>
                                    </div>
                                    <div class="info-item">
                                        <div class="info-label">Forma de Pagamento</div>
                                    <div class="info-value">${pedido.tipo_pagamento || pedido.tipoPagamentoNome || pedido.tipoPagamento || 'N/A'}</div>
                                    </div>
                                </div>
                                
                            
                            
                            ${pedido.items && pedido.items.length > 0 ? `
                                <div class="items-section" style="page-break-inside: avoid;">
                                    <h4 style="margin-bottom: 15px; border-bottom: 2px solid #333; padding-bottom: 5px;">Itens do Pedido</h4>
                                    ${pedido.items.length > 3 ? `
                                        <table class="items-table">
                                            <thead>
                                                <tr>
                                                    <th>#</th>
                                                    <th>Tipo</th>
                                                    <th>Descrição</th>
                                                    <th>Tecido/Material</th>
                                                    <th>Dimensões</th>
                                                    <th>Detalhes</th>
                                                    <th>Vendedor/Designer</th>
                                                    <th>Valor</th>
                                                    <th>Imagem</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                ${pedido.items.map((item, index) => `
                                                    <tr>
                                                        <td>${index + 1}</td>
                                                        <td style="text-transform: capitalize;">${item.tipoProducao || item.tipo || item.tipo_producao || 'Item'}</td>
                                                        <td>${item.descricao || 'N/A'}</td>
                                                        <td>${item.tecido || item.material || '-'}</td>
                                                        <td>${item.largura || '0'} x ${item.altura || '0'}${item.area ? `<br><small>(${item.area} m²)</small>` : ''}${item.quantidade && item.quantidade !== '1' ? `<br><small>Qtd: ${item.quantidade}</small>` : ''}</td>
                                                        <td style="font-size: 10px;">
                                                            ${item.acabamento && Object.entries(item.acabamento).filter(([k,v])=>v).length > 0 ? `<strong>Acab:</strong> ${formatarAcabamentos(item)}<br>` : ''}
                                                            ${item.emenda && item.emenda !== 'sem-emenda' ? `<strong>Emenda:</strong> ${item.emenda.replace('-', ' ')}<br>` : ''}
                                                            ${item.enchimento ? `<strong>Ench:</strong> ${item.enchimento === 'com' ? 'Com' : 'Sem'}<br>` : ''}
                                                            ${item.cor ? `<strong>Cor:</strong> ${item.cor}<br>` : ''}
                                                            ${item.fecho ? `<strong>Fecho:</strong> ${item.fecho}<br>` : ''}
                                                            ${item.alcaAjustavel ? `<strong>Alça ajustável</strong><br>` : ''}
                                                            ${item.ilhosQtd ? `<strong>Ilhós:</strong> ${item.ilhosQtd}${item.ilhosDistancia ? ` (${item.ilhosDistancia})` : ''}<br>` : ''}
                                                            ${item.legenda ? `<strong>Legenda:</strong> ${item.legenda}` : ''}
                                                        </td>
                                                        <td style="font-size: 10px;">
                                                            ${item.vendedor ? `<strong>Vend:</strong> ${item.vendedor}<br>` : ''}
                                                            ${item.designer ? `<strong>Des:</strong> ${item.designer}` : ''}
                                                        </td>
                                                        <td>
                                                            <strong>R$ ${(() => { const v = String(item.valor || item.valor_unitario || '0').replace(/\./g, '').replace(',', '.'); return (isNaN(parseFloat(v)) ? 0 : parseFloat(v)).toFixed(2); })()}</strong>
                                                            ${item.valorAdicionais ? `<br><small>+ R$ ${item.valorAdicionais}</small>` : ''}
                                                        </td>
                                                        <td>${item.imagem ? `<img src="${item.imagem}" alt="Imagem do item" />` : '-'}</td>
                                                    </tr>
                                                `).join('')}
                                            </tbody>
                                        </table>
                                    ` : `
                                        ${pedido.items.map((item, index) => `
                                            <div class="item-card" style="border: 1px solid #333; margin-bottom: 20px; padding: 15px; page-break-inside: avoid;">
                                                <div class="item-header" style="background: #f8f9fa; margin: -15px -15px 15px -15px; padding: 10px 15px; border-bottom: 1px solid #333;">
                                                    <h5 style="margin: 0; font-size: 14px; font-weight: bold;">
                                                        ${item.tipoProducao || item.tipo || item.tipo_producao || 'Item'} #${index + 1}
                                                    </h5>
                                                </div>
                                                <div style="display: flex; gap: 20px; align-items: flex-start;">
                                                    <!-- Seção da Imagem - LADO ESQUERDO (60%) -->
                                                    <div class="item-image" style="flex: 0 0 60%; width: 60%; max-width: 60%;">
                                                        ${item.imagem ? `
                                                            <div class="image-frame" style="border: 2px solid #ddd; padding: 15px; background: #f8f9fa; border-radius: 8px; text-align: center; width: 100%;">
                                                                <div style="font-size: 12px; color: #666; margin-bottom: 10px; text-transform: uppercase; font-weight: bold;">Imagem do Item</div>
                                                                <img src="${item.imagem}" alt="Imagem do item" style="max-width: 100%; max-height: 600px; width: auto; height: auto; object-fit: contain; border-radius: 4px; display: block; margin: 0 auto;" />
                                                            </div>
                                                        ` : `
                                                            <div class="image-frame" style="border: 2px solid #ddd; padding: 15px; background: #f8f9fa; border-radius: 8px; text-align: center; min-height: 400px; display: flex; align-items: center; justify-content: center; width: 100%;">
                                                                <div style="color: #999; font-size: 14px;">Sem imagem disponível</div>
                                                            </div>
                                                        `}
                                                    </div>
                                                    
                                                    <!-- Seção das Informações - LADO DIREITO (40%) -->
                                                    <div style="flex: 1; width: 40%; max-width: 40%;">
                                                        <div class="item-info" style="padding: 20px; background: #fafbfc; border: 1px solid #e1e5e9; border-radius: 8px; height: 100%; display: flex; flex-direction: column; gap: 15px;">
                                                            <div class="info-row">
                                                                <strong style="font-size: 14px; color: #2c3e50; display: block; margin-bottom: 8px;">Descrição do Item:</strong>
                                                                <span style="font-size: 13px; line-height: 1.4; color: #34495e; display: block;">${item.descricao || 'N/A'}</span>
                                                            </div>
                                                            
                                                            <div class="info-row">
                                                                <strong style="font-size: 13px; color: #2c3e50; display: block; margin-bottom: 5px;">Tipo de Produção:</strong>
                                                                <span style="font-size: 12px; color: #34495e; display: block; text-transform: capitalize;">${item.tipoProducao || item.tipo || 'N/A'}</span>
                                                            </div>
                                                            
                                                            <div class="info-row">
                                                                <strong style="font-size: 13px; color: #2c3e50; display: block; margin-bottom: 5px;">Dimensões:</strong>
                                                                <span style="font-size: 12px; color: #34495e; display: block;">${item.largura || '0'} x ${item.altura || '0'}${item.area ? ` (${item.area} m²)` : ''}</span>
                                                            </div>
                                                            
                                                            ${item.tecido ? `
                                                            <div class="info-row">
                                                                <strong style="font-size: 13px; color: #2c3e50; display: block; margin-bottom: 5px;">Tecido/Material:</strong>
                                                                <span style="font-size: 12px; color: #34495e; display: block;">${item.tecido}</span>
                                                            </div>` : ''}
                                                            
                                                            ${item.material ? `
                                                            <div class="info-row">
                                                                <strong style="font-size: 13px; color: #2c3e50; display: block; margin-bottom: 5px;">Material:</strong>
                                                                <span style="font-size: 12px; color: #34495e; display: block;">${item.material}</span>
                                                            </div>` : ''}
                                                            
                                                            ${item.quantidade ? `
                                                            <div class="info-row">
                                                                <strong style="font-size: 13px; color: #2c3e50; display: block; margin-bottom: 5px;">Quantidade:</strong>
                                                                <span style="font-size: 12px; color: #34495e; display: block;">${item.quantidade}</span>
                                                            </div>` : ''}
                                                            
                                                            ${item.vendedor ? `
                                                            <div class="info-row">
                                                                <strong style="font-size: 13px; color: #2c3e50; display: block; margin-bottom: 5px;">Vendedor:</strong>
                                                                <span style="font-size: 12px; color: #34495e; display: block;">${item.vendedor}</span>
                                                            </div>` : ''}
                                                            
                                                            ${item.designer ? `
                                                            <div class="info-row">
                                                                <strong style="font-size: 13px; color: #2c3e50; display: block; margin-bottom: 5px;">Designer:</strong>
                                                                <span style="font-size: 12px; color: #34495e; display: block;">${item.designer}</span>
                                                            </div>` : ''}
                                                            
                                                            ${item.acabamento && Object.entries(item.acabamento).filter(([k,v])=>v).length > 0 ? `
                                                            <div class="info-row">
                                                                <strong style="font-size: 13px; color: #2c3e50; display: block; margin-bottom: 5px;">Acabamentos:</strong>
                                                                <span style="font-size: 12px; color: #34495e; display: block;">${formatarAcabamentos(item)}</span>
                                                            </div>` : ''}
                                                            
                                                            ${item.emenda && item.emenda !== 'sem-emenda' ? `
                                                            <div class="info-row">
                                                                <strong style="font-size: 13px; color: #2c3e50; display: block; margin-bottom: 5px;">Emenda:</strong>
                                                                <span style="font-size: 12px; color: #34495e; display: block; text-transform: capitalize;">${item.emenda.replace('-', ' ')}</span>
                                                            </div>` : ''}
                                                            
                                                            ${item.enchimento ? `
                                                            <div class="info-row">
                                                                <strong style="font-size: 13px; color: #2c3e50; display: block; margin-bottom: 5px;">Enchimento:</strong>
                                                                <span style="font-size: 12px; color: #34495e; display: block; text-transform: capitalize;">${item.enchimento === 'com' ? 'Com enchimento' : 'Sem enchimento'}</span>
                                                            </div>` : ''}
                                                            
                                                            ${item.tipo && (item.tipoProducao === 'bolsinha' || item.tipo === 'bolsinha') ? `
                                                            <div class="info-row">
                                                                <strong style="font-size: 13px; color: #2c3e50; display: block; margin-bottom: 5px;">Tipo de Bolsinha:</strong>
                                                                <span style="font-size: 12px; color: #34495e; display: block; text-transform: capitalize;">${item.tipo}</span>
                                                            </div>` : ''}
                                                            
                                                            ${item.cor ? `
                                                            <div class="info-row">
                                                                <strong style="font-size: 13px; color: #2c3e50; display: block; margin-bottom: 5px;">Cor:</strong>
                                                                <span style="font-size: 12px; color: #34495e; display: block;">${item.cor}</span>
                                                            </div>` : ''}
                                                            
                                                            ${item.fecho ? `
                                                            <div class="info-row">
                                                                <strong style="font-size: 13px; color: #2c3e50; display: block; margin-bottom: 5px;">Fecho:</strong>
                                                                <span style="font-size: 12px; color: #34495e; display: block;">${item.fecho}</span>
                                                            </div>` : ''}
                                                            
                                                            ${item.alcaAjustavel ? `
                                                            <div class="info-row">
                                                                <strong style="font-size: 13px; color: #2c3e50; display: block; margin-bottom: 5px;">Alça:</strong>
                                                                <span style="font-size: 12px; color: #34495e; display: block;">Alça ajustável</span>
                                                            </div>` : ''}
                                                            
                                                            ${item.legenda ? `
                                                            <div class="info-row">
                                                                <strong style="font-size: 13px; color: #2c3e50; display: block; margin-bottom: 5px;">Legenda da Imagem:</strong>
                                                                <span style="font-size: 12px; color: #34495e; display: block; font-style: italic;">${item.legenda}</span>
                                                            </div>` : ''}
                                                            
                                                            ${item.ilhosQtd ? `
                                                            <div class="info-row">
                                                                <strong style="font-size: 13px; color: #2c3e50; display: block; margin-bottom: 5px;">Ilhós:</strong>
                                                                <span style="font-size: 12px; color: #34495e; display: block;">Qtd: ${item.ilhosQtd}${item.ilhosDistancia ? `, Dist: ${item.ilhosDistancia}` : ''}${item.ilhosValorUnitario ? `, Valor unit: R$ ${item.ilhosValorUnitario}` : ''}</span>
                                                            </div>` : ''}
                                                            
                                                            <div class="info-row" style="margin-top: auto; padding-top: 15px; border-top: 2px solid #dee2e6;">
                                                                <strong style="font-size: 16px; color: #2c3e50; display: block; margin-bottom: 8px;">Valor do Item:</strong>
                                                                <span style="font-size: 20px; font-weight: bold; color: #27ae60; display: block;">R$ ${(() => { const v = String(item.valor || item.valor_unitario || '0').replace(/\./g, '').replace(',', '.'); return (isNaN(parseFloat(v)) ? 0 : parseFloat(v)).toFixed(2); })()}</span>
                                                                ${item.valorAdicionais ? `<span style="font-size: 11px; color: #7f8c8d; display: block; margin-top: 4px;">+ Valores adicionais: R$ ${item.valorAdicionais}</span>` : ''}
                                                            </div>
                                                            
                                                            ${(item.tipoProducao === 'bolsinha' || item.tipo === 'bolsinha') ? `
                                                                ${item.tamanho ? `
                                                                <div class="info-row">
                                                                    <strong style="font-size: 13px; color: #2c3e50; display: block; margin-bottom: 5px;">Tamanho:</strong>
                                                                    <span style="font-size: 12px; color: #34495e; display: block;">${item.tamanho}</span>
                                                                </div>` : ''}
                                                                ${item.cor ? `
                                                                <div class="info-row">
                                                                    <strong style="font-size: 13px; color: #2c3e50; display: block; margin-bottom: 5px;">Cor:</strong>
                                                                    <span style="font-size: 12px; color: #34495e; display: block;">${item.cor}</span>
                                                                </div>` : ''}
                                                                ${item.fecho ? `
                                                                <div class="info-row">
                                                                    <strong style="font-size: 13px; color: #2c3e50; display: block; margin-bottom: 5px;">Fecho:</strong>
                                                                    <span style="font-size: 12px; color: #34495e; display: block;">${item.fecho}</span>
                                                                </div>` : ''}
                                                                ${item.alcaAjustavel ? `
                                                                <div class="info-row">
                                                                    <strong style="font-size: 13px; color: #2c3e50; display: block; margin-bottom: 5px;">Alça Ajustável:</strong>
                                                                    <span style="font-size: 12px; color: #34495e; display: block;">Sim</span>
                                                                </div>` : ''}
                                                            ` : ''}
                                                            
                                                            ${(item.tipoProducao === 'almofada' || item.tipo === 'almofada') ? `
                                                                ${item.enchimento ? `
                                                                <div class="info-row">
                                                                    <strong style="font-size: 13px; color: #2c3e50; display: block; margin-bottom: 5px;">Enchimento:</strong>
                                                                    <span style="font-size: 12px; color: #34495e; display: block;">${item.enchimento === 'com' ? 'Com enchimento' : 'Sem enchimento'}</span>
                                                                </div>` : ''}
                                                                ${item.legenda ? `
                                                                <div class="info-row">
                                                                    <strong style="font-size: 13px; color: #2c3e50; display: block; margin-bottom: 5px;">Legenda:</strong>
                                                                    <span style="font-size: 12px; color: #34495e; display: block;">${item.legenda}</span>
                                                                </div>` : ''}
                                                            ` : ''}

                                                            ${item.observacao ? `
                                                            <div class="info-row">
                                                                <strong style="font-size: 13px; color: #2c3e50; display: block; margin-bottom: 5px;">Observações:</strong>
                                                                <span style="font-size: 12px; color: #7f8c8d; font-style: italic; display: block; line-height: 1.4;">${item.observacao}</span>
                                                            </div>` : ''}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        `).join('')}
                                    `}
                                </div>
                                
                                <div class="totals">
                                    <div class="total-row">
                                        <span>Valor dos Itens:</span>
                                        <span>R$ ${(() => { 
                                            const v = String(pedido.valor_itens || pedido.valorItens || '0');
                                            if (/^\d+\.\d{2}$/.test(v)) return parseFloat(v).toFixed(2);
                                            const normalized = v.replace(/\./g, '').replace(',', '.');
                                            return (isNaN(parseFloat(normalized)) ? 0 : parseFloat(normalized)).toFixed(2);
                                        })()}</span>
                                    </div>
                                    <div class="total-row">
                                        <span>Valor do Frete:</span>
                                        <span>R$ ${(() => { 
                                            const v = String(pedido.valor_frete || pedido.valorFrete || '0');
                                            if (/^\d+\.\d{2}$/.test(v)) return parseFloat(v).toFixed(2);
                                            const normalized = v.replace(/\./g, '').replace(',', '.');
                                            return (isNaN(parseFloat(normalized)) ? 0 : parseFloat(normalized)).toFixed(2);
                                        })()}</span>
                                    </div>
                                    <div class="total-row final">
                                        <span>VALOR TOTAL:</span>
                                        <span>R$ ${(() => { 
                                            const v = String(pedido.valor_total || pedido.valorTotal || '0');
                                            if (/^\d+\.\d{2}$/.test(v)) return parseFloat(v).toFixed(2);
                                            const normalized = v.replace(/\./g, '').replace(',', '.');
                                            return (isNaN(parseFloat(normalized)) ? 0 : parseFloat(normalized)).toFixed(2);
                                        })()}</span>
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
                </div>
            </body>
            </html>
        `;
    };

    const gerarListaPedidos = (pedidos) => {
        console.log('🔍 LISTA PEDIDOS - Gerando lista para', pedidos.length, 'pedidos:', {
            ids: pedidos.map(p => p.id),
            nomes: pedidos.map(p => p.nomeCliente)
        });
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Lista de Pedidos - Sistema SGP</title>
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
                        align-items: center;
                        font-size: 14px;
                        color: #666;
                    }
                    
                    .pedido-info {
                        background: #f8f9fa;
                        border: 1px solid #dee2e6;
                        border-radius: 8px;
                        padding: 20px;
                        margin-bottom: 20px;
                    }
                    
                    .pedido-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 15px;
                        padding-bottom: 10px;
                        border-bottom: 1px solid #ccc;
                    }
                    
                    .pedido-numero {
                        font-size: 20px;
                        font-weight: bold;
                        color: #007bff;
                    }
                    
                    .pedido-status {
                        padding: 5px 15px;
                        border-radius: 20px;
                        font-size: 12px;
                        font-weight: bold;
                        text-transform: uppercase;
                    }
                    
                    .status-pendente {
                        background-color: #fff3cd;
                        color: #856404;
                    }
                    
                    .status-em-producao {
                        background-color: #d1ecf1;
                        color: #0c5460;
                    }
                    
                    .status-pronto {
                        background-color: #d4edda;
                        color: #155724;
                    }
                    
                    .status-entregue {
                        background-color: #e2e3e5;
                        color: #383d41;
                    }
                    
                    .cliente-info {
                        background: white;
                        padding: 15px;
                        border-radius: 6px;
                        margin-bottom: 15px;
                        border-left: 4px solid #28a745;
                    }
                    
                    .cliente-info h3 {
                        color: #28a745;
                        margin-bottom: 10px;
                        font-size: 16px;
                    }
                    
                    .info-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 15px;
                        margin-bottom: 15px;
                    }
                    
                    .info-item {
                        background: white;
                        padding: 10px;
                        border-radius: 4px;
                        border-left: 3px solid #007bff;
                    }
                    
                    .info-label {
                        font-weight: bold;
                        color: #495057;
                        font-size: 12px;
                        text-transform: uppercase;
                        margin-bottom: 3px;
                    }
                    
                    .info-value {
                        color: #212529;
                        font-size: 14px;
                    }
                    
                    .items-section {
                        margin-top: 20px;
                    }
                    
                    .items-title {
                        font-size: 18px;
                        font-weight: bold;
                        color: #007bff;
                        margin-bottom: 15px;
                        padding-bottom: 8px;
                        border-bottom: 2px solid #007bff;
                    }
                    
                    .item-card {
                        background: white;
                        border: 1px solid #dee2e6;
                        border-radius: 6px;
                        padding: 15px;
                        margin-bottom: 15px;
                        border-left: 4px solid #ffc107;
                    }
                    
                    .item-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 10px;
                    }
                    
                    .item-tipo {
                        background: #ffc107;
                        color: #212529;
                        padding: 4px 8px;
                        border-radius: 4px;
                        font-size: 12px;
                        font-weight: bold;
                        text-transform: uppercase;
                    }
                    
                    .item-descricao {
                        font-size: 16px;
                        font-weight: bold;
                        color: #212529;
                        margin-bottom: 8px;
                    }
                    
                    .item-details {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 10px;
                        margin-bottom: 10px;
                    }
                    
                    .item-detail {
                        font-size: 13px;
                    }
                    
                    .item-detail strong {
                        color: #495057;
                    }
                    
                    .item-valor {
                        text-align: right;
                        font-size: 16px;
                        font-weight: bold;
                        color: #28a745;
                    }
                    
                    .item-image {
                        margin-top: 10px;
                        text-align: center;
                    }
                    
                    .item-image img {
                        max-width: 200px;
                        max-height: 150px;
                        border-radius: 4px;
                        border: 1px solid #dee2e6;
                    }
                    
                    .totals-section {
                        background: #e9ecef;
                        padding: 15px;
                        border-radius: 6px;
                        margin-top: 20px;
                    }
                    
                    .totals-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr 1fr;
                        gap: 15px;
                    }
                    
                    .total-item {
                        text-align: center;
                    }
                    
                    .total-label {
                        font-size: 12px;
                        color: #6c757d;
                        text-transform: uppercase;
                        margin-bottom: 4px;
                    }
                    
                    .total-value {
                        font-size: 18px;
                        font-weight: bold;
                        color: #212529;
                    }
                    
                    .total-final {
                        background: #007bff;
                        color: white;
                        padding: 15px;
                        border-radius: 6px;
                        text-align: center;
                        margin-top: 15px;
                    }
                    
                    .total-final .label {
                        font-size: 14px;
                        margin-bottom: 5px;
                    }
                    
                    .total-final .value {
                        font-size: 24px;
                        font-weight: bold;
                    }
                    
                    .observacoes {
                        background: #fff3cd;
                        border: 1px solid #ffeaa7;
                        border-radius: 4px;
                        padding: 10px;
                        margin-top: 15px;
                    }
                    
                    .observacoes h4 {
                        color: #856404;
                        font-size: 13px;
                        margin-bottom: 5px;
                    }
                    
                    .observacoes p {
                        color: #856404;
                        font-size: 12px;
                        margin: 0;
                    }
                    
                    .footer {
                        margin-top: 30px;
                        text-align: center;
                        font-size: 11px;
                        color: #6c757d;
                        border-top: 1px solid #dee2e6;
                        padding-top: 15px;
                    }
                    
                    @media print {
                        body {
                            padding: 0;
                        }
                        
                        .page {
                            margin: 0;
                            padding: 10mm;
                        }
                        
                        /* Ajustes para imagens na impressão múltipla */
                        .item-image img {
                            max-width: 150px !important;
                            max-height: 150px !important;
                            width: auto !important;
                            height: auto !important;
                        }
                        
                        .pedido-info {
                            page-break-inside: avoid;
                            margin-bottom: 15px;
                        }
                        
                        .item-card {
                            page-break-inside: avoid;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="page">
                    <div class="header">
                        <h1>Lista de Pedidos</h1>
                        <div class="header-info">
                            <span>Data: ${new Date().toLocaleDateString('pt-BR')}</span>
                            <span>Total: ${pedidos.length} pedido(s)</span>
                        </div>
                    </div>
                    
                    ${pedidos.map(pedido => `
                        <div class="pedido-info">
                            <div class="pedido-header">
                                <div class="pedido-numero">Pedido #${pedido.numeroPedido}</div>
                                <div class="pedido-status status-${pedido.status}">
                                    ${pedido.status}
                                </div>
                            </div>
                            
                            <div class="cliente-info">
                                <h3>Dados do Cliente</h3>
                                <div class="info-grid">
                                    <div class="info-item">
                                        <div class="info-label">Nome</div>
                                        <div class="info-value">${pedido.nomeCliente}</div>
                                    </div>
                                    <div class="info-item">
                                        <div class="info-label">Telefone</div>
                                        <div class="info-value">${pedido.telefoneCliente}</div>
                                    </div>
                                    <div class="info-item">
                                        <div class="info-label">Cidade</div>
                                        <div class="info-value">${pedido.cidadeCliente}</div>
                                    </div>
                                    <div class="info-item">
                                        <div class="info-label">Prioridade</div>
                                        <div class="info-value">${pedido.prioridade ? 'SIM' : 'NÃO'}</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="info-grid">
                                <div class="info-item">
                                    <div class="info-label">Data de Entrada</div>
                                    <div class="info-value">${new Date(pedido.dataEntrada).toLocaleDateString('pt-BR')}</div>
                                </div>
                                <div class="info-item">
                                    <div class="info-label">Data de Entrega</div>
                                    <div class="info-value">${new Date(pedido.dataEntrega).toLocaleDateString('pt-BR')}</div>
                                </div>
                                <div class="info-item">
                                    <div class="info-label">Forma de Pagamento</div>
                                    <div class="info-value">${pedido.tipoPagamento || 'Não informado'}</div>
                                </div>
                                <div class="info-item">
                                    <div class="info-label">Forma de Envio</div>
                                    <div class="info-value">${pedido.formaEnvio || 'Não informado'}</div>
                                </div>
                            </div>
                            
                            <div class="items-section">
                                <div class="items-title">Itens do Pedido</div>
                                ${pedido.items.map((item, index) => `
                                    <div class="item-card">
                                        <div class="item-header">
                                            <div class="item-tipo">${item.tipoProducao || item.tipo || item.tipo_producao || 'Item'}</div>
                                            <div class="item-valor">R$ ${item.valor || item.valor_unitario || item.valorUnitario || '0,00'}</div>
                                        </div>
                                        <div class="item-descricao">${item.descricao}</div>
                                        <div class="item-details">
                                            ${item.largura ? `<div class="item-detail"><strong>Largura:</strong> ${item.largura}m</div>` : ''}
                                            ${item.altura ? `<div class="item-detail"><strong>Altura:</strong> ${item.altura}m</div>` : ''}
                                            ${item.material ? `<div class="item-detail"><strong>Material:</strong> ${item.material}</div>` : ''}
                                            ${item.tecido ? `<div class="item-detail"><strong>Tecido:</strong> ${item.tecido}</div>` : ''}
                                            ${item.vendedor ? `<div class="item-detail"><strong>Vendedor:</strong> ${item.vendedor}</div>` : ''}
                                            ${item.designer ? `<div class="item-detail"><strong>Designer:</strong> ${item.designer}</div>` : ''}
                                        </div>
                                        ${item.observacao ? `
                                            <div class="observacoes">
                                                <h4>Observações:</h4>
                                                <p>${item.observacao}</p>
                                            </div>
                                        ` : ''}
                                        ${item.imagem && item.imagem !== '' && item.imagem !== null ? `
                                            <div class="item-image">
                                                <img src="${item.imagem}" alt="Imagem do item" style="max-width: 180px; max-height: 180px; width: auto; height: auto; object-fit: contain; border-radius: 6px; border: 1px solid #999;" />
                                            </div>
                                        ` : ''}
                                    </div>
                                `).join('')}
                            </div>
                            
                            <div class="totals-section">
                                <div class="totals-grid">
                                    <div class="total-item">
                                        <div class="total-label">Valor dos Itens</div>
                                        <div class="total-value">R$ ${pedido.valorItens || '0,00'}</div>
                                    </div>
                                    <div class="total-item">
                                        <div class="total-label">Valor do Frete</div>
                                        <div class="total-value">R$ ${pedido.valorFrete || '0,00'}</div>
                                    </div>
                                    <div class="total-item">
                                        <div class="total-label">Valor Total</div>
                                        <div class="total-value">R$ ${pedido.valorTotal || '0,00'}</div>
                                    </div>
                                </div>
                                <div class="total-final">
                                    <div class="label">Valor Total do Pedido</div>
                                    <div class="value">R$ ${pedido.valorTotal || '0,00'}</div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </body>
            </html>
        `;
    };

    // Layout resumido para múltiplos pedidos: Cliente, Data de Envio, Forma de Envio, Prioridade e Imagens dos Itens
    const gerarListaPedidosResumida = (pedidos) => {
        console.log('🔍 LISTA RESUMIDA - Gerando para', pedidos.length, 'pedidos');
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Lista Resumida de Pedidos</title>
                <meta charset="UTF-8">
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: Arial, sans-serif; font-size: 12px; color: #111; background: #fff; }
                    .page { width: 210mm; min-height: 297mm; margin: 0 auto; padding: 10mm; }
                    .header { text-align: center; margin-bottom: 10px; border-bottom: 2px solid #222; padding-bottom: 8px; }
                    .header h1 { font-size: 18px; margin-bottom: 4px; }
                    .header-info { font-size: 11px; color: #555; display: flex; justify-content: space-between; }
                    .grid { display: grid; grid-template-columns: 1fr; gap: 10px; }
                    .card { border: 1px solid #ddd; border-radius: 6px; padding: 10px; page-break-inside: avoid; }
                    .card-header { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 8px; align-items: center; margin-bottom: 8px; }
                    .label { font-size: 10px; text-transform: uppercase; color: #666; }
                    .value { font-size: 12px; color: #111; font-weight: 600; }
                    .prioridade-alta { color: #b91c1c; }
                    .prioridade-normal { color: #374151; font-weight: 500; }
                    .imgs { display: grid; grid-template-columns: repeat(6, 1fr); gap: 6px; }
                    .img-wrap { border: 1px solid #ddd; border-radius: 4px; padding: 4px; display: flex; align-items: center; justify-content: center; height: 92px; }
                    .img-wrap img { max-width: 100%; max-height: 86px; object-fit: contain; }
                    .img-more { display:flex; align-items:center; justify-content:center; font-size: 12px; color:#555; background:#f3f4f6; border:1px dashed #d1d5db; border-radius:4px; }
                    @media print {
                      body { padding: 0; }
                      .page { margin: 0; padding: 8mm; }
                      .card { break-inside: avoid; page-break-inside: avoid; }
                      .img-wrap { height: 80px; }
                      .img-wrap img { max-height: 74px; }
                    }
                </style>
            </head>
            <body>
                <div class="page">
                    <div class="header">
                        <h1>Lista Resumida de Pedidos</h1>
                        <div class="header-info">
                            <span>Data: ${new Date().toLocaleDateString('pt-BR')}</span>
                            <span>Total: ${pedidos.length} pedido(s)</span>
                        </div>
                    </div>
                    <div class="grid">
                        ${pedidos.map(p => {
                            const prioridadeAlta = (p.prioridade === true || p.prioridade === 'ALTA');
                            const dataEnvio = p.dataEntrega ? new Date(p.dataEntrega).toLocaleDateString('pt-BR') : '-';
                            const formaEnvio = p.formaEnvio || '-';
                            const imgs = (p.items || []).filter(i => !!i.imagem);
                            return `
                                <div class="card">
                                    <div class="card-header">
                                        <div>
                                            <div class="label">Cliente</div>
                                            <div class="value">${p.nomeCliente || '-'}</div>
                                        </div>
                                        <div>
                                            <div class="label">Data de Envio</div>
                                            <div class="value">${dataEnvio}</div>
                                        </div>
                                        <div>
                                            <div class="label">Forma de Envio</div>
                                            <div class="value">${formaEnvio}</div>
                                        </div>
                                        <div>
                                            <div class="label">Prioridade</div>
                                            <div class="value ${prioridadeAlta ? 'prioridade-alta' : 'prioridade-normal'}">${prioridadeAlta ? 'ALTA' : 'Normal'}</div>
                                        </div>
                                    </div>
                                    ${imgs.length > 0 ? `
                                        <div class="imgs">
                                            ${imgs.slice(0, 6).map(it => `
                                                <div class="img-wrap">
                                                    <img src="${it.imagem}" alt="Item" />
                                                </div>
                                            `).join('')}
                                            ${imgs.length > 6 ? `
                                                <div class="img-wrap img-more">+${imgs.length - 6}</div>
                                            ` : ''}
                                        </div>
                                    ` : `
                                        <div class="label" style="color:#888">Sem imagens de itens</div>
                                    `}
                                </div>
                            `;
                        }).join('')}
                    </div>
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

    function useDebouncedValue(value, delayMs) {
        const [debounced, setDebounced] = useState(value);
        useEffect(() => {
            const id = setTimeout(() => setDebounced(value), delayMs);
            return () => clearTimeout(id);
        }, [value, delayMs]);
        return debounced;
    }

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

            {/* Modal de Edição de Pedido */}
            <EditOrderModal
                show={editModal.show}
                onHide={() => setEditModal({ show: false, pedido: null })}
                pedido={editModal.pedido}
                onPedidoUpdated={handlePedidoUpdated}
                onPedidoDeleted={handlePedidoDeleted}
                customAlert={customAlert}
            />

            {/* Modal de Alertas Customizados */}
            <CustomAlertModal
                show={customAlert.show}
                onHide={customAlert.hide}
                type={customAlert.type}
                title={customAlert.title}
                message={customAlert.message}
                onConfirm={customAlert.onConfirm}
                onCancel={customAlert.onCancel}
            />

            {/* Modal de Logs */}
            <LogsModal
                show={logsModal.show}
                onHide={() => setLogsModal({ show: false })}
            />

            {/* Modal de Imagem Ampliada */}
            {imageModal.show && (
                <div 
                    className={`image-modal-overlay ${imageModal.show ? 'active' : ''}`}
                    onClick={closeImageModal}
                    style={{ 
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 2000,
                        background: 'rgba(0, 0, 0, 0.95)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button 
                            className="image-modal-close"
                            onClick={closeImageModal}
                            title="Fechar imagem"
                            style={{
                                position: 'absolute',
                                top: '-60px',
                                right: '-60px',
                                background: 'rgba(255, 255, 255, 0.2)',
                                border: 'none',
                                borderRadius: '50%',
                                width: '50px',
                                height: '50px',
                                color: 'white',
                                fontSize: '24px',
                                cursor: 'pointer'
                            }}
                        >
                            ×
                        </button>
                        <img 
                            src={imageModal.src} 
                            alt={imageModal.alt}
                            className="image-modal-image"
                            style={{
                                maxWidth: '70vw',
                                maxHeight: '70vh',
                                width: 'auto',
                                height: 'auto',
                                borderRadius: '12px',
                                border: '3px solid var(--color-primary)'
                            }}
                        />
                        <div className="image-modal-info" style={{
                            position: 'absolute',
                            bottom: '-80px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: 'rgba(0, 0, 0, 0.9)',
                            color: 'white',
                            padding: '12px 20px',
                            borderRadius: '25px',
                            fontSize: '14px',
                            whiteSpace: 'nowrap'
                        }}>
                            {imageModal.alt} - Clique fora para fechar
                        </div>
                    </div>
                </div>
            )}

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
                size="xl"
                centered
                dialogClassName="fullscreen-modal"
            >
                <Modal.Header closeButton className="modal-header">
                    <Modal.Title className="modal-title">
                        <ClipboardData className="me-2" />
                        Visualização Completa do Pedido
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="modal-body">
                    {previewModal.pedido && (
                        <div>
                            {/* Informações Principais */}
                            <Row className="mb-4">
                                <Col md={6}>
                                    <div className="dashboard-card">
                                        <div className="dashboard-card-header">
                                            <h6 className="dashboard-card-title">Informações do Pedido</h6>
                                            <ClipboardData className="dashboard-card-icon" />
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            <div>
                                                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-neutral-600)' }}>Número do Pedido:</span>
                                                <p style={{ margin: '4px 0 0 0', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-primary)' }}>
                                                    {previewModal.pedido.numero || previewModal.pedido.numeroPedido || 'N/A'}
                                                </p>
                                            </div>
                                            <div>
                                                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-neutral-600)' }}>Cliente:</span>
                                                <p style={{ margin: '4px 0 0 0', fontWeight: 'var(--font-weight-medium)' }}>
                                                    {previewModal.pedido.cliente || previewModal.pedido.nomeCliente || 'N/A'}
                                                </p>
                                            </div>
                                            <div>
                                                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-neutral-600)' }}>Telefone:</span>
                                                <p style={{ margin: '4px 0 0 0' }}>
                                                    {previewModal.pedido.telefone || previewModal.pedido.telefoneCliente || 'N/A'}
                                                </p>
                                            </div>
                                            <div>
                                                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-neutral-600)' }}>Cidade:</span>
                                                <p style={{ margin: '4px 0 0 0' }}>
                                                    {previewModal.pedido.cidade || previewModal.pedido.cidadeCliente || 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <div className="dashboard-card">
                                        <div className="dashboard-card-header">
                                            <h6 className="dashboard-card-title">Datas e Status</h6>
                                            <Calendar className="dashboard-card-icon" />
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            <div>
                                                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-neutral-600)' }}>Data de Entrada:</span>
                                                <p style={{ margin: '4px 0 0 0' }}>
                                                    {previewModal.pedido.data_entrada || previewModal.pedido.dataEntrada || 'N/A'}
                                                </p>
                                            </div>
                                            <div>
                                                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-neutral-600)' }}>Data de Entrega:</span>
                                                <p style={{ margin: '4px 0 0 0' }}>
                                                    {previewModal.pedido.data_entrega || previewModal.pedido.dataEntrega || 'N/A'}
                                                </p>
                                            </div>
                                            <div>
                                                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-neutral-600)' }}>Status:</span>
                                                <div style={{ marginTop: '4px' }}>
                                                    <span className={`badge ${
                                                        previewModal.pedido.status === 'pendente' ? 'badge-warning' : 
                                                        previewModal.pedido.status === 'em andamento' ? 'badge-info' :
                                                        previewModal.pedido.status === 'pronto' ? 'badge-success' : 'badge-neutral'
                                                    }`}>
                                                        {previewModal.pedido.status || 'N/A'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div>
                                                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-neutral-600)' }}>Prioridade:</span>
                                                <div style={{ marginTop: '4px' }}>
                                                    {previewModal.pedido.prioridade || previewModal.pedido.prioridade === '1' ? (
                                                        <span className="badge badge-error">ALTA</span>
                                                    ) : (
                                                        <span className="badge badge-neutral">NORMAL</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Col>
                            </Row>

                            {/* Informações Financeiras */}
                            <Row className="mb-4">
                                <Col md={6}>
                                    <div className="dashboard-card">
                                        <div className="dashboard-card-header">
                                            <h6 className="dashboard-card-title">Informações Financeiras</h6>
                                            <CurrencyDollar className="dashboard-card-icon" />
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            <div>
                                                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-neutral-600)' }}>Valor Total:</span>
                                                <p style={{ margin: '4px 0 0 0', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-success)' }}>
                                                    R$ {previewModal.pedido.valorTotal || previewModal.pedido.valor_total || '0,00'}
                                                </p>
                                            </div>
                                            <div>
                                                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-neutral-600)' }}>Valor do Frete:</span>
                                                <p style={{ margin: '4px 0 0 0' }}>
                                                    R$ {previewModal.pedido.valorFrete || previewModal.pedido.valor_frete || '0,00'}
                                                </p>
                                            </div>
                                            <div>
                                                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-neutral-600)' }}>Forma de Pagamento:</span>
                                                <p style={{ margin: '4px 0 0 0' }}>
                                                    {previewModal.pedido.tipoPagamento || previewModal.pedido.forma_pagamento || 'N/A'}
                                                </p>
                                            </div>
                                            <div>
                                                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-neutral-600)' }}>Forma de Envio:</span>
                                                <p style={{ margin: '4px 0 0 0' }}>
                                                    {previewModal.pedido.formaEnvio || previewModal.pedido.forma_envio || 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <div className="dashboard-card">
                                        <div className="dashboard-card-header">
                                            <h6 className="dashboard-card-title">Status dos Setores</h6>
                                            <CheckCircle className="dashboard-card-icon" />
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontSize: 'var(--font-size-sm)' }}>Financeiro:</span>
                                                <span className={`badge ${previewModal.pedido.financeiro ? 'badge-success' : 'badge-neutral'}`}>
                                                    {previewModal.pedido.financeiro ? 'Concluído' : 'Pendente'}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontSize: 'var(--font-size-sm)' }}>Conferência:</span>
                                                <span className={`badge ${previewModal.pedido.conferencia ? 'badge-success' : 'badge-neutral'}`}>
                                                    {previewModal.pedido.conferencia ? 'Concluído' : 'Pendente'}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontSize: 'var(--font-size-sm)' }}>Sublimação:</span>
                                                <span className={`badge ${previewModal.pedido.sublimacao ? 'badge-success' : 'badge-neutral'}`}>
                                                    {previewModal.pedido.sublimacao ? 'Concluído' : 'Pendente'}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontSize: 'var(--font-size-sm)' }}>Costura:</span>
                                                <span className={`badge ${previewModal.pedido.costura ? 'badge-success' : 'badge-neutral'}`}>
                                                    {previewModal.pedido.costura ? 'Concluído' : 'Pendente'}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontSize: 'var(--font-size-sm)' }}>Expedição:</span>
                                                <span className={`badge ${previewModal.pedido.expedicao ? 'badge-success' : 'badge-neutral'}`}>
                                                    {previewModal.pedido.expedicao ? 'Concluído' : 'Pendente'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Col>
                            </Row>

                            {/* Itens do Pedido */}
                            {previewModal.pedido.items && previewModal.pedido.items.length > 0 && (
                                <div className="dashboard-card mb-4">
                                    <div className="dashboard-card-header">
                                        <h4 className="dashboard-card-title" style={{ fontSize: '24px', fontWeight: '600' }}>Itens do Pedido</h4>
                                        <FileText className="dashboard-card-icon" />
                                    </div>
                                    <div className="table-responsive">
                                        <table className="table">
                                            <thead>
                                                <tr>
                                                    <th style={{ fontSize: '20px', fontWeight: '600' }}>Tipo</th>
                                                    <th style={{ fontSize: '20px', fontWeight: '600' }}>Descrição</th>
                                                    <th style={{ fontSize: '20px', fontWeight: '600' }}>Quantidade</th>
                                                    <th style={{ fontSize: '20px', fontWeight: '600' }}>Valor Unitário</th>
                                                    <th style={{ fontSize: '20px', fontWeight: '600' }}>Valor Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {previewModal.pedido.items.map((item, index) => (
                                                    <tr key={index}>
                                                        <td>
                                                            <span className="badge badge-info" style={{ fontSize: '16px', padding: '8px 14px' }}>
                                                                {item.tipoProducao || item.tipo || item.tipo_producao || 'Item'}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                                    <strong style={{ fontSize: '22px', lineHeight: '1.4' }}>{item.descricao || item.nome || 'Sem descrição'}</strong>
                                                                {item.observacao && (
                                                                        <div style={{ fontSize: '19px', color: 'var(--color-neutral-600)', marginTop: '8px', lineHeight: '1.5' }}>
                                                                        {item.observacao}
                                                                    </div>
                                                                )}
                                                                    <div style={{ marginTop: '12px', fontSize: '18px', color: 'var(--color-neutral-700)', lineHeight: '1.6' }}>
                                                                        {item.tecido && (
                                                                            <div style={{ marginBottom: '6px' }}><strong>Tecido:</strong> {item.tecido}</div>
                                                                        )}
                                                                        {item.emenda && (
                                                                            <div style={{ marginBottom: '6px' }}><strong>Emenda:</strong> {item.emenda}</div>
                                                                        )}
                                                                        {item.acabamento && (
                                                                            <div style={{ marginBottom: '6px' }}>
                                                                                <strong>Acabamento:</strong> {formatarAcabamentos(item)}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="image-container" style={{ flex: '0 0 auto', maxWidth: '500px' }}>
                                                                    {item.imagem && item.imagem !== '' && item.imagem !== null ? (
                                                                        <img 
                                                                            src={item.imagem} 
                                                                            alt={`Imagem do item ${item.descricao || 'item'}`}
                                                                            className="item-image-clickable"
                                                                            style={{
                                                                                maxWidth: '500px',
                                                                                maxHeight: '500px',
                                                                                width: 'auto',
                                                                                height: 'auto',
                                                                                objectFit: 'contain'
                                                                            }}
                                                                            onClick={() => handleImageClick(item.imagem, `Imagem do item ${item.descricao || 'item'}`)}
                                                                            title="Clique para ampliar imagem"
                                                                        />
                                                                    ) : (
                                                                    <div style={{ marginTop: '8px', color: 'var(--color-neutral-500)', fontSize: 'var(--font-size-xs)' }}>
                                                                        Sem imagem
                                                                    </div>
                                                                )}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td style={{ fontSize: '18px', fontWeight: '500' }}>{item.quantidade || 1}</td>
                                                        <td style={{ fontSize: '18px' }}>R$ {(() => { const v = String(item.valor || item.valor_unitario || item.valorUnitario || '0').replace(/\./g, '').replace(',', '.'); const n = isNaN(parseFloat(v)) ? 0 : parseFloat(v); return n.toFixed(2).replace('.', ','); })()}</td>
                                                        <td style={{ fontSize: '18px' }}>
                                                            <strong>R$ {(() => { const v = String(item.valor || item.valor_unitario || item.valorUnitario || '0').replace(/\./g, '').replace(',', '.'); const n = isNaN(parseFloat(v)) ? 0 : parseFloat(v); return (n * (item.quantidade || 1)).toFixed(2).replace('.', ','); })()}</strong>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Observações */}
                            {previewModal.pedido.observacao && (
                                <div className="dashboard-card">
                                    <div className="dashboard-card-header">
                                        <h6 className="dashboard-card-title">Observações</h6>
                                        <FileText className="dashboard-card-icon" />
                                    </div>
                                    <div style={{ padding: '16px', background: 'var(--color-neutral-50)', borderRadius: 'var(--border-radius)', border: '1px solid var(--color-neutral-200)' }}>
                                        <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', lineHeight: '1.5' }}>
                                            {previewModal.pedido.observacao}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
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

            {/* Filtros Organizados */}
            <CollapsibleFilters
                filtro={filtro}
                setFiltro={setFiltro}
                filtrosAvancados={filtrosAvancados}
                setFiltrosAvancados={setFiltrosAvancados}
                filtroApenasProntos={filtroApenasProntos}
                setFiltroApenasProntos={setFiltroApenasProntos}
                listScope={listScope}
                setListScope={setListScope}
                todosPeriod={todosPeriod}
                setTodosPeriod={setTodosPeriod}
            />

            <div className="dashboard-card" style={{ overflowX: 'hidden' }}>
                <div className="dashboard-card-header">
                    <div className="d-flex justify-content-between align-items-center">
                        <h5 className="dashboard-card-title mb-0">Últimos Pedidos</h5>
                        <div className="d-flex gap-2 align-items-center">
                            {listScope === 'ativos' && (
                                <span 
                                    className="badge bg-success me-2" 
                                    title="Sincronização em tempo real ativa! ⚡
• Broadcast Channel: INSTANTÂNEO entre abas
• Auto-refresh: a cada 5 segundos
• Cache: 15 segundos"
                                    style={{ fontSize: '0.75rem', cursor: 'help' }}
                                >
                                    <ArrowClockwise size={12} className="me-1" style={{ animation: 'spin 2s linear infinite' }} />
                                    Sync Tempo Real ⚡
                                </span>
                            )}
                            <style>{`
                                @keyframes spin {
                                    from { transform: rotate(0deg); }
                                    to { transform: rotate(360deg); }
                                }
                            `}</style>
                            <Button 
                                variant="outline-primary" 
                                size="sm"
                                onClick={sincronizarCache}
                                disabled={isSyncing || isLoadingLista}
                                className="btn-outline"
                                title={cacheStats ? `Cache: ${cacheStats.pedidosEmCache}/${cacheStats.totalPedidos} pedidos` : ''}
                            >
                                {isSyncing ? (
                                    <>
                                        <div className="spinner-border spinner-border-sm me-1" role="status">
                                            <span className="visually-hidden">Sincronizando...</span>
                                        </div>
                                        Sincronizando...
                                    </>
                                ) : (
                                    <>
                                        <ArrowClockwise size={14} className="me-1" />
                                        Sincronizar
                                    </>
                                )}
                            </Button>
                            {pendingPedidosStats && pendingPedidosStats.total > 0 && (
                                <div className="d-flex align-items-center ms-2">
                                    <span className="badge bg-info me-1" title={`${pendingPedidosStats.naoConcluidos} pedidos não concluídos salvos no localStorage`}>
                                        📋 {pendingPedidosStats.naoConcluidos} pendentes
                                    </span>
                                    <Button 
                                        variant="outline-info" 
                                        size="sm"
                                        onClick={async () => {
                                            try {
                                                const pedidosRecuperados = pedidosCache.recuperarPedidosPerdidos();
                                                if (pedidosRecuperados.length > 0) {
                                                    setToast({ 
                                                        show: true, 
                                                        message: `✅ ${pedidosRecuperados.length} pedidos perdidos recuperados!` 
                                                    });
                                                    // Recarregar lista para mostrar pedidos recuperados
                                                    carregarListaPorScope(listScope);
                                                } else {
                                                    setToast({ 
                                                        show: true, 
                                                        message: `ℹ️ Nenhum pedido perdido encontrado.` 
                                                    });
                                                }
                                            } catch (error) {
                                                console.error('Erro ao recuperar pedidos:', error);
                                                setToast({ 
                                                    show: true, 
                                                    message: `❌ Erro ao recuperar pedidos: ${error.message}` 
                                                });
                                            }
                                        }}
                                        className="btn-outline ms-1"
                                        title="Recuperar pedidos perdidos"
                                    >
                                        🔄
                                    </Button>
                                </div>
                            )}
                            <Button 
                                variant={isSeeding ? 'warning' : 'outline-warning'} 
                                size="sm"
                                onClick={() => gerarPedidosFakes(100)}
                                disabled={isSeeding}
                                className="btn-outline"
                                title={isSeeding ? `Inserindo... ${seedProgress.current}/${seedProgress.total}` : 'Gerar 100 pedidos fakes'}
                            >
                                {isSeeding ? (
                                    <>
                                        <div className="spinner-border spinner-border-sm me-1" role="status">
                                            <span className="visually-hidden">Gerando...</span>
                                        </div>
                                        Gerando ({seedProgress.current}/{seedProgress.total})
                                    </>
                                ) : (
                                    <>
                                        <Plus size={14} className="me-1" />
                                        Gerar 100 Fakes
                                    </>
                                )}
                            </Button>
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
                                variant={isCleaning ? 'danger' : 'outline-danger'} 
                                size="sm"
                                onClick={limparFakes}
                                disabled={isCleaning}
                                className="btn-outline"
                                title={isCleaning ? `Limpando... ${cleanProgress.current}/${cleanProgress.total}` : 'Remover pedidos fakes (PED-FAKE)'}
                            >
                                {isCleaning ? (
                                    <>
                                        <div className="spinner-border spinner-border-sm me-1" role="status">
                                            <span className="visually-hidden">Limpando...</span>
                                        </div>
                                        Limpando ({cleanProgress.current}/{cleanProgress.total})
                                    </>
                                ) : (
                                    <>
                                        <Trash size={14} className="me-1" />
                                        Remover Fakes
                                    </>
                                )}
                            </Button>
                            <div className="d-flex align-items-center gap-2">
                                <input
                                    type="date"
                                    className="form-control form-control-sm"
                                    value={new Date(closeDate).toISOString().slice(0,10)}
                                    onChange={(e) => setCloseDate(e.target.value)}
                                    style={{ width: '150px' }}
                                    title="Data do Fechamento"
                                />
                                <Button 
                                    variant={isClosing ? 'secondary' : 'outline-secondary'} 
                                    size="sm"
                                    onClick={() => fecharDiario(closeDate)}
                                    disabled={isClosing}
                                    className="btn-outline"
                                    title="Gerar Fechamento do Dia (snapshot)"
                                >
                                    {isClosing ? (
                                        <>
                                            <div className="spinner-border spinner-border-sm me-1" role="status">
                                                <span className="visually-hidden">Fechando...</span>
                                            </div>
                                            Fechando...
                                        </>
                                    ) : (
                                        <>
                                            <FileText size={14} className="me-1" />
                                            Fechar Dia
                                        </>
                                    )}
                                </Button>
                            </div>
                            <Button 
                                variant={viewMode === 'kanban' ? 'info' : 'outline-info'} 
                                size="sm"
                                onClick={() => setViewMode(viewMode === 'kanban' ? 'table' : 'kanban')}
                                className="btn-outline"
                                style={{ marginLeft: '8px' }}
                                title={viewMode === 'kanban' ? 'Trocar para Tabela' : 'Trocar para Kanban'}
                            >
                                {viewMode === 'kanban' ? 'Tabela' : 'Kanban'}
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
                <div className="table-container" style={{ overflowX: 'auto' }}>
                    <div className="filtros-container" style={{ marginBottom: '12px' }}>
                        <div className="form-check">
                            <input 
                                type="checkbox" 
                                id="filtroApenasProntos"
                                className="form-check-input"
                                checked={filtroApenasProntos || false}
                                onChange={(e) => setFiltroApenasProntos(e.target.checked)}
                            />
                            <label htmlFor="filtroApenasProntos" className="form-check-label" style={{ marginLeft: '8px' }}>
                                Mostrar apenas pedidos Prontos
                            </label>
                        </div>
                    </div>
                    {isLoadingLista && (
                        <div className="my-2">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={`skeleton-row-${i}`} className="mb-2" style={{ height: '38px', background: 'linear-gradient(90deg, #f2f2f2 25%, #e6e6e6 37%, #f2f2f2 63%)', backgroundSize: '400% 100%', animation: 'placeholderShimmer 1.2s ease-in-out infinite' }} />
                            ))}
                            <style>{`@keyframes placeholderShimmer { 0% { background-position: 100% 0 } 100% { background-position: -100% 0 } }`}</style>
                        </div>
                    )}
                    {viewMode === 'kanban' ? (
                        <KanbanBoard 
                            pedidos={pedidosOrdenados}
                            onToggleSetor={toggleSetor}
                            onEdit={handleEditPedido}
                            onPreview={(pedido) => imprimirConteudo([pedido], `Pedido #${pedido.numeroPedido}`)}
                            onMoveToColumn={movePedidoToColumn}
                        />
                    ) : (
                    <Table hover responsive className="table">
                        <thead>
                            <tr>
                                <th>
                                    <input
                                        type="checkbox"
                                        checked={pedidosSelecionados.length === pedidosOrdenados.length && pedidosOrdenados.length > 0}
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
                            {pedidosOrdenados.map((pedido, index) => (
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
                                            <CustomCheckbox
                                                checked={pedido.financeiro || false}
                                                onChange={() => toggleSetor(pedido.id, 'financeiro')}
                                                size="large"
                                            />
                                        </Tooltip>
                                    </td>
                                    <td className="setor-cell">
                                        <Tooltip content={pedido.conferencia ? "Conferência concluída" : pedido.financeiro ? "Conferência pendente" : "Aguarde aprovação do Financeiro"} position="top">
                                            <CustomCheckbox
                                                checked={pedido.conferencia || false}
                                                disabled={!pedido.financeiro}
                                                onChange={() => toggleSetor(pedido.id, 'conferencia')}
                                                size="large"
                                            />
                                        </Tooltip>
                                    </td>
                                    <td className="setor-cell">
                                        <Tooltip content={pedido.sublimacao ? "Sublimação concluída" : pedido.financeiro ? "Sublimação pendente" : "Aguarde aprovação do Financeiro"} position="top">
                                            <CustomCheckbox
                                                checked={pedido.sublimacao || false}
                                                disabled={!pedido.financeiro}
                                                onChange={() => toggleSetor(pedido.id, 'sublimacao')}
                                                size="large"
                                            />
                                        </Tooltip>
                                    </td>
                                    <td className="setor-cell">
                                        <Tooltip content={pedido.costura ? "Costura concluída" : pedido.financeiro ? "Costura pendente" : "Aguarde aprovação do Financeiro"} position="top">
                                            <CustomCheckbox
                                                checked={pedido.costura || false}
                                                disabled={!pedido.financeiro}
                                                onChange={() => toggleSetor(pedido.id, 'costura')}
                                                size="large"
                                            />
                                        </Tooltip>
                                    </td>
                                    <td className="setor-cell">
                                        <Tooltip content={pedido.expedicao ? "Expedição concluída" : pedido.financeiro ? "Expedição pendente" : "Aguarde aprovação do Financeiro"} position="top">
                                            <CustomCheckbox
                                                checked={pedido.expedicao || false}
                                                disabled={!pedido.financeiro}
                                                onChange={() => toggleSetor(pedido.id, 'expedicao')}
                                                size="large"
                                            />
                                        </Tooltip>
                                    </td>
                                    <td>
                                        <div className="d-flex gap-2">
                                            <Tooltip content="Visualizar detalhes do pedido" position="top">
                                                <Button
                                                    variant="outline-secondary"
                                                    size="sm"
                                                    onClick={() => setPreviewModal({ show: true, pedido })}
                                                    className="action-button"
                                                >
                                                    <Eye size={14} />
                                                    Ver
                                                </Button>
                                            </Tooltip>
                                            <Tooltip content="Editar pedido" position="top">
                                                <Button
                                                    variant="outline-warning"
                                                    size="sm"
                                                    onClick={() => handleEditPedido(pedido)}
                                                    className="action-button"
                                                >
                                                    <PencilSquare size={14} />
                                                    Editar
                                                </Button>
                                            </Tooltip>
                                            <Tooltip content="Imprimir ficha do pedido" position="top">
                                                <Button
                                                    variant="outline-success"
                                                    size="sm"
                                                    onClick={() => imprimirPedidoIndividual(pedido)}
                                                    className="action-button"
                                                >
                                                    <Printer size={14} />
                                                    Imprimir
                                                </Button>
                                            </Tooltip>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    )}
                    {listScope === 'todos' && (
                        <div className="d-flex justify-content-center align-items-center py-2" ref={sentinelRef}>
                            {isLoadingMore ? (
                                <span className="text-muted" style={{ fontSize: '0.9rem' }}>Carregando mais...</span>
                            ) : hasMoreTodos ? (
                                <span className="text-muted" style={{ fontSize: '0.9rem' }}>Role para carregar mais ({Math.min(pedidos.length, todosAll.length)} de {todosAll.length})</span>
                            ) : (
                                <span className="text-muted" style={{ fontSize: '0.9rem' }}>Fim da lista ({pedidos.length})</span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Home;
export { Home };
