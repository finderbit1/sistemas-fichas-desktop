/**
 * Exemplo de Uso do Sistema de Lock de Pedidos
 * 
 * Demonstra como integrar o hook usePedidoLock e o componente PedidoLockIndicator
 */

import React, { useState } from 'react';
import usePedidoLock from '../../hooks/usePedidoLock';
import PedidoLockIndicator from '../PedidoLockIndicator';
import api from '../../services/api';

function PedidoLockExample({ pedidoId }) {
  const { isLocked, lockInfo, canEdit, removeLock, forceRemoveLock } = usePedidoLock(pedidoId);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');

  const handleUpdateStatus = async (status) => {
    setUpdating(true);
    setMessage('');

    try {
      // Tentar atualizar o pedido
      await api.patch(`/pedidos/${pedidoId}`, {
        financeiro: status === 'financeiro'
      });

      setMessage('✅ Status atualizado com sucesso!');
    } catch (error) {
      // Se retornar 423 (Locked), mostrar mensagem específica
      if (error.response?.status === 423) {
        const detail = error.response.data.detail;
        setMessage(
          `🔒 ${detail.message}\n` +
          `Travado por: ${detail.locked_by}\n` +
          `Disponível em: ${detail.time_left}s`
        );
      } else {
        setMessage(`❌ Erro: ${error.response?.data?.detail || error.message}`);
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleForceRemove = async () => {
    if (confirm('Tem certeza que deseja remover a trava forçadamente?')) {
      const success = await forceRemoveLock();
      if (success) {
        setMessage('✅ Trava removida forçadamente!');
      } else {
        setMessage('❌ Erro ao remover trava');
      }
    }
  };

  return (
    <div className="pedido-lock-example">
      <h3>Pedido #{pedidoId}</h3>

      {/* Indicador de lock */}
      {isLocked && (
        <PedidoLockIndicator
          lockInfo={lockInfo}
          onRemoveLock={handleForceRemove}
          canForceRemove={true}  // true se for admin
        />
      )}

      {/* Botões de ação */}
      <div className="actions">
        <button
          onClick={() => handleUpdateStatus('financeiro')}
          disabled={!canEdit || updating}
          className={!canEdit ? 'disabled' : ''}
        >
          {updating ? 'Atualizando...' : 'Marcar Financeiro'}
        </button>

        {isLocked && (
          <button
            onClick={removeLock}
            disabled={updating}
            className="btn-secondary"
          >
            Tentar Destravar
          </button>
        )}
      </div>

      {/* Mensagens */}
      {message && (
        <div className="message">
          <pre>{message}</pre>
        </div>
      )}

      {/* Info de estado */}
      <div className="info">
        <p>
          <strong>Status:</strong>{' '}
          {isLocked ? '🔒 Travado' : '🔓 Disponível'}
        </p>
        {isLocked && lockInfo && (
          <>
            <p><strong>Travado por:</strong> {lockInfo.locked_by}</p>
            <p><strong>Tempo restante:</strong> {lockInfo.time_left_seconds}s</p>
          </>
        )}
        <p>
          <strong>Pode editar:</strong>{' '}
          {canEdit ? '✅ Sim' : '❌ Não'}
        </p>
      </div>
    </div>
  );
}

export default PedidoLockExample;

