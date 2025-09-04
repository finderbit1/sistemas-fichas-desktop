import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Person, 
  Lock, 
  Eye, 
  EyeSlash, 
  ClipboardData,
  ExclamationTriangle,
  CheckCircle
} from 'react-bootstrap-icons';
import { useAuth } from '../contexts/AuthContext';
import '../styles/login.css';

const Login = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [credentials, setCredentials] = useState({
    email: '',
    senha: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

    setError('');
    setSuccess('');

    try {
      const result = await login(credentials);
      
      if (result.success) {
        setSuccess('Login realizado com sucesso! Redirecionando...');
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Erro interno do sistema. Tente novamente.');
      console.error('Erro no login:', error);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-page">
      <div className="login-background">
        <div className="login-pattern"></div>
      </div>
      
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="logo-section">
              <div className="logo-icon">
                <ClipboardData size={32} />
              </div>
              <div className="logo-text">
                <h1>Sistema de Fichas</h1>
                <p>Gestão de Pedidos</p>
              </div>
            </div>
          </div>

          <div className="login-body">
            <div className="welcome-section">
              <h2>Bem-vindo de volta</h2>
              <p className="login-subtitle">
                Faça login para acessar o sistema
              </p>
            </div>

            {error && (
              <div className="alert alert-error">
                <ExclamationTriangle size={16} />
                {error}
              </div>
            )}

            {success && (
              <div className="alert alert-success">
                <CheckCircle size={16} />
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  <Person size={16} style={{ marginRight: '8px' }} />
                  E-mail
                </label>
                <div className="input-container">
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
                  <Lock size={16} style={{ marginRight: '8px' }} />
                  Senha
                </label>
                <div className="input-container">
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
                    {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary login-button"
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
              <div className="help-header">
                <h4>Credenciais de teste</h4>
              </div>
              <div className="credentials-grid">
                <div className="credential-card admin">
                  <div className="credential-header">
                    <span className="credential-role">👨‍💼 Admin</span>
                  </div>
                  <div className="credential-details">
                    <p><strong>Email:</strong> admin@admin.com</p>
                    <p><strong>Senha:</strong> 123456</p>
                  </div>
                </div>
                <div className="credential-card user">
                  <div className="credential-header">
                    <span className="credential-role">👤 Usuário</span>
                  </div>
                  <div className="credential-details">
                    <p><strong>Email:</strong> user@user.com</p>
                    <p><strong>Senha:</strong> 123456</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="login-footer">
            <p>&copy; 2025 Sistema de Fichas. Todos os direitos reservados.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
