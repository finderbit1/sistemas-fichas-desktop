import React, { useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Bell, Search } from 'react-bootstrap-icons';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ServerConfigProvider } from './contexts/ServerConfigContext';
import Sidebar from './components/Sidebar';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import ThemeToggle from './components/ThemeToggle';
import LoadingSpinner from './components/LoadingSpinner';
import './App.css';

// Lazy loading para componentes pesados
const Home = lazy(() => import('./pages/PageHome'));
const CreateClient = lazy(() => import('./pages/PageCreateClient'));
const CreateOrderPage = lazy(() => import('./pages/PageCreateOrder'));
const RelatorioPedidos = lazy(() => import('./pages/PageRelatorioPedidos'));
const PageRelatorios = lazy(() => import('./pages/PageRelatorios'));
const PageRelatoriosMatriz = lazy(() => import('./pages/PageRelatoriosMatriz'));
const Admin = lazy(() => import('./pages/Admin'));

// Componente de loading para Suspense
const PageLoader = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '200px' 
  }}>
    <LoadingSpinner />
  </div>
);

// Componente interno para layout autenticado - memoizado
const AuthenticatedLayout = React.memo(() => {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  const toggleSidebar = React.useCallback(() => {
    setSidebarExpanded(prev => !prev);
  }, []);

  return (
    <div className="app-container">
      <Sidebar expanded={sidebarExpanded} toggleSidebar={toggleSidebar} />
      <div className={`main-content ${sidebarExpanded ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
        <header className="main-header">
          <div>
            <h1>Dashboard</h1>
          </div>
          <div className="header-controls">
            <button className="btn btn-outline" style={{ padding: '8px', width: '40px', height: '40px' }}>
              <Search size={16} />
            </button>
            <button className="btn btn-outline" style={{ padding: '8px', width: '40px', height: '40px' }}>
              <Bell size={16} />
            </button>
            <ThemeToggle size="medium" />
          </div>
        </header>
        <div className="content-area">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/orders" element={<CreateOrderPage />} />
              <Route path="/clientes" element={<CreateClient />} />
              <Route path="/relatorio" element={<RelatorioPedidos />} />
              <Route 
                path="/relatorios" 
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <PageRelatorios />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/relatorios-matriz" 
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <PageRelatoriosMatriz />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <Admin />
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </div>
      </div>
    </div>
  );
});

AuthenticatedLayout.displayName = 'AuthenticatedLayout';

function OptimizedApp() {
  return (
    <ThemeProvider>
      <ServerConfigProvider>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/*" element={
                <ProtectedRoute>
                  <AuthenticatedLayout />
                </ProtectedRoute>
              } />
            </Routes>
          </Router>
        </AuthProvider>
      </ServerConfigProvider>
    </ThemeProvider>
  );
}

export default OptimizedApp;
