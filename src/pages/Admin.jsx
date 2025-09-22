import React, { useState, useMemo } from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import { 
  Gear, 
  People, 
  CreditCard, 
  Truck, 
  Percent,
  BarChart,
  Palette
} from 'react-bootstrap-icons';
import { useAuth } from '../contexts/AuthContext';
import FormasEnvioManagement from '../components/admin/FormasEnvioManagement';
import FormasPagamentoManagement from '../components/admin/FormasPagamentoManagement';
import FormasResumo from '../components/admin/FormasResumo';
import DesignersManagement from '../components/admin/DesignersManagement';
import VendedoresManagement from '../components/admin/VendedoresManagement';
import DescontosManagement from '../components/admin/DescontosManagement';
import ProducoesManagement from '../components/admin/ProducoesManagement';
import TecidosManagement from '../components/admin/TecidosManagement';

const AdminPage = () => {
  const { user } = useAuth();

  const managementSections = useMemo(() => ([
    {
      id: 'payments',
      title: 'Formas de Pagamento',
      description: 'Configurar métodos de pagamento',
      icon: <CreditCard size={24} />,
      component: FormasPagamentoManagement
    },
    {
      id: 'shipping',
      title: 'Formas de Envio',
      description: 'Gerenciar formas de envio e transportadoras',
      icon: <Truck size={24} />,
      component: FormasEnvioManagement
    },
    {
      id: 'formas-resumo',
      title: 'Resumo das Formas',
      description: 'Visão geral das formas de envio e pagamento',
      icon: <BarChart size={24} />,
      component: FormasResumo
    },
    {
      id: 'designers',
      title: 'Designers',
      description: 'Gerenciar designers cadastrados',
      icon: <Palette size={24} />,
      component: DesignersManagement
    },
    {
      id: 'vendedores',
      title: 'Vendedores',
      description: 'Gerenciar vendedores cadastrados',
      icon: <People size={24} />,
      component: VendedoresManagement
    },
    {
      id: 'discounts',
      title: 'Descontos',
      description: 'Configurar descontos por volume',
      icon: <Percent size={24} />,
      component: DescontosManagement
    }
    ,
    {
      id: 'producoes',
      title: 'Produções',
      description: 'Gerenciar tipos de produção (com/sem tecido)',
      icon: <Gear size={24} />,
      component: ProducoesManagement
    },
    {
      id: 'tecidos',
      title: 'Tecidos',
      description: 'Cadastrar tecidos e vincular às produções',
      icon: <Palette size={24} />,
      component: TecidosManagement
    }
  ]), []);

  return (
    <div style={{ padding: 0 }}>
      <div className="dashboard-card mb-4">
        <div className="dashboard-card-header">
          <h4 className="dashboard-card-title">
            <Gear className="dashboard-card-icon" />
            Gestão do Sistema
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

      <div className="dashboard-card">
        <div className="dashboard-card-header">
          <h6 className="dashboard-card-title">Configurações</h6>
        </div>
        <div style={{ padding: 'var(--spacing-4)' }}>
          <Tabs defaultActiveKey={managementSections[0]?.id || 'payments'} id="admin-tabs" className="mb-3" mountOnEnter unmountOnExit={false} transition={false}>
            {managementSections.map((section) => (
              <Tab
                key={section.id}
                eventKey={section.id}
                title={
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    {section.icon}
                    {section.title}
                  </span>
                }
              >
                <div style={{ paddingTop: 'var(--spacing-2)' }}>
                  {(() => { const SectionComp = section.component; return <SectionComp />; })()}
                </div>
              </Tab>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;