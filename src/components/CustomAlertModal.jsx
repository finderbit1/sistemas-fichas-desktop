import React from 'react';
import { X, CheckCircle, ExclamationTriangle, InfoCircle, XCircle } from 'react-bootstrap-icons';

const CustomAlertModal = ({ 
  isOpen, 
  onClose, 
  type = 'info', 
  title, 
  message, 
  confirmText = 'OK',
  onConfirm,
  showCancel = false,
  cancelText = 'Cancelar'
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="text-success" size={24} />;
      case 'warning':
        return <ExclamationTriangle className="text-warning" size={24} />;
      case 'error':
        return <XCircle className="text-error" size={24} />;
      case 'info':
      default:
        return <InfoCircle className="text-info" size={24} />;
    }
  };

  const getTypeClass = () => {
    switch (type) {
      case 'success':
        return 'alert-success';
      case 'warning':
        return 'alert-warning';
      case 'error':
        return 'alert-error';
      case 'info':
      default:
        return 'alert-info';
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className={`modal-header ${getTypeClass()}`}>
          <div className="d-flex align-items-center gap-3">
            {getIcon()}
            <h4 className="modal-title mb-0">{title}</h4>
          </div>
          <button 
            className="modal-close" 
            onClick={onClose}
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="modal-body">
          <p className="mb-0">{message}</p>
        </div>
        
        <div className="modal-footer">
          {showCancel && (
            <button 
              className="btn btn-secondary" 
              onClick={onClose}
            >
              {cancelText}
            </button>
          )}
          <button 
            className={`btn btn-${type === 'error' ? 'error' : type === 'warning' ? 'warning' : type === 'success' ? 'success' : 'primary'}`}
            onClick={handleConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomAlertModal;












