/**
 * Componente de Indicador de Lock (Trava) de Pedido
 * 
 * Mostra quando um pedido está sendo editado por outro usuário
 */

import React from 'react';
import './PedidoLockIndicator.css';

function PedidoLockIndicator({ lockInfo, onRemoveLock, canForceRemove = false }) {
  if (!lockInfo) return null;

  const formatTimeLeft = (seconds) => {
    if (seconds > 60) {
      const minutes = Math.floor(seconds / 60);
      return `${minutes}min`;
    }
    return `${seconds}s`;
  };

  return (
    <div className="pedido-lock-indicator">
      <div className="lock-icon">🔒</div>
      
      <div className="lock-content">
        <div className="lock-message">
          <strong>Pedido em edição</strong>
        </div>
        
        <div className="lock-details">
          <span className="lock-user">
            por {lockInfo.locked_by}
          </span>
          
          {lockInfo.time_left_seconds && (
            <span className="lock-timer">
              • Disponível em {formatTimeLeft(lockInfo.time_left_seconds)}
            </span>
          )}
        </div>
      </div>

      {canForceRemove && onRemoveLock && (
        <button
          className="lock-force-remove"
          onClick={onRemoveLock}
          title="Remover trava forçadamente (admin)"
        >
          🔓 Forçar
        </button>
      )}
    </div>
  );
}

export default PedidoLockIndicator;

