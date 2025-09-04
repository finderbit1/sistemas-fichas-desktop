import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { ExclamationTriangle, ShieldX, Lock } from 'react-bootstrap-icons';
import { useAuth } from '../contexts/AuthContext';
import '../styles/protected-route.css';

const ProtectedRoute = ({ children, requireAdmin = false, requirePermission = null }) => {
  const { user, isAuthenticated, loading, isAdmin, hasPermission } = useAuth();
  const location = useLocation();

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <h5>Verificando autenticação...</h5>
        <p>Aguarde um momento</p>
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
      <div className="access-denied-container">
        <div className="access-denied-card">
          <div className="access-denied-icon">
            <ShieldX size={64} />
          </div>
          <h4>Acesso Negado</h4>
          <p>
            Você não tem permissão para acessar esta página.
          </p>
          <div className="user-info">
            <p><strong>Usuário:</strong> {user?.name} ({user?.role})</p>
          </div>
        </div>
      </div>
    );
  }

  // Se requer permissão específica e usuário não tem
  if (requirePermission && !hasPermission(requirePermission)) {
    return (
      <div className="access-denied-container">
        <div className="access-denied-card">
          <div className="access-denied-icon warning">
            <Lock size={64} />
          </div>
          <h4>Permissão Insuficiente</h4>
          <p>
            Você não tem a permissão necessária para acessar esta funcionalidade.
          </p>
          <div className="user-info">
            <p><strong>Permissão requerida:</strong> {requirePermission}</p>
          </div>
        </div>
      </div>
    );
  }

  // Se passou por todas as verificações, renderizar o conteúdo
  return children;
};

export default ProtectedRoute;
