import React from 'react';
import { Badge, ProgressBar, Spinner } from 'react-bootstrap';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  PlayCircle,
  PauseCircle,
  StopCircle,
  ExclamationTriangle
} from 'react-bootstrap-icons';

// Componente para badges de status
export const StatusBadge = ({ 
  status, 
  variant = 'secondary', 
  showIcon = true, 
  size = 'sm',
  className = '' 
}) => {
  const getStatusConfig = (status) => {
    const statusLower = status?.toString().toLowerCase();
    
    switch (statusLower) {
      case 'ativo':
      case 'active':
      case 'success':
      case 'completed':
      case 'concluído':
      case 'pronto':
        return {
          variant: 'success',
          icon: <CheckCircle size={12} />,
          text: 'Ativo'
        };
      
      case 'inativo':
      case 'inactive':
      case 'disabled':
      case 'cancelled':
      case 'cancelado':
        return {
          variant: 'secondary',
          icon: <XCircle size={12} />,
          text: 'Inativo'
        };
      
      case 'pendente':
      case 'pending':
      case 'waiting':
      case 'aguardando':
        return {
          variant: 'warning',
          icon: <Clock size={12} />,
          text: 'Pendente'
        };
      
      case 'em_andamento':
      case 'in_progress':
      case 'processing':
      case 'em processamento':
        return {
          variant: 'info',
          icon: <PlayCircle size={12} />,
          text: 'Em Andamento'
        };
      
      case 'pausado':
      case 'paused':
      case 'stopped':
        return {
          variant: 'warning',
          icon: <PauseCircle size={12} />,
          text: 'Pausado'
        };
      
      case 'erro':
      case 'error':
      case 'failed':
      case 'falhou':
        return {
          variant: 'danger',
          icon: <XCircle size={12} />,
          text: 'Erro'
        };
      
      case 'aviso':
      case 'warning':
      case 'alerta':
        return {
          variant: 'warning',
          icon: <ExclamationTriangle size={12} />,
          text: 'Aviso'
        };
      
      default:
        return {
          variant: variant,
          icon: <AlertCircle size={12} />,
          text: status || 'Desconhecido'
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge 
      bg={config.variant} 
      className={`d-flex align-items-center gap-1 ${className}`}
      style={{ fontSize: size === 'sm' ? '0.75rem' : '0.875rem' }}
    >
      {showIcon && config.icon}
      <span>{config.text}</span>
    </Badge>
  );
};

// Componente para barra de progresso
export const ProgressIndicator = ({ 
  value = 0, 
  max = 100, 
  showLabel = true, 
  size = 'sm',
  variant = 'primary',
  className = '',
  label = null
}) => {
  const percentage = Math.round((value / max) * 100);
  
  const getVariant = () => {
    if (percentage >= 100) return 'success';
    if (percentage >= 75) return 'info';
    if (percentage >= 50) return 'primary';
    if (percentage >= 25) return 'warning';
    return 'danger';
  };

  const displayLabel = label || `${percentage}%`;

  return (
    <div className={`progress-indicator ${className}`}>
      <div className="d-flex justify-content-between align-items-center mb-1">
        {showLabel && (
          <small className="text-muted">
            {displayLabel}
          </small>
        )}
        <small className="text-muted">
          {value}/{max}
        </small>
      </div>
      <ProgressBar
        now={percentage}
        variant={getVariant()}
        style={{ height: size === 'sm' ? '6px' : '8px' }}
        className="rounded"
      />
    </div>
  );
};

// Componente para indicador de prioridade
export const PriorityIndicator = ({ 
  priority, 
  size = 'sm',
  className = '' 
}) => {
  const getPriorityConfig = (priority) => {
    const priorityLower = priority?.toString().toLowerCase();
    
    switch (priorityLower) {
      case 'alta':
      case 'high':
      case 'urgente':
      case 'urgent':
        return {
          variant: 'danger',
          icon: <ExclamationTriangle size={12} />,
          text: 'Alta',
          className: 'priority-high'
        };
      
      case 'média':
      case 'medium':
      case 'normal':
        return {
          variant: 'warning',
          icon: <AlertCircle size={12} />,
          text: 'Média',
          className: 'priority-medium'
        };
      
      case 'baixa':
      case 'low':
      case 'baixo':
        return {
          variant: 'success',
          icon: <CheckCircle size={12} />,
          text: 'Baixa',
          className: 'priority-low'
        };
      
      default:
        return {
          variant: 'secondary',
          icon: <Clock size={12} />,
          text: 'Normal',
          className: 'priority-normal'
        };
    }
  };

  const config = getPriorityConfig(priority);

  return (
    <Badge 
      bg={config.variant} 
      className={`priority-indicator ${config.className} d-flex align-items-center gap-1 ${className}`}
      style={{ fontSize: size === 'sm' ? '0.75rem' : '0.875rem' }}
    >
      {config.icon}
      <span>{config.text}</span>
    </Badge>
  );
};

// Componente para indicador de status com loading
export const LoadingStatusIndicator = ({ 
  loading = false, 
  status = null, 
  size = 'sm',
  className = '' 
}) => {
  if (loading) {
    return (
      <div className={`d-flex align-items-center gap-1 ${className}`}>
        <Spinner size="sm" animation="border" variant="primary" />
        <small className="text-muted">Carregando...</small>
      </div>
    );
  }

  return <StatusBadge status={status} size={size} className={className} />;
};

// Componente para indicador de etapas/processo
export const StepIndicator = ({ 
  steps = [], 
  currentStep = 0, 
  showLabels = true,
  orientation = 'horizontal',
  className = '' 
}) => {
  return (
    <div className={`step-indicator ${orientation} ${className}`}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isPending = index > currentStep;

        return (
          <div
            key={index}
            className={`step-item ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''} ${isPending ? 'pending' : ''}`}
          >
            <div className="step-circle">
              {isCompleted ? (
                <CheckCircle size={16} />
              ) : (
                <span className="step-number">{index + 1}</span>
              )}
            </div>
            {showLabels && (
              <div className="step-label">
                <small>{step.label || step}</small>
              </div>
            )}
            {index < steps.length - 1 && (
              <div className="step-connector" />
            )}
          </div>
        );
      })}
    </div>
  );
};

