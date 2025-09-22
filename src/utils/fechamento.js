// Utilitário de Fechamento Diário (snapshot local com base em relatório da API)
import { gerarRelatorioDiario } from '../services/api';

const STORAGE_KEY = 'fechamentos_v1';

function loadAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (_) {
    return [];
  }
}

function saveAll(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (_) {}
}

function formatISODate(date) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function gerarNumeroFechamento(dataISO, index) {
  return `FD-${dataISO}-${String(index).padStart(2, '0')}`;
}

function computeFallbackSummary(dataISO, pedidosList = []) {
  const target = new Date(dataISO);
  const isSameDay = (dStr) => {
    if (!dStr) return false;
    const d = new Date(dStr);
    return d.getFullYear() === target.getFullYear() && d.getMonth() === target.getMonth() && d.getDate() === target.getDate();
  };

  const pedidosDia = pedidosList.filter(p => isSameDay(p.dataEntrada));
  const total = pedidosDia.length;

  const porStatus = pedidosDia.reduce((acc, p) => {
    const s = String(p.status || '').toLowerCase();
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  const porPagamento = pedidosDia.reduce((acc, p) => {
    const tp = p.tipoPagamento || 'Indefinido';
    acc[tp] = (acc[tp] || 0) + 1;
    return acc;
  }, {});

  const valorTotal = pedidosDia.reduce((acc, p) => acc + parseFloat(p.valorTotal || '0'), 0);

  return {
    total_pedidos: total,
    por_status: porStatus,
    por_pagamento: porPagamento,
    valor_total: Number.isFinite(valorTotal) ? Number(valorTotal.toFixed(2)) : 0
  };
}

export async function fecharDia(dateInput, pedidosFallback = []) {
  const dataISO = formatISODate(dateInput);
  const existentes = loadAll();
  const mesmoDia = existentes.filter(f => f.data === dataISO);
  const proximoIndex = mesmoDia.length + 1;
  const numero = gerarNumeroFechamento(dataISO, proximoIndex);

  let resumo = null;
  let origem = 'api';
  try {
    const resp = await gerarRelatorioDiario(dataISO);
    resumo = resp?.data || null;
    if (!resumo || typeof resumo !== 'object') throw new Error('Relatório inválido');
  } catch (_) {
    origem = 'fallback';
    resumo = computeFallbackSummary(dataISO, pedidosFallback);
  }

  const snapshot = {
    id: numero,
    data: dataISO,
    criado_em: new Date().toISOString(),
    origem,
    resumo
  };

  saveAll([...existentes, snapshot]);
  return snapshot;
}

export function listarFechamentos() {
  return loadAll();
}

export function apagarFechamento(id) {
  const todos = loadAll();
  const filtrados = todos.filter(f => f.id !== id);
  saveAll(filtrados);
}

export function obterFechamentoPorData(dateInput) {
  const dataISO = formatISODate(dateInput);
  const todos = loadAll();
  return todos.filter(f => f.data === dataISO);
}





