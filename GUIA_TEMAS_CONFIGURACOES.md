# 🎨 Guia de Temas e Configurações

## 📋 Visão Geral

Este guia detalha como funciona o sistema de temas (modo claro/escuro) e configurações do sistema, incluindo personalização, persistência e integração com componentes.

## 🌓 Sistema de Temas

### ThemeContext
```javascript
// src/contexts/ThemeContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Verificar localStorage primeiro
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme;
    }
    
    // Fallback para preferência do sistema
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    // Aplicar tema no documento
    document.documentElement.setAttribute('data-theme', theme);
    
    // Salvar no localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const isDark = theme === 'dark';

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de ThemeProvider');
  }
  return context;
};
```

### Variáveis CSS do Tema

#### Modo Claro
```css
:root {
  /* Cores Primárias */
  --color-primary: #667eea;
  --color-primary-dark: #5a67d8;
  --color-primary-light: #a5b4fc;
  
  /* Cores Neutras */
  --color-neutral-50: #f9fafb;
  --color-neutral-100: #f3f4f6;
  --color-neutral-200: #e5e7eb;
  --color-neutral-300: #d1d5db;
  --color-neutral-400: #9ca3af;
  --color-neutral-500: #6b7280;
  --color-neutral-600: #4b5563;
  --color-neutral-700: #374151;
  --color-neutral-800: #1f2937;
  --color-neutral-900: #111827;
  
  /* Cores de Estado */
  --color-success: #48bb78;
  --color-success-light: #68d391;
  --color-warning: #ed8936;
  --color-warning-light: #f6ad55;
  --color-error: #f56565;
  --color-error-light: #fc8181;
  --color-info: #4299e1;
  --color-info-light: #63b3ed;
  
  /* Cores de Fundo */
  --bg-primary: #ffffff;
  --bg-secondary: #f9fafb;
  --bg-tertiary: #f3f4f6;
  
  /* Cores de Texto */
  --text-primary: #111827;
  --text-secondary: #4b5563;
  --text-tertiary: #6b7280;
  --text-inverse: #ffffff;
  
  /* Cores de Ícones */
  --icon-primary: #374151;
  --icon-secondary: #6b7280;
  --icon-muted: #9ca3af;
}
```

#### Modo Escuro
```css
[data-theme="dark"] {
  /* Cores Primárias */
  --color-primary: #818cf8;
  --color-primary-dark: #6366f1;
  --color-primary-light: #a5b4fc;
  
  /* Cores Neutras */
  --color-neutral-50: #1f2937;
  --color-neutral-100: #374151;
  --color-neutral-200: #4b5563;
  --color-neutral-300: #6b7280;
  --color-neutral-400: #9ca3af;
  --color-neutral-500: #d1d5db;
  --color-neutral-600: #e5e7eb;
  --color-neutral-700: #f3f4f6;
  --color-neutral-800: #f9fafb;
  --color-neutral-900: #ffffff;
  
  /* Cores de Estado */
  --color-success: #68d391;
  --color-success-light: #9ae6b4;
  --color-warning: #f6ad55;
  --color-warning-light: #fbd38d;
  --color-error: #fc8181;
  --color-error-light: #feb2b2;
  --color-info: #63b3ed;
  --color-info-light: #90cdf4;
  
  /* Cores de Fundo */
  --bg-primary: #111827;
  --bg-secondary: #1f2937;
  --bg-tertiary: #374151;
  
  /* Cores de Texto */
  --text-primary: #f9fafb;
  --text-secondary: #e5e7eb;
  --text-tertiary: #d1d5db;
  --text-inverse: #111827;
  
  /* Cores de Ícones */
  --icon-primary: #f3f4f6;
  --icon-secondary: #d1d5db;
  --icon-muted: #9ca3af;
}
```

