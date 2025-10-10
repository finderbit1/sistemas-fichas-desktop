/**
 * Utilitário de Exportação Profissional de Relatórios
 * Suporta: Excel (XLSX), PDF, CSV
 */

import { formatCurrency, formatDate } from './formatters';

/**
 * Exporta relatório para Excel com formatação profissional
 */
export const exportarRelatorioExcel = (dados, nomeArquivo = 'relatorio') => {
  // Preparar dados para Excel
  const workbook = [];
  
  // Aba 1: Resumo Geral
  const resumo = [
    ['RELATÓRIO DE ENVIOS'],
    [''],
    ['Período', `${dados.periodo?.inicio || ''} a ${dados.periodo?.fim || ''}`],
    ['Total de Pedidos', dados.total_pedidos],
    ['Total de Itens', dados.total_itens],
    ['Valor Total', formatCurrency(dados.valor_total)],
    ['Ticket Médio', formatCurrency(dados.ticket_medio)],
    [''],
    ['ESTATÍSTICAS POR FORMA DE ENVIO'],
    ['Forma de Envio', 'Pedidos', '% Pedidos', 'Itens', 'Valor Total', '% Valor', 'Ticket Médio'],
    ...(dados.estatisticas_envios || []).map(e => [
      e.forma_envio,
      e.quantidade_pedidos,
      `${e.percentual_pedidos.toFixed(1)}%`,
      e.quantidade_itens,
      formatCurrency(e.valor_total),
      `${e.percentual_valor.toFixed(1)}%`,
      formatCurrency(e.ticket_medio)
    ])
  ];
  
  // Aba 2: Distribuição Geográfica
  const geografica = [
    ['DISTRIBUIÇÃO POR CIDADE'],
    ['Cidade', 'Quantidade', 'Valor'],
    ...(dados.distribuicao_cidades || []).slice(0, 50).map(c => [
      c.cidade,
      c.quantidade,
      formatCurrency(c.valor)
    ]),
    [''],
    ['DISTRIBUIÇÃO POR ESTADO'],
    ['Estado', 'Quantidade', 'Valor'],
    ...(dados.distribuicao_estados || []).map(e => [
      e.estado,
      e.quantidade,
      formatCurrency(e.valor)
    ])
  ];
  
  // Aba 3: Detalhes
  const detalhes = [
    ['DETALHAMENTO DE PEDIDOS'],
    ['ID', 'Cliente', 'Forma Envio', 'Cidade', 'Estado', 'Tipos Itens', 'Qtd Itens', 'Valor', 'Status'],
    ...(dados.detalhes || []).map(d => [
      d.pedido_id,
      d.cliente,
      d.forma_envio,
      d.cidade,
      d.estado,
      d.tipos_itens.join(', '),
      d.quantidade_itens,
      formatCurrency(d.valor_total),
      d.status
    ])
  ];
  
  // Converter para CSV (simulado como Excel básico)
  const abaResumo = resumo.map(row => row.join('\t')).join('\n');
  const abaGeografica = geografica.map(row => row.join('\t')).join('\n');
  const abaDetalhes = detalhes.map(row => row.join('\t')).join('\n');
  
  const conteudoCompleto = `${abaResumo}\n\n\n${abaGeografica}\n\n\n${abaDetalhes}`;
  
  // Download
  const blob = new Blob([conteudoCompleto], { type: 'text/tab-separated-values;charset=utf-8;' });
  downloadBlob(blob, `${nomeArquivo}.xls`);
};

/**
 * Exporta relatório para CSV
 */
