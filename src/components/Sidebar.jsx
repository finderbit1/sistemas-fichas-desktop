import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HouseDoorFill,
  ClipboardData,
  PeopleFill,
  FileTextFill,
  BarChartFill,
  GearFill,
  ChevronDoubleLeft,
  ChevronDoubleRight,
  TruckFront
} from 'react-bootstrap-icons';
import { useAuth } from '../contexts/AuthContext';
import Tooltip from './Tooltip';
import UserProfile from './UserProfile';
import '../styles/user-profile.css';

const Sidebar = ({ expanded, toggleSidebar }) => {
  const location = useLocation();
  const { isAdmin } = useAuth();

  const menuItems = [
    { path: '/', icon: HouseDoorFill, label: 'Início' },
    { path: '/orders', icon: ClipboardData, label: 'Pedidos' },
    { path: '/clientes', icon: PeopleFill, label: 'Cadastro' },
    { path: '/relatorio', icon: FileTextFill, label: 'Relatórios' },
    { path: '/relatorios', icon: BarChartFill, label: 'Relatórios Admin', adminOnly: true },
    { path: '/relatorios-matriz', icon: BarChartFill, label: 'Matriz X×Y', adminOnly: true },
    { path: '/relatorios-envios', icon: TruckFront, label: 'Relatório Envios', adminOnly: true },
    { path: '/admin', icon: GearFill, label: 'Admin', adminOnly: true }
  ].filter(item => !item.adminOnly || isAdmin());

  return (
    <div className={`sidebar ${expanded ? 'expanded' : 'collapsed'}`}>
      <div className="sidebar-header">
        <h5>{expanded ? 'Sistema de Fichas' : ''}</h5>
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          {expanded ? <ChevronDoubleLeft size={16} /> : <ChevronDoubleRight size={16} />}
        </button>
      </div>
      
      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          const linkContent = (
            <Link to={item.path} className="sidebar-link">
              <Icon className="sidebar-icon" size={20} />
              <span className="sidebar-text">{item.label}</span>
            </Link>
          );
          
          return (
            <div key={item.path} className={`sidebar-item ${isActive ? 'active' : ''}`}>
              {expanded ? (
                linkContent
              ) : (
                <Tooltip content={item.label} position="right" delay={300}>
                  {linkContent}
                </Tooltip>
              )}
            </div>
          );
        })}
      </nav>
      
      {/* Área do usuário na parte inferior da sidebar */}
      <div className="sidebar-footer">
        <UserProfile expanded={expanded} />
      </div>
    </div>
  );
};

export default Sidebar;
