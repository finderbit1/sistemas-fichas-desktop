import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { 
  Table, 
  Form, 
  Button, 
  Row, 
  Col, 
  Badge, 
  Dropdown, 
  InputGroup,
  Spinner,
  Alert
} from 'react-bootstrap';
import { 
  ArrowUp, 
  ArrowDown, 
  Search,
  Filter,
  X
} from 'react-bootstrap-icons';

const VirtualizedTable = ({
  data = [],
  columns = [],
  rowHeight = 50,
  headerHeight = 60,
  containerHeight = 400,
  overscan = 5,
  showSearch = true,
  showFilters = true,
  sortable = true,
  onRowClick = null,
  loading = false,
  emptyMessage = "Nenhum registro encontrado",
  className = "",
  ...props
}) => {
  // Estados principais
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  const [scrollTop, setScrollTop] = useState(0);
  
  // Refs
  const containerRef = useRef(null);
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

  // Cálculo de virtualização
  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
    const endIndex = Math.min(
      processedData.length - 1,
      Math.ceil((scrollTop + containerHeight) / rowHeight) + overscan
    );

    return { startIndex, endIndex };
  }, [processedData.length, scrollTop, rowHeight, containerHeight, overscan]);

  const visibleItems = useMemo(() => {
    return processedData.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [processedData, visibleRange]);

  const totalHeight = processedData.length * rowHeight;
  const offsetY = visibleRange.startIndex * rowHeight;

  // Controle de scroll
  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

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

  // Controle de filtros
  const handleFilterChange = useCallback((field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setSearchTerm('');
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
        style={{ 
          cursor: isSortable ? 'pointer' : 'default',
          height: headerHeight,
          padding: '0 12px'
        }}
      >
        <div className="d-flex align-items-center justify-content-between h-100">
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
  }, [sortable, sortField, sortDirection, handleSort, headerHeight]);

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
          <Col md={6}>
            <InputGroup>
              <InputGroup.Text>
                <Search size={16} />
              </InputGroup.Text>
              <Form.Control
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </Col>
        )}
        
        {showFilters && filterableColumns.length > 0 && (
          <Col md={6}>
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
      </Row>
    );
  }, [showSearch, showFilters, columns, searchTerm, filters, showFilterDropdown, handleFilterChange, clearFilters]);

  // Efeito para resetar scroll quando dados mudam
  useEffect(() => {
    setScrollTop(0);
  }, [processedData.length]);

  if (loading) {
    return (
      <div className="text-center p-4">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Carregando dados...</p>
      </div>
    );
  }

  return (
    <div className={`virtualized-table ${className}`}>
      {/* Filtros e Busca */}
      {renderFilters()}
      
      {/* Contador de resultados */}
      <div className="mb-3 text-muted small">
        {processedData.length} registro{processedData.length !== 1 ? 's' : ''} encontrado{processedData.length !== 1 ? 's' : ''}
      </div>
      
      {/* Tabela virtualizada */}
      <div
        ref={containerRef}
        className="virtualized-table-container"
        style={{
          height: containerHeight,
          overflow: 'auto',
          border: '1px solid #ddd',
          borderRadius: '4px'
        }}
        onScroll={handleScroll}
      >
        {/* Header fixo */}
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 1,
            backgroundColor: '#f8f9fa',
            borderBottom: '1px solid #ddd'
          }}
        >
          <div
            style={{
              display: 'flex',
              height: headerHeight,
              alignItems: 'center',
              fontWeight: 'bold',
              padding: '0 12px'
            }}
          >
            {columns.map((column, index) => (
              <div
                key={index}
                style={{
                  flex: column.width || 1,
                  padding: '0 12px',
                  borderRight: index < columns.length - 1 ? '1px solid #ddd' : 'none'
                }}
              >
                {column.header}
              </div>
            ))}
          </div>
        </div>

        {/* Container com altura total */}
        <div style={{ height: totalHeight, position: 'relative' }}>
          {processedData.length === 0 ? (
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                width: '100%'
              }}
            >
              <Alert variant="info" className="mb-0">
                {emptyMessage}
              </Alert>
            </div>
          ) : (
            <div
              style={{
                transform: `translateY(${offsetY}px)`,
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0
              }}
            >
              {visibleItems.map((item, index) => {
                const actualIndex = visibleRange.startIndex + index;
                return (
                  <div
                    key={item.id || actualIndex}
                    style={{
                      height: rowHeight,
                      display: 'flex',
                      alignItems: 'center',
                      borderBottom: '1px solid #eee',
                      cursor: onRowClick ? 'pointer' : 'default',
                      backgroundColor: actualIndex % 2 === 0 ? '#fff' : '#f8f9fa'
                    }}
                    onClick={() => onRowClick?.(item, actualIndex)}
                  >
                    {columns.map((column, colIndex) => (
                      <div
                        key={colIndex}
                        style={{
                          flex: column.width || 1,
                          padding: '0 12px',
                          borderRight: colIndex < columns.length - 1 ? '1px solid #eee' : 'none'
                        }}
                      >
                        {renderCell(item, column, actualIndex)}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VirtualizedTable;