// Componente para indicador de contador
export const CounterIndicator = ({ 
  count = 0, 
  max = null, 
  variant = 'primary',
  size = 'sm',
  showMax = true,
  className = '' 
}) => {
  const getVariant = () => {
    if (max && count >= max) return 'danger';
    if (max && count >= max * 0.8) return 'warning';
    return variant;
  };

  return (
    <Badge 
      bg={getVariant()} 
      className={`counter-indicator d-flex align-items-center gap-1 ${className}`}
      style={{ fontSize: size === 'sm' ? '0.75rem' : '0.875rem' }}
    >
      <span>{count}</span>
      {showMax && max && (
        <span className="text-muted">/ {max}</span>
      )}
    </Badge>
  );
};

// Componente para indicador de tempo
export const TimeIndicator = ({ 
  date, 
  showRelative = true, 
  showAbsolute = false,
  className = '' 
}) => {
  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR');
  };

  const formatRelative = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Hoje';
    if (days === 1) return 'Ontem';
    if (days > 1 && days <= 7) return `${days} dias atrás`;
    if (days > 7 && days <= 30) return `${Math.floor(days / 7)} semanas atrás`;
    return formatDate(date);
  };

  return (
    <div className={`time-indicator ${className}`}>
      {showRelative && (
        <small className="text-muted d-block">
          {formatRelative(date)}
        </small>
      )}
      {showAbsolute && (
        <small className="text-muted d-block">
          {formatDate(date)}
        </small>
      )}
    </div>
  );
};

export default {
  StatusBadge,
  ProgressIndicator,
  PriorityIndicator,
  LoadingStatusIndicator,
  StepIndicator,
  CounterIndicator,
  TimeIndicator
};
