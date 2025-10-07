import React, { useState, useMemo, useCallback } from 'react';
import { 
  Table, 
  Form, 
  Button, 
  Row, 
  Col, 
  Pagination, 
  Badge, 
  Dropdown, 
  InputGroup,
  Spinner,
  Alert
} from 'react-bootstrap';
import { 
  ArrowUp, 
  ArrowDown, 
  ChevronLeft, 
  ChevronRight,
  Search,
  Filter,
  Check,
  X
} from 'react-bootstrap-icons';

const AdvancedTable = ({
  data = [],
  columns = [],
  pageSize = 10,
  showPagination = true,
  showSearch = true,
  showFilters = true,
  showSelection = false,
  onSelectionChange = () => {},
  onRowClick = null,
  loading = false,
  emptyMessage = "Nenhum registro encontrado",
  className = "",
  responsive = true,
  striped = true,
  hover = true,
  sortable = true,
  virtualized = false,
  maxHeight = null,
  ...props
}) => {
  // Estados principais
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Função para ordenar dados
  const sortData = useCallback((data, field, direction) => {
    if (!field) return data;
    
    return [...data].sort((a, b) => {
      let aVal = a[field];
      let bVal = b[field];
      
      // Tratar valores nulos/undefined
      if (aVal == null) aVal = '';
      if (bVal == null) bVal = '';
      
      // Tratar diferentes tipos
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (direction === 'asc') {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      }
    });
  }, []);

  // Função para filtrar dados
  const filterData = useCallback((data, searchTerm, filters) => {
    return data.filter(item => {
      // Filtro de busca geral
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = Object.values(item).some(value => 
          value && value.toString().toLowerCase().includes(searchLower)
        );
        if (!matchesSearch) return false;
      }
      
      // Filtros específicos por coluna
      for (const [field, filterValue] of Object.entries(filters)) {
        if (filterValue && filterValue !== '') {
          const itemValue = item[field];
          if (itemValue == null) return false;
          
          const itemStr = itemValue.toString().toLowerCase();
          const filterStr = filterValue.toString().toLowerCase();
          
          if (!itemStr.includes(filterStr)) return false;
        }
      }
      
      return true;
    });
  }, []);

  // Dados processados
  const processedData = useMemo(() => {
    let result = data;
    
    // Aplicar filtros
    result = filterData(result, searchTerm, filters);
    
    // Aplicar ordenação
    result = sortData(result, sortField, sortDirection);
    
    return result;
  }, [data, searchTerm, filters, sortField, sortDirection, filterData, sortData]);

  // Dados paginados
  const paginatedData = useMemo(() => {
    if (!showPagination) return processedData;
    
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return processedData.slice(startIndex, endIndex);
  }, [processedData, currentPage, pageSize, showPagination]);

  // Controle de ordenação
  const handleSort = useCallback((field) => {
    if (!sortable) return;
    
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }, [sortField, sortable]);

  // Controle de seleção
  const handleSelectAll = useCallback((checked) => {
    if (checked) {
      const allIds = new Set(paginatedData.map(item => item.id));
      setSelectedRows(allIds);
      onSelectionChange(Array.from(allIds));
    } else {
      setSelectedRows(new Set());
      onSelectionChange([]);
    }
  }, [paginatedData, onSelectionChange]);

  const handleSelectRow = useCallback((id, checked) => {
    const newSelected = new Set(selectedRows);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedRows(newSelected);
    onSelectionChange(Array.from(newSelected));
  }, [selectedRows, onSelectionChange]);

  // Controle de filtros
  const handleFilterChange = useCallback((field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setCurrentPage(1); // Reset para primeira página ao filtrar
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setSearchTerm('');
    setCurrentPage(1);
  }, []);

  // Renderizar cabeçalho da coluna
  const renderHeader = useCallback((column, index) => {
    const isSortable = sortable && column.sortable !== false;
    const isSorted = sortField === column.key;
    
    return (
      <th 
        key={index}
        className={`${isSortable ? 'sortable' : ''} ${isSorted ? 'sorted' : ''}`}
        onClick={() => isSortable && handleSort(column.key)}
        style={{ cursor: isSortable ? 'pointer' : 'default' }}
      >
        <div className="d-flex align-items-center justify-content-between">
          <span>{column.header}</span>
          {isSortable && (
            <div className="sort-indicator">
              {isSorted ? (
                sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
              ) : (
                <div className="sort-placeholder" style={{ width: '14px', height: '14px' }} />
              )}
            </div>
          )}
        </div>
      </th>
    );
  }, [sortable, sortField, sortDirection, handleSort]);

  // Renderizar célula
  const renderCell = useCallback((item, column, rowIndex) => {
    if (column.render) {
      return column.render(item, rowIndex);
    }
    return item[column.key] || '-';
  }, []);

  // Renderizar filtros
  const renderFilters = useCallback(() => {
    const filterableColumns = columns.filter(col => col.filterable !== false);
    
    return (
      <Row className="mb-3">
        {showSearch && (
          <Col md={4}>
            <InputGroup>
              <InputGroup.Text>
                <Search size={16} />
              </InputGroup.Text>
              <Form.Control
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </InputGroup>
          </Col>
        )}
        
        {showFilters && filterableColumns.length > 0 && (
          <Col md={4}>
            <Dropdown show={showFilterDropdown} onToggle={setShowFilterDropdown}>
              <Dropdown.Toggle variant="outline-secondary" size="sm">
                <Filter size={16} className="me-2" />
                Filtros
                {Object.keys(filters).length > 0 && (
                  <Badge bg="primary" className="ms-2">
                    {Object.keys(filters).length}
                  </Badge>
                )}
              </Dropdown.Toggle>
              
              <Dropdown.Menu style={{ minWidth: '300px' }}>
                <Dropdown.Header>Filtros por Coluna</Dropdown.Header>
                {filterableColumns.map((column, index) => (
                  <div key={index} className="px-3 py-2">
                    <Form.Label className="small mb-1">{column.header}</Form.Label>
                    <Form.Control
                      size="sm"
                      placeholder={`Filtrar ${column.header.toLowerCase()}...`}
                      value={filters[column.key] || ''}
                      onChange={(e) => handleFilterChange(column.key, e.target.value)}
                    />
                  </div>
                ))}
                <Dropdown.Divider />
                <div className="px-3 py-2">
                  <Button 
                    variant="outline-danger" 
                    size="sm" 
                    onClick={clearFilters}
                    className="w-100"
                  >
                    <X size={14} className="me-1" />
                    Limpar Filtros
                  </Button>
                </div>
              </Dropdown.Menu>
            </Dropdown>
          </Col>
        )}
        
        <Col md={4} className="text-end">
          <small className="text-muted">
            {processedData.length} registro{processedData.length !== 1 ? 's' : ''} encontrado{processedData.length !== 1 ? 's' : ''}
          </small>
        </Col>
      </Row>
    );
  }, [showSearch, showFilters, columns, searchTerm, filters, showFilterDropdown, processedData.length, handleFilterChange, clearFilters]);

  // Renderizar paginação
  const renderPagination = useCallback(() => {
    if (!showPagination) return null;
    
    const totalPages = Math.ceil(processedData.length / pageSize);
    if (totalPages <= 1) return null;
    
    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, processedData.length);
    
    return (
      <div className="d-flex justify-content-between align-items-center mt-3">
        <div className="text-muted small">
          Mostrando {startItem} a {endItem} de {processedData.length} registros
        </div>
        
        <Pagination size="sm">
          <Pagination.Prev 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            <ChevronLeft size={16} />
          </Pagination.Prev>
          
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }
            
            return (
              <Pagination.Item
                key={pageNum}
                active={pageNum === currentPage}
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </Pagination.Item>
            );
          })}
          
          <Pagination.Next 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            <ChevronRight size={16} />
          </Pagination.Next>
        </Pagination>
      </div>
    );
  }, [showPagination, processedData.length, pageSize, currentPage]);

  if (loading) {
    return (
      <div className="text-center p-4">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Carregando dados...</p>
      </div>
    );
  }

  return (
    <div className={`advanced-table ${className}`}>
      {/* Filtros e Busca */}
      {renderFilters()}
      
      {/* Tabela */}
      <div 
        className="table-container"
        style={{ 
          maxHeight: maxHeight || (virtualized ? '600px' : null),
          overflowY: maxHeight || virtualized ? 'auto' : null
        }}
      >
        <Table 
          responsive={responsive} 
          striped={striped} 
          hover={hover}
          className="table-modern"
          {...props}
        >
          <thead>
            <tr>
              {showSelection && (
                <th style={{ width: '50px' }}>
                  <Form.Check
                    type="checkbox"
                    checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    aria-label="Selecionar todos"
                  />
                </th>
              )}
              {columns.map(renderHeader)}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td 
                  colSpan={columns.length + (showSelection ? 1 : 0)} 
                  className="text-center py-4"
                >
                  <Alert variant="info" className="mb-0">
                    {emptyMessage}
                  </Alert>
                </td>
              </tr>
            ) : (
              paginatedData.map((item, rowIndex) => (
                <tr 
                  key={item.id || rowIndex}
                  className={selectedRows.has(item.id) ? 'table-selected' : ''}
                  onClick={() => onRowClick && onRowClick(item, rowIndex)}
                  style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                >
                  {showSelection && (
                    <td>
                      <Form.Check
                        type="checkbox"
                        checked={selectedRows.has(item.id)}
                        onChange={(e) => handleSelectRow(item.id, e.target.checked)}
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`Selecionar linha ${rowIndex + 1}`}
                      />
                    </td>
                  )}
                  {columns.map((column, colIndex) => (
                    <td key={colIndex}>
                      {renderCell(item, column, rowIndex)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>
      
      {/* Paginação */}
      {renderPagination()}
    </div>
  );
};

export default AdvancedTable;
