import React, { useState, useEffect } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';
import { CheckCircle, ExclamationTriangle, Info, X } from 'react-bootstrap-icons';

const ToastNotification = ({ 
  show, 
  message, 
  type = 'info', 
  duration = 3000, 
  onClose 
}) => {
  const [visible, setVisible] = useState(show);

  useEffect(() => {
    setVisible(show);
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration]);

  const handleClose = () => {
    setVisible(false);
    if (onClose) onClose();
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} />;
      case 'error':
        return <ExclamationTriangle size={20} />;
      case 'warning':
        return <ExclamationTriangle size={20} />;
      default:
        return <Info size={20} />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'success';
      case 'error':
        return 'danger';
      case 'warning':
        return 'warning';
      default:
        return 'info';
    }
  };

  if (!visible) return null;

  return (
    <ToastContainer position="top-end" className="p-3">
      <Toast
        show={visible}
        onClose={handleClose}
        bg={getBgColor()}
        className="toast-notification"
        style={{
          minWidth: '300px',
          border: 'none',
          borderRadius: 'var(--border-radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          animation: 'toastSlideIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
        }}
      >
        <Toast.Header 
          closeButton={false}
          style={{ 
            border: 'none', 
            background: 'transparent',
            padding: '12px 16px 8px 16px'
          }}
        >
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            color: 'white',
            fontWeight: 'var(--font-weight-semibold)'
          }}>
            {getIcon()}
            <span style={{ textTransform: 'capitalize' }}>{type}</span>
          </div>
          <button
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: 'auto'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            <X size={16} />
          </button>
        </Toast.Header>
        <Toast.Body style={{ 
          color: 'white', 
          padding: '0 16px 12px 16px',
          fontSize: 'var(--font-size-sm)'
        }}>
          {message}
        </Toast.Body>
      </Toast>
    </ToastContainer>
  );
};

export default ToastNotification;
