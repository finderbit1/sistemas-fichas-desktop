import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpar erros ao editar
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        // Redirecionar baseado no role do usuário
        navigate('/');
      } else {
        setErrors([result.message]);
      }
    } catch (error) {
      setErrors(['Erro interno. Tente novamente.']);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (email) => {
    setFormData({ email, password: '123456' });
    setLoading(true);
    setErrors([]);

    try {
      const result = await login(email, '123456');
      
      if (result.success) {
        navigate('/');
      } else {
        setErrors([result.message]);
      }
    } catch (error) {
      setErrors(['Erro interno. Tente novamente.']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center" style={{ 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
    }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-xs-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
            <div className="card shadow-lg border-0">
              <div className="card-body p-5">
                {/* Header */}
                <div className="text-center mb-4">
                  <div className="mb-3">
                    <span style={{ fontSize: 'var(--font-size-3xl)' }}>🚀</span>
                  </div>
                  <h2 className="text-primary fw-bold mb-2">
                    Sistema de Fichas
                  </h2>
                  <p className="text-muted">
                    Faça login para acessar o sistema
                  </p>
                </div>

                {/* Alertas de Erro */}
                {errors.length > 0 && (
                  <div className="alert alert-danger mb-4">
                    <h6>
                      <i className="fas fa-exclamation-triangle me-2"></i>
                      Erro no Login
                    </h6>
                    <ul className="mb-0">
                      {errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Formulário de Login */}
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Digite seu email"
                      required
                      className="form-control form-control-lg"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label">Senha</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Digite sua senha"
                      required
                      className="form-control form-control-lg"
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-lg w-100 mb-3"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Entrando...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-sign-in-alt me-2"></i>
                        Entrar
                      </>
                    )}
                  </button>
                </form>

                {/* Divisor */}
                <div className="text-center my-4">
                  <span className="text-muted">ou</span>
                </div>

                {/* Botões de Demo */}
                <div className="d-grid gap-2">
                  <button
                    className="btn btn-outline-success btn-lg"
                    onClick={() => handleDemoLogin('admin@admin.com')}
                    disabled={loading}
                  >
                    <i className="fas fa-user-shield me-2"></i>
                    Demo Admin
                  </button>
                  
                  <button
                    className="btn btn-outline-info btn-lg"
                    onClick={() => handleDemoLogin('manager@manager.com')}
                    disabled={loading}
                  >
                    <i className="fas fa-user-tie me-2"></i>
                    Demo Gerente
                  </button>
                  
                  <button
                    className="btn btn-outline-secondary btn-lg"
                    onClick={() => handleDemoLogin('user@user.com')}
                    disabled={loading}
                  >
                    <i className="fas fa-user me-2"></i>
                    Demo Usuário
                  </button>
                </div>

                {/* Informações de Demo */}
                <div className="mt-4 p-3 bg-light rounded">
                  <h6 className="text-muted mb-2">
                    <i className="fas fa-info-circle me-2"></i>
                    Contas de Demonstração
                  </h6>
                  <div className="small text-muted">
                    <div><strong>Admin:</strong> admin@admin.com / 123456</div>
                    <div><strong>Gerente:</strong> manager@manager.com / 123456</div>
                    <div><strong>Usuário:</strong> user@user.com / 123456</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