export const exportarRelatorioCSV = (dados, nomeArquivo = 'relatorio_envios') => {
  const linhas = [];
  
  // Cabeçalho do relatório
  linhas.push('RELATÓRIO DE ENVIOS');
  linhas.push('');
  linhas.push(`Período;${dados.periodo?.inicio || ''} a ${dados.periodo?.fim || ''}`);
  linhas.push(`Total de Pedidos;${dados.total_pedidos}`);
  linhas.push(`Total de Itens;${dados.total_itens}`);
  linhas.push(`Valor Total;${dados.valor_total.toFixed(2)}`);
  linhas.push(`Ticket Médio;${dados.ticket_medio.toFixed(2)}`);
  linhas.push('');
  
  // Estatísticas por forma de envio
  linhas.push('ESTATÍSTICAS POR FORMA DE ENVIO');
  linhas.push('Forma de Envio;Pedidos;% Pedidos;Itens;Valor Total;% Valor;Ticket Médio');
  (dados.estatisticas_envios || []).forEach(e => {
    linhas.push([
      e.forma_envio,
      e.quantidade_pedidos,
      e.percentual_pedidos.toFixed(1),
      e.quantidade_itens,
      e.valor_total.toFixed(2),
      e.percentual_valor.toFixed(1),
      e.ticket_medio.toFixed(2)
    ].join(';'));
  });
  linhas.push('');
  
  // Distribuição geográfica
  linhas.push('DISTRIBUIÇÃO POR CIDADE');
  linhas.push('Cidade;Quantidade;Valor');
  (dados.distribuicao_cidades || []).slice(0, 30).forEach(c => {
    linhas.push(`${c.cidade};${c.quantidade};${c.valor.toFixed(2)}`);
  });
  linhas.push('');
  
  // Top clientes
  linhas.push('TOP CLIENTES');
  linhas.push('Cliente;Pedidos;Valor;Formas de Envio');
  (dados.top_clientes || []).forEach(c => {
    linhas.push([
      c.cliente,
      c.pedidos,
      c.valor.toFixed(2),
      c.formas_envio.join(', ')
    ].join(';'));
  });
  
  const csv = linhas.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${nomeArquivo}.csv`);
};

/**
 * Gera PDF profissional do relatório
 */
export const exportarRelatorioPDF = (dados, nomeArquivo = 'relatorio_envios') => {
  const html = gerarHTMLRelatorio(dados);
  
  // Tentar abrir em nova janela para impressão
  let janela = null;
  try {
    janela = window.open('', '_blank');
  } catch {
    janela = null;
  }
  
  if (janela && janela.document) {
    try {
      janela.document.open();
      janela.document.write(html);
      janela.document.close();
      setTimeout(() => {
        try {
          janela.focus();
          janela.print();
        } catch {
          imprimirViaIframe(html);
        }
      }, 300);
    } catch {
      imprimirViaIframe(html);
    }
  } else {
    // Fallback: usar iframe oculto
    imprimirViaIframe(html);
  }
};

/**
 * Gera HTML profissional para o relatório
 */
const gerarHTMLRelatorio = (dados) => {
  const hoje = new Date().toLocaleString('pt-BR');
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Relatório de Envios</title>
  <style>
    @page { 
      size: A4; 
      margin: 15mm; 
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 11pt;
      line-height: 1.4;
      color: #333;
    }
    
    .header {
      text-align: center;
      padding: 20px 0;
      border-bottom: 3px solid #2c3e50;
      margin-bottom: 30px;
    }
    
    .header h1 {
      color: #2c3e50;
      font-size: 24pt;
      margin-bottom: 8px;
    }
    
    .header .periodo {
      font-size: 12pt;
      color: #7f8c8d;
      margin-bottom: 4px;
    }
    
    .header .data-geracao {
      font-size: 9pt;
      color: #95a5a6;
    }
    
    .kpis {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
      margin-bottom: 30px;
    }
    
    .kpi-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 15px;
      border-radius: 8px;
      text-align: center;
    }
    
    .kpi-card:nth-child(2) {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }
    
    .kpi-card:nth-child(3) {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    }
    
    .kpi-card:nth-child(4) {
      background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
    }
    
    .kpi-label {
      font-size: 9pt;
      opacity: 0.9;
      margin-bottom: 5px;
    }
    
    .kpi-value {
      font-size: 18pt;
      font-weight: bold;
    }
    
    .secao {
      margin-bottom: 25px;
      page-break-inside: avoid;
    }
    
    .secao-titulo {
      font-size: 14pt;
      font-weight: bold;
      color: #2c3e50;
      margin-bottom: 12px;
      padding-bottom: 5px;
      border-bottom: 2px solid #ecf0f1;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 15px;
    }
    
    th {
      background: #34495e;
      color: white;
      padding: 10px 8px;
      text-align: left;
      font-size: 9pt;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    td {
      padding: 8px;
      border-bottom: 1px solid #ecf0f1;
      font-size: 10pt;
    }
    
    tr:nth-child(even) {
      background: #f8f9fa;
    }
    
    tr:hover {
      background: #e8f4f8;
    }
    
    .valor {
      text-align: right;
      font-weight: 500;
    }
    
    .percentual {
      text-align: center;
      font-size: 9pt;
      color: #7f8c8d;
    }
    
    .destaque {
      background: #fff3cd !important;
      font-weight: bold;
    }
    
    .footer {
      margin-top: 30px;
      padding-top: 15px;
      border-top: 1px solid #ecf0f1;
      text-align: center;
      font-size: 8pt;
      color: #95a5a6;
    }
    
    @media print {
      .kpis {
        page-break-inside: avoid;
      }
      
      .secao {
        page-break-inside: avoid;
      }
      
      body {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 Relatório de Envios</h1>
    <div class="periodo">Período: ${dados.periodo?.inicio || ''} a ${dados.periodo?.fim || ''}</div>
    <div class="data-geracao">Gerado em: ${hoje}</div>
  </div>
  
  <div class="kpis">
    <div class="kpi-card">
      <div class="kpi-label">Total de Pedidos</div>
      <div class="kpi-value">${dados.total_pedidos}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Total de Itens</div>
      <div class="kpi-value">${dados.total_itens}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Valor Total</div>
      <div class="kpi-value">${formatCurrency(dados.valor_total)}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Ticket Médio</div>
      <div class="kpi-value">${formatCurrency(dados.ticket_medio)}</div>
    </div>
  </div>
  
  <div class="secao">
    <h2 class="secao-titulo">Estatísticas por Forma de Envio</h2>
    <table>
      <thead>
        <tr>
          <th>Forma de Envio</th>
          <th style="text-align: center;">Pedidos</th>
          <th style="text-align: center;">% Pedidos</th>
          <th style="text-align: center;">Itens</th>
          <th style="text-align: right;">Valor Total</th>
          <th style="text-align: center;">% Valor</th>
          <th style="text-align: right;">Ticket Médio</th>
        </tr>
      </thead>
      <tbody>
        ${(dados.estatisticas_envios || []).map((e, idx) => `
          <tr ${idx === 0 ? 'class="destaque"' : ''}>
            <td>${e.forma_envio}</td>
            <td style="text-align: center;">${e.quantidade_pedidos}</td>
            <td class="percentual">${e.percentual_pedidos.toFixed(1)}%</td>
            <td style="text-align: center;">${e.quantidade_itens}</td>
            <td class="valor">${formatCurrency(e.valor_total)}</td>
            <td class="percentual">${e.percentual_valor.toFixed(1)}%</td>
            <td class="valor">${formatCurrency(e.ticket_medio)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
  
  <div class="secao">
    <h2 class="secao-titulo">Top 10 Cidades</h2>
    <table>
      <thead>
        <tr>
          <th>Cidade</th>
          <th style="text-align: center;">Quantidade</th>
          <th style="text-align: right;">Valor Total</th>
        </tr>
      </thead>
      <tbody>
        ${(dados.top_cidades || []).map(c => `
          <tr>
            <td>${c.cidade}</td>
            <td style="text-align: center;">${c.quantidade}</td>
            <td class="valor">${formatCurrency(c.valor)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
  
  <div class="secao">
    <h2 class="secao-titulo">Top 10 Clientes</h2>
    <table>
      <thead>
        <tr>
          <th>Cliente</th>
          <th style="text-align: center;">Pedidos</th>
          <th style="text-align: right;">Valor</th>
          <th>Formas de Envio</th>
        </tr>
      </thead>
      <tbody>
        ${(dados.top_clientes || []).map(c => `
          <tr>
            <td>${c.cliente}</td>
            <td style="text-align: center;">${c.pedidos}</td>
            <td class="valor">${formatCurrency(c.valor)}</td>
            <td>${c.formas_envio.join(', ')}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
  
  ${dados.comparativo_periodo_anterior ? `
  <div class="secao">
    <h2 class="secao-titulo">Comparativo com Período Anterior</h2>
    <table>
      <tbody>
        <tr>
          <td><strong>Período Anterior</strong></td>
          <td>${dados.comparativo_periodo_anterior.periodo_anterior.inicio} a ${dados.comparativo_periodo_anterior.periodo_anterior.fim}</td>
        </tr>
        <tr>
          <td><strong>Pedidos (Anterior)</strong></td>
          <td>${dados.comparativo_periodo_anterior.periodo_anterior.total_pedidos}</td>
        </tr>
        <tr>
          <td><strong>Variação em Pedidos</strong></td>
          <td style="color: ${dados.comparativo_periodo_anterior.variacao_pedidos >= 0 ? 'green' : 'red'}">
            ${dados.comparativo_periodo_anterior.variacao_pedidos >= 0 ? '↑' : '↓'} 
            ${Math.abs(dados.comparativo_periodo_anterior.variacao_pedidos).toFixed(1)}%
          </td>
        </tr>
        <tr>
          <td><strong>Variação em Valor</strong></td>
          <td style="color: ${dados.comparativo_periodo_anterior.variacao_valor >= 0 ? 'green' : 'red'}">
            ${dados.comparativo_periodo_anterior.variacao_valor >= 0 ? '↑' : '↓'} 
            ${Math.abs(dados.comparativo_periodo_anterior.variacao_valor).toFixed(1)}%
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  ` : ''}
  
  <div class="footer">
    <p>Relatório gerado automaticamente pelo Sistema de Gestão de Pedidos</p>
  </div>
</body>
</html>`;
};

/**
 * Imprime via iframe oculto (fallback para popup blocker)
 */
const imprimirViaIframe = (html) => {
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
      } finally {
        setTimeout(() => document.body.removeChild(iframe), 1000);
      }
    }, 300);
  } catch (e) {
    console.error('Erro ao imprimir via iframe:', e);
  }
};

/**
 * Helper para download de blob
 */
const downloadBlob = (blob, nomeArquivo) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nomeArquivo;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export default {
  exportarRelatorioExcel,
  exportarRelatorioCSV,
  exportarRelatorioPDF
};



