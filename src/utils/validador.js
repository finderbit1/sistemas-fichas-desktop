
export function validarPedido(dados) {
    alert(dados)
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
  convertido.valorTotal = convertido.valorTotal ? String(convertido.valorTotal).replace(",", ".") : "0.00";
  convertido.valorFrete = convertido.valorFrete ? String(convertido.valorFrete).replace(",", ".") : "0.00";

  convertido.items = convertido.items.map((item) => {
    const largura = Number(item.largura.replace(",", ".")).toFixed(2);
    const altura = Number(item.altura.replace(",", ".")).toFixed(2);
    console.log(largura,altura)
    const metroQuadrado = item.metroQuadrado
      ? parseFloat(item.metroQuadrado.replace(",", ".")).toFixed(2)
      : null;
    return {
      ...item,
      largura,
      altura,
      metroQuadrado,
    };
  });

  return convertido;
}