### Componente ThemeToggle
```javascript
// src/components/ThemeToggle.jsx
import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { SunFill, MoonFill } from 'react-bootstrap-icons';

const ThemeToggle = ({ size = 'medium' }) => {
  const { theme, toggleTheme, isDark } = useTheme();

  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-10 h-10',
    large: 'w-12 h-12'
  };

  const iconSizes = {
    small: 16,
    medium: 20,
    large: 24
  };

  const buttonStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    borderRadius: '50%',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    background: isDark
      ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
      : 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
    color: isDark ? '#1f2937' : '#fbbf24',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    width: sizeClasses[size],
    height: sizeClasses[size]
  };

  return (
    <button
      onClick={toggleTheme}
      style={buttonStyle}
      title={`Alternar para modo ${isDark ? 'claro' : 'escuro'}`}
      aria-label={`Alternar para modo ${isDark ? 'claro' : 'escuro'}`}
    >
      {isDark ? (
        <SunFill size={iconSizes[size]} />
      ) : (
        <MoonFill size={iconSizes[size]} />
      )}
    </button>
  );
};

export default ThemeToggle;
```

## ⚙️ Sistema de Configurações

### ServerConfigContext
```javascript
// src/contexts/ServerConfigContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const ServerConfigContext = createContext();

export const ServerConfigProvider = ({ children }) => {
  const [serverConfig, setServerConfig] = useState(() => {
    const savedConfig = localStorage.getItem('serverConfig');
    return savedConfig ? JSON.parse(savedConfig) : {
      url: 'http://localhost:3001/api',
      timeout: 5000,
      retries: 3,
      enableLogs: true,
      enableNotifications: true
    };
  });

  useEffect(() => {
    localStorage.setItem('serverConfig', JSON.stringify(serverConfig));
  }, [serverConfig]);

  const updateServerConfig = (newConfig) => {
    setServerConfig((prevConfig) => ({ ...prevConfig, ...newConfig }));
  };

  const resetServerConfig = () => {
    const defaultConfig = {
      url: 'http://localhost:3001/api',
      timeout: 5000,
      retries: 3,
      enableLogs: true,
      enableNotifications: true
    };
    setServerConfig(defaultConfig);
  };

  const testConnection = async () => {
    try {
      const startTime = Date.now();
      const response = await fetch(`${serverConfig.url}/health`, {
        method: 'GET',
        timeout: serverConfig.timeout
      });
      const endTime = Date.now();
      
      return {
        success: response.ok,
        status: response.status,
        responseTime: endTime - startTime,
        message: response.ok ? 'Conexão estabelecida' : 'Falha na conexão'
      };
    } catch (error) {
      return {
        success: false,
        status: 0,
        responseTime: 0,
        message: `Erro: ${error.message}`
      };
    }
  };

  return (
    <ServerConfigContext.Provider value={{ 
      serverConfig, 
      updateServerConfig, 
      resetServerConfig,
      testConnection
    }}>
      {children}
    </ServerConfigContext.Provider>
  );
};

export const useServerConfig = () => {
  const context = useContext(ServerConfigContext);
  if (!context) {
    throw new Error('useServerConfig deve ser usado dentro de ServerConfigProvider');
  }
  return context;
};
```

