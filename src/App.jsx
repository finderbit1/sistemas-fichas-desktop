import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ServerConfigProvider } from './contexts/ServerConfigContext';
import Sidebar from './components/Sidebar';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/PageHome';
import CreateClient from './pages/PageCreateClient';
import CreateOrderPage from './pages/PageCreateOrder';
import RelatorioPedidos from './pages/PageRelatorioPedidos';
import PageRelatorios from './pages/PageRelatorios';
import PageRelatoriosMatriz from './pages/PageRelatoriosMatriz';
import Admin from './pages/Admin';
import './App.css';

// Componente interno para layout autenticado
const AuthenticatedLayout = () => {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  return (
    <div className="app-container">
      <Sidebar expanded={sidebarExpanded} toggleSidebar={toggleSidebar} />
      <div className={`main-content ${sidebarExpanded ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
        <div className="content-area">
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
        </div>
      </div>
    </div>
  );
};

function App() {
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

export default App;
