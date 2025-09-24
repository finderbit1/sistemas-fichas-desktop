import React, { memo, useMemo, useCallback } from 'react';

const KANBAN_COLUMNS = [
  { key: 'Financeiro', title: 'Financeiro' },
  { key: 'Conferência', title: 'Conferência' },
  { key: 'Sublimação', title: 'Sublimação' },
  { key: 'Costura', title: 'Costura' },
  { key: 'Expedição', title: 'Expedição' },
  { key: 'Pronto', title: 'Pronto' }
];

// Componente memoizado para o card do Kanban
const KanbanCard = memo(({ pedido, onToggleSetor, onEdit, onPreview }) => {
  const isLate = useMemo(() => {
    if (!pedido?.dataEntrega) return false;
    const entrega = new Date(pedido.dataEntrega);
    const today = new Date();
    today.setHours(0,0,0,0);
    entrega.setHours(0,0,0,0);
    const allDone = !!(pedido.financeiro && pedido.conferencia && pedido.sublimacao && pedido.costura && pedido.expedicao);
    return entrega < today && !allDone;
  }, [pedido?.dataEntrega, pedido?.financeiro, pedido?.conferencia, pedido?.sublimacao, pedido?.costura, pedido?.expedicao]);

  const steps = useMemo(() => {
    const financeiro = !!pedido.financeiro;
    const conferencia = !!pedido.conferencia;
    const sublimacao = !!pedido.sublimacao;
    const costura = !!pedido.costura;
    const expedicao = !!pedido.expedicao;
    
    return [
      { key: 'financeiro', label: 'Financeiro', done: financeiro },
      { key: 'conferencia', label: 'Conferência', done: conferencia },
      { key: 'sublimacao', label: 'Sublimação', done: sublimacao },
      { key: 'costura', label: 'Costura', done: costura },
      { key: 'expedicao', label: 'Expedição', done: expedicao }
    ];
  }, [pedido?.financeiro, pedido?.conferencia, pedido?.sublimacao, pedido?.costura, pedido?.expedicao]);

  const progressData = useMemo(() => {
    const isHighPriority = pedido.prioridade === true || pedido.prioridade === 'ALTA';
    const totalSteps = steps.length;
    const completedSteps = steps.filter(s => s.done).length;
    const progressPct = Math.round((completedSteps / totalSteps) * 100);
    const firstPending = steps.find(s => !s.done)?.key;

    return { isHighPriority, totalSteps, completedSteps, progressPct, firstPending };
  }, [steps, pedido.prioridade]);

  const handleDragStart = useCallback((e) => {
    e.dataTransfer.setData('text/plain', String(pedido.id));
    try { 
      e.dataTransfer.effectAllowed = 'move'; 
    } catch (_) {}
  }, [pedido.id]);

  const handlePreview = useCallback(() => {
    onPreview?.(pedido);
  }, [onPreview, pedido]);

  const handleEdit = useCallback(() => {
    onEdit?.(pedido);
  }, [onEdit, pedido]);

  return (
    <div 
      className={`kanban-card${isLate ? ' late' : ''}${progressData.isHighPriority ? ' priority-high' : ''}`} 
      draggable 
      onDragStart={handleDragStart}
    >
      <div className="kanban-card-header">
        <span className="kanban-card-number">#{pedido.numeroPedido}</span>
        {progressData.isHighPriority ? (
          <span className="badge badge-error">Alta</span>
        ) : (
          <span className="badge badge-neutral">Normal</span>
        )}
        <span className="kanban-card-progress-count">{progressData.completedSteps}/{progressData.totalSteps}</span>
      </div>
      <div className="kanban-card-body">
        <div className="kanban-card-title">{pedido.nomeCliente || 'Sem nome'}</div>
        <div className="kanban-card-subtitle">{pedido.cidadeCliente || ''}</div>
        {pedido.dataEntrega && (
          <div className="kanban-card-date">
            Entrega: {new Date(pedido.dataEntrega).toLocaleDateString('pt-BR')}
            {isLate && <span className="badge badge-error" style={{ marginLeft: 6 }}>Atrasado</span>}
          </div>
        )}
        <div className="kanban-progress" aria-label="Progresso do pedido">
          <div className="kanban-progress-bar" style={{ width: `${progressData.progressPct}%` }} />
        </div>
        <div className="kanban-steps">
          {steps.map(step => (
            <div
              key={step.key}
              className={`kanban-step${step.done ? ' done' : ''}${!step.done && progressData.firstPending === step.key ? ' current' : ''}`}
              title={step.label}
            >
              {step.label}
            </div>
          ))}
        </div>
      </div>
      <div className="kanban-card-footer">
        <button className="btn btn-sm btn-outline" onClick={handlePreview}>Visualizar</button>
        <button className="btn btn-sm btn-outline" onClick={handleEdit}>Editar</button>
      </div>
    </div>
  );
});