### Componente ServerConfig
```javascript
// src/components/ServerConfig.jsx
import React, { useState } from 'react';
import { useServerConfig } from '../contexts/ServerConfigContext';
import { Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { 
  CheckCircle, 
  XCircle, 
  ArrowClockwise, 
  ArrowCounterclockwise,
  Wifi,
  WifiOff
} from 'react-bootstrap-icons';

const ServerConfig = () => {
  const { serverConfig, updateServerConfig, resetServerConfig, testConnection } = useServerConfig();
  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);

  const handleInputChange = (field, value) => {
    updateServerConfig({ [field]: value });
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    
    try {
      const result = await testConnection();
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        message: `Erro: ${error.message}`
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleReset = () => {
    resetServerConfig();
    setTestResult(null);
  };

  return (
    <Card className="dashboard-card">
      <Card.Header className="dashboard-card-header">
        <h5 className="dashboard-card-title">
          <Wifi className="dashboard-card-icon" />
          Configuração do Servidor
        </h5>
      </Card.Header>
      <Card.Body>
        <Form>
          <Row>
            <Col md={8}>
              <Form.Group className="mb-3">
                <Form.Label>URL da API</Form.Label>
                <Form.Control
                  type="url"
                  value={serverConfig.url}
                  onChange={(e) => handleInputChange('url', e.target.value)}
                  placeholder="http://localhost:3001/api"
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Timeout (ms)</Form.Label>
                <Form.Control
                  type="number"
                  value={serverConfig.timeout}
                  onChange={(e) => handleInputChange('timeout', parseInt(e.target.value))}
                  min="1000"
                  max="30000"
                />
              </Form.Group>
            </Col>
          </Row>
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Tentativas de Retry</Form.Label>
                <Form.Control
                  type="number"
                  value={serverConfig.retries}
                  onChange={(e) => handleInputChange('retries', parseInt(e.target.value))}
                  min="0"
                  max="10"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Configurações</Form.Label>
                <div>
                  <Form.Check
                    type="checkbox"
                    id="enableLogs"
                    label="Habilitar Logs"
                    checked={serverConfig.enableLogs}
                    onChange={(e) => handleInputChange('enableLogs', e.target.checked)}
                  />
                  <Form.Check
                    type="checkbox"
                    id="enableNotifications"
                    label="Habilitar Notificações"
                    checked={serverConfig.enableNotifications}
                    onChange={(e) => handleInputChange('enableNotifications', e.target.checked)}
                  />
                </div>
              </Form.Group>
            </Col>
          </Row>

          {testResult && (
            <Alert variant={testResult.success ? 'success' : 'danger'} className="mb-3">
              <div className="d-flex align-items-center">
                {testResult.success ? (
                  <CheckCircle className="me-2" />
                ) : (
                  <XCircle className="me-2" />
                )}
                <div>
                  <strong>{testResult.message}</strong>
                  {testResult.responseTime && (
                    <div className="text-muted">
                      Tempo de resposta: {testResult.responseTime}ms
                    </div>
                  )}
                </div>
              </div>
            </Alert>
          )}

          <div className="d-flex gap-2">
            <Button
              variant="primary"
              onClick={handleTestConnection}
              disabled={isTesting}
            >
              {isTesting ? (
                <ArrowClockwise className="me-2" />
              ) : (
                <Wifi className="me-2" />
              )}
              {isTesting ? 'Testando...' : 'Testar Conexão'}
            </Button>
            
            <Button
              variant="outline-secondary"
              onClick={handleReset}
            >
              <ArrowCounterclockwise className="me-2" />
              Restaurar Padrão
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default ServerConfig;
```

## 🎨 Personalização de Temas

### Cores Customizadas
```css
/* Adicionar cores personalizadas */
:root {
  /* Cores da marca */
  --brand-primary: #667eea;
  --brand-secondary: #764ba2;
  --brand-accent: #f093fb;
  
  /* Cores de status personalizadas */
  --status-pending: #fbbf24;
  --status-processing: #3b82f6;
  --status-completed: #10b981;
  --status-cancelled: #ef4444;
}

[data-theme="dark"] {
  /* Ajustar cores para modo escuro */
  --brand-primary: #818cf8;
  --brand-secondary: #a78bfa;
  --brand-accent: #f472b6;
  
  --status-pending: #f59e0b;
  --status-processing: #60a5fa;
  --status-completed: #34d399;
  --status-cancelled: #f87171;
}
```

### Tema Personalizado
```javascript
// src/utils/themeUtils.js
export const createCustomTheme = (colors) => {
  const root = document.documentElement;
  
  Object.entries(colors).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value);
  });
};

// Exemplo de uso
const customColors = {
  'color-primary': '#ff6b6b',
  'color-secondary': '#4ecdc4',
  'color-accent': '#45b7d1'
};

createCustomTheme(customColors);
```

### Detecção de Preferência do Sistema
```javascript
// src/hooks/useSystemTheme.js
import { useState, useEffect } from 'react';

export const useSystemTheme = () => {
  const [systemTheme, setSystemTheme] = useState(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return systemTheme;
};
```

## 🔧 Configurações Avançadas

