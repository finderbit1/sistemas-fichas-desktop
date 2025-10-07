import React, { useState, useCallback } from 'react';
import { Button, Badge, Dropdown } from 'react-bootstrap';
import { CheckSquare, Square, Trash, Download, MoreVertical } from 'react-bootstrap-icons';
import AdvancedTable from './AdvancedTable';

const SelectableTable = ({
  data = [],
  columns = [],
  onBulkDelete = null,
  onBulkExport = null,
  onBulkAction = null,
  bulkActions = [],
  selectionActions = [],
  showSelectionActions = true,
  pageSize = 10,
  className = "",
  ...props
}) => {
  const [selectedItems, setSelectedItems] = useState([]);

  // Callback para quando a seleção muda
  const handleSelectionChange = useCallback((selectedIds) => {
    const selected = data.filter(item => selectedIds.includes(item.id));
    setSelectedItems(selected);
  }, [data]);

  // Ações em lote disponíveis
  const defaultBulkActions = [
    ...(onBulkDelete ? [{
      label: 'Excluir Selecionados',
      icon: <Trash size={14} />,
      variant: 'danger',
      onClick: () => onBulkDelete(selectedItems)
    }] : []),
    ...(onBulkExport ? [{
      label: 'Exportar Selecionados',
      icon: <Download size={14} />,
      variant: 'success',
      onClick: () => onBulkExport(selectedItems)
    }] : []),
    ...bulkActions
  ];

  // Renderizar ações de seleção
  const renderSelectionActions = () => {
    if (!showSelectionActions || selectedItems.length === 0) return null;

    return (
      <div className="d-flex align-items-center gap-2 mb-3 p-3 bg-light rounded">
        <div className="d-flex align-items-center">
          <CheckSquare size={16} className="text-primary me-2" />
          <strong>{selectedItems.length}</strong>
          <span className="text-muted ms-1">
            item{selectedItems.length !== 1 ? 's' : ''} selecionado{selectedItems.length !== 1 ? 's' : ''}
          </span>
        </div>
        
        <div className="ms-auto d-flex gap-2">
          {/* Ações principais */}
          {defaultBulkActions.slice(0, 2).map((action, index) => (
            <Button
              key={index}
              variant={action.variant || 'outline-secondary'}
              size="sm"
              onClick={action.onClick}
              className="d-flex align-items-center gap-1"
            >
              {action.icon}
              {action.label}
            </Button>
          ))}
          
          {/* Menu dropdown para ações adicionais */}
          {(defaultBulkActions.length > 2 || selectionActions.length > 0) && (
            <Dropdown>
              <Dropdown.Toggle 
                variant="outline-secondary" 
                size="sm"
                className="d-flex align-items-center"
              >
                <MoreVertical size={14} />
              </Dropdown.Toggle>
              
              <Dropdown.Menu>
                {defaultBulkActions.slice(2).map((action, index) => (
                  <Dropdown.Item
                    key={`bulk-${index}`}
                    onClick={action.onClick}
                    className="d-flex align-items-center gap-2"
                  >
                    {action.icon}
                    {action.label}
                  </Dropdown.Item>
                ))}
                
                {selectionActions.length > 0 && (
                  <>
                    <Dropdown.Divider />
                    {selectionActions.map((action, index) => (
                      <Dropdown.Item
                        key={`selection-${index}`}
                        onClick={() => action.onClick(selectedItems)}
                        className="d-flex align-items-center gap-2"
                      >
                        {action.icon}
                        {action.label}
                      </Dropdown.Item>
                    ))}
                  </>
                )}
              </Dropdown.Menu>
            </Dropdown>
          )}
        </div>
      </div>
    );
  };

  // Renderizar badge de seleção no cabeçalho
  const renderSelectionHeader = () => {
    if (selectedItems.length === 0) return null;
    
    return (
      <Badge bg="primary" className="ms-2">
        {selectedItems.length} selecionado{selectedItems.length !== 1 ? 's' : ''}
      </Badge>
    );
  };

  return (
    <div className={`selectable-table ${className}`}>
      {/* Ações de seleção */}
      {renderSelectionActions()}
      
      {/* Tabela avançada */}
      <AdvancedTable
        data={data}
        columns={columns}
        showSelection={true}
        showSelectionActions={showSelectionActions}
        onSelectionChange={handleSelectionChange}
        pageSize={pageSize}
        className="selectable-advanced-table"
        {...props}
      />
    </div>
  );
};

export default SelectableTable;
