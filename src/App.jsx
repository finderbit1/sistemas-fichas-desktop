import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Bell, Person, Search, BoxArrowRight } from 'react-bootstrap-icons';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ServerConfigProvider } from './contexts/ServerConfigContext';
import Sidebar from './components/Sidebar';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import ThemeToggle from './components/ThemeToggle';
import Home from './pages/PageHome';
import CreateClient from './pages/PageCreateClient';
import CreateOrderPage from './pages/PageCreateOrder';
import RelatorioPedidos from './pages/PageRelatorioPedidos';
import Admin from './pages/Admin';
import './App.css';

// Componente interno para layout autenticado
const AuthenticatedLayout = () => {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const { user, logout } = useAuth();

  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="app-container">
      <Sidebar expanded={sidebarExpanded} toggleSidebar={toggleSidebar} />
      <div className={`main-content ${sidebarExpanded ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
        <header className="main-header">
          <div>
            <h1>Dashboard</h1>
          </div>
          <div className="user-controls">
            <button className="btn btn-outline" style={{ padding: '8px', width: '40px', height: '40px' }}>
              <Search size={16} />
            </button>
            <button className="btn btn-outline" style={{ padding: '8px', width: '40px', height: '40px' }}>
              <Bell size={16} />
            </button>
            <ThemeToggle size="medium" />
            <div className="user-menu">
              <button className="btn btn-outline" style={{ padding: '8px', width: '40px', height: '40px' }}>
                <Person size={16} />
              </button>
              <div className="user-info">
                <span className="user-name">{user?.name}</span>
                <span className="user-role">{user?.role}</span>
              </div>
              <button 
                className="btn btn-outline" 
                onClick={handleLogout}
                style={{ padding: '8px', width: '40px', height: '40px' }}
                title="Sair"
              >
                <BoxArrowRight size={16} />
              </button>
            </div>
          </div>
        </header>
        <div className="content-area">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/orders" element={<CreateOrderPage />} />
            <Route path="/clientes" element={<CreateClient />} />
            <Route path="/relatorio" element={<RelatorioPedidos />} />
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
