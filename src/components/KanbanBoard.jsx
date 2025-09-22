import React from 'react';

const KANBAN_COLUMNS = [
  { key: 'Financeiro', title: 'Financeiro' },
  { key: 'Conferência', title: 'Conferência' },
  { key: 'Sublimação', title: 'Sublimação' },
  { key: 'Costura', title: 'Costura' },
  { key: 'Expedição', title: 'Expedição' },
  { key: 'Pronto', title: 'Pronto' }
];

const KanbanCard = ({ pedido, onToggleSetor, onEdit, onPreview }) => {
  const isLate = (() => {
    if (!pedido?.dataEntrega) return false;
    const entrega = new Date(pedido.dataEntrega);
    const today = new Date();
    today.setHours(0,0,0,0);
    entrega.setHours(0,0,0,0);
    const allDone = !!(pedido.financeiro && pedido.conferencia && pedido.sublimacao && pedido.costura && pedido.expedicao);
    return entrega < today && !allDone;
  })();

  const financeiro = !!pedido.financeiro;
  const conferencia = !!pedido.conferencia;
  const sublimacao = !!pedido.sublimacao;
  const costura = !!pedido.costura;
  const expedicao = !!pedido.expedicao;
  const steps = [
    { key: 'financeiro', label: 'Financeiro', done: financeiro },
    { key: 'conferencia', label: 'Conferência', done: conferencia },
    { key: 'sublimacao', label: 'Sublimação', done: sublimacao },
    { key: 'costura', label: 'Costura', done: costura },
    { key: 'expedicao', label: 'Expedição', done: expedicao }
  ];
  const firstPending = steps.find(s => !s.done)?.key;

  const isHighPriority = pedido.prioridade === true || pedido.prioridade === 'ALTA';
  const totalSteps = steps.length;
  const completedSteps = steps.filter(s => s.done).length;
  const progressPct = Math.round((completedSteps / totalSteps) * 100);

  return (
    <div className={`kanban-card${isLate ? ' late' : ''}${isHighPriority ? ' priority-high' : ''}`} draggable onDragStart={(e) => {
      e.dataTransfer.setData('text/plain', String(pedido.id));
      try { e.dataTransfer.effectAllowed = 'move'; } catch (_) {}
    }}>
      <div className="kanban-card-header">
        <span className="kanban-card-number">#{pedido.numeroPedido}</span>
        {isHighPriority ? (
          <span className="badge badge-error">Alta</span>
        ) : (
          <span className="badge badge-neutral">Normal</span>
        )}
        <span className="kanban-card-progress-count">{completedSteps}/{totalSteps}</span>
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
          <div className="kanban-progress-bar" style={{ width: `${progressPct}%` }} />
        </div>
        <div className="kanban-steps">
          {steps.map(step => (
            <div
              key={step.key}
              className={`kanban-step${step.done ? ' done' : ''}${!step.done && firstPending === step.key ? ' current' : ''}`}
              title={step.label}
            >
              {step.label}
            </div>
          ))}
        </div>
      </div>
      <div className="kanban-card-footer">
        <button className="btn btn-sm btn-outline" onClick={() => onPreview?.(pedido)}>Visualizar</button>
        <button className="btn btn-sm btn-outline" onClick={() => onEdit?.(pedido)}>Editar</button>
      </div>
    </div>
  );
};

const KanbanBoard = ({ pedidos, onToggleSetor, onEdit, onPreview, onMoveToColumn }) => {
  const getColumnForPedido = (p) => {
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
  };

  const grouped = React.useMemo(() => {
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
  }, [pedidos]);

  const highPriorityCount = (list) => (list || []).filter(p => p.prioridade === true || p.prioridade === 'ALTA').length;

  const setorKeyToField = (colKey) => {
    switch (colKey) {
      case 'Financeiro': return 'financeiro';
      case 'Conferência': return 'conferencia';
      case 'Sublimação': return 'sublimacao';
      case 'Costura': return 'costura';
      case 'Expedição': return 'expedicao';
      case 'Pronto': return 'expedicao';
      default: return null;
    }
  };

  const orderedKeys = KANBAN_COLUMNS.map(c => c.key);
  const isDropAllowed = (pedido, targetCol) => {
    const nextCol = getColumnForPedido(pedido);
    const nextIdx = orderedKeys.indexOf(nextCol);
    const targetIdx = orderedKeys.indexOf(targetCol);
    return targetIdx >= nextIdx && nextIdx !== -1 && targetIdx !== -1;
  };

  const advancePedidoToColumn = (pedido, targetCol) => {
    const targetIdx = orderedKeys.indexOf(targetCol);
    // Para 'Pronto', precisamos completar até 'Expedição'
    const lastWorkIdx = orderedKeys.indexOf('Expedição');
    const finalIdx = targetCol === 'Pronto' ? lastWorkIdx : targetIdx;
    for (let i = 0; i <= finalIdx; i++) {
      const key = orderedKeys[i];
      const field = setorKeyToField(key);
      if (!field) continue;
      if (!pedido[field]) {
        onToggleSetor(pedido.id, field);
      }
    }
  };

  return (
    <div className="kanban-board">
      {KANBAN_COLUMNS.map(col => (
        <div
          className="kanban-column"
          key={col.key}
          onDragEnter={(e) => { e.preventDefault(); }}
          onDragOver={(e) => {
            e.preventDefault();
            try { e.dataTransfer.dropEffect = 'move'; } catch (_) {}
          }}
          onDrop={(e) => {
            e.preventDefault();
            const id = e.dataTransfer.getData('text/plain');
            const pedido = (pedidos || []).find(p => String(p.id) === String(id));
            if (!pedido) return;
            if (onMoveToColumn) {
              onMoveToColumn(pedido, col.key);
            } else {
              advancePedidoToColumn(pedido, col.key);
            }
          }}
        >
          <div className="kanban-column-header">
            <span className={`kanban-pip status-${col.key.replace(/\s/g, '').toLowerCase()}`} />
            <span className="kanban-column-title">{col.title}</span>
            <span className="kanban-column-count">{grouped[col.key]?.length || 0}</span>
            {highPriorityCount(grouped[col.key]) > 0 && (
              <span className="kanban-column-priority">Alta: {highPriorityCount(grouped[col.key])}</span>
            )}
          </div>
          <div className="kanban-column-body">
            {(grouped[col.key] || []).map(p => (
              <KanbanCard
                key={p.id}
                pedido={p}
                onToggleSetor={onToggleSetor}
                onEdit={onEdit}
                onPreview={onPreview}
              />)
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default KanbanBoard;


