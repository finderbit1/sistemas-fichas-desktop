import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Row, Col, Table, Card, Alert, Spinner } from 'react-bootstrap';
import { Calendar, Truck, FileText, Download, Search } from 'react-bootstrap-icons';
import { getAllPedidos, getAllFormasEnvios } from '../services/api';
import { obterPedidos } from '../utils/localStorageHelper';

function RelatorioEnvios() {
  const [filters, setFilters] = useState({
    dataInicio: '',
    dataFim: '',
  });
  const [pedidos, setPedidos] = useState([]);
  const [formasEnvio, setFormasEnvio] = useState([]);
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // Carregar dados iniciais
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoadingData(true);
      
      // Carregar pedidos da API
      const pedidosResponse = await getAllPedidos();
      const pedidosApi = pedidosResponse.data || [];
      
      // Carregar pedidos do localStorage como fallback
      const pedidosLocal = obterPedidos();
      
      // Combinar dados (API tem prioridade)
      const todosPedidos = [...pedidosApi, ...pedidosLocal.filter(p => 
        !pedidosApi.some(api => api.id === p.id)
      )];
      
      setPedidos(todosPedidos);
      
      // Carregar formas de envio
      const enviosResponse = await getAllFormasEnvios();
      setFormasEnvio(enviosResponse.data || []);
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      // Usar apenas dados do localStorage em caso de erro
      setPedidos(obterPedidos());
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const gerarRelatorio = () => {
    if (!filters.dataInicio || !filters.dataFim) {
      alert('Por favor, selecione o intervalo de datas');
      return;
    }

    setLoading(true);
    
    // Filtrar pedidos por data de entrega
    const pedidosFiltrados = pedidos.filter(pedido => {
      const dataEntrega = pedido.dataEntrega || pedido.data_entrega;
      return dataEntrega >= filters.dataInicio && dataEntrega <= filters.dataFim;
    });

    // Agrupar por forma de envio
    const agrupados = {};
    
    pedidosFiltrados.forEach(pedido => {
      const formaEnvio = pedido.formaEnvio || pedido.forma_envio || 'Não especificado';
      const formaEnvioObj = formasEnvio.find(f => f.id === pedido.formaEnvio || f.id === pedido.forma_envio);
      const nomeFormaEnvio = formaEnvioObj ? formaEnvioObj.name : formaEnvio;
      
      if (!agrupados[nomeFormaEnvio]) {
        agrupados[nomeFormaEnvio] = [];
      }
      
      // Extrair informações do pedido
      const cliente = pedido.cliente || pedido.nome_cliente || 'Cliente não informado';
      const cidade = pedido.cidade || pedido.endereco?.cidade || 'Cidade não informada';
      
      // Extrair tipos de itens
      const itens = pedido.itens || pedido.items || [];
      const tiposItens = itens.map(item => item.tipo || item.nome || 'Item').join(', ');
      
      agrupados[nomeFormaEnvio].push({
        cliente,
        tiposItens: tiposItens || 'Sem itens especificados',
        cidade,
        pedidoId: pedido.id,
        dataEntrega: pedido.dataEntrega || pedido.data_entrega
      });
    });

    setResultados(agrupados);
    setLoading(false);
  };

  const imprimirRelatorio = () => {
    const conteudo = gerarConteudoImpressao();
    const janela = window.open('', '_blank');
    janela.document.write(conteudo);
    janela.document.close();
    janela.print();
  };

  const gerarConteudoImpressao = () => {
    const dataInicio = new Date(filters.dataInicio).toLocaleDateString('pt-BR');
    const dataFim = new Date(filters.dataFim).toLocaleDateString('pt-BR');
    
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Relatório de Envios - ${dataInicio} a ${dataFim}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .forma-envio { margin-bottom: 30px; page-break-inside: avoid; }
          .forma-titulo { background: #f8f9fa; padding: 10px; font-weight: bold; border: 1px solid #dee2e6; }
          .item { padding: 8px; border-bottom: 1px solid #eee; }
          .item:last-child { border-bottom: none; }
          .cliente { font-weight: bold; }
          .tipos { color: #666; font-style: italic; }
          .cidade { color: #007bff; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Relatório de Envios</h1>
          <p>Período: ${dataInicio} a ${dataFim}</p>
          <p>Gerado em: ${new Date().toLocaleString('pt-BR')}</p>
        </div>
    `;

    Object.keys(resultados).forEach(formaEnvio => {
      html += `
        <div class="forma-envio">
          <div class="forma-titulo">${formaEnvio}</div>
      `;
      
      resultados[formaEnvio].forEach(item => {
        html += `
          <div class="item">
            <span class="cliente">${item.cliente}</span> - 
            <span class="tipos">${item.tiposItens}</span> - 
            <span class="cidade">${item.cidade}</span>
          </div>
        `;
      });
      
      html += `</div>`;
    });

    html += `</body></html>`;
    return html;
  };

  if (loadingData) {
    return (
      <div className="text-center p-4">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Carregando dados...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 0 }}>
      <div className="dashboard-card mb-4">
        <div className="dashboard-card-header">
          <h4 className="dashboard-card-title">
            <Truck size={20} style={{ marginRight: '8px' }} />
            Relatório de Envios
          </h4>
        </div>
      </div>
      
      <div className="dashboard-card mb-4">
        <div className="dashboard-card-header">
          <h5 className="dashboard-card-title">
            <Calendar size={16} style={{ marginRight: '8px' }} />
            Filtros de Data
          </h5>
        </div>
        <div style={{ padding: 'var(--spacing-4)' }}>
          <Row className="mb-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Data Início</Form.Label>
                <Form.Control 
                  type="date" 
                  name="dataInicio" 
                  value={filters.dataInicio}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Data Fim</Form.Label>
                <Form.Control 
                  type="date" 
                  name="dataFim" 
                  value={filters.dataFim}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={4} className="d-flex align-items-end">
              <Button 
                onClick={gerarRelatorio} 
                disabled={loading}
                className="me-2"
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                {loading ? <Spinner size="sm" /> : <Search size={16} />}
                {loading ? 'Gerando...' : 'Gerar Relatório'}
              </Button>
              {Object.keys(resultados).length > 0 && (
                <Button 
                  variant="success" 
                  onClick={imprimirRelatorio}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Download size={16} />
                  Imprimir
                </Button>
              )}
            </Col>
          </Row>
        </div>
      </div>

      {Object.keys(resultados).length > 0 && (
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <h5 className="dashboard-card-title">
              <FileText size={16} style={{ marginRight: '8px' }} />
              Relatório Agrupado por Forma de Envio
            </h5>
          </div>
          <div style={{ padding: 'var(--spacing-4)' }}>
            {Object.keys(resultados).map(formaEnvio => (
              <Card key={formaEnvio} className="mb-4">
                <Card.Header className="bg-primary text-white">
                  <h6 className="mb-0">
                    <Truck size={16} className="me-2" />
                    {formaEnvio} ({resultados[formaEnvio].length} pedidos)
                  </h6>
                </Card.Header>
                <Card.Body>
                  {resultados[formaEnvio].map((item, index) => (
                    <div key={index} className="border-bottom pb-2 mb-2">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <strong className="text-primary">{item.cliente}</strong>
                          <div className="text-muted small">
                            <em>{item.tiposItens}</em>
                          </div>
                        </div>
                        <div className="text-end">
                          <span className="badge bg-info">{item.cidade}</span>
                          <div className="small text-muted">
                            Entrega: {new Date(item.dataEntrega).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </Card.Body>
              </Card>
            ))}
          </div>
        </div>
      )}

      {Object.keys(resultados).length === 0 && !loading && (
        <Alert variant="info" className="text-center">
          <FileText size={24} className="mb-2" />
          <h5>Nenhum pedido encontrado</h5>
          <p>Selecione um intervalo de datas para gerar o relatório de envios.</p>
        </Alert>
      )}
    </div>
  );
}

export default RelatorioEnvios;
