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
  const [resultados, setResultados] = useState({});
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

    // Agrupar por forma de envio: forma de envio:\ncliente - tipo de items - cidade/estado
    const grupos = {};
    pedidosFiltrados.forEach(pedido => {
      const formaEnvioId = pedido.formaEnvioId || pedido.forma_envio_id || pedido.formaEnvio || pedido.forma_envio;
      const formaEnvioNomeDireto = pedido.formaEnvio || pedido.forma_envio || '';
      const formaEnvioObj = formasEnvio.find(f => f.id === formaEnvioId) || formasEnvio.find(f => f.name === formaEnvioNomeDireto);
      const formaEnvioNome = (formaEnvioObj && formaEnvioObj.name) || formaEnvioNomeDireto || 'Não especificado';

      const cliente = pedido.nomeCliente || pedido.cliente || pedido.nome_cliente || 'Cliente não informado';
      const cidade = pedido.cidadeCliente || pedido.cidade_cliente || pedido.cidade || pedido.endereco?.cidade || '';
      const estado = pedido.estadoCliente || pedido.estado_cliente || pedido.estado || pedido.endereco?.estado || '';
      const cidadeEstado = estado ? `${cidade}/${estado}` : (cidade || 'Cidade não informada');
      const itens = pedido.items || pedido.itens || [];
      const tipos = itens.map(item => item.tipoProducao || item.tipo || item.tipo_producao || item.nome || 'Item');
      const tiposItens = tipos.length > 0 ? Array.from(new Set(tipos)).join(', ') : 'Sem itens especificados';

      if (!grupos[formaEnvioNome]) grupos[formaEnvioNome] = [];
      grupos[formaEnvioNome].push({ cliente, tiposItens, cidadeEstado });
    });

    setResultados(grupos);
    setLoading(false);
  };

  const imprimirRelatorio = () => {
    const conteudo = gerarConteudoImpressao();
    let janela = null;
    try {
      janela = window.open('', '_blank');
    } catch (e) {
      janela = null;
    }

    if (janela && janela.document) {
      try {
        janela.document.open();
        janela.document.write(conteudo);
        janela.document.close();
        setTimeout(() => {
          try {
            janela.focus();
            janela.print();
          } catch (e) {
            console.error('Falha ao imprimir na nova janela. Usando fallback via iframe.', e);
            printViaIframe(conteudo);
          }
        }, 300);
      } catch (e) {
        console.error('Erro manipulando a janela de impressão. Usando fallback via iframe.', e);
        printViaIframe(conteudo);
      }
    } else {
      // Popup bloqueado: usar fallback via iframe oculto
      printViaIframe(conteudo);
    }
  };

  const printViaIframe = (html) => {
    try {
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow || iframe.contentDocument;
      const d = doc.document || doc;
      d.open();
      d.write(html);
      d.close();

      setTimeout(() => {
        try {
          (iframe.contentWindow || iframe).focus();
          (iframe.contentWindow || iframe).print();
        } catch (e) {
          console.error('Falha ao imprimir via iframe:', e);
        } finally {
          document.body.removeChild(iframe);
        }
      }, 300);
    } catch (e) {
      console.error('Erro no fallback de impressão via iframe:', e);
    }
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
          .grupo { margin-bottom: 24px; }
          .titulo { font-weight: bold; font-size: 14px; margin-bottom: 8px; }
          .linha { padding: 4px 0; border-bottom: 1px solid #eee; font-size: 12px; }
          .linha:last-child { border-bottom: none; }
          .upper { text-transform: uppercase; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Relatório de Envios</h1>
          <p>Período: ${dataInicio} a ${dataFim}</p>
          <p>Gerado em: ${new Date().toLocaleString('pt-BR')}</p>
        </div>
          ${Object.keys(resultados).map(nome => `
            <div class="grupo">
              <div class="titulo">${nome}</div>
              ${resultados[nome].map(item => `
                <div class="linha">${item.cliente} - <span class="upper">${item.tiposItens}</span> - ${item.cidadeEstado}</div>
              `).join('')}
            </div>
          `).join('')}
        </body></html>`;
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
                  Salvar PDF
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
              Relatório por Forma de Envio
            </h5>
          </div>
          <div style={{ padding: 'var(--spacing-4)' }}>
            {Object.keys(resultados).map(nome => (
              <Card key={nome} className="mb-3">
                <Card.Header className="bg-light">
                  <strong>forma de envio: {nome}</strong>
                </Card.Header>
                <Card.Body>
                  {resultados[nome].map((item, idx) => (
                    <div key={idx} className="border-bottom py-1">
                      {item.cliente} - <em>{item.tiposItens}</em> - <span className="text-muted">{item.cidadeEstado}</span>
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
