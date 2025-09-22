
export function validarPedido(dados) {
    console.log('Dados validados:', dados)
    const erros = [];

    if (!dados.nomeCliente.trim()) erros.push("Nome do cliente é obrigatório.");
    if (!dados.telefoneCliente.trim()) erros.push("Telefone do cliente é obrigatório.");
    if (!dados.dataEntrada) erros.push("Data de entrada é obrigatória.");
    if (!dados.dataEntrega) erros.push("Data de entrega é obrigatória.");
    if (!dados.tipoPagamento) erros.push("Tipo de pagamento é obrigatório.");
    // if (dados.items.length === 0) erros.push("Adicione pelo menos um item ao pedido.");

    if (dados.dataEntrada && dados.dataEntrega && dados.dataEntrada > dados.dataEntrega) {
        erros.push("A data de entrada não pode ser posterior à data de entrega.");
    }

    return erros;
}



export function normalizarDecimais(obj) {
  const convertido = JSON.parse(JSON.stringify(obj));
  const parseBRLMoney = (value) => {
    if (typeof value === 'number') return value.toFixed ? value.toFixed(2) : value;
    if (!value) return '0.00';
    
    const v = String(value);
    // Se já está no formato correto (ex: "90.00"), usar diretamente
    if (/^\d+\.\d{2}$/.test(v)) return parseFloat(v).toFixed(2);
    
    // Se está no formato brasileiro (ex: "90,00" ou "1.234,56"), converter
    const normalized = v.replace(/\./g, '').replace(',', '.');
    const num = parseFloat(normalized);
    return isNaN(num) ? '0.00' : num.toFixed(2);
  };

  convertido.valorTotal = parseBRLMoney(convertido.valorTotal);
  convertido.valorFrete = parseBRLMoney(convertido.valorFrete);

  convertido.items = convertido.items.map((item) => {
    const largura = Number(item.largura?.replace(",", ".") || 0).toFixed(2);
    const altura = Number(item.altura?.replace(",", ".") || 0).toFixed(2);
    const metroQuadrado = item.metroQuadrado || item.metro_quadrado
      ? parseFloat((item.metroQuadrado || item.metro_quadrado).replace(",", ".")).toFixed(2)
      : null;
    return {
      ...item,
      largura,
      altura,
      metro_quadrado: metroQuadrado,
      metroQuadrado,
    };
  });

  return convertido;
}