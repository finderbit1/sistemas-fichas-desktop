import { useState } from 'react';

const useCustomAlert = () => {
  const [alertState, setAlertState] = useState({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    confirmText: 'OK',
    onConfirm: null,
    showCancel: false,
    cancelText: 'Cancelar'
  });

  const showAlert = ({
    type = 'info',
    title,
    message,
    confirmText = 'OK',
    onConfirm = null,
    showCancel = false,
    cancelText = 'Cancelar'
  }) => {
    setAlertState({
      isOpen: true,
      type,
      title,
      message,
      confirmText,
      onConfirm,
      showCancel,
      cancelText
    });
  };

  const hideAlert = () => {
    setAlertState(prev => ({ ...prev, isOpen: false }));
  };

  const showSuccess = (title, message, onConfirm = null) => {
    showAlert({ type: 'success', title, message, onConfirm });
  };

  const showError = (title, message, onConfirm = null) => {
    showAlert({ type: 'error', title, message, onConfirm });
  };

  const showWarning = (title, message, onConfirm = null) => {
    showAlert({ type: 'warning', title, message, onConfirm });
  };

  const showInfo = (title, message, onConfirm = null) => {
    showAlert({ type: 'info', title, message, onConfirm });
  };

  const showConfirm = (title, message, onConfirm, onCancel = null) => {
    showAlert({ 
      type: 'warning', 
      title, 
      message, 
      confirmText: 'Confirmar',
      onConfirm,
      showCancel: true,
      cancelText: 'Cancelar'
    });
  };

  return {
    alertState,
    showAlert,
    hideAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm
  };
};

export default useCustomAlert;

