import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Home from './pages/PageHome';

import CreateClient from './pages/PageCreateClient';
import CreateOrderPage from './pages/PageCreateOrder';
import RelatorioPedidos from './pages/PageRelatorioPedidos'
import Admin from './pages/Admin';
// import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  return (
    <Router>
      <div className="app-container">
        <Sidebar expanded={sidebarExpanded} toggleSidebar={toggleSidebar} />
        <div className={`main-content ${sidebarExpanded ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
          <div className="content-area">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/orders" element={<CreateOrderPage />} />
              <Route path="/clientes" element={<CreateClient />} />
              <Route path="/relatorio" element={<RelatorioPedidos />} />
              <Route path="/admin" element={<Admin />} />

            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
