import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requireAdmin = false, requirePermission = null }) => {
  const { user, isAuthenticated, loading, isAdmin, hasPermission } = useAuth();
  const location = useLocation();

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
          <h5>Verificando autenticação...</h5>
          <p className="text-muted">Aguarde um momento</p>
        </div>
      </div>
    );
  }

  // Se não estiver autenticado, redirecionar para login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se requer admin e usuário não é admin
  if (requireAdmin && !isAdmin()) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="mb-3">
            <span style={{ fontSize: '3rem' }}>🚫</span>
          </div>
          <h4 className="text-danger mb-3">Acesso Negado</h4>
          <p className="text-muted">
            Você não tem permissão para acessar esta página.
          </p>
          <p className="small text-muted">
            <strong>Usuário:</strong> {user?.name} ({user?.role})
          </p>
        </div>
      </div>
    );
  }

  // Se requer permissão específica e usuário não tem
  if (requirePermission && !hasPermission(requirePermission)) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="mb-3">
            <span style={{ fontSize: '3rem' }}>⚠️</span>
          </div>
          <h4 className="text-warning mb-3">Permissão Insuficiente</h4>
          <p className="text-muted">
            Você não tem a permissão necessária para acessar esta funcionalidade.
          </p>
          <p className="small text-muted">
            <strong>Permissão requerida:</strong> {requirePermission}
          </p>
        </div>
      </div>
    );
  }

  // Se passou por todas as verificações, renderizar o conteúdo
  return children;
};

export default ProtectedRoute;
