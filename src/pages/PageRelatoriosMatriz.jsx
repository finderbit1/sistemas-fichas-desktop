import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Table, Spinner, Alert, ButtonGroup } from 'react-bootstrap';
import { gerarRelatorioMatriz } from '../services/api';
import AutocompleteInput from '../components/AutocompleteInput';
import { obterListaClientes, obterListaVendedores, obterListaDesigners } from '../services/api';

const DIM_OPTIONS = [
  { value: 'designer', label: 'Designer' },
  { value: 'cliente', label: 'Cliente' },
  { value: 'painel', label: 'Painel/Tipo' },
  { value: 'envio', label: 'Envio' },
  { value: 'data_dia', label: 'Data (Dia)' },
  { value: 'data_mes', label: 'Data (Mês)' },
];

function PageRelatoriosMatriz() {
  const [dimX, setDimX] = useState('designer');
  const [dimY, setDimY] = useState('cliente');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [filtros, setFiltros] = useState({ cliente: '', designer: '', vendedor: '', envio: '', painel: '' });
  const [loading, setLoading] = useState(false);
  const [carregandoListas, setCarregandoListas] = useState(false);
  const [erro, setErro] = useState(null);
  const [matriz, setMatriz] = useState(null);
  const [totais, setTotais] = useState(null);
  const [listaClientes, setListaClientes] = useState([]);
  const [listaDesigners, setListaDesigners] = useState([]);
  const [listaVendedores, setListaVendedores] = useState([]);

  useEffect(() => {
    const carregar = async () => {
      setCarregandoListas(true);
      try {
        const [c, v, d] = await Promise.allSettled([
          obterListaClientes(),
          obterListaVendedores(),
          obterListaDesigners(),
        ]);
        setListaClientes(c.status === 'fulfilled' ? (c.value.data?.clientes || []) : []);
        setListaVendedores(v.status === 'fulfilled' ? (v.value.data?.vendedores || []) : []);
        setListaDesigners(d.status === 'fulfilled' ? (d.value.data?.designers || []) : []);
      } finally {
        setCarregandoListas(false);
      }
    };
    carregar();
  }, []);

  const limparVazios = (obj) => Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== '' && v !== null && v !== undefined));

  const setPreset = (preset) => {
    const hoje = new Date();
    const toYMD = (d) => d.toISOString().split('T')[0];
    let ini, fim;
    switch (preset) {
      case 'hoje':
        ini = toYMD(hoje); fim = toYMD(hoje); break;
      case '7d': {
        const d = new Date(hoje); d.setDate(d.getDate() - 6); ini = toYMD(d); fim = toYMD(hoje); break;
      }
      case '30d': {
        const d = new Date(hoje); d.setDate(d.getDate() - 29); ini = toYMD(d); fim = toYMD(hoje); break;
      }
      case 'semana': {
        const d = new Date(hoje); const day = d.getDay(); // 0=Dom
        const diff = (day === 0 ? 6 : day - 1); // início segunda
        const start = new Date(d); start.setDate(d.getDate() - diff);
        const end = new Date(start); end.setDate(start.getDate() + 6);
        ini = toYMD(start); fim = toYMD(end); break;
      }
      case 'mes': {
        const start = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        const end = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
        ini = toYMD(start); fim = toYMD(end); break;
      }
      default:
        return;
    }
    setDataInicio(ini);
    setDataFim(fim);
  };

  const gerar = async () => {
    setErro(null);
    setLoading(true);
    setMatriz(null);
    setTotais(null);
    try {
      const payload = {
        dim_x: dimX,
        dim_y: dimY,
        data_inicio: dataInicio || null,
        data_fim: dataFim || null,
        filtros: limparVazios(filtros),
      };
      const resp = await gerarRelatorioMatriz(payload);
      setMatriz(resp.data.matriz || {});
      setTotais(resp.data.totais || {});
    } catch (e) {
      setErro(e.response?.data?.detail || e.message || 'Erro ao gerar matriz');
    } finally {
      setLoading(false);
    }
  };

  const exportarCSV = () => {
    if (!matriz) return;
    const linhas = [];
    const header = ['X', 'Y', 'qtd_pedidos', 'qtd_itens', 'valor_total', 'ticket_medio'];
    linhas.push(header.join(';'));
    Object.keys(matriz).forEach((x) => {
      const col = matriz[x];
      Object.keys(col).forEach((y) => {
        const m = col[y];
        linhas.push([x, y, m.qtd_pedidos, m.qtd_itens, m.valor_total, m.ticket_medio].join(';'));
      });
    });
    const csv = linhas.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `matriz_${dimX}_x_${dimY}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // sem geração de arquivo; impressão direto no navegador

  const imprimirPDF = () => {
    if (!matriz) return;
    const titulo = `Matriz ${dimX} × ${dimY}`;
    let rows = '';
    Object.keys(matriz).forEach((x) => {
      const col = matriz[x];
      Object.keys(col).forEach((y) => {
        const m = col[y];
        rows += `<tr><td>${x}</td><td>${y}</td><td>${m.qtd_pedidos}</td><td>${m.qtd_itens}</td><td>${m.valor_total}</td><td>${m.ticket_medio}</td></tr>`;
      });
    });
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8" /><title>${titulo}</title>
      <style>
        body{font-family: Arial, sans-serif; margin:20px;}
        h2{margin:0 0 8px 0}
        p{margin:0 0 12px 0}
        table{width:100%; border-collapse:collapse}
        th,td{border:1px solid #ddd; padding:8px; text-align:left}
        th{background:#f5f5f5; text-transform:uppercase; font-size:12px}
        tfoot th{font-weight:bold}
      </style></head><body>
      <h2>${titulo}</h2>
      <p>Período: ${(dataInicio||'-')} a ${(dataFim||'-')}</p>
      <p>Filtros: ${JSON.stringify(limparVazios(filtros))}</p>
      <table>
        <thead><tr><th>${dimX}</th><th>${dimY}</th><th>qtd_pedidos</th><th>qtd_itens</th><th>valor_total</th><th>ticket_medio</th></tr></thead>
        <tbody>${rows}</tbody>
        ${totais ? `<tfoot><tr><th colspan="2">Totais</th><th>${totais.qtd_pedidos}</th><th>${totais.qtd_itens}</th><th>${totais.valor_total}</th><th>${totais.ticket_medio}</th></tr></tfoot>` : ''}
      </table>
    </body></html>`;

    const printViaIframe = (htmlStr) => {
      try {
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed'; iframe.style.right = '0'; iframe.style.bottom = '0';
        iframe.style.width = '0'; iframe.style.height = '0'; iframe.style.border = '0';
        document.body.appendChild(iframe);
        const doc = iframe.contentWindow || iframe.contentDocument; const d = doc.document || doc;
        d.open(); d.write(htmlStr); d.close();
        setTimeout(() => { try { (iframe.contentWindow || iframe).focus(); (iframe.contentWindow || iframe).print(); } finally { document.body.removeChild(iframe); } }, 300);
      } catch {
        // último recurso: nada
      }
    };

    let w = null;
    try { w = window.open('', '_blank'); } catch { w = null; }
    if (w && w.document) {
      try {
        w.document.open(); w.document.write(html); w.document.close();
        setTimeout(() => { try { w.focus(); w.print(); } catch {} }, 300);
      } catch {
        printViaIframe(html);
      }
    } else {
      // Popup bloqueado
      printViaIframe(html);
    }
  };

  return (
    <Container fluid className="mt-4">
      <Row className="mb-3">
        <Col>
          <h2>📐 Relatório Matriz (X×Y)</h2>
          <p className="text-muted">Monte cruzamentos como Designer × Cliente, Cliente × Painel, Envio × Painel, etc.</p>
        </Col>
      </Row>

      <Card className="mb-3">
        <Card.Header>
          <h5>Filtros</h5>
        </Card.Header>
        <Card.Body>
          <Row className="mb-3">
            <Col md={3}>
              <Form.Group>
                <Form.Label>Eixo X</Form.Label>
                <Form.Select value={dimX} onChange={(e) => setDimX(e.target.value)}>
                  {DIM_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Eixo Y</Form.Label>
                <Form.Select value={dimY} onChange={(e) => setDimY(e.target.value)}>
                  {DIM_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6} className="d-flex align-items-end">
              <ButtonGroup className="ms-auto">
                <Button variant="outline-secondary" onClick={() => setPreset('hoje')}>Hoje</Button>
                <Button variant="outline-secondary" onClick={() => setPreset('semana')}>Semana</Button>
                <Button variant="outline-secondary" onClick={() => setPreset('mes')}>Mês</Button>
                <Button variant="outline-secondary" onClick={() => setPreset('7d')}>7 dias</Button>
                <Button variant="outline-secondary" onClick={() => setPreset('30d')}>30 dias</Button>
              </ButtonGroup>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={3}>
              <Form.Group>
                <Form.Label>Data Início</Form.Label>
                <Form.Control type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Data Fim</Form.Label>
                <Form.Control type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={3}>
              <AutocompleteInput
                label="Cliente"
                placeholder="Digite o nome do cliente..."
                options={listaClientes}
                value={filtros.cliente}
                onChange={(v) => setFiltros({ ...filtros, cliente: v })}
                onSelect={(v) => setFiltros({ ...filtros, cliente: v })}
                loading={carregandoListas}
              />
            </Col>
            <Col md={3}>
              <AutocompleteInput
                label="Designer"
                placeholder="Digite o nome do designer..."
                options={listaDesigners}
                value={filtros.designer}
                onChange={(v) => setFiltros({ ...filtros, designer: v })}
                onSelect={(v) => setFiltros({ ...filtros, designer: v })}
                loading={carregandoListas}
              />
            </Col>
            <Col md={3}>
              <AutocompleteInput
                label="Vendedor"
                placeholder="Digite o nome do vendedor..."
                options={listaVendedores}
                value={filtros.vendedor}
                onChange={(v) => setFiltros({ ...filtros, vendedor: v })}
                onSelect={(v) => setFiltros({ ...filtros, vendedor: v })}
                loading={carregandoListas}
              />
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Envio</Form.Label>
                <Form.Control placeholder="Filtrar envio" value={filtros.envio} onChange={(e) => setFiltros({ ...filtros, envio: e.target.value })} />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6} className="d-flex align-items-end">
              <Button variant="primary" onClick={gerar} disabled={loading}>
                {loading ? <Spinner size="sm" /> : 'Gerar Matriz'}
              </Button>
            </Col>
            <Col md={6} className="text-end">
              {matriz && (
                <>
                  <Button className="me-2" variant="outline-secondary" onClick={exportarCSV}>Exportar CSV</Button>
                  <Button variant="success" onClick={imprimirPDF}>Imprimir</Button>
                </>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {erro && (
        <Alert variant="danger">{erro}</Alert>
      )}

      {matriz && (
        <Card>
          <Card.Header>
            <h5>Resultado</h5>
          </Card.Header>
          <Card.Body>
            <div className="table-responsive">
              <Table striped hover size="sm">
                <thead>
                  <tr>
                    <th>{dimX}</th>
                    <th>{dimY}</th>
                    <th>qtd_pedidos</th>
                    <th>qtd_itens</th>
                    <th>valor_total</th>
                    <th>ticket_medio</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(matriz).map((x) => (
                    Object.keys(matriz[x]).map((y) => (
                      <tr key={`${x}-${y}`}>
                        <td>{x}</td>
                        <td>{y}</td>
                        <td>{matriz[x][y].qtd_pedidos}</td>
                        <td>{matriz[x][y].qtd_itens}</td>
                        <td>{matriz[x][y].valor_total}</td>
                        <td>{matriz[x][y].ticket_medio}</td>
                      </tr>
                    ))
                  ))}
                </tbody>
                {totais && (
                  <tfoot>
                    <tr>
                      <th colSpan={2}>Totais</th>
                      <th>{totais.qtd_pedidos}</th>
                      <th>{totais.qtd_itens}</th>
                      <th>{totais.valor_total}</th>
                      <th>{totais.ticket_medio}</th>
                    </tr>
                  </tfoot>
                )}
              </Table>
            </div>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
}

export default PageRelatoriosMatriz;


