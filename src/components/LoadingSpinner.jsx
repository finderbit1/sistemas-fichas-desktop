import React from 'react';

const LoadingSpinner = ({ 
  size = 'medium', 
  color = 'primary', 
  text = 'Carregando...',
  fullScreen = false 
}) => {
  const getSize = () => {
    switch (size) {
      case 'small':
        return { width: '20px', height: '20px' };
      case 'large':
        return { width: '60px', height: '60px' };
      default:
        return { width: '40px', height: '40px' };
    }
  };

  const getColor = () => {
    switch (color) {
      case 'white':
        return '#ffffff';
      case 'success':
        return 'var(--color-success)';
      case 'warning':
        return 'var(--color-warning)';
      case 'error':
        return 'var(--color-error)';
      default:
        return 'var(--color-primary)';
    }
  };

  const spinnerStyle = {
    ...getSize(),
    border: `3px solid rgba(102, 126, 234, 0.1)`,
    borderTop: `3px solid ${getColor()}`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto'
  };

  const containerStyle = fullScreen ? {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(255, 255, 255, 0.9)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    backdropFilter: 'blur(4px)'
  } : {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'var(--spacing-6)',
    gap: 'var(--spacing-3)'
  };

  return (
    <div style={containerStyle}>
      <div style={spinnerStyle}></div>
      {text && (
        <p style={{
          color: 'var(--color-neutral-600)',
          fontSize: 'var(--font-size-sm)',
          margin: 0,
          animation: 'pulse 2s infinite'
        }}>
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;














