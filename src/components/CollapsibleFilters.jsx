import React, { useState } from 'react';
import { Row, Col, Form, Button, Collapse } from 'react-bootstrap';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  Calendar, 
  Tag,
  X,
  CheckCircle
} from 'react-bootstrap-icons';

const CollapsibleFilters = ({
  filtro,
  setFiltro,
  filtrosAvancados,
  setFiltrosAvancados,
  filtroApenasProntos,
  setFiltroApenasProntos,
  listScope,
  setListScope,
  todosPeriod,
  setTodosPeriod,
  onClearFilters
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  // Contar filtros ativos
  React.useEffect(() => {
    let count = 0;
    if (filtro.trim()) count++;
    if (filtrosAvancados.status !== 'all') count++;
    if (filtrosAvancados.tipo !== 'all') count++;
    if (filtrosAvancados.dataInicio) count++;
    if (filtrosAvancados.dataFim) count++;
    if (filtroApenasProntos) count++;
    setActiveFiltersCount(count);
  }, [filtro, filtrosAvancados, filtroApenasProntos]);

  const handleClearAll = () => {
    setFiltro('');
    setFiltrosAvancados({
      status: 'all',
      tipo: 'all',
      dataInicio: '',
      dataFim: ''
    });
    setFiltroApenasProntos(false);
    if (onClearFilters) onClearFilters();
  };

  return (
    <div className="filters-container">
      {/* Filtros Principais - Sempre Visíveis */}
      <Row className="mb-3">
        <Col md={6}>
          <div className="search-input-container">
            <Search size={16} className="search-icon" />
            <Form.Control
              type="text"
              placeholder="Buscar por número ou cliente..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="form-control"
            />
          </div>
        </Col>
        <Col md={6}>
          <div className="d-flex gap-2 align-items-center">
            {/* Filtros Rápidos */}
            <div className="btn-group" role="group">
              <Button 
                variant={listScope === 'ativos' ? 'primary' : 'outline-primary'}
                size="sm"
                onClick={() => setListScope('ativos')}
                title="Mostrar apenas pendentes e em produção"
              >
                Ativos
              </Button>
              <Button 
                variant={listScope === 'hoje' ? 'primary' : 'outline-primary'}
                size="sm"
                onClick={() => setListScope('hoje')}
                title="Pedidos do dia"
              >
                Hoje
              </Button>
              <Button 
                variant={listScope === 'todos' ? 'primary' : 'outline-primary'}
                size="sm"
                onClick={() => setListScope('todos')}
                title="Carregar todos"
              >
                Todos
              </Button>
            </div>

            {/* Período para "Todos" */}
            {listScope === 'todos' && (
              <Form.Select
                size="sm"
                value={todosPeriod}
                onChange={(e) => setTodosPeriod(e.target.value)}
                style={{ width: '140px' }}
                title="Período"
              >
                <option value="7">7 dias</option>
                <option value="30">30 dias</option>
                <option value="all">Todos</option>
              </Form.Select>
            )}

            {/* Botão de Filtros Avançados */}
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="d-flex align-items-center gap-1"
            >
              <Filter size={14} />
              Filtros
              {activeFiltersCount > 0 && (
                <span className="badge bg-primary ms-1">
                  {activeFiltersCount}
                </span>
              )}
              {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </Button>

            {/* Botão Limpar */}
            {activeFiltersCount > 0 && (
              <Button
                variant="outline-danger"
                size="sm"
                onClick={handleClearAll}
                title="Limpar todos os filtros"
              >
                <X size={14} />
              </Button>
            )}
          </div>
        </Col>
      </Row>

      {/* Filtros Avançados - Colapsáveis */}
      <Collapse in={showAdvanced}>
        <div className="advanced-filters">
          <Row className="mb-3">
            <Col md={3}>
              <Form.Group>
                <Form.Label className="small text-muted">
                  <Tag size={12} className="me-1" />
                  Status
                </Form.Label>
                <Form.Select 
                  value={filtrosAvancados.status}
                  onChange={(e) => setFiltrosAvancados(prev => ({...prev, status: e.target.value}))}
                  size="sm"
                >
                  <option value="all">Todos os status</option>
                  <option value="pendente">Pendente</option>
                  <option value="em_producao">Em Andamento</option>
                  <option value="pronto">Pronto</option>
                  <option value="entregue">Entregue</option>
                  <option value="cancelado">Cancelado</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label className="small text-muted">
                  <Tag size={12} className="me-1" />
                  Tipo de Produção
                </Form.Label>
                <Form.Select 
                  value={filtrosAvancados.tipo}
                  onChange={(e) => setFiltrosAvancados(prev => ({...prev, tipo: e.target.value}))}
                  size="sm"
                >
                  <option value="all">Todos os tipos</option>
                  <option value="painel">Painel</option>
                  <option value="totem">Totem</option>
                  <option value="lona">Lona</option>
                  <option value="bolsinha">Bolsinha</option>
                  <option value="almofada">Almofada</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label className="small text-muted">
                  <Calendar size={12} className="me-1" />
                  Data Início
                </Form.Label>
                <Form.Control
                  type="date"
                  value={filtrosAvancados.dataInicio}
                  onChange={(e) => setFiltrosAvancados(prev => ({...prev, dataInicio: e.target.value}))}
                  size="sm"
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label className="small text-muted">
                  <Calendar size={12} className="me-1" />
                  Data Fim
                </Form.Label>
                <Form.Control
                  type="date"
                  value={filtrosAvancados.dataFim}
                  onChange={(e) => setFiltrosAvancados(prev => ({...prev, dataFim: e.target.value}))}
                  size="sm"
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Filtros Especiais */}
          <Row>
            <Col md={12}>
              <div className="d-flex gap-3 align-items-center">
                <Form.Check
                  type="checkbox"
                  id="apenas-prontos"
                  label="Apenas prontos"
                  checked={filtroApenasProntos}
                  onChange={(e) => setFiltroApenasProntos(e.target.checked)}
                  className="small"
                />
                <div className="text-muted small">
                  <CheckCircle size={12} className="me-1" />
                  {activeFiltersCount} filtro(s) ativo(s)
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </Collapse>
    </div>
  );
};

export default CollapsibleFilters;
