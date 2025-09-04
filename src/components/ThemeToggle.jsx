import React from 'react';
import { Sun, Moon } from 'react-bootstrap-icons';
import { useTheme } from '../contexts/ThemeContext';
import Tooltip from './Tooltip';

const ThemeToggle = ({ size = 'medium', showLabel = false }) => {
  const { theme, toggleTheme, isDark } = useTheme();

  const getSize = () => {
    switch (size) {
      case 'small':
        return { width: '32px', height: '32px', iconSize: 14 };
      case 'large':
        return { width: '48px', height: '48px', iconSize: 20 };
      default:
        return { width: '40px', height: '40px', iconSize: 16 };
    }
  };

  const { width, height, iconSize } = getSize();

  const buttonStyle = {
    width,
    height,
    border: 'none',
    borderRadius: '50%',
    background: isDark 
      ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)' 
      : 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
    color: isDark ? '#1f2937' : '#fbbf24',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all var(--transition-normal)',
    boxShadow: 'var(--shadow-sm)',
    position: 'relative',
    overflow: 'hidden',
    zIndex: 1
  };

  const iconStyle = {
    transition: 'all var(--transition-normal)',
    transform: isDark ? 'rotate(0deg)' : 'rotate(180deg)'
  };

  const toggleContent = (
    <button
      style={buttonStyle}
      onClick={toggleTheme}
      onMouseEnter={(e) => {
        e.target.style.transform = 'scale(1.1)';
        e.target.style.boxShadow = 'var(--shadow-md)';
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = 'scale(1)';
        e.target.style.boxShadow = 'var(--shadow-sm)';
      }}
      onMouseDown={(e) => {
        e.target.style.transform = 'scale(0.95)';
      }}
      onMouseUp={(e) => {
        e.target.style.transform = 'scale(1.1)';
      }}
      title={`Alternar para modo ${isDark ? 'claro' : 'escuro'}`}
    >
      {isDark ? (
        <Sun size={iconSize} style={iconStyle} />
      ) : (
        <Moon size={iconSize} style={iconStyle} />
      )}
    </button>
  );

  if (showLabel) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 'var(--spacing-3)',
        padding: 'var(--spacing-2) var(--spacing-4)',
        background: 'var(--color-neutral-50)',
        borderRadius: 'var(--border-radius)',
        border: '1px solid var(--color-neutral-200)'
      }}>
        {toggleContent}
        <span style={{ 
          fontSize: 'var(--font-size-sm)', 
          fontWeight: 'var(--font-weight-medium)',
          color: 'var(--color-neutral-700)'
        }}>
          {isDark ? 'Modo Escuro' : 'Modo Claro'}
        </span>
      </div>
    );
  }

  return (
    <Tooltip 
      content={`Alternar para modo ${isDark ? 'claro' : 'escuro'}`} 
      position="bottom"
      delay={200}
    >
      {toggleContent}
    </Tooltip>
  );
};

export default ThemeToggle;
