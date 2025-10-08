import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Table,
  Alert,
  Spinner,
  Badge,
  ButtonGroup,
  Collapse
} from 'react-bootstrap';
import {
  Calendar,
  Truck,
  Download,
  FileText,
  ArrowUp,
  ArrowDown,
  GeoAlt,
  People,
  CurrencyDollar,
  Box,
  Filter,
  X
} from 'react-bootstrap-icons';
import { gerarRelatorioEnvios, getAllFormasEnvios } from '../services/api';
import { formatCurrency } from '../utils/formatters';
import { exportarRelatorioExcel, exportarRelatorioCSV, exportarRelatorioPDF } from '../utils/reportExporter';

const PageRelatorioEnviosModerno = () => {
  // Estados principais
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dados, setDados] = useState(null);
  
  // Estados de filtros
  const [filtros, setFiltros] = useState({
    data_inicio: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    data_fim: new Date().toISOString().split('T')[0],
    formas_envio: [],
    cidades: [],
    estados: [],
    status: [],
    vendedor: '',
    designer: '',
    valor_min: '',
    valor_max: ''
  });
  
  // Estados auxiliares
  const [formasEnvio, setFormasEnvio] = useState([]);
  const [mostrarFiltrosAvancados, setMostrarFiltrosAvancados] = useState(false);
  const [abaSelecionada, setAbaSelecionada] = useState('visao-geral');
  
  // Carregar formas de envio
  useEffect(() => {
    carregarFormasEnvio();
  }, []);
  
  const carregarFormasEnvio = async () => {
    try {
      const response = await getAllFormasEnvios();
      setFormasEnvio(response.data || []);
    } catch (err) {
      console.error('Erro ao carregar formas de envio:', err);
    }
  };
  
  // Presets de período
  const aplicarPreset = (preset) => {
    const hoje = new Date();
    let dataInicio, dataFim;
    
    switch (preset) {
      case 'hoje':
        dataInicio = dataFim = hoje.toISOString().split('T')[0];
        break;
      case '7dias':
        dataInicio = new Date(hoje.setDate(hoje.getDate() - 6)).toISOString().split('T')[0];
        dataFim = new Date().toISOString().split('T')[0];
        break;
      case '30dias':
        dataInicio = new Date(hoje.setDate(hoje.getDate() - 29)).toISOString().split('T')[0];
        dataFim = new Date().toISOString().split('T')[0];
        break;
      case 'mes':
        dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0];
        dataFim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString().split('T')[0];
        break;
      default:
        return;
    }
    
    setFiltros({ ...filtros, data_inicio: dataInicio, data_fim: dataFim });
  };
  
  // Gerar relatório
  const gerarRelatorio = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Preparar filtros para a API
      const filtrosAPI = {
        data_inicio: filtros.data_inicio || null,
        data_fim: filtros.data_fim || null,
        formas_envio: filtros.formas_envio.length > 0 ? filtros.formas_envio : null,
        cidades: filtros.cidades.length > 0 ? filtros.cidades : null,
        estados: filtros.estados.length > 0 ? filtros.estados : null,
        status: filtros.status.length > 0 ? filtros.status : null,
        vendedor: filtros.vendedor || null,
        designer: filtros.designer || null,
        valor_min: filtros.valor_min ? parseFloat(filtros.valor_min) : null,
        valor_max: filtros.valor_max ? parseFloat(filtros.valor_max) : null
      };
      
      const response = await gerarRelatorioEnvios(filtrosAPI);
      setDados(response.data);
    } catch (err) {
      console.error('Erro ao gerar relatório:', err);
      setError(err.response?.data?.detail || err.message || 'Erro ao gerar relatório');
    } finally {
      setLoading(false);
    }
  };
  
  // Limpar filtros
  const limparFiltros = () => {
    setFiltros({
      data_inicio: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
      data_fim: new Date().toISOString().split('T')[0],
      formas_envio: [],
      cidades: [],
      estados: [],
      status: [],
      vendedor: '',
      designer: '',
      valor_min: '',
      valor_max: ''
    });
  };
  
  // Cálculos derivados
  const estatisticasComputadas = useMemo(() => {
    if (!dados) return null;
    
    return {
      totalFormasEnvio: dados.estatisticas_envios?.length || 0,
      formaMaisUsada: dados.estatisticas_envios?.[0]?.forma_envio || 'N/A',
      cidadeMaisAtiva: dados.top_cidades?.[0]?.cidade || 'N/A',
      crescimento: dados.comparativo_periodo_anterior?.variacao_pedidos || 0
    };
  }, [dados]);
  
  // Cards de KPIs
  const renderKPIs = () => {
    if (!dados) return null;
    
    const kpis = [
      {
        titulo: 'Total de Pedidos',
        valor: dados.total_pedidos,
        icon: <Box size={24} />,
        cor: 'primary',
        variacao: estatisticasComputadas?.crescimento
      },
      {
        titulo: 'Total de Itens',
        valor: dados.total_itens,
        icon: <Truck size={24} />,
        cor: 'info'
      },
      {
        titulo: 'Valor Total',
        valor: formatCurrency(dados.valor_total),
        icon: <CurrencyDollar size={24} />,
        cor: 'success'
      },
      {
        titulo: 'Ticket Médio',
        valor: formatCurrency(dados.ticket_medio),
        icon: <ArrowUp size={24} />,
        cor: 'warning'
      }
    ];
    
    return (
      <Row className="mb-4">
        {kpis.map((kpi, idx) => (
          <Col md={3} key={idx} className="mb-3">
            <Card className="h-100 shadow-sm border-0" style={{ 
              background: `linear-gradient(135deg, var(--bs-${kpi.cor}) 0%, var(--bs-${kpi.cor}-dark, var(--bs-${kpi.cor})) 100%)`,
              color: 'white'
            }}>
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <div style={{ opacity: 0.9, fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                      {kpi.titulo}
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>
                      {kpi.valor}
                    </div>
                    {kpi.variacao !== undefined && (
                      <div className="mt-2" style={{ fontSize: '0.85rem', opacity: 0.95 }}>
                        {kpi.variacao >= 0 ? (
                          <><ArrowUp size={16} /> +{kpi.variacao.toFixed(1)}%</>
                        ) : (
                          <><ArrowDown size={16} /> {kpi.variacao.toFixed(1)}%</>
                        )}
                        <span style={{ opacity: 0.8 }}> vs período anterior</span>
                      </div>
                    )}
                  </div>
                  <div style={{ opacity: 0.3, fontSize: '2.5rem' }}>
                    {kpi.icon}
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    );
  };
  
  // Gráfico de Pizza (SVG simples)
  const renderGraficoPizza = () => {
    if (!dados?.estatisticas_envios || dados.estatisticas_envios.length === 0) return null;
    
    const cores = ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#fee140', '#30cfd0'];
    let anguloInicial = 0;
    const raio = 100;
    const centroX = 120;
    const centroY = 120;
    
    const fatias = dados.estatisticas_envios.slice(0, 7).map((envio, idx) => {
      const percentual = envio.percentual_valor / 100;
      const anguloFatia = percentual * 360;
      const anguloFinal = anguloInicial + anguloFatia;
      
      const x1 = centroX + raio * Math.cos((anguloInicial - 90) * Math.PI / 180);
      const y1 = centroY + raio * Math.sin((anguloInicial - 90) * Math.PI / 180);
      const x2 = centroX + raio * Math.cos((anguloFinal - 90) * Math.PI / 180);
      const y2 = centroY + raio * Math.sin((anguloFinal - 90) * Math.PI / 180);
      
      const largeArcFlag = anguloFatia > 180 ? 1 : 0;
      const path = `M ${centroX} ${centroY} L ${x1} ${y1} A ${raio} ${raio} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
      
      anguloInicial = anguloFinal;
      
      return { path, cor: cores[idx % cores.length], envio };
    });
    
    return (
      <Card className="shadow-sm border-0 mb-4">
        <Card.Header className="bg-white border-bottom">
          <h5 className="mb-0"><FileText size={20} className="me-2" />Distribuição por Forma de Envio (Valor)</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6} className="d-flex justify-content-center align-items-center">
              <svg width="240" height="240" viewBox="0 0 240 240">
                {fatias.map((fatia, idx) => (
                  <g key={idx}>
                    <path d={fatia.path} fill={fatia.cor} opacity="0.9" />
                  </g>
                ))}
              </svg>
            </Col>
            <Col md={6} className="d-flex align-items-center">
              <div className="w-100">
                {fatias.map((fatia, idx) => (
                  <div key={idx} className="d-flex align-items-center mb-2">
                    <div style={{ 
                      width: '16px', 
                      height: '16px', 
                      backgroundColor: fatia.cor, 
                      borderRadius: '4px',
                      marginRight: '8px'
                    }} />
                    <div className="flex-grow-1">
                      <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{fatia.envio.forma_envio}</div>
                      <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>
                        {formatCurrency(fatia.envio.valor_total)} ({fatia.envio.percentual_valor.toFixed(1)}%)
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    );
  };
  
  // Tabela de estatísticas
  const renderTabelaEstatisticas = () => {
    if (!dados?.estatisticas_envios) return null;
    
    return (
      <Card className="shadow-sm border-0 mb-4">
        <Card.Header className="bg-white border-bottom">
          <h5 className="mb-0"><Truck size={20} className="me-2" />Estatísticas por Forma de Envio</h5>
        </Card.Header>
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0">
            <thead style={{ backgroundColor: '#f8f9fa' }}>
              <tr>
                <th>Forma de Envio</th>
                <th className="text-center">Pedidos</th>
                <th className="text-center">% Pedidos</th>
                <th className="text-center">Itens</th>
                <th className="text-end">Valor Total</th>
                <th className="text-center">% Valor</th>
                <th className="text-end">Ticket Médio</th>
              </tr>
            </thead>
            <tbody>
              {dados.estatisticas_envios.map((envio, idx) => (
                <tr key={idx}>
                  <td>
                    <strong>{envio.forma_envio}</strong>
                    <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>
                      {envio.cidades.slice(0, 3).map(c => c.cidade).join(', ')}
                      {envio.cidades.length > 3 && '...'}
                    </div>
                  </td>
                  <td className="text-center">{envio.quantidade_pedidos}</td>
                  <td className="text-center">
                    <Badge bg="primary" style={{ opacity: 0.7 }}>
                      {envio.percentual_pedidos.toFixed(1)}%
                    </Badge>
                  </td>
                  <td className="text-center">{envio.quantidade_itens}</td>
                  <td className="text-end">{formatCurrency(envio.valor_total)}</td>
                  <td className="text-center">
                    <Badge bg="success" style={{ opacity: 0.7 }}>
                      {envio.percentual_valor.toFixed(1)}%
                    </Badge>
                  </td>
                  <td className="text-end">{formatCurrency(envio.ticket_medio)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    );
  };
  
  // Distribuição geográfica
  const renderDistribuicaoGeografica = () => {
    if (!dados) return null;
    
    return (
      <Row className="mb-4">
        <Col md={6}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Header className="bg-white border-bottom">
              <h5 className="mb-0"><GeoAlt size={20} className="me-2" />Top 10 Cidades</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <Table responsive hover className="mb-0">
                <thead style={{ backgroundColor: '#f8f9fa' }}>
                  <tr>
                    <th>Cidade</th>
                    <th className="text-center">Pedidos</th>
                    <th className="text-end">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {(dados.top_cidades || []).map((cidade, idx) => (
                    <tr key={idx}>
                      <td>
                        <Badge bg="secondary" className="me-2">#{idx + 1}</Badge>
                        {cidade.cidade}
                      </td>
                      <td className="text-center">{cidade.quantidade}</td>
                      <td className="text-end">{formatCurrency(cidade.valor)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Header className="bg-white border-bottom">
              <h5 className="mb-0"><People size={20} className="me-2" />Top 10 Clientes</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <Table responsive hover className="mb-0">
                <thead style={{ backgroundColor: '#f8f9fa' }}>
                  <tr>
                    <th>Cliente</th>
                    <th className="text-center">Pedidos</th>
                    <th className="text-end">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {(dados.top_clientes || []).map((cliente, idx) => (
                    <tr key={idx}>
                      <td>
                        <Badge bg="primary" className="me-2">#{idx + 1}</Badge>
                        <div>{cliente.cliente}</div>
                        <div style={{ fontSize: '0.75rem', color: '#6c757d' }}>
                          {cliente.formas_envio.join(', ')}
                        </div>
                      </td>
                      <td className="text-center">{cliente.pedidos}</td>
                      <td className="text-end">{formatCurrency(cliente.valor)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    );
  };
  
  return (
    <Container fluid className="py-4">
      {/* Header */}
      <div className="mb-4">
        <h2><Truck size={32} className="me-2" />Relatório de Envios - Dashboard Moderno</h2>
        <p className="text-muted">Análise completa de envios com estatísticas e insights</p>
      </div>
      
      {/* Filtros */}
      <Card className="shadow-sm border-0 mb-4">
        <Card.Header className="bg-white border-bottom">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0"><Filter size={20} className="me-2" />Filtros</h5>
            <div>
              <Button 
                variant="link" 
                size="sm" 
                onClick={() => setMostrarFiltrosAvancados(!mostrarFiltrosAvancados)}
              >
                {mostrarFiltrosAvancados ? 'Ocultar' : 'Mostrar'} Filtros Avançados
              </Button>
              <Button variant="link" size="sm" onClick={limparFiltros}>
                <X size={16} /> Limpar
              </Button>
            </div>
          </div>
        </Card.Header>
        <Card.Body>
          {/* Filtros Básicos */}
          <Row className="mb-3">
            <Col md={3}>
              <Form.Group>
                <Form.Label><Calendar size={16} className="me-1" />Data Início</Form.Label>
                <Form.Control
                  type="date"
                  value={filtros.data_inicio}
                  onChange={(e) => setFiltros({ ...filtros, data_inicio: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label><Calendar size={16} className="me-1" />Data Fim</Form.Label>
                <Form.Control
                  type="date"
                  value={filtros.data_fim}
                  onChange={(e) => setFiltros({ ...filtros, data_fim: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col md={6} className="d-flex align-items-end">
              <ButtonGroup size="sm" className="me-2">
                <Button variant="outline-secondary" onClick={() => aplicarPreset('hoje')}>Hoje</Button>
                <Button variant="outline-secondary" onClick={() => aplicarPreset('7dias')}>7 dias</Button>
                <Button variant="outline-secondary" onClick={() => aplicarPreset('30dias')}>30 dias</Button>
                <Button variant="outline-secondary" onClick={() => aplicarPreset('mes')}>Este mês</Button>
              </ButtonGroup>
              <Button 
                variant="primary" 
                onClick={gerarRelatorio} 
                disabled={loading}
                className="me-2"
              >
                {loading ? <><Spinner size="sm" className="me-2" />Gerando...</> : 'Gerar Relatório'}
              </Button>
              {dados && (
                <ButtonGroup>
                  <Button variant="outline-success" size="sm" onClick={() => exportarRelatorioExcel(dados)}>
                    <Download size={16} /> Excel
                  </Button>
                  <Button variant="outline-info" size="sm" onClick={() => exportarRelatorioCSV(dados)}>
                    <Download size={16} /> CSV
                  </Button>
                  <Button variant="outline-danger" size="sm" onClick={() => exportarRelatorioPDF(dados)}>
                    <Download size={16} /> PDF
                  </Button>
                </ButtonGroup>
              )}
            </Col>
          </Row>
          
          {/* Filtros Avançados */}
          <Collapse in={mostrarFiltrosAvancados}>
            <div>
              <hr />
              <Row>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Forma de Envio</Form.Label>
                    <Form.Select 
                      value=""
                      onChange={(e) => {
                        if (e.target.value && !filtros.formas_envio.includes(e.target.value)) {
                          setFiltros({ 
                            ...filtros, 
                            formas_envio: [...filtros.formas_envio, e.target.value] 
                          });
                        }
                      }}
                    >
                      <option value="">Selecione...</option>
                      {formasEnvio.map(forma => (
                        <option key={forma.id} value={forma.name}>{forma.name}</option>
                      ))}
                    </Form.Select>
                    <div className="mt-2">
                      {filtros.formas_envio.map((forma, idx) => (
                        <Badge key={idx} bg="primary" className="me-1">
                          {forma}
                          <X 
                            size={14} 
                            className="ms-1" 
                            style={{ cursor: 'pointer' }}
                            onClick={() => setFiltros({
                              ...filtros,
                              formas_envio: filtros.formas_envio.filter(f => f !== forma)
                            })}
                          />
                        </Badge>
                      ))}
                    </div>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Vendedor</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Nome do vendedor..."
                      value={filtros.vendedor}
                      onChange={(e) => setFiltros({ ...filtros, vendedor: e.target.value })}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Designer</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Nome do designer..."
                      value={filtros.designer}
                      onChange={(e) => setFiltros({ ...filtros, designer: e.target.value })}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Faixa de Valor</Form.Label>
                    <div className="d-flex gap-2">
                      <Form.Control
                        type="number"
                        placeholder="Mín"
                        value={filtros.valor_min}
                        onChange={(e) => setFiltros({ ...filtros, valor_min: e.target.value })}
                      />
                      <Form.Control
                        type="number"
                        placeholder="Máx"
                        value={filtros.valor_max}
                        onChange={(e) => setFiltros({ ...filtros, valor_max: e.target.value })}
                      />
                    </div>
                  </Form.Group>
                </Col>
              </Row>
            </div>
          </Collapse>
        </Card.Body>
      </Card>
      
      {/* Erro */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {/* Resultados */}
      {dados && (
        <>
          {renderKPIs()}
          {renderGraficoPizza()}
          {renderTabelaEstatisticas()}
          {renderDistribuicaoGeografica()}
          
          {/* Comparativo período anterior */}
          {dados.comparativo_periodo_anterior && (
            <Card className="shadow-sm border-0 mb-4">
              <Card.Header className="bg-white border-bottom">
                <h5 className="mb-0"><ArrowUp size={20} className="me-2" />Comparativo com Período Anterior</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <div className="mb-2">
                      <strong>Período Anterior:</strong> {dados.comparativo_periodo_anterior.periodo_anterior.inicio} a {dados.comparativo_periodo_anterior.periodo_anterior.fim}
                    </div>
                    <div className="mb-2">
                      <strong>Pedidos:</strong> {dados.comparativo_periodo_anterior.periodo_anterior.total_pedidos}
                    </div>
                    <div>
                      <strong>Valor:</strong> {formatCurrency(dados.comparativo_periodo_anterior.periodo_anterior.valor_total)}
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="mb-2">
                      <strong>Variação em Pedidos:</strong>{' '}
                      <Badge bg={dados.comparativo_periodo_anterior.variacao_pedidos >= 0 ? 'success' : 'danger'}>
                        {dados.comparativo_periodo_anterior.variacao_pedidos >= 0 ? <ArrowUp /> : <ArrowDown />}
                        {' '}{Math.abs(dados.comparativo_periodo_anterior.variacao_pedidos).toFixed(1)}%
                      </Badge>
                    </div>
                    <div>
                      <strong>Variação em Valor:</strong>{' '}
                      <Badge bg={dados.comparativo_periodo_anterior.variacao_valor >= 0 ? 'success' : 'danger'}>
                        {dados.comparativo_periodo_anterior.variacao_valor >= 0 ? <ArrowUp /> : <ArrowDown />}
                        {' '}{Math.abs(dados.comparativo_periodo_anterior.variacao_valor).toFixed(1)}%
                      </Badge>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          )}
        </>
      )}
      
      {/* Mensagem inicial */}
      {!dados && !loading && (
        <Alert variant="info" className="text-center">
          <FileText size={32} className="mb-2" />
          <h5>Selecione os filtros e clique em "Gerar Relatório"</h5>
          <p className="mb-0">O relatório será gerado com estatísticas completas de envios</p>
        </Alert>
      )}
    </Container>
  );
};

export default PageRelatorioEnviosModerno;

