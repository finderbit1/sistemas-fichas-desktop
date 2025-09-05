/**
 * Utilitários para validação de datas
 */

/**
 * Verifica se uma data é um final de semana (sábado ou domingo)
 * @param {string} dateString - Data no formato YYYY-MM-DD
 * @returns {boolean} - true se for final de semana
 */
export const isWeekend = (dateString) => {
  if (!dateString) return false;
  
  const date = new Date(dateString);
  const dayOfWeek = date.getDay();
  
  // 0 = Domingo, 6 = Sábado
  return dayOfWeek === 0 || dayOfWeek === 6;
};

/**
 * Verifica se uma data é válida
 * @param {string} dateString - Data no formato YYYY-MM-DD
 * @returns {boolean} - true se a data for válida
 */
export const isValidDate = (dateString) => {
  if (!dateString) return false;
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

/**
 * Compara duas datas
 * @param {string} date1 - Primeira data (YYYY-MM-DD)
 * @param {string} date2 - Segunda data (YYYY-MM-DD)
 * @returns {number} - -1 se date1 < date2, 0 se iguais, 1 se date1 > date2
 */
export const compareDates = (date1, date2) => {
  if (!date1 || !date2) return 0;
  
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  
  if (d1 < d2) return -1;
  if (d1 > d2) return 1;
  return 0;
};

/**
 * Formata uma data para exibição em português
 * @param {string} dateString - Data no formato YYYY-MM-DD
 * @returns {string} - Data formatada (DD/MM/YYYY)
 */
export const formatDateForDisplay = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
};

/**
 * Obtém o nome do dia da semana em português
 * @param {string} dateString - Data no formato YYYY-MM-DD
 * @returns {string} - Nome do dia da semana
 */
export const getDayName = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  return days[date.getDay()];
};

/**
 * Valida as datas do pedido
 * @param {string} dataEntrada - Data de entrada
 * @param {string} dataEntrega - Data de entrega
 * @returns {Object} - { isValid: boolean, errors: string[] }
 */
export const validateOrderDates = (dataEntrada, dataEntrega) => {
  const errors = [];
  
  // Verificar se as datas são válidas
  if (!isValidDate(dataEntrada)) {
    errors.push("Data de entrada inválida");
  }
  
  if (!isValidDate(dataEntrega)) {
    errors.push("Data de entrega inválida");
  }
  
  if (!isValidDate(dataEntrada) || !isValidDate(dataEntrega)) {
    return { isValid: false, errors };
  }
  
  // Verificar se a data de entrada não é maior que a de entrega
  const dateComparison = compareDates(dataEntrada, dataEntrega);
  if (dateComparison > 0) {
    errors.push(`Data de entrada (${formatDateForDisplay(dataEntrada)}) não pode ser posterior à data de entrega (${formatDateForDisplay(dataEntrega)})`);
  }
  
  // Verificar se a data de entrada é final de semana
  if (isWeekend(dataEntrada)) {
    const dayName = getDayName(dataEntrada);
    errors.push(`Data de entrada (${formatDateForDisplay(dataEntrada)} - ${dayName}) é um final de semana. Considere escolher um dia útil.`);
  }
  
  // Verificar se a data de entrega é final de semana
  if (isWeekend(dataEntrega)) {
    const dayName = getDayName(dataEntrega);
    errors.push(`Data de entrega (${formatDateForDisplay(dataEntrega)} - ${dayName}) é um final de semana. Considere escolher um dia útil.`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
