import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Form, 
  Tab, 
  Tabs, 
  Table, 
  Alert,
  Spinner,
  Badge
} from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import AutocompleteInput from '../components/AutocompleteInput';
import { 
  gerarRelatorioDiario, 
  gerarRelatorioSemanal, 
  gerarRelatorioMensal,
  obterRankingProdutos,
  obterRelatorioCancelamentos,
  obterListaClientes,
  obterListaVendedores,
  obterListaDesigners
} from '../services/api';
import { getAllPedidos, getAllClientes } from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';

function PageRelatorios() {
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('diario');
  const [relatorio, setRelatorio] = useState(null);
  const [error, setError] = useState(null);

  // Estados para formulários
  const [dataDiario, setDataDiario] = useState(new Date().toISOString().split('T')[0]);
  const [dataSemanal, setDataSemanal] = useState(new Date().toISOString().split('T')[0]);
  const [mesMensal, setMesMensal] = useState(new Date().getMonth() + 1);
  const [anoMensal, setAnoMensal] = useState(new Date().getFullYear());

  // Estados para filtros por pessoa
  const [filtroTipo, setFiltroTipo] = useState('todos'); // 'todos', 'cliente', 'vendedor', 'designer'
  const [filtroNome, setFiltroNome] = useState('');
  const [listaClientes, setListaClientes] = useState([]);
  const [listaVendedores, setListaVendedores] = useState([]);
  const [listaDesigners, setListaDesigners] = useState([]);
  const [carregandoListas, setCarregandoListas] = useState(false);

  // Estados para relatórios especiais
  const [rankingProdutos, setRankingProdutos] = useState(null);
  const [relatorioCancelamentos, setRelatorioCancelamentos] = useState(null);

  // Fechamento por Cliente (Admin)
  const [fcDataInicio, setFcDataInicio] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [fcDataFim, setFcDataFim] = useState(new Date().toISOString().split('T')[0]);
  const [fcCliente, setFcCliente] = useState('');
  const [fcListaClientes, setFcListaClientes] = useState([]);
  const [fcResultados, setFcResultados] = useState([]);
  const [fcLoading, setFcLoading] = useState(false);

  const parseBRLMoneyNumber = (value) => {
    if (typeof value === 'number') return value;
    if (!value) return 0;
    const normalized = String(value).replace(/\./g, '').replace(',', '.');
    const num = parseFloat(normalized);
    return isNaN(num) ? 0 : num;
  };

  const gerarFechamentoClientes = async () => {
    if (!fcDataInicio || !fcDataFim) {
      setError('Selecione o intervalo de datas.');
      return;
    }
    setError(null);
    setFcLoading(true);
    try {
      const res = await getAllPedidos();
      const pedidos = res.data || [];
      const inicio = fcDataInicio;
      const fim = fcDataFim;
      const filtrados = pedidos.filter((p) => {
        const data = p.data_entrega || p.dataEntrega || '';
        if (!data) return false;
        const okData = data >= inicio && data <= fim;
        const cliente = p.cliente || p.nomeCliente || p.nome_cliente || '';
        const okCliente = fcCliente ? String(cliente).toLowerCase().includes(fcCliente.toLowerCase()) : true;
        return okData && okCliente;
      });

      const mapa = new Map();
      filtrados.forEach((p) => {
        const cliente = p.cliente || p.nomeCliente || p.nome_cliente || 'Cliente';
        const cidade = p.cidade_cliente || p.cidadeCliente || p.cidade || p.endereco?.cidade || '';
        const uf = p.estado_cliente || p.estadoCliente || p.estado || p.endereco?.estado || '';
        const chave = cliente;
        const valorTotal = parseBRLMoneyNumber(p.valor_total || p.valorTotal || 0);
        const atual = mapa.get(chave) || { cliente, cidade, uf, pedidos: 0, valor: 0 };
        atual.pedidos += 1;
        atual.valor += isNaN(valorTotal) ? 0 : valorTotal;
        mapa.set(chave, atual);
      });

      const lista = Array.from(mapa.values())
        .map((x) => ({ ...x, ticket: x.pedidos > 0 ? x.valor / x.pedidos : 0 }))
        .sort((a, b) => b.valor - a.valor);
      setFcResultados(lista);
    } catch (e) {
      console.error('Erro ao gerar fechamento por cliente:', e);
      setError(e.response?.data?.detail || e.message || 'Erro ao gerar fechamento por cliente');
    } finally {
      setFcLoading(false);
    }
  };

  const exportarFechamentoCSV = () => {
    const cabecalho = 'Cliente;Cidade/UF;Pedidos;Valor Total;Ticket Médio\n';
    const linhas = fcResultados
      .map((r) => `${r.cliente};${r.cidade || ''}/${r.uf || ''};${r.pedidos};${r.valor.toFixed(2).replace('.', ',')};${r.ticket.toFixed(2).replace('.', ',')}`)
      .join('\n');
    const csv = cabecalho + linhas;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fechamento_clientes_${fcDataInicio}_a_${fcDataFim}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const imprimirFechamentoPDF = () => {
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8" />
    <title>Fechamento por Cliente</title>
    <style>
      body{font-family: Arial, sans-serif; margin:20px;}
      .header{text-align:center; margin-bottom:16px}
      table{width:100%; border-collapse:collapse}
      th,td{border:1px solid #ddd; padding:8px; text-align:left}
      th{background:#f5f5f5; text-transform:uppercase; font-size:12px}
      tbody tr:nth-child(even){background:#fafafa}
    </style>
    </head><body>
      <div class="header">
        <h2>Fechamento por Cliente</h2>
        <p>Período: ${fcDataInicio} a ${fcDataFim}${fcCliente ? ` • Cliente: ${fcCliente}` : ''}</p>
      </div>
      <table>
        <thead>
          <tr><th>Cliente</th><th>Cidade/UF</th><th>Pedidos</th><th>Valor Total</th><th>Ticket Médio</th></tr>
        </thead>
        <tbody>
          ${fcResultados
            .map(
              (r) => `<tr>
                <td>${r.cliente}</td>
                <td>${r.cidade || ''}/${r.uf || ''}</td>
                <td>${r.pedidos}</td>
                <td>${r.valor.toFixed(2).replace('.', ',')}</td>
                <td>${r.ticket.toFixed(2).replace('.', ',')}</td>
              </tr>`
            )
            .join('')}
        </tbody>
      </table>
    </body></html>`;

    let w = null;
    try { w = window.open('', '_blank'); } catch { w = null; }
    if (w && w.document) {
      w.document.open(); w.document.write(html); w.document.close();
      setTimeout(() => { try { w.focus(); w.print(); } catch { /* ignore */ } }, 300);
    } else {
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed'; iframe.style.right = '0'; iframe.style.bottom = '0';
      iframe.style.width = '0'; iframe.style.height = '0'; iframe.style.border = '0';
      document.body.appendChild(iframe);
      const doc = iframe.contentWindow || iframe.contentDocument; const d = doc.document || doc;
      d.open(); d.write(html); d.close();
      setTimeout(() => { try { (iframe.contentWindow || iframe).print(); } finally { document.body.removeChild(iframe); } }, 300);
    }
  };

  const carregarListas = async () => {
    setCarregandoListas(true);
    try {
      console.log('🔄 Carregando listas (clientes, vendedores, designers)...');
      const results = await Promise.allSettled([
        obterListaClientes(),
        obterListaVendedores(),
        obterListaDesigners(),
        getAllClientes(),
      ]);

      const [clientesRes, vendedoresRes, designersRes, clientesAllRes] = results;

      // Clientes (preferir endpoint completo; fallback para lista do módulo de relatórios)
      try {
        const allClientes = clientesAllRes.status === 'fulfilled' ? (clientesAllRes.value.data || []) : [];
        const listaRelatoriosClientes = clientesRes.status === 'fulfilled' ? (clientesRes.value.data?.clientes || []) : [];
        const baseClientes = Array.isArray(allClientes) && allClientes.length > 0 ? allClientes : listaRelatoriosClientes;
        setListaClientes(listaRelatoriosClientes);
        setFcListaClientes(baseClientes.map((c) => c.nome || c.name || c));
      } catch (e) {
        console.warn('⚠️ Falha ao processar clientes:', e);
        setListaClientes([]);
        setFcListaClientes([]);
      }

      // Vendedores
      try {
        const vendedores = vendedoresRes.status === 'fulfilled' ? (vendedoresRes.value.data?.vendedores || []) : [];
        setListaVendedores(vendedores);
      } catch (e) {
        console.warn('⚠️ Falha ao processar vendedores:', e);
        setListaVendedores([]);
      }

      // Designers – não bloquear se falhar
      if (designersRes.status === 'fulfilled') {
        setListaDesigners(designersRes.value.data?.designers || []);
      } else {
        console.warn('⚠️ Lista de designers indisponível:', designersRes.reason?.message || designersRes.reason);
        setListaDesigners([]);
      }

      // Só mostrar erro se TUDO falhar
      const allRejected = results.every((r) => r.status === 'rejected');
      if (allRejected) {
        setError('Erro ao carregar listas de pessoas. Tente novamente mais tarde.');
      } else {
        setError(null);
      }
    } catch (e) {
      console.error('❌ Erro inesperado ao carregar listas:', e);
      setError('Erro ao carregar listas de pessoas: ' + (e.message || 'desconhecido'));
    } finally {
      setCarregandoListas(false);
    }
  };

  const gerarRelatorio = async (tipo) => {
    console.log('🔄 Iniciando geração de relatório:', { tipo, filtroTipo, filtroNome });
    
    setLoading(true);
    setError(null);
    setRelatorio(null);

    try {
      let response;
      const filtroTipoParam = filtroTipo === 'todos' ? null : filtroTipo;
      const filtroNomeParam = filtroTipo === 'todos' ? null : filtroNome;
      
      console.log('📊 Parâmetros do relatório:', {
        tipo,
        filtroTipoParam,
        filtroNomeParam,
        dataDiario,
        dataSemanal,
        mesMensal,
        anoMensal
      });
      
      switch (tipo) {
        case 'diario':
          console.log('📅 Gerando relatório diário...');
          response = await gerarRelatorioDiario(dataDiario, filtroTipoParam, filtroNomeParam);
          break;
        case 'semanal':
          console.log('📅 Gerando relatório semanal...');
          response = await gerarRelatorioSemanal(dataSemanal);
          break;
        case 'mensal':
          console.log('📅 Gerando relatório mensal...');
          response = await gerarRelatorioMensal(mesMensal, anoMensal);
          break;
        default:
          throw new Error('Tipo de relatório inválido');
      }

      console.log('✅ Relatório gerado com sucesso:', response.data);
      setRelatorio(response.data);
    } catch (err) {
      console.error('❌ Erro ao gerar relatório:', err);
      console.error('❌ Detalhes do erro:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      if (err.response?.status === 403) {
        setError('Acesso negado. Apenas administradores podem acessar relatórios.');
      } else {
        setError(err.response?.data?.detail || err.message || 'Erro ao gerar relatório');
      }
    } finally {
      console.log('🏁 Finalizando geração de relatório');
      setLoading(false);
    }
  };

  const carregarRankingProdutos = async () => {
    try {
      const response = await obterRankingProdutos(20);
      setRankingProdutos(response.data);
    } catch (err) {
      if (err.response?.status === 403) {
        setError('Acesso negado. Apenas administradores podem acessar relatórios.');
      } else {
        console.error('Erro ao carregar ranking de produtos:', err);
      }
    }
  };

  const carregarRelatorioCancelamentos = async () => {
    try {
      const response = await obterRelatorioCancelamentos();
      setRelatorioCancelamentos(response.data);
    } catch (err) {
      if (err.response?.status === 403) {
        setError('Acesso negado. Apenas administradores podem acessar relatórios.');
      } else {
        console.error('Erro ao carregar relatório de cancelamentos:', err);
      }
    }
  };

  useEffect(() => {
    if (['ranking', 'cancelamentos'].includes(activeTab)) {
      if (activeTab === 'ranking') {
        carregarRankingProdutos();
      } else if (activeTab === 'cancelamentos') {
        carregarRelatorioCancelamentos();
      }
    } else {
      carregarListas();
    }
  }, [activeTab]);

  const renderFiltroPessoa = () => {
    const listaAtual = filtroTipo === 'cliente' ? listaClientes :
                      filtroTipo === 'vendedor' ? listaVendedores :
                      filtroTipo === 'designer' ? listaDesigners : [];

    const getPlaceholder = () => {
      if (carregandoListas) return 'Carregando...';
      if (listaAtual.length === 0) return 'Nenhum encontrado';
      
      switch (filtroTipo) {
        case 'cliente': return 'Digite o nome do cliente...';
        case 'vendedor': return 'Digite o nome do vendedor...';
        case 'designer': return 'Digite o nome do designer...';
        default: return 'Selecione...';
      }
    };

    const getLabel = () => {
      switch (filtroTipo) {
        case 'cliente': return 'Cliente';
        case 'vendedor': return 'Vendedor';
        case 'designer': return 'Designer';
        default: return 'Pessoa';
      }
    };

    return (
      <Row className="mb-3">
        <Col md={3}>
          <Form.Group>
            <Form.Label>Filtrar por</Form.Label>
            <Form.Select
              value={filtroTipo}
              onChange={(e) => {
                setFiltroTipo(e.target.value);
                setFiltroNome('');
              }}
            >
              <option value="todos">Todos</option>
              <option value="cliente">Cliente</option>
              <option value="vendedor">Vendedor</option>
              <option value="designer">Designer</option>
            </Form.Select>
          </Form.Group>
        </Col>
        {filtroTipo !== 'todos' && (
          <Col md={4}>
            <AutocompleteInput
              label={getLabel()}
              placeholder={getPlaceholder()}
              options={listaAtual}
              value={filtroNome}
              onChange={setFiltroNome}
              onSelect={(value) => {
                console.log('✅ Pessoa selecionada:', value);
                setFiltroNome(value);
              }}
              disabled={carregandoListas || listaAtual.length === 0}
              loading={carregandoListas}
            />
            {!carregandoListas && listaAtual.length === 0 && (
              <Form.Text className="text-muted">
                {filtroTipo === 'cliente' ? 'Nenhum cliente encontrado' :
                 filtroTipo === 'vendedor' ? 'Nenhum vendedor encontrado' :
                 'Nenhum designer encontrado'}
              </Form.Text>
            )}
          </Col>
        )}
      </Row>
    );
  };

  const renderRelatorioDiario = () => {
    if (!relatorio) {
      console.log('⚠️ Relatório diário não disponível');
      return null;
    }

    console.log('🎨 Renderizando relatório diário:', relatorio);

    // Verificar se os dados essenciais existem
    const dadosSeguros = {
      total_pedidos: relatorio.total_pedidos || 0,
      total_faturado: relatorio.total_faturado || 0,
      ticket_medio: relatorio.ticket_medio || 0,
      quantidade_produtos: relatorio.quantidade_produtos || 0,
      resumo_pagamento: relatorio.resumo_pagamento || {},
      produtos_mais_vendidos: relatorio.produtos_mais_vendidos || [],
      vendas_por_vendedor: relatorio.vendas_por_vendedor || [],
      filtro_tipo: relatorio.filtro_tipo,
      filtro_nome: relatorio.filtro_nome,
      dados_filtrados: relatorio.dados_filtrados
    };

    console.log('🔒 Dados seguros para renderização:', dadosSeguros);

    return (
      <div>
        <Row className="mb-4">
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h3 className="text-primary">{dadosSeguros.total_pedidos}</h3>
                <p className="mb-0">Total de Pedidos</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h3 className="text-success">{formatCurrency(dadosSeguros.total_faturado)}</h3>
                <p className="mb-0">Total Faturado</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h3 className="text-info">{formatCurrency(dadosSeguros.ticket_medio)}</h3>
                <p className="mb-0">Ticket Médio</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h3 className="text-warning">{dadosSeguros.quantidade_produtos}</h3>
                <p className="mb-0">Produtos Vendidos</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {dadosSeguros.filtro_tipo && dadosSeguros.dados_filtrados && (
          <Row className="mb-4">
            <Col>
              <Card className="border-primary">
                <Card.Header className="bg-primary text-white">
                  <h5>
                    {dadosSeguros.filtro_tipo === 'cliente' ? '👤' :
                     dadosSeguros.filtro_tipo === 'vendedor' ? '💼' : '🎨'} 
                    Relatório de {dadosSeguros.filtro_tipo === 'cliente' ? 'Cliente' :
                                 dadosSeguros.filtro_tipo === 'vendedor' ? 'Vendedor' : 'Designer'}: {dadosSeguros.filtro_nome}
                  </h5>
                </Card.Header>
                <Card.Body>
                  {relatorio.filtro_tipo === 'cliente' && (
                    <Row>
                      <Col md={6}>
                        <p><strong>Primeiro Pedido:</strong> {formatDate(relatorio.dados_filtrados.primeiro_pedido)}</p>
                        <p><strong>Último Pedido:</strong> {formatDate(relatorio.dados_filtrados.ultimo_pedido)}</p>
                      </Col>
                      <Col md={6}>
                        <h6>Produtos Comprados:</h6>
                        <Table size="sm">
                          <tbody>
                            {relatorio.dados_filtrados.produtos_comprados.slice(0, 5).map((produto, index) => (
                              <tr key={index}>
                                <td>{produto.produto}</td>
                                <td>{produto.quantidade}x</td>
                                <td>{formatCurrency(produto.valor)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </Col>
                    </Row>
                  )}
                  {(relatorio.filtro_tipo === 'vendedor' || relatorio.filtro_tipo === 'designer') && (
                    <Row>
                      <Col md={6}>
                        <p><strong>Clientes Atendidos:</strong> {relatorio.dados_filtrados.clientes_atendidos}</p>
                      </Col>
                      <Col md={6}>
                        <h6>
                          {relatorio.filtro_tipo === 'vendedor' ? 'Produtos Vendidos' : 'Produtos Desenhados'}:
                        </h6>
                        <Table size="sm">
                          <tbody>
                            {relatorio.dados_filtrados[relatorio.filtro_tipo === 'vendedor' ? 'produtos_vendidos' : 'produtos_desenhados'].slice(0, 5).map((produto, index) => (
                              <tr key={index}>
                                <td>{produto.produto}</td>
                                <td>{produto.quantidade}x</td>
                                <td>{formatCurrency(produto.valor)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </Col>
                    </Row>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        <Row>
          <Col md={6}>
            <Card>
              <Card.Header>
                <h5>Resumo por Forma de Pagamento</h5>
              </Card.Header>
              <Card.Body>
                <Table striped hover size="sm">
                  <thead>
                    <tr>
                      <th>Forma de Pagamento</th>
                      <th>Quantidade</th>
                      <th>Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(dadosSeguros.resumo_pagamento).map(([forma, dados]) => (
                      <tr key={forma}>
                        <td>{forma}</td>
                        <td>{dados?.quantidade || 0}</td>
                        <td>{formatCurrency(dados?.valor || 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card>
              <Card.Header>
                <h5>Produtos Mais Vendidos</h5>
              </Card.Header>
              <Card.Body>
                <Table striped hover size="sm">
                  <thead>
                    <tr>
                      <th>Produto</th>
                      <th>Quantidade</th>
                      <th>Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dadosSeguros.produtos_mais_vendidos.slice(0, 10).map((produto, index) => (
                      <tr key={index}>
                        <td>{produto?.produto || 'N/A'}</td>
                        <td>{produto?.quantidade || 0}</td>
                        <td>{formatCurrency(produto?.valor || 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="mt-3">
          <Col>
            <Card>
              <Card.Header>
                <h5>Vendas por Vendedor</h5>
              </Card.Header>
              <Card.Body>
                <Table striped hover size="sm">
                  <thead>
                    <tr>
                      <th>Vendedor</th>
                      <th>Quantidade</th>
                      <th>Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dadosSeguros.vendas_por_vendedor.map((vendedor, index) => (
                      <tr key={index}>
                        <td>{vendedor?.vendedor || 'N/A'}</td>
                        <td>{vendedor?.quantidade || 0}</td>
                        <td>{formatCurrency(vendedor?.valor || 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    );
  };

  const renderRelatorioSemanal = () => {
    if (!relatorio) return null;

    return (
      <div>
        <Row className="mb-4">
          <Col md={4}>
            <Card className="text-center">
              <Card.Body>
                <h3 className="text-primary">{relatorio.total_pedidos}</h3>
                <p className="mb-0">Total de Pedidos</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="text-center">
              <Card.Body>
                <h3 className="text-success">{formatCurrency(relatorio.total_faturado)}</h3>
                <p className="mb-0">Total Faturado</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="text-center">
              <Card.Body>
                <h3 className="text-info">{formatCurrency(relatorio.ticket_medio)}</h3>
                <p className="mb-0">Ticket Médio</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Card>
              <Card.Header>
                <h5>Comparativo por Dia da Semana</h5>
              </Card.Header>
              <Card.Body>
                <Table striped hover size="sm">
                  <thead>
                    <tr>
                      <th>Dia</th>
                      <th>Data</th>
                      <th>Pedidos</th>
                      <th>Faturamento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {relatorio.comparativo_dias.map((dia, index) => (
                      <tr key={index}>
                        <td>{dia.dia}</td>
                        <td>{formatDate(dia.data)}</td>
                        <td>{dia.pedidos}</td>
                        <td>{formatCurrency(dia.faturamento)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card>
              <Card.Header>
                <h5>Top Clientes da Semana</h5>
              </Card.Header>
              <Card.Body>
                <Table striped hover size="sm">
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th>Pedidos</th>
                      <th>Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {relatorio.top_clientes.map((cliente, index) => (
                      <tr key={index}>
                        <td>{cliente.cliente}</td>
                        <td>{cliente.pedidos}</td>
                        <td>{formatCurrency(cliente.valor)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    );
  };

  const renderRelatorioMensal = () => {
    if (!relatorio) return null;

    return (
      <div>
        <Row className="mb-4">
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h3 className="text-primary">{relatorio.total_pedidos}</h3>
                <p className="mb-0">Total de Pedidos</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h3 className="text-success">{formatCurrency(relatorio.total_faturado)}</h3>
                <p className="mb-0">Total Faturado</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h3 className="text-info">{formatCurrency(relatorio.ticket_medio)}</h3>
                <p className="mb-0">Ticket Médio</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h3 className="text-warning">{relatorio.comparativo_meses.length}</h3>
                <p className="mb-0">Meses Comparados</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Card>
              <Card.Header>
                <h5>Comparativo com Meses Anteriores</h5>
              </Card.Header>
              <Card.Body>
                <Table striped hover size="sm">
                  <thead>
                    <tr>
                      <th>Mês</th>
                      <th>Pedidos</th>
                      <th>Faturamento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {relatorio.comparativo_meses.map((mes, index) => (
                      <tr key={index}>
                        <td>{mes.mes}</td>
                        <td>{mes.pedidos}</td>
                        <td>{formatCurrency(mes.faturamento)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card>
              <Card.Header>
                <h5>Top Clientes do Mês</h5>
              </Card.Header>
              <Card.Body>
                <Table striped hover size="sm">
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th>Pedidos</th>
                      <th>Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {relatorio.top_clientes.map((cliente, index) => (
                      <tr key={index}>
                        <td>{cliente.cliente}</td>
                        <td>{cliente.pedidos}</td>
                        <td>{formatCurrency(cliente.valor)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="mt-3">
          <Col md={6}>
            <Card>
              <Card.Header>
                <h5>Produtos Mais Vendidos</h5>
              </Card.Header>
              <Card.Body>
                <Table striped hover size="sm">
                  <thead>
                    <tr>
                      <th>Produto</th>
                      <th>Quantidade</th>
                      <th>Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {relatorio.produtos_mais_vendidos.map((produto, index) => (
                      <tr key={index}>
                        <td>{produto.produto}</td>
                        <td>{produto.quantidade}</td>
                        <td>{formatCurrency(produto.valor)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card>
              <Card.Header>
                <h5>Distribuição por Forma de Pagamento</h5>
              </Card.Header>
              <Card.Body>
                <Table striped hover size="sm">
                  <thead>
                    <tr>
                      <th>Forma de Pagamento</th>
                      <th>Quantidade</th>
                      <th>Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(relatorio.distribuicao_pagamento).map(([forma, dados]) => (
                      <tr key={forma}>
                        <td>{forma}</td>
                        <td>{dados.quantidade}</td>
                        <td>{formatCurrency(dados.valor)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    );
  };

  const renderRankingProdutos = () => {
    if (!rankingProdutos) return <Spinner animation="border" />;

    return (
      <Card>
        <Card.Header>
          <h5>Ranking dos Produtos Mais Vendidos</h5>
        </Card.Header>
        <Card.Body>
          <Table striped hover>
            <thead>
              <tr>
                <th>Posição</th>
                <th>Produto</th>
                <th>Quantidade Vendida</th>
                <th>Valor Total</th>
                <th>Número de Vendas</th>
              </tr>
            </thead>
            <tbody>
              {rankingProdutos.ranking.map((produto, index) => (
                <tr key={index}>
                  <td>
                    <Badge bg={index < 3 ? 'success' : 'secondary'}>
                      #{index + 1}
                    </Badge>
                  </td>
                  <td>{produto.produto}</td>
                  <td>{produto.quantidade}</td>
                  <td>{formatCurrency(produto.valor_total)}</td>
                  <td>{produto.vendas}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    );
  };

  const renderRelatorioCancelamentos = () => {
    if (!relatorioCancelamentos) return <Spinner animation="border" />;

    return (
      <div>
        <Row className="mb-4">
          <Col md={6}>
            <Card className="text-center">
              <Card.Body>
                <h3 className="text-danger">{relatorioCancelamentos.total_cancelamentos}</h3>
                <p className="mb-0">Total de Cancelamentos</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="text-center">
              <Card.Body>
                <h3 className="text-danger">{formatCurrency(relatorioCancelamentos.valor_cancelamentos)}</h3>
                <p className="mb-0">Valor Cancelado</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Card>
          <Card.Header>
            <h5>Cancelamentos por Motivo</h5>
          </Card.Header>
          <Card.Body>
            <Table striped hover>
              <thead>
                <tr>
                  <th>Motivo</th>
                  <th>Quantidade</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(relatorioCancelamentos.cancelamentos_por_motivo).map(([motivo, dados]) => (
                  <tr key={motivo}>
                    <td>{motivo}</td>
                    <td>{dados.quantidade}</td>
                    <td>{formatCurrency(dados.valor)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </div>
    );
  };

  // Verificar se o usuário é admin
  if (!isAdmin()) {
    return (
      <Container fluid className="mt-4">
        <Row>
          <Col>
            <Alert variant="danger" className="text-center">
              <h4>🚫 Acesso Negado</h4>
              <p>Você não tem permissão para acessar esta área.</p>
              <p>Apenas administradores podem visualizar relatórios administrativos.</p>
            </Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  // Try-catch global para evitar tela branca
  try {

  return (
    <Container fluid className="mt-4">
      <Row>
        <Col>
          <h2>📊 Relatórios Administrativos</h2>
          <p className="text-muted">Acompanhe o desempenho do seu negócio com relatórios detalhados</p>
        </Col>
      </Row>

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
      >
        <Tab eventKey="fechamentoCliente" title="🧾 Fechamento por Cliente">
          <Card>
            <Card.Header>
              <h5>Fechamento por Cliente</h5>
            </Card.Header>
            <Card.Body>
              <Row className="mb-3">
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Data Início</Form.Label>
                    <Form.Control type="date" value={fcDataInicio} onChange={(e) => setFcDataInicio(e.target.value)} />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Data Fim</Form.Label>
                    <Form.Control type="date" value={fcDataFim} onChange={(e) => setFcDataFim(e.target.value)} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <AutocompleteInput
                    label="Cliente (opcional)"
                    placeholder="Digite o nome do cliente..."
                    options={fcListaClientes}
                    value={fcCliente}
                    onChange={setFcCliente}
                    onSelect={setFcCliente}
                    loading={carregandoListas}
                  />
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <Button variant="primary" onClick={gerarFechamentoClientes} disabled={fcLoading}>
                    {fcLoading ? <Spinner size="sm" /> : 'Gerar Fechamento'}
                  </Button>
                </Col>
                <Col md={6} className="text-end">
                  {fcResultados.length > 0 && (
                    <>
                      <Button className="me-2" variant="outline-secondary" onClick={exportarFechamentoCSV}>Exportar CSV</Button>
                      <Button variant="success" onClick={imprimirFechamentoPDF}>Salvar PDF</Button>
                    </>
                  )}
                </Col>
              </Row>

              {error && <Alert variant="danger">{error}</Alert>}

              {fcResultados.length > 0 && (
                <Table striped hover responsive size="sm">
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th>Cidade/UF</th>
                      <th>Pedidos</th>
                      <th>Valor Total</th>
                      <th>Ticket Médio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fcResultados.map((r, idx) => (
                      <tr key={idx}>
                        <td>{r.cliente}</td>
                        <td>{(r.cidade || '') + '/' + (r.uf || '')}</td>
                        <td>{r.pedidos}</td>
                        <td>{formatCurrency(r.valor)}</td>
                        <td>{formatCurrency(r.ticket)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Tab>
        <Tab eventKey="diario" title="📅 Relatório Diário">
          <Card>
            <Card.Header>
              <h5>Fechamento Diário</h5>
            </Card.Header>
            <Card.Body>
              <Row className="mb-3">
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Data</Form.Label>
                    <Form.Control
                      type="date"
                      value={dataDiario}
                      onChange={(e) => setDataDiario(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={3} className="d-flex align-items-end">
                  <Button 
                    variant="primary" 
                    onClick={() => gerarRelatorio('diario')}
                    disabled={loading}
                  >
                    {loading ? <Spinner size="sm" /> : 'Gerar Relatório'}
                  </Button>
                </Col>
              </Row>

              {renderFiltroPessoa()}

              {error && <Alert variant="danger">{error}</Alert>}
              {relatorio && renderRelatorioDiario()}
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="semanal" title="📅 Relatório Semanal">
          <Card>
            <Card.Header>
              <h5>Fechamento Semanal</h5>
            </Card.Header>
            <Card.Body>
              <Row className="mb-3">
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Data de Início da Semana</Form.Label>
                    <Form.Control
                      type="date"
                      value={dataSemanal}
                      onChange={(e) => setDataSemanal(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={3} className="d-flex align-items-end">
                  <Button 
                    variant="primary" 
                    onClick={() => gerarRelatorio('semanal')}
                    disabled={loading}
                  >
                    {loading ? <Spinner size="sm" /> : 'Gerar Relatório'}
                  </Button>
                </Col>
              </Row>

              {renderFiltroPessoa()}

              {error && <Alert variant="danger">{error}</Alert>}
              {relatorio && renderRelatorioSemanal()}
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="mensal" title="📅 Relatório Mensal">
          <Card>
            <Card.Header>
              <h5>Fechamento Mensal</h5>
            </Card.Header>
            <Card.Body>
              <Row className="mb-3">
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Mês</Form.Label>
                    <Form.Select
                      value={mesMensal}
                      onChange={(e) => setMesMensal(parseInt(e.target.value))}
                    >
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {new Date(0, i).toLocaleString('pt-BR', { month: 'long' })}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Ano</Form.Label>
                    <Form.Control
                      type="number"
                      value={anoMensal}
                      onChange={(e) => setAnoMensal(parseInt(e.target.value))}
                      min="2020"
                      max="2030"
                    />
                  </Form.Group>
                </Col>
                <Col md={3} className="d-flex align-items-end">
                  <Button 
                    variant="primary" 
                    onClick={() => gerarRelatorio('mensal')}
                    disabled={loading}
                  >
                    {loading ? <Spinner size="sm" /> : 'Gerar Relatório'}
                  </Button>
                </Col>
              </Row>

              {renderFiltroPessoa()}

              {error && <Alert variant="danger">{error}</Alert>}
              {relatorio && renderRelatorioMensal()}
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="ranking" title="🏆 Ranking de Produtos">
          <Card>
            <Card.Header>
              <h5>Ranking dos Produtos Mais Vendidos</h5>
            </Card.Header>
            <Card.Body>
              {renderRankingProdutos()}
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="cancelamentos" title="❌ Cancelamentos">
          <Card>
            <Card.Header>
              <h5>Relatório de Cancelamentos</h5>
            </Card.Header>
            <Card.Body>
              {renderRelatorioCancelamentos()}
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
    </Container>
  );
  } catch (error) {
    console.error('❌ Erro crítico na renderização:', error);
    return (
      <Container fluid className="mt-4">
        <Row>
          <Col>
            <Alert variant="danger" className="text-center">
              <h4>🚨 Erro na Página</h4>
              <p>Ocorreu um erro inesperado na página de relatórios.</p>
              <p>Detalhes: {error.message}</p>
              <Button 
                variant="primary" 
                onClick={() => window.location.reload()}
                className="mt-2"
              >
                Recarregar Página
              </Button>
            </Alert>
          </Col>
        </Row>
      </Container>
    );
  }
}

export default PageRelatorios;