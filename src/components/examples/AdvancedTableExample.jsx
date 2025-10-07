import React, { useState } from 'react';
import { Card, Button, Badge, Row, Col } from 'react-bootstrap';
import { Plus, Download, Trash } from 'react-bootstrap-icons';
import AdvancedTable from '../AdvancedTable';
import SelectableTable from '../SelectableTable';
import VirtualizedTable from '../VirtualizedTable';
import { StatusBadge, ProgressIndicator, PriorityIndicator } from '../StatusIndicators';
import '../../styles/advanced-table.css';
import '../../styles/status-indicators.css';

const AdvancedTableExample = () => {
  // Dados de exemplo
  const [sampleData] = useState([
    {
      id: 1,
      name: 'Pedido #001',
      cliente: 'João Silva',
      status: 'ativo',
      prioridade: 'alta',
      progresso: 75,
      dataCriacao: '2024-01-15',
      valor: 1500.00,
      tipo: 'painel'
    },
    {
      id: 2,
      name: 'Pedido #002',
      cliente: 'Maria Santos',
      status: 'pendente',
      prioridade: 'média',
      progresso: 25,
      dataCriacao: '2024-01-14',
      valor: 2300.00,
      tipo: 'almofada'
    },
    {
      id: 3,
      name: 'Pedido #003',
      cliente: 'Pedro Oliveira',
      status: 'concluído',
      prioridade: 'baixa',
      progresso: 100,
      dataCriacao: '2024-01-13',
      valor: 850.00,
      tipo: 'bandeira'
    },
    {
      id: 4,
      name: 'Pedido #004',
      cliente: 'Ana Costa',
      status: 'em_andamento',
      prioridade: 'alta',
      progresso: 50,
      dataCriacao: '2024-01-12',
      valor: 3200.00,
      tipo: 'totem'
    },
    {
      id: 5,
      name: 'Pedido #005',
      cliente: 'Carlos Ferreira',
      status: 'inativo',
      prioridade: 'normal',
      progresso: 0,
      dataCriacao: '2024-01-11',
      valor: 1800.00,
      tipo: 'lona'
    }
  ]);

  // Configuração das colunas para tabela avançada
  const columns = [
    {
      key: 'name',
      header: 'Pedido',
      sortable: true,
      filterable: true,
      render: (item) => (
        <div className="fw-medium text-primary">{item.name}</div>
      )
    },
    {
      key: 'cliente',
      header: 'Cliente',
      sortable: true,
      filterable: true,
      render: (item) => (
        <div>{item.cliente}</div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      filterable: true,
      render: (item) => (
        <StatusBadge status={item.status} showIcon={true} />
      )
    },
    {
      key: 'prioridade',
      header: 'Prioridade',
      sortable: true,
      filterable: true,
      render: (item) => (
        <PriorityIndicator priority={item.prioridade} />
      )
    },
    {
      key: 'progresso',
      header: 'Progresso',
      sortable: true,
      filterable: false,
      render: (item) => (
        <ProgressIndicator 
          value={item.progresso} 
          max={100} 
          size="sm"
          showLabel={true}
        />
      )
    },
    {
      key: 'valor',
      header: 'Valor',
      sortable: true,
      filterable: true,
      render: (item) => (
        <div className="fw-medium">
          R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </div>
      )
    },
    {
      key: 'dataCriacao',
      header: 'Data',
      sortable: true,
      filterable: true,
      render: (item) => (
        <div className="text-muted">
          {new Date(item.dataCriacao).toLocaleDateString('pt-BR')}
        </div>
      )
    }
  ];

  // Configuração das colunas para tabela selecionável
  const selectableColumns = [
    ...columns,
    {
      key: 'actions',
      header: 'Ações',
      sortable: false,
      filterable: false,
      render: (item) => (
        <div className="d-flex gap-1">
          <Button variant="outline-primary" size="sm">
            Editar
          </Button>
          <Button variant="outline-danger" size="sm">
            Excluir
          </Button>
        </div>
      )
    }
  ];

  // Ações em lote
  const handleBulkDelete = (selectedItems) => {
    console.log('Excluir itens:', selectedItems);
    alert(`Excluir ${selectedItems.length} itens selecionados?`);
  };

  const handleBulkExport = (selectedItems) => {
    console.log('Exportar itens:', selectedItems);
    alert(`Exportar ${selectedItems.length} itens selecionados?`);
  };

  const bulkActions = [
    {
      label: 'Marcar como Concluído',
      icon: <Badge bg="success">✓</Badge>,
      variant: 'success',
      onClick: (items) => console.log('Marcar como concluído:', items)
    },
    {
      label: 'Alterar Prioridade',
      icon: <Badge bg="warning">!</Badge>,
      variant: 'warning',
      onClick: (items) => console.log('Alterar prioridade:', items)
    }
  ];

  return (
    <div className="p-4">
      <h2 className="mb-4">Exemplos de Tabelas Avançadas</h2>
      
      {/* Tabela Avançada Básica */}
      <Card className="mb-4">
        <Card.Header>
          <h5>Tabela Avançada - Recursos Básicos</h5>
        </Card.Header>
        <Card.Body>
          <AdvancedTable
            data={sampleData}
            columns={columns}
            showPagination={true}
            showSearch={true}
            showFilters={true}
            pageSize={5}
            emptyMessage="Nenhum pedido encontrado"
            onRowClick={(item) => console.log('Clique na linha:', item)}
            className="mb-3"
          />
        </Card.Body>
      </Card>

      {/* Tabela com Seleção Múltipla */}
      <Card className="mb-4">
        <Card.Header>
          <h5>Tabela com Seleção Múltipla</h5>
        </Card.Header>
        <Card.Body>
          <SelectableTable
            data={sampleData}
            columns={selectableColumns}
            onBulkDelete={handleBulkDelete}
            onBulkExport={handleBulkExport}
            bulkActions={bulkActions}
            pageSize={5}
            className="mb-3"
          />
        </Card.Body>
      </Card>

      {/* Tabela Virtualizada */}
      <Card className="mb-4">
        <Card.Header>
          <h5>Tabela Virtualizada - Para Grandes Volumes</h5>
        </Card.Header>
        <Card.Body>
          <VirtualizedTable
            data={sampleData}
            columns={columns}
            containerHeight={300}
            rowHeight={60}
            showSearch={true}
            showFilters={true}
            onRowClick={(item) => console.log('Clique na linha:', item)}
            className="mb-3"
          />
        </Card.Body>
      </Card>

      {/* Exemplos de Indicadores Visuais */}
      <Card className="mb-4">
        <Card.Header>
          <h5>Indicadores Visuais</h5>
        </Card.Header>
        <Card.Body>
          <Row className="mb-3">
            <Col md={6}>
              <h6>Status Badges:</h6>
              <div className="d-flex flex-wrap gap-2 mb-3">
                <StatusBadge status="ativo" />
                <StatusBadge status="pendente" />
                <StatusBadge status="concluído" />
                <StatusBadge status="erro" />
                <StatusBadge status="inativo" />
              </div>
            </Col>
            <Col md={6}>
              <h6>Prioridades:</h6>
              <div className="d-flex flex-wrap gap-2 mb-3">
                <PriorityIndicator priority="alta" />
                <PriorityIndicator priority="média" />
                <PriorityIndicator priority="baixa" />
                <PriorityIndicator priority="normal" />
              </div>
            </Col>
          </Row>
          
          <Row>
            <Col md={6}>
              <h6>Barras de Progresso:</h6>
              <div className="mb-3">
                <ProgressIndicator value={25} max={100} label="25%" />
                <ProgressIndicator value={50} max={100} label="50%" />
                <ProgressIndicator value={75} max={100} label="75%" />
                <ProgressIndicator value={100} max={100} label="100%" />
              </div>
            </Col>
            <Col md={6}>
              <h6>Contadores:</h6>
              <div className="d-flex flex-wrap gap-2 mb-3">
                <Badge bg="primary">5</Badge>
                <Badge bg="success">12/20</Badge>
                <Badge bg="warning">3</Badge>
                <Badge bg="danger">8/10</Badge>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Documentação de Uso */}
      <Card>
        <Card.Header>
          <h5>Como Usar</h5>
        </Card.Header>
        <Card.Body>
          <h6>1. Tabela Avançada Básica:</h6>
          <pre className="bg-light p-3 rounded">
{`<AdvancedTable
  data={dados}
  columns={colunas}
  showPagination={true}
  showSearch={true}
  showFilters={true}
  pageSize={10}
  onRowClick={(item) => console.log(item)}
/>`}
          </pre>

          <h6>2. Tabela com Seleção Múltipla:</h6>
          <pre className="bg-light p-3 rounded">
{`<SelectableTable
  data={dados}
  columns={colunas}
  onBulkDelete={handleDelete}
  onBulkExport={handleExport}
  bulkActions={acoesCustomizadas}
/>`}
          </pre>

          <h6>3. Tabela Virtualizada:</h6>
          <pre className="bg-light p-3 rounded">
{`<VirtualizedTable
  data={dados}
  columns={colunas}
  containerHeight={400}
  rowHeight={50}
  showSearch={true}
/>`}
          </pre>
        </Card.Body>
      </Card>
    </div>
  );
};

export default AdvancedTableExample;