### Configuração de Animações
```css
/* Configurações de animação por tema */
:root {
  --animation-duration-fast: 150ms;
  --animation-duration-normal: 300ms;
  --animation-duration-slow: 500ms;
  --animation-easing: cubic-bezier(0.4, 0, 0.2, 1);
}

[data-theme="dark"] {
  /* Animações mais suaves no modo escuro */
  --animation-duration-fast: 200ms;
  --animation-duration-normal: 400ms;
  --animation-duration-slow: 600ms;
  --animation-easing: cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
```

### Configuração de Transições
```css
/* Transições adaptáveis */
.transition-theme {
  transition: 
    background-color var(--animation-duration-normal) var(--animation-easing),
    color var(--animation-duration-normal) var(--animation-easing),
    border-color var(--animation-duration-normal) var(--animation-easing);
}

/* Transições específicas para modo escuro */
[data-theme="dark"] .transition-theme {
  transition: 
    background-color var(--animation-duration-slow) var(--animation-easing),
    color var(--animation-duration-slow) var(--animation-easing),
    border-color var(--animation-duration-slow) var(--animation-easing);
}
```

### Configuração de Sombras
```css
/* Sombras adaptáveis ao tema */
:root {
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

[data-theme="dark"] {
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
}
```

## 📱 Responsividade e Temas

### Breakpoints com Temas
```css
/* Temas responsivos */
@media (max-width: 768px) {
  :root {
    --font-size-base: 14px;
    --spacing-unit: 8px;
  }
  
  [data-theme="dark"] {
    --font-size-base: 15px;
    --spacing-unit: 10px;
  }
}

@media (min-width: 1200px) {
  :root {
    --font-size-base: 18px;
    --spacing-unit: 12px;
  }
  
  [data-theme="dark"] {
    --font-size-base: 19px;
    --spacing-unit: 14px;
  }
}
```

### Componentes Responsivos
```javascript
// src/components/ResponsiveThemeToggle.jsx
import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useMediaQuery } from '../hooks/useMediaQuery';

const ResponsiveThemeToggle = () => {
  const { theme, toggleTheme, isDark } = useTheme();
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <button
      onClick={toggleTheme}
      className={`theme-toggle ${isMobile ? 'theme-toggle--mobile' : 'theme-toggle--desktop'}`}
      style={{
        width: isMobile ? '32px' : '40px',
        height: isMobile ? '32px' : '40px'
      }}
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  );
};
```

## 🧪 Testes de Temas

### Teste de Contraste
```javascript
// src/utils/contrastTest.js
export const testContrast = (foreground, background) => {
  const getLuminance = (color) => {
    const rgb = color.match(/\d+/g).map(Number);
    const [r, g, b] = rgb.map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);
  
  const contrast = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  
  return {
    ratio: contrast,
    passes: contrast >= 4.5, // WCAG AA
    passesAAA: contrast >= 7 // WCAG AAA
  };
};
```

### Validação de Tema
```javascript
// src/utils/themeValidator.js
export const validateTheme = (theme) => {
  const requiredColors = [
    '--color-primary',
    '--color-neutral-50',
    '--color-neutral-900',
    '--text-primary',
    '--bg-primary'
  ];

  const missing = requiredColors.filter(color => 
    !getComputedStyle(document.documentElement).getPropertyValue(color)
  );

  return {
    isValid: missing.length === 0,
    missing,
    message: missing.length > 0 
      ? `Cores ausentes: ${missing.join(', ')}`
      : 'Tema válido'
  };
};
```

## 🚀 Otimizações

### Lazy Loading de Temas
```javascript
// src/utils/themeLoader.js
export const loadTheme = async (themeName) => {
  try {
    const theme = await import(`../themes/${themeName}.css`);
    return theme;
  } catch (error) {
    console.warn(`Tema ${themeName} não encontrado, usando padrão`);
    return null;
  }
};
```

### Cache de Configurações
```javascript
// src/utils/configCache.js
class ConfigCache {
  constructor() {
    this.cache = new Map();
    this.ttl = 5 * 60 * 1000; // 5 minutos
  }

  set(key, value) {
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }
}

export const configCache = new ConfigCache();
```

---

**Versão:** 1.0.0  
**Última atualização:** Janeiro 2024  
**Status:** Sistema completo e funcional