// Componente memoizado para coluna do Kanban
const KanbanColumn = memo(({ 
  column, 
  pedidos, 
  onToggleSetor, 
  onEdit, 
  onPreview, 
  onMoveToColumn,
  getColumnForPedido,
  setorKeyToField,
  orderedKeys
}) => {
  const highPriorityCount = useMemo(() => 
    (pedidos || []).filter(p => p.prioridade === true || p.prioridade === 'ALTA').length,
    [pedidos]
  );

  const handleDragEnter = useCallback((e) => { 
    e.preventDefault(); 
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    try { 
      e.dataTransfer.dropEffect = 'move'; 
    } catch (_) {}
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    const pedido = (pedidos || []).find(p => String(p.id) === String(id));
    if (!pedido) return;
    
    if (onMoveToColumn) {
      onMoveToColumn(pedido, column.key);
    } else {
      // Lógica de avanço automático
      const targetIdx = orderedKeys.indexOf(column.key);
      const lastWorkIdx = orderedKeys.indexOf('Expedição');
      const finalIdx = column.key === 'Pronto' ? lastWorkIdx : targetIdx;
      
      for (let i = 0; i <= finalIdx; i++) {
        const key = orderedKeys[i];
        const field = setorKeyToField(key);
        if (!field) continue;
        if (!pedido[field]) {
          onToggleSetor(pedido.id, field);
        }
      }
    }
  }, [pedidos, onMoveToColumn, onToggleSetor, column.key, orderedKeys, setorKeyToField]);

  return (
    <div
      className="kanban-column"
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="kanban-column-header">
        <span className={`kanban-pip status-${column.key.replace(/\s/g, '').toLowerCase()}`} />
        <span className="kanban-column-title">{column.title}</span>
        <span className="kanban-column-count">{pedidos?.length || 0}</span>
        {highPriorityCount > 0 && (
          <span className="kanban-column-priority">Alta: {highPriorityCount}</span>
        )}
      </div>
      <div className="kanban-column-body">
        {(pedidos || []).map(p => (
          <KanbanCard
            key={p.id}
            pedido={p}
            onToggleSetor={onToggleSetor}
            onEdit={onEdit}
            onPreview={onPreview}
          />
        ))}
      </div>
    </div>
  );
});

const OptimizedKanbanBoard = memo(({ pedidos, onToggleSetor, onEdit, onPreview, onMoveToColumn }) => {
  const getColumnForPedido = useCallback((p) => {
    const financeiro = !!p.financeiro;
    const conferencia = !!p.conferencia;
    const sublimacao = !!p.sublimacao;
    const costura = !!p.costura;
    const expedicao = !!p.expedicao;
    const allDone = financeiro && conferencia && sublimacao && costura && expedicao;
    
    if (allDone) return 'Pronto';
    if (!financeiro) return 'Financeiro';
    if (!conferencia) return 'Conferência';
    if (!sublimacao) return 'Sublimação';
    if (!costura) return 'Costura';
    if (!expedicao) return 'Expedição';
    return 'Financeiro';
  }, []);

  const setorKeyToField = useCallback((colKey) => {
    switch (colKey) {
      case 'Financeiro': return 'financeiro';
      case 'Conferência': return 'conferencia';
      case 'Sublimação': return 'sublimacao';
      case 'Costura': return 'costura';
      case 'Expedição': return 'expedicao';
      case 'Pronto': return 'expedicao';
      default: return null;
    }
  }, []);

  const orderedKeys = useMemo(() => KANBAN_COLUMNS.map(c => c.key), []);

  const grouped = useMemo(() => {
    const map = {
      'Financeiro': [],
      'Conferência': [],
      'Sublimação': [],
      'Costura': [],
      'Expedição': [],
      'Pronto': []
    };
    
    (pedidos || []).forEach(p => {
      const col = getColumnForPedido(p);
      map[col].push(p);
    });
    
    return map;
  }, [pedidos, getColumnForPedido]);

  return (
    <div className="kanban-board">
      {KANBAN_COLUMNS.map(col => (
        <KanbanColumn
          key={col.key}
          column={col}
          pedidos={grouped[col.key]}
          onToggleSetor={onToggleSetor}
          onEdit={onEdit}
          onPreview={onPreview}
          onMoveToColumn={onMoveToColumn}
          getColumnForPedido={getColumnForPedido}
          setorKeyToField={setorKeyToField}
          orderedKeys={orderedKeys}
        />
      ))}
    </div>
  );
});

OptimizedKanbanBoard.displayName = 'OptimizedKanbanBoard';

export default OptimizedKanbanBoard;
