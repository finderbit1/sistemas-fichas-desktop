// Utilitário para gerar e criar pedidos falsos na API
// Gera dados variados (datas, status, itens, formas de envio/pagamento) e imagens inline (SVG data URL)

import { createPedido } from '../services/api';

// Pequena ajuda para números aleatórios inteiros entre min e max (inclusive)
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice(array) {
  return array[randomInt(0, array.length - 1)];
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function formatISODate(date) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Gera uma imagem pequenina como data URL SVG com uma cor aleatória e label
function gerarImagemDataUrl(label) {
  const cores = ['#FF4136', '#2ECC40', '#0074D9', '#FF851B', '#B10DC9', '#111111', '#39CCCC'];
  const cor = randomChoice(cores).replace('#', '%23');
  const txt = encodeURIComponent(label || 'IMG');
  // 40x40px para ficar leve
  return `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40'><rect width='40' height='40' fill='${cor}'/><text x='20' y='22' font-size='10' text-anchor='middle' fill='%23ffffff'>${txt}</text></svg>`;
}

const LISTA_CIDADES = [
  'São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Curitiba', 'Porto Alegre',
  'Florianópolis', 'Campinas', 'Fortaleza', 'Recife', 'Brasília', 'Salvador'
];

const LISTA_CLIENTES = [
  'Maria Silva', 'João Souza', 'Ana Pereira', 'Carlos Oliveira', 'Fernanda Lima',
  'Ricardo Santos', 'Paula Costa', 'Bruno Almeida', 'Juliana Rocha', 'Marcos Dias'
];

const LISTA_VENDEDORES = ['Alice', 'Bruno', 'Camila', 'Diego', 'Eduarda'];
const LISTA_DESIGNERS = ['Felipe', 'Gabriela', 'Henrique', 'Isabela', 'Joana'];
const LISTA_TECIDOS = ['Oxford', 'Microfibra', 'MDF 6MM', 'Canvas'];

const FORMAS_ENVIO = [
  { id: 1, name: 'Retirada no Local', value: 0 },
  { id: 2, name: 'Entrega Local', value: 15 },
  { id: 3, name: 'Sedex', value: 25 },
  { id: 4, name: 'PAC', value: 20 },
  { id: 5, name: 'Transportadora', value: 30 }
];

const FORMAS_PAGAMENTO = ['Dinheiro', 'Cartão de Crédito', 'PIX', 'Boleto', 'Transferência'];

const TIPOS_PRODUCAO = ['painel', 'totem', 'lona', 'almofada', 'bolsinha'];

const STATUS_API = ['pendente', 'em_producao', 'pronto', 'entregue', 'cancelado'];

function gerarTelefoneBR() {
  const ddd = randomInt(11, 99);
  const prefixo = randomInt(90000, 99999);
  const sufixo = randomInt(1000, 9999);
  return `(${ddd}) ${prefixo}-${sufixo}`;
}

function calcularMetroQuadrado(larguraCm, alturaCm) {
  const m2 = (larguraCm * alturaCm) / 10000;
  return m2.toFixed(2);
}

function gerarItemApi(tipo) {
  const largura = randomInt(30, 200); // cm
  const altura = randomInt(30, 200);  // cm
  const valorUnit = (randomInt(50, 600) + Math.random()).toFixed(2);
  const imagem = gerarImagemDataUrl(tipo.substring(0, 3).toUpperCase());

  const base = {
    tipo_producao: tipo,
    descricao: `${tipo.toUpperCase()} ${largura}x${altura}`,
    largura: String(largura),
    altura: String(altura),
    metro_quadrado: calcularMetroQuadrado(largura, altura),
    vendedor: randomChoice(LISTA_VENDEDORES),
    designer: randomChoice(LISTA_DESIGNERS),
    tecido: randomChoice(LISTA_TECIDOS),
    acabamento: {
      overloque: Math.random() < 0.3,
      elastico: Math.random() < 0.2,
      ilhos: Math.random() < 0.25,
    },
    emenda: 'sem-emenda',
    observacao: Math.random() < 0.2 ? 'Observação do item' : null,
    valor_unitario: String(valorUnit),
    imagem,
    ilhos_qtd: null,
    ilhos_valor_unitario: null,
    ilhos_distancia: null,
  };

  if (tipo === 'totem') {
    base.ilhos_qtd = String(randomInt(0, 8));
    base.ilhos_valor_unitario = String((randomInt(1, 5) + 0.5).toFixed(2));
    base.ilhos_distancia = String(randomInt(10, 40));
  }

  return base;
}

export function gerarPedidoApiFake(index = 0) {
  const now = new Date();
  const dataEntrada = addDays(now, -randomInt(0, 30));
  const dataEntrega = addDays(dataEntrada, randomInt(1, 15));

  const formaEnvio = randomChoice(FORMAS_ENVIO);
  const itensCount = randomInt(1, 4);
  const tipos = Array.from({ length: itensCount }).map(() => randomChoice(TIPOS_PRODUCAO));
  const items = tipos.map(gerarItemApi);

  const valorItens = items.reduce((acc, it) => acc + parseFloat(it.valor_unitario), 0);
  const valorFrete = formaEnvio.value || 0;
  const valorTotal = (valorItens + valorFrete).toFixed(2);

  const prioridade = Math.random() < 0.25 ? 'ALTA' : 'NORMAL';
  const status = randomChoice(STATUS_API);

  const payload = {
    numero: `PED-FAKE-${Date.now()}-${index}-${randomInt(1000, 9999)}`,
    data_entrada: formatISODate(dataEntrada),
    data_entrega: formatISODate(dataEntrega),
    observacao: Math.random() < 0.3 ? 'Observações gerais do pedido.' : null,
    prioridade,
    status,
    cliente: randomChoice(LISTA_CLIENTES),
    telefone_cliente: gerarTelefoneBR(),
    cidade_cliente: randomChoice(LISTA_CIDADES),
    valor_total: String(valorTotal),
    valor_frete: String(valorFrete.toFixed ? valorFrete.toFixed(2) : valorFrete),
    valor_itens: String(valorItens.toFixed(2)),
    tipo_pagamento: randomChoice(FORMAS_PAGAMENTO),
    obs_pagamento: Math.random() < 0.15 ? 'Pago parcialmente' : null,
    forma_envio: formaEnvio.name,
    forma_envio_id: formaEnvio.id,
    financeiro: ['em_producao', 'pronto', 'entregue'].includes(status),
    sublimacao: ['em_producao', 'pronto', 'entregue'].includes(status) && Math.random() < 0.8,
    costura: ['pronto', 'entregue'].includes(status) && Math.random() < 0.7,
    expedicao: status === 'entregue',
    items,
  };

  return payload;
}

// Cria N pedidos fakes na API, sequencialmente (para evitar sobrecarga), com callback de progresso opcional
export async function criarPedidosFakesNaAPI(qtd = 100, onProgress) {
  const total = Math.max(1, Math.min(qtd, 1000));
  let sucesso = 0;
  let falhas = 0;
  const resultados = [];

  for (let i = 0; i < total; i++) {
    const payload = gerarPedidoApiFake(i);
    try {
      const resp = await createPedido(payload);
      resultados.push(resp.data);
      sucesso += 1;
    } catch (e) {
      falhas += 1;
      resultados.push({ error: true, message: e?.message || 'Erro ao criar pedido' });
    }
    if (typeof onProgress === 'function') {
      try { onProgress({ current: i + 1, total, sucesso, falhas }); } catch (_) {}
    }
    // Pequeno intervalo para aliviar a API
    await new Promise(r => setTimeout(r, 60));
  }

  return { sucesso, falhas, resultados };
}





