import React, { useState } from 'react';
import { Container, Row, Col, Tabs, Tab, Card } from 'react-bootstrap';
import { 
  Gear, 
  Server, 
  People, 
  Palette, 
  CreditCard, 
  Truck, 
  Percent,
  GearFill,
  Cpu,
  FileText,
  CloudDownload,
  BarChart,
  Shield,
  Building,
  Activity
} from 'react-bootstrap-icons';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import ServerConfig from '../components/ServerConfig';
import ThemeToggle from '../components/ThemeToggle';
import SystemStats from '../components/SystemStats';
import SystemLogs from '../components/SystemLogs';
import SystemBackup from '../components/SystemBackup';
import UserManagement from '../components/admin/UserManagement';
import SecurityAudit from '../components/admin/SecurityAudit';
import SystemSettings from '../components/admin/SystemSettings';
import ExecutiveDashboard from '../components/admin/ExecutiveDashboard';

const AdminPage = () => {
  const { user } = useAuth();
  const { theme, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('dashboard');

  const systemSections = [
    {
      id: 'server',
      title: 'Configuração do Servidor',
      description: 'Configurar URL e parâmetros de conexão',
      icon: <Server size={24} />,
      component: <ServerConfig />
    },
    {
      id: 'theme',
      title: 'Aparência do Sistema',
      description: 'Configurar tema e personalização visual',
      icon: <Palette size={24} />,
      component: (
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <h5 className="dashboard-card-title">
              <Palette className="dashboard-card-icon" />
              Configurações de Aparência
            </h5>
          </div>
          <div style={{ padding: 'var(--spacing-4)' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              padding: 'var(--spacing-4)',
              background: 'var(--color-neutral-50)',
              borderRadius: 'var(--border-radius)',
              border: '1px solid var(--color-neutral-200)'
            }}>
              <div>
                <h6 style={{ margin: '0 0 var(--spacing-2) 0', color: 'var(--color-neutral-800)' }}>
                  Tema do Sistema
                </h6>
                <p style={{ 
                  margin: 0, 
                  fontSize: 'var(--font-size-sm)', 
                  color: 'var(--color-neutral-600)' 
                }}>
                  Atualmente usando: <strong>{isDark ? 'Modo Escuro' : 'Modo Claro'}</strong>
                </p>
              </div>
              <ThemeToggle size="large" showLabel={true} />
            </div>
          </div>
        </div>
      )
    }
  ];

  const monitoringSections = [
    {
      id: 'stats',
      title: 'Estatísticas do Sistema',
      description: 'Monitorar performance e recursos',
      icon: <Cpu size={24} />,
      component: <SystemStats />
    },
    {
      id: 'logs',
      title: 'Logs do Sistema',
      description: 'Visualizar e gerenciar logs',
      icon: <FileText size={24} />,
      component: <SystemLogs />
    },
    {
      id: 'backup',
      title: 'Backup do Sistema',
      description: 'Gerenciar backups e restaurações',
      icon: <CloudDownload size={24} />,
      component: <SystemBackup />
    }
  ];

  const managementSections = [
    {
      id: 'users',
      title: 'Usuários',
      description: 'Gerenciar usuários e permissões',
      icon: <People size={24} />,
      component: <UserManagement />
    },
    {
      id: 'payments',
      title: 'Formas de Pagamento',
      description: 'Configurar métodos de pagamento',
      icon: <CreditCard size={24} />
    },
    {
      id: 'shipping',
      title: 'Transportadoras',
      description: 'Gerenciar empresas de transporte',
      icon: <Truck size={24} />
    },
    {
      id: 'discounts',
      title: 'Descontos',
      description: 'Configurar descontos por volume',
      icon: <Percent size={24} />
    }
  ];

  const newTabs = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: <BarChart size={16} />,
      component: <ExecutiveDashboard />
    },
    {
      id: 'users',
      title: 'Usuários',
      icon: <People size={16} />,
      component: <UserManagement />
    },
    {
      id: 'security',
      title: 'Segurança',
      icon: <Shield size={16} />,
      component: <SecurityAudit />
    },
    {
      id: 'settings',
      title: 'Configurações',
      icon: <Building size={16} />,
      component: <SystemSettings />
    }
  ];

  return (
    <div style={{ padding: 0 }}>
      <div className="dashboard-card mb-4">
        <div className="dashboard-card-header">
          <h4 className="dashboard-card-title">
            <Gear className="dashboard-card-icon" />
            Painel Administrativo
          </h4>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 'var(--spacing-3)',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-neutral-600)'
          }}>
            <span>Bem-vindo, <strong>{user?.name}</strong></span>
            <span style={{ 
              padding: '4px 8px', 
              background: 'var(--color-primary)', 
              color: 'white', 
              borderRadius: 'var(--border-radius-sm)',
              fontSize: 'var(--font-size-xs)',
              textTransform: 'uppercase',
              fontWeight: 'var(--font-weight-semibold)'
            }}>
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
        style={{ borderBottom: '1px solid var(--color-neutral-200)' }}
      >
        {/* Novas Abas Principais */}
        {newTabs.map((tab) => (
          <Tab 
            key={tab.id}
            eventKey={tab.id} 
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {tab.icon}
                {tab.title}
              </div>
            }
          >
            {tab.component}
          </Tab>
        ))}

        {/* Abas Legadas */}
        <Tab 
          eventKey="system" 
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <GearFill size={16} />
              Sistema
            </div>
          }
        >
          <Row>
            {systemSections.map((section) => (
              <Col key={section.id} md={12} className="mb-4">
                {section.component}
              </Col>
            ))}
          </Row>
        </Tab>

        <Tab 
          eventKey="monitoring" 
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={16} />
              Monitoramento
            </div>
          }
        >
          <Row>
            {monitoringSections.map((section) => (
              <Col key={section.id} md={12} className="mb-4">
                {section.component}
              </Col>
            ))}
          </Row>
        </Tab>

        <Tab 
          eventKey="management" 
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <People size={16} />
              Gestão
            </div>
          }
        >
          <Row>
            {managementSections.map((section) => (
              <Col key={section.id} md={6} className="mb-4">
                {section.component ? (
                  section.component
                ) : (
                  <div className="dashboard-card" style={{ height: '100%' }}>
                    <div className="dashboard-card-header">
                      <h6 className="dashboard-card-title">
                        {section.icon}
                        {section.title}
                      </h6>
                    </div>
                    <div style={{ padding: 'var(--spacing-4)' }}>
                      <p style={{ 
                        color: 'var(--color-neutral-600)', 
                        fontSize: 'var(--font-size-sm)',
                        marginBottom: 'var(--spacing-4)'
                      }}>
                        {section.description}
                      </p>
                      <button 
                        className="btn btn-primary"
                        style={{ width: '100%' }}
                        onClick={() => alert(`Funcionalidade ${section.title} em desenvolvimento`)}
                      >
                        Configurar
                      </button>
                    </div>
                  </div>
                )}
              </Col>
            ))}
          </Row>
        </Tab>
      </Tabs>
    </div>
  );
};

export default AdminPage;