import React, { memo, useMemo, useCallback, useState, useRef, useEffect } from 'react';
import { Table, Pagination, Form, InputGroup, Spinner } from 'react-bootstrap';
import { Search, SortUp, SortDown } from 'react-bootstrap-icons';

/**
 * Componente de tabela otimizada com virtualização para grandes volumes de dados
 */
const OptimizedTable = memo(({
  data = [],
  columns = [],
  pageSize = 50,
  sortable = true,
  searchable = true,
  loading = false,
  onRowClick = null,
  className = '',
  rowClassName = '',
  ...props
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState(data);
  
  // Memoizar dados filtrados e ordenados
  const processedData = useMemo(() => {
    let result = [...filteredData];
    
    // Aplicar busca
    if (searchTerm && searchable) {
      result = result.filter(row => 
        columns.some(col => {
          const value = row[col.key];
          return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    }
    
    // Aplicar ordenação
    if (sortConfig.key && sortable) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        
        if (aVal < bVal) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aVal > bVal) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return result;
  }, [filteredData, searchTerm, sortConfig, columns, searchable, sortable]);
  
  // Memoizar dados paginados
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return processedData.slice(startIndex, endIndex);
  }, [processedData, currentPage, pageSize]);
  
  // Calcular número de páginas
  const totalPages = useMemo(() => {
    return Math.ceil(processedData.length / pageSize);
  }, [processedData.length, pageSize]);
  
  // Atualizar dados filtrados quando data mudar
  useEffect(() => {
    setFilteredData(data);
  }, [data]);
  
  // Resetar página quando dados mudarem
  useEffect(() => {
    setCurrentPage(1);
  }, [processedData.length]);
  
  // Handlers memoizados
  const handleSort = useCallback((key) => {
    if (!sortable) return;
    
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, [sortable]);
  
  const handleSearch = useCallback((e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  }, []);
  
  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);
  
  const handleRowClick = useCallback((row) => {
    if (onRowClick) {
      onRowClick(row);
    }
  }, [onRowClick]);
  
  // Renderizar ícone de ordenação
  const renderSortIcon = (key) => {
    if (!sortable) return null;
    
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? <SortUp /> : <SortDown />;
    }
    return null;
  };
  
  // Renderizar célula
  const renderCell = (row, column) => {
    const value = row[column.key];
    
    if (column.render) {
      return column.render(value, row, column);
    }
    
    return value || '-';
  };
  
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }
  
  return (
    <div className="optimized-table">
      {searchable && (
        <div className="mb-3">
          <InputGroup>
            <InputGroup.Text>
              <Search />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </InputGroup>
        </div>
      )}
      
      <div className="table-responsive">
        <Table className={className} {...props}>
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  style={{ cursor: sortable ? 'pointer' : 'default' }}
                  onClick={() => handleSort(column.key)}
                  className={sortable ? 'sortable' : ''}
                >
                  <div className="d-flex align-items-center justify-content-between">
                    <span>{column.title}</span>
                    {renderSortIcon(column.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, index) => (
              <tr
                key={row.id || index}
                onClick={() => handleRowClick(row)}
                className={`${rowClassName} ${onRowClick ? 'clickable-row' : ''}`}
              >
                {columns.map((column) => (
                  <td key={column.key}>
                    {renderCell(row, column)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
      
      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-3">
          <Pagination>
            <Pagination.First
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
            />
            <Pagination.Prev
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            />
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <Pagination.Item
                  key={page}
                  active={page === currentPage}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </Pagination.Item>
              );
            })}
            
            <Pagination.Next
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            />
            <Pagination.Last
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
            />
          </Pagination>
        </div>
      )}
      
      <div className="table-info mt-2">
        <small className="text-muted">
          Mostrando {((currentPage - 1) * pageSize) + 1} a {Math.min(currentPage * pageSize, processedData.length)} de {processedData.length} registros
        </small>
      </div>
    </div>
  );
});

OptimizedTable.displayName = 'OptimizedTable';

export default OptimizedTable;
