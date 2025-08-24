import React, { useState } from 'react';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaClipboardList } from 'react-icons/fa';
import useAuth from '../hooks/useAuth';

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    senha: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpar erro quando usuário digita
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!credentials.email || !credentials.senha) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await login(credentials);
      
      if (result.success) {
        // Login bem-sucedido - o useAuth já atualiza o estado
        console.log('Login realizado com sucesso:', result.user);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Erro interno do sistema. Tente novamente.');
      console.error('Erro no login:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="login-pattern"></div>
      </div>
      
      <div className="login-card">
        <div className="login-header">
          <div className="logo-container">
            <div className="logo-icon">
              <FaClipboardList />
            </div>
            <div className="logo-text">
              <h1>SGP</h1>
              <p>Sistema de Gestão de Pedidos</p>
            </div>
          </div>
        </div>

        <div className="login-body">
          <h2>Bem-vindo de volta</h2>
          <p className="login-subtitle">
            Faça login para acessar o sistema
          </p>

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                E-mail
              </label>
              <div className="input-group">
                <span className="input-icon">
                  <FaUser />
                </span>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={credentials.email}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Digite seu e-mail"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="senha" className="form-label">
                Senha
              </label>
              <div className="input-group">
                <span className="input-icon">
                  <FaLock />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="senha"
                  name="senha"
                  value={credentials.senha}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Digite sua senha"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={togglePasswordVisibility}
                  disabled={loading}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg login-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Entrando...
                </>
              ) : (
                'Entrar no Sistema'
              )}
            </button>
          </form>

          <div className="login-help">
            <p className="help-text">
              <strong>Credenciais de teste:</strong>
            </p>
            <div className="credentials-info">
              <div className="credential-item">
                <span className="credential-label">Admin:</span>
                <span className="credential-value">admin@sgp.com / admin123</span>
              </div>
              <div className="credential-item">
                <span className="credential-label">Usuário:</span>
                <span className="credential-value">user@sgp.com / user123</span>
              </div>
            </div>
          </div>
        </div>

        <div className="login-footer">
          <p>&copy; 2025 Sistema de Gestão de Pedidos. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